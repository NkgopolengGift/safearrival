import { useCallback, useEffect, useState, type FormEvent } from 'react';

type Contact = { id: string; name: string; relation: string; initials: string; color: string };
type JourneyStatus = 'active' | 'overdue' | 'completed' | 'cancelled';
type ApiJourney = {
  id: string;
  destinationLabel: string;
  contactName: string;
  status: string;
  startedAt: string;
  deadlineAt: string;
  serverNow: string;
  overdueAt: string | null;
  notificationStatus: string;
  travellerToken?: string | null;
  contactToken?: string | null;
};
type Journey = ApiJourney & { travellerToken: string; contactToken: string };
type ContactNotice = {
  status: string;
  destinationLabel: string;
  contactName: string;
  startedAt: string;
  deadlineAt: string;
  overdueAt: string | null;
  acknowledgedAt: string | null;
  notificationStatus: string;
};

const STORAGE_KEY = 'safearrival.demo.journey';

async function api<T>(path: string, options: { token?: string; method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  if (!response.ok) {
    let reason = `Request failed (${response.status})`;
    try {
      const error = await response.json();
      reason = error.detail || error.message || error.title || reason;
    } catch { /* Keep the status-based error. */ }
    throw new Error(reason);
  }
  return response.json() as Promise<T>;
}

function readSavedJourney(): Journey | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as Journey : null;
  } catch {
    return null;
  }
}

function mergeJourney(data: ApiJourney, current?: Journey | null): Journey {
  return {
    ...data,
    travellerToken: data.travellerToken ?? current?.travellerToken ?? '',
    contactToken: data.contactToken ?? current?.contactToken ?? '',
  };
}

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export default function App() {
  const [destination, setDestination] = useState('Home');
  const [contactId, setContactId] = useState('maya');
  const [windowMinutes, setWindowMinutes] = useState(5);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [journey, setJourney] = useState<Journey | null>(readSavedJourney);
  const [contactNotice, setContactNotice] = useState<ContactNotice | null>(null);
  const [now, setNow] = useState(Date.now());
  const [view, setView] = useState<'traveller' | 'contact'>('traveller');
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    api<Contact[]>('/demo/contacts')
      .then((result) => { setContacts(result); if (result[0]) setContactId(result[0].id); })
      .catch(() => setApiError('Can’t reach the SafeArrival API. Start PostgreSQL and the API, then reload this page.'));
  }, []);

  useEffect(() => {
    if (journey) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
    else sessionStorage.removeItem(STORAGE_KEY);
  }, [journey]);

  const refreshJourney = useCallback(async () => {
    if (!journey) return;
    try {
      const latest = await api<ApiJourney>(`/journeys/${journey.id}`, { token: journey.travellerToken });
      setJourney((current) => current ? mergeJourney(latest, current) : current);
      setApiError('');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not refresh this journey.');
    }
  }, [journey?.id, journey?.travellerToken]);

  useEffect(() => {
    if (!journey || !['active', 'overdue'].includes(journey.status.toLowerCase())) return;
    void refreshJourney();
    const poll = window.setInterval(() => void refreshJourney(), 3000);
    return () => window.clearInterval(poll);
  }, [journey?.id, journey?.status, refreshJourney]);

  const refreshContact = useCallback(async () => {
    if (!journey?.contactToken) return;
    try {
      const notice = await api<ContactNotice>('/contact-alert', { token: journey.contactToken });
      setContactNotice(notice);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not load the contact notice.');
    }
  }, [journey?.contactToken]);

  useEffect(() => {
    if (view !== 'contact' || !journey?.contactToken) return;
    void refreshContact();
    const poll = window.setInterval(() => void refreshContact(), 3000);
    return () => window.clearInterval(poll);
  }, [view, journey?.contactToken, refreshContact]);

  const contact = contacts.find((item) => item.id === contactId) ?? contacts[0];
  const secondsLeft = journey ? Math.ceil((Date.parse(journey.deadlineAt) - now) / 1000) : 0;
  const status = journey?.status.toLowerCase() as JourneyStatus | undefined;
  const hasJourney = !!journey && (status === 'active' || status === 'overdue');

  async function startJourney(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setApiError('');
    try {
      const started = await api<ApiJourney>('/journeys', {
        method: 'POST',
        body: {
          destinationLabel: destination.trim(),
          trustedContactId: contactId,
          arrivalWindowMinutes: windowMinutes,
          consent: { contactMayBeNotifiedIfOverdue: true },
        },
      });
      setJourney(mergeJourney(started));
      setContactNotice(null);
      setView('traveller');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not start the journey.');
    } finally {
      setBusy(false);
    }
  }

  async function journeyAction(path: string, body?: unknown) {
    if (!journey) return;
    setBusy(true);
    setApiError('');
    try {
      const updated = await api<ApiJourney>(`/journeys/${journey.id}/${path}`, {
        method: 'POST', token: journey.travellerToken, ...(body ? { body } : {}),
      });
      setJourney((current) => current ? mergeJourney(updated, current) : current);
      if (path === 'check-in' || path === 'cancel') await refreshContact();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not update the journey.');
      await refreshJourney();
    } finally {
      setBusy(false);
    }
  }

  async function acknowledgeNotice() {
    if (!journey) return;
    setBusy(true);
    try {
      const notice = await api<ContactNotice>('/contact-alert/acknowledge', { method: 'POST', token: journey.contactToken });
      setContactNotice(notice);
      setApiError('');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not acknowledge the notice.');
    } finally {
      setBusy(false);
    }
  }

  function startAnotherJourney() {
    setJourney(null);
    setContactNotice(null);
    setView('traveller');
    setApiError('');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="SafeArrival home" onClick={() => setView('traveller')}>
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>safe<span className="brand-light">arrival</span></span>
        </a>
        <div className="demo-pill"><span /> DEMO MODE</div>
        <button className="avatar-button" type="button" aria-label="Demo profile">A</button>
      </header>

      <main className="page-wrap">
        <div className="page-heading">
          <div>
            <p className="eyebrow">A little more peace of mind</p>
            <h1>{view === 'contact' ? 'A check-in to notice' : hasJourney ? 'Your journey' : 'Get there. Check in.'}</h1>
            <p className="heading-copy">
              {view === 'contact'
                ? 'See what a trusted contact would receive if a check-in became overdue.'
                : 'A simple way to let someone you trust know you made it in.'}
            </p>
          </div>
          <div className="view-switch" role="group" aria-label="Preview mode">
            <button className={view === 'traveller' ? 'selected' : ''} onClick={() => setView('traveller')} type="button">Traveller</button>
            <button className={view === 'contact' ? 'selected' : ''} onClick={() => setView('contact')} type="button">Contact view</button>
          </div>
        </div>

        <div className="demo-notice" role="note">
          <span className="notice-icon" aria-hidden="true">i</span>
          <p><strong>Demo mode.</strong> Deadlines are stored and evaluated by the server. Alerts are simulated in this app; no messages or location are shared.</p>
        </div>

        {apiError && <div className="api-error" role="alert"><strong>Something needs attention.</strong> {apiError}</div>}

        {view === 'contact' ? (
          <section className="contact-preview card">
            <div className="card-topline"><span className="section-kicker">TRUSTED CONTACT VIEW</span><span className="demo-tag">SIMULATED</span></div>
            {contactNotice?.status === 'OVERDUE' ? (
              <>
                <div className="alert-symbol" aria-hidden="true">!</div>
                <p className="eyebrow alert-eyebrow">CHECK-IN OVERDUE</p>
                <h2>{contactNotice.contactName} hasn’t checked in yet.</h2>
                <p className="body-copy">Their journey to <strong>{contactNotice.destinationLabel}</strong> is past the arrival window. This can happen for many reasons; it does not confirm an emergency.</p>
                <div className="alert-detail"><span>Journey status</span><strong>Overdue · demo alert</strong></div>
                <div className="alert-detail"><span>Location</span><strong>Not shared</strong></div>
                <div className="alert-detail"><span>Notification</span><strong>Simulated · no message sent</strong></div>
                <button className="button button-primary full-button" type="button" onClick={() => void acknowledgeNotice()} disabled={busy || !!contactNotice.acknowledgedAt}>
                  {contactNotice.acknowledgedAt ? 'Notice acknowledged' : busy ? 'Saving…' : 'Acknowledge notice'}
                </button>
                <p className="fine-print">Acknowledging means you saw this notice. It does not confirm the traveller is safe.</p>
              </>
            ) : contactNotice?.status === 'COMPLETED' ? (
              <div className="empty-contact"><div className="quiet-icon success" aria-hidden="true">✓</div><h2>The traveller checked in</h2><p>This journey has been marked complete. The notice was simulated and no message was sent.</p></div>
            ) : contactNotice?.status === 'CANCELLED' ? (
              <div className="empty-contact"><div className="quiet-icon" aria-hidden="true">—</div><h2>Journey cancelled</h2><p>The traveller cancelled this demo journey. No message was sent.</p></div>
            ) : contactNotice ? (
              <div className="empty-contact"><div className="quiet-icon" aria-hidden="true">✓</div><h2>No overdue check-in</h2><p>The journey is still within its arrival window. This page will update if the server marks it overdue.</p></div>
            ) : (
              <div className="empty-contact"><div className="quiet-icon" aria-hidden="true">✓</div><h2>No journey to show</h2><p>Start a fictional demo journey first. This contact view uses a private, temporary capability for that journey.</p><button className="text-button" type="button" onClick={() => setView('traveller')}>Back to traveller view <span aria-hidden="true">→</span></button></div>
            )}
          </section>
        ) : hasJourney && journey ? (
          <section className="journey-layout">
            <div className={`journey-card card ${status === 'overdue' ? 'is-overdue' : ''}`}>
              <div className="card-topline"><span className="section-kicker">SERVER-MANAGED JOURNEY</span><span className={`status-pill ${status}`}>{status === 'active' ? 'IN PROGRESS' : 'CHECK-IN OVERDUE'}</span></div>
              <div className="timer-area">
                <div className="timer-ring"><span className="timer-value">{status === 'active' ? formatTime(secondsLeft) : '00:00'}</span><span className="timer-caption">{status === 'active' ? 'remaining' : 'past deadline'}</span></div>
              </div>
              <div className="journey-destination"><span className="pin-icon" aria-hidden="true">⌖</span><div><span className="muted-label">Heading to</span><strong>{journey.destinationLabel}</strong></div></div>
              <div className="journey-contact"><span className={`contact-avatar ${contact?.color ?? 'lavender'}`}>{contact?.initials ?? 'TC'}</span><div><span className="muted-label">Trusted contact</span><strong>{journey.contactName}</strong></div><span className="contact-check" aria-label="Selected">✓</span></div>
              {status === 'active' ? (
                <>
                  <button className="button button-primary full-button" type="button" disabled={busy} onClick={() => void journeyAction('check-in')}><span aria-hidden="true">✓</span> I’m safely inside</button>
                  <button className="text-button simulate-button" type="button" disabled={busy} onClick={() => void journeyAction('demo/expire')}>Simulate a missed check-in</button>
                  <button className="text-button simulate-button" type="button" disabled={busy} onClick={() => void journeyAction('extend', { minutes: 5 })}>Give me 5 more minutes</button>
                </>
              ) : (
                <div className="overdue-actions">
                  <p>Your demo contact notice is ready in <button className="inline-link" onClick={() => setView('contact')} type="button">Contact view</button>.</p>
                  <button className="button button-primary full-button" type="button" disabled={busy} onClick={() => void journeyAction('check-in')}>I’m safely inside now</button>
                </div>
              )}
              <button className="cancel-button" type="button" disabled={busy} onClick={() => void journeyAction('cancel')}>Cancel journey</button>
            </div>
            <aside className="side-notes">
              <div className="side-card"><span className="side-icon mint" aria-hidden="true">✦</span><div><h3>A check-in, on your terms</h3><p>The server keeps the deadline. The contact notice stays simulated in this demo.</p></div></div>
              <div className="side-card"><span className="side-icon sand" aria-hidden="true">⌁</span><div><h3>Plans can change</h3><p>A missed check-in can happen for many reasons. It is not proof that something is wrong.</p></div></div>
            </aside>
          </section>
        ) : journey && (status === 'completed' || status === 'cancelled') ? (
          <section className="finished-card card">
            <div className={`quiet-icon ${status === 'completed' ? 'success' : ''}`}>{status === 'completed' ? '✓' : '—'}</div>
            <p className="eyebrow">{status === 'completed' ? 'CHECK-IN COMPLETE' : 'JOURNEY CANCELLED'}</p>
            <h2>{status === 'completed' ? 'Glad you made it in.' : 'Journey cancelled.'}</h2>
            <p className="body-copy">This was a simulated check-in. No message was sent to {journey.contactName}.</p>
            <button className="button button-primary" type="button" onClick={startAnotherJourney}>Start another journey</button>
          </section>
        ) : (
          <section className="setup-layout">
            <form className="setup-card card" onSubmit={startJourney}>
              <div className="card-topline"><span className="section-kicker">NEW JOURNEY</span><span className="step-label">01 <i /> 02</span></div>
              <label className="field-label" htmlFor="destination">Where are you heading?</label>
              <div className="input-wrap"><span aria-hidden="true">⌖</span><input id="destination" maxLength={48} value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g. Home" required /></div>
              <p className="field-hint">A short label is enough. No address needed.</p>

              <label className="field-label contact-label">Who should know you arrived?</label>
              <div className="contact-options" role="radiogroup" aria-label="Choose a trusted contact">
                {contacts.map((item) => (
                  <button className={`contact-option ${contactId === item.id ? 'active' : ''}`} key={item.id} type="button" role="radio" aria-checked={contactId === item.id} onClick={() => setContactId(item.id)}>
                    <span className={`contact-avatar ${item.color}`}>{item.initials}</span><span className="contact-option-copy"><strong>{item.name}</strong><small>{item.relation} · Demo contact</small></span><span className="radio-dot" />
                  </button>
                ))}
                {contacts.length === 0 && <p className="field-hint">Loading demo contacts from the API…</p>}
              </div>

              <label className="field-label window-label" htmlFor="arrival-window">Arrival window</label>
              <div className="window-control"><span>Allow time to get inside</span><div className="select-wrap"><select id="arrival-window" value={windowMinutes} onChange={(event) => setWindowMinutes(Number(event.target.value))}><option value={5}>5 min</option><option value={10}>10 min</option><option value={15}>15 min</option><option value={20}>20 min</option></select><span aria-hidden="true">⌄</span></div></div>
              <div className="consent-copy"><span aria-hidden="true">ⓘ</span><p>If this check-in becomes overdue, an in-app demo alert will be created. No external message or location is shared.</p></div>
              <button className="button button-primary full-button start-button" type="submit" disabled={busy || !contact}>{busy ? 'Starting…' : 'Start journey'} <span aria-hidden="true">→</span></button>
              <p className="form-footnote">Starting confirms this simulated contact alert behavior.</p>
            </form>
            <aside className="side-notes setup-notes">
              <div className="side-card"><span className="side-icon mint" aria-hidden="true">✦</span><div><h3>Keep it simple</h3><p>Choose a window that feels right for your usual arrival routine.</p></div></div>
              <div className="side-card"><span className="side-icon sand" aria-hidden="true">⌁</span><div><h3>Your privacy matters</h3><p>This demo uses fictional contacts and doesn’t request location.</p></div></div>
              <div className="quote-card"><span className="quote-mark">“</span><p>A missed check-in is a reason to check in — not a reason to assume.</p><span>SAFEARRIVAL PRINCIPLE</span></div>
            </aside>
          </section>
        )}

        <footer className="page-footer"><span>SafeArrival <i>·</i> A check-in concept for the journey home</span><span>Demo · No emergency response</span></footer>
      </main>
    </div>
  );
}
