import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthPage, MarketingPage, OnboardingPage } from './marketing';

type Account = { id: string; email: string; displayName: string; onboardingComplete: boolean; timezone: string; defaultArrivalWindowMinutes: number };

type Contact = { id: string; name: string; relation: string; initials: string; color: string };
type RuntimeInfo = { mode: 'demo' | 'live'; emailNotificationsEnabled: boolean; locationSharingEnabled: boolean };
type JourneyStatus = 'active' | 'overdue' | 'completed' | 'cancelled';
type SharedLocation = { latitude: number; longitude: number; accuracyMeters: number; capturedAt: string };
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
  locationShared: boolean;
  locationCapturedAt: string | null;
  locationAccuracyMeters: number | null;
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
  location: SharedLocation | null;
};

const STORAGE_KEY = 'safearrival.demo.journey';

async function api<T>(path: string, options: { token?: string; method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
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
  if (response.status === 204) return undefined as T;
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

function readContactTokenFromFragment(): string {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get('token') ?? '';
  if (token) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  return token;
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

function formatLocalTime(value: string, timezone?: string) {
  return new Intl.DateTimeFormat(undefined, { timeZone: timezone, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(value));
}

function formatLocalDate(value: string, timezone?: string) {
  return new Intl.DateTimeFormat(undefined, { timeZone: timezone, month: 'short', day: 'numeric' }).format(new Date(value));
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TC';
}

export default function App() {
  const [linkedContactToken] = useState(readContactTokenFromFragment);
  const [stage, setStage] = useState<'loading' | 'landing' | 'signin' | 'signup' | 'onboarding' | 'workspace'>(() => linkedContactToken ? 'workspace' : 'loading');
  const [account, setAccount] = useState<Account | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [onboardingTimezone, setOnboardingTimezone] = useState('Africa/Johannesburg');
  const [onboardingWindow, setOnboardingWindow] = useState(20);
  const [destination, setDestination] = useState('Home');
  const [contactId, setContactId] = useState('maya');
  const [windowMinutes, setWindowMinutes] = useState(5);
  const [trustedContactName, setTrustedContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [emailConsent, setEmailConsent] = useState(false);
  const [journeyConsent, setJourneyConsent] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [journeyHistory, setJourneyHistory] = useState<Journey[]>([]);
  const [journey, setJourney] = useState<Journey | null>(readSavedJourney);
  const [contactNotice, setContactNotice] = useState<ContactNotice | null>(null);
  const [contactNoticeLoading, setContactNoticeLoading] = useState(!!linkedContactToken);
  const [runtime, setRuntime] = useState<RuntimeInfo>({ mode: 'demo', emailNotificationsEnabled: false, locationSharingEnabled: false });
  const [now, setNow] = useState(Date.now());
  const [view, setView] = useState<'traveller' | 'contact'>(() => linkedContactToken ? 'contact' : 'traveller');
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (linkedContactToken) return;
    api<Account>('/auth/me').then((current) => {
      setAccount(current);
      setOnboardingTimezone(current.timezone);
      setOnboardingWindow(current.defaultArrivalWindowMinutes);
      setWindowMinutes(current.defaultArrivalWindowMinutes);
      setStage(current.onboardingComplete ? 'workspace' : 'onboarding');
      api<ApiJourney[]>('/journeys').then((items) => {
        setJourneyHistory(items.map((item) => mergeJourney(item)));
        const active = items.find((item) => ['ACTIVE', 'OVERDUE'].includes(item.status.toUpperCase()));
        setJourney(active ? mergeJourney(active) : null);
      }).catch(() => undefined);
    }).catch(() => setStage('landing'));
  }, [linkedContactToken]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    api<RuntimeInfo>('/runtime').then(setRuntime).catch(() => setApiError('Can’t read the API runtime configuration.'));
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

  const contactCapability = linkedContactToken || journey?.contactToken || '';

  const refreshContact = useCallback(async () => {
    if (!contactCapability) return;
    try {
      const notice = await api<ContactNotice>('/contact-alert', { token: contactCapability });
      setContactNotice(notice);
      setContactNoticeLoading(false);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not load the contact notice.');
      setContactNoticeLoading(false);
    }
  }, [contactCapability]);

  useEffect(() => {
    if (view !== 'contact' || !contactCapability) return;
    void refreshContact();
    const poll = window.setInterval(() => void refreshContact(), 3000);
    return () => window.clearInterval(poll);
  }, [view, contactCapability, refreshContact]);

  const contact = contacts.find((item) => item.id === contactId) ?? contacts[0];
  const journeyContact = contacts.find((item) => item.name === journey?.contactName);
  const secondsLeft = journey ? Math.ceil((Date.parse(journey.deadlineAt) - now) / 1000) : 0;
  const status = journey?.status.toLowerCase() as JourneyStatus | undefined;
  const hasJourney = !!journey && (status === 'active' || status === 'overdue');

  async function submitAuthentication(values: { displayName: string; email: string; password: string }) {
    setAuthBusy(true);
    setAuthError('');
    try {
      const route = stage === 'signup' ? '/auth/register' : '/auth/login';
      const signedIn = await api<Account>(route, { method: 'POST', body: values });
      setAccount(signedIn);
      setOnboardingTimezone(signedIn.timezone);
      setOnboardingWindow(signedIn.defaultArrivalWindowMinutes);
      setWindowMinutes(signedIn.defaultArrivalWindowMinutes);
      setStage(signedIn.onboardingComplete ? 'workspace' : 'onboarding');
      if (route === '/auth/register') { setJourney(null); setJourneyHistory([]); }
      else if (signedIn.onboardingComplete) {
        const items = await api<ApiJourney[]>('/journeys');
        setJourneyHistory(items.map((item) => mergeJourney(item)));
        const active = items.find((item) => ['ACTIVE', 'OVERDUE'].includes(item.status.toUpperCase()));
        setJourney(active ? mergeJourney(active) : null);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'We couldn’t sign you in. Please try again.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function completeOnboarding() {
    setAuthBusy(true);
    setAuthError('');
    try {
      const updated = await api<Account>('/auth/onboarding', { method: 'POST', body: { timezone: onboardingTimezone, defaultArrivalWindowMinutes: onboardingWindow } });
      setAccount(updated);
      setWindowMinutes(updated.defaultArrivalWindowMinutes);
      setStage('workspace');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not save your preferences.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    try { await api<void>('/auth/logout', { method: 'POST' }); } catch { /* Local state still ends this session. */ }
    setAccount(null);
    setJourney(null);
    setJourneyHistory([]);
    setStage('landing');
  }

  if (stage === 'loading' && !linkedContactToken) return <div className="app-loading"><span className="sa-brand-icon"><span /></span><p>Opening your SafeArrival space…</p></div>;
  if (stage === 'landing') return <MarketingPage onSignUp={() => setStage('signup')} onSignIn={() => setStage('signin')} />;
  if (stage === 'signin' || stage === 'signup') return <AuthPage mode={stage} busy={authBusy} error={authError} onSubmit={(values) => void submitAuthentication(values)} onSwitch={() => { setAuthError(''); setStage(stage === 'signin' ? 'signup' : 'signin'); }} onHome={() => setStage('landing')} />;
  if (stage === 'onboarding' && account) return <OnboardingPage name={account.displayName} timezone={onboardingTimezone} arrivalWindow={onboardingWindow} busy={authBusy} error={authError} onChangeTimezone={setOnboardingTimezone} onChangeWindow={setOnboardingWindow} onComplete={() => void completeOnboarding()} onLogout={() => void signOut()} />;

  async function startJourney(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setApiError('');
    try {
      const started = await api<ApiJourney>('/journeys', {
        method: 'POST',
        body: {
          destinationLabel: destination.trim(),
          trustedContactId: runtime.emailNotificationsEnabled ? null : contactId,
          trustedContactName: runtime.emailNotificationsEnabled ? trustedContactName.trim() : null,
          contactEmail: runtime.emailNotificationsEnabled ? contactEmail.trim() : null,
          arrivalWindowMinutes: windowMinutes,
          consent: { contactMayBeNotifiedIfOverdue: journeyConsent, emailAlertConsent: emailConsent },
        },
      });
      setJourney(mergeJourney(started));
      setJourneyHistory((items) => [mergeJourney(started), ...items.filter((item) => item.id !== started.id)]);
      setContactNotice(null);
      setJourneyConsent(false);
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
      setJourneyHistory((items) => items.map((item) => item.id === updated.id ? mergeJourney(updated, item) : item));
      if (path === 'check-in' || path === 'cancel') await refreshContact();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not update the journey.');
      await refreshJourney();
    } finally {
      setBusy(false);
    }
  }

  async function acknowledgeNotice() {
    if (!contactCapability) return;
    setBusy(true);
    try {
      const notice = await api<ContactNotice>('/contact-alert/acknowledge', { method: 'POST', token: contactCapability });
      setContactNotice(notice);
      setApiError('');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not acknowledge the notice.');
    } finally {
      setBusy(false);
    }
  }

  async function shareCurrentLocation() {
    if (!journey || !navigator.geolocation) {
      setApiError('This browser does not provide location sharing.');
      return;
    }
    if (!window.isSecureContext) {
      setApiError('Location sharing requires HTTPS (or localhost during development).');
      return;
    }
    setBusy(true);
    setApiError('');
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, maximumAge: 0, timeout: 15000 });
      });
      const updated = await api<ApiJourney>(`/journeys/${journey.id}/location`, {
        method: 'POST', token: journey.travellerToken,
        body: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: Math.ceil(position.coords.accuracy),
          capturedAt: new Date(position.timestamp).toISOString(),
          consent: true,
        },
      });
      setJourney((current) => current ? mergeJourney(updated, current) : current);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Location could not be shared. Check browser permission and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function removeSharedLocation() {
    if (!journey) return;
    setBusy(true);
    try {
      const updated = await api<ApiJourney>(`/journeys/${journey.id}/location`, { method: 'DELETE', token: journey.travellerToken });
      setJourney((current) => current ? mergeJourney(updated, current) : current);
      setApiError('');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not remove the shared location.');
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
        <div className={`demo-pill ${runtime.mode}`}><span /> {runtime.emailNotificationsEnabled ? 'LIVE EMAIL' : 'DEMO MODE'}</div>
        {account && <div className="account-menu"><span className="account-name">{account.displayName}</span><span className="avatar-button" aria-hidden="true">{account.displayName.slice(0, 1).toUpperCase()}</span><button className="workspace-signout" type="button" onClick={() => void signOut()}>Sign out</button></div>}
      </header>

      <main className="page-wrap">
        <div className="page-heading">
          <div>
            <p className="eyebrow">A little more peace of mind</p>
            <h1>{view === 'contact' ? 'A check-in to notice' : hasJourney ? 'Your journey' : account ? `${journeyHistory.length ? 'Welcome back' : 'Welcome'}, ${account.displayName.split(' ')[0]}.` : 'Get there. Check in.'}</h1>
            <p className="heading-copy">
              {view === 'contact'
                ? 'See what a trusted contact would receive if a check-in became overdue.'
                : account ? 'Your private space for planning a journey and checking in.' : 'A simple way to let someone you trust know you made it in.'}
            </p>
          </div>
          {runtime.mode === 'demo' && <div className="view-switch" role="group" aria-label="Preview mode">
            <button className={view === 'traveller' ? 'selected' : ''} onClick={() => setView('traveller')} type="button" aria-pressed={view === 'traveller'}>Traveller</button>
            <button className={view === 'contact' ? 'selected' : ''} onClick={() => { if (!contactNotice && contactCapability) setContactNoticeLoading(true); setView('contact'); }} type="button" aria-pressed={view === 'contact'} disabled={runtime.emailNotificationsEnabled && !linkedContactToken}>Contact view</button>
          </div>}
        </div>

        <div className="demo-notice" role="note">
          <span className="notice-icon" aria-hidden="true">i</span>
          {runtime.mode === 'live'
            ? <p><strong>Live email mode.</strong> A real email may be sent to the approved recipient if the server marks this journey overdue. Location is shared only after you request it. Email does not guarantee delivery or emergency response.</p>
            : <p><strong>Demo mode.</strong> Deadlines are stored and evaluated by the server. Alerts are simulated in this app; no email is sent. Location sharing is available only when encrypted storage is configured.</p>}
        </div>

        {apiError && <div className="api-error" role="alert"><strong>Something needs attention.</strong> {apiError}</div>}

        {view === 'contact' ? (
          <section className="contact-preview card">
            <div className="card-topline"><span className="section-kicker">TRUSTED CONTACT VIEW</span><span className="demo-tag">{contactNotice?.notificationStatus === 'SIMULATED' ? 'SIMULATED' : 'PRIVATE LINK'}</span></div>
            {contactNoticeLoading && !contactNotice ? (
              <div className="empty-contact" role="status"><div className="contact-loading-mark" aria-hidden="true" /><h2>Opening the private notice</h2><p>Loading the latest check-in status securely.</p></div>
            ) : apiError && linkedContactToken && !contactNotice ? (
              <div className="empty-contact"><div className="quiet-icon" aria-hidden="true">!</div><h2>Notice unavailable</h2><p>We couldn’t load this private notice. Check your connection and reopen the link.</p></div>
            ) : contactNotice?.status === 'OVERDUE' ? (
              <>
                <div className="alert-symbol" aria-hidden="true">!</div>
                <p className="eyebrow alert-eyebrow">CHECK-IN OVERDUE</p>
                <h2>{contactNotice.contactName} hasn’t checked in yet.</h2>
                <p className="body-copy">Their journey to <strong>{contactNotice.destinationLabel}</strong> is past the arrival window. This can happen for many reasons; it does not confirm an emergency.</p>
                <div className="alert-detail"><span>Journey status</span><strong>{contactNotice.notificationStatus === 'SIMULATED' ? 'Overdue · simulated notice' : 'Overdue'}</strong></div>
                <div className="alert-detail"><span>Location</span><strong>{contactNotice.location ? `Shared once · ${formatLocalTime(contactNotice.location.capturedAt, account?.timezone)}` : 'Not shared'}</strong></div>
                <div className="alert-detail"><span>Email status</span><strong>{contactNotice.notificationStatus === 'SENT' ? 'Accepted by Gmail SMTP; delivery not confirmed' : contactNotice.notificationStatus === 'QUEUED' ? 'Email queued' : contactNotice.notificationStatus === 'FAILED' ? 'Email not sent' : contactNotice.notificationStatus === 'UNKNOWN' ? 'Send result unknown; not retried' : contactNotice.notificationStatus === 'CANCELLED' ? 'Queued email cancelled before send' : 'Simulated · no message sent'}</strong></div>
                {contactNotice.location && (
                  <div className="shared-location">
                    <p className="section-kicker">LAST LOCATION SHARED BY TRAVELLER</p>
                    <p>±{contactNotice.location.accuracyMeters} m · {formatLocalTime(contactNotice.location.capturedAt, account?.timezone)}</p>
                    <a href={`https://www.openstreetmap.org/?mlat=${contactNotice.location.latitude}&mlon=${contactNotice.location.longitude}#map=17/${contactNotice.location.latitude}/${contactNotice.location.longitude}`} target="_blank" rel="noreferrer">Open in OpenStreetMap ↗</a>
                    <small>This opens a third-party map with the shared coordinates.</small>
                  </div>
                )}
                <div className="emergency-panel">
                  <strong>Need emergency help?</strong>
                  <p>If there is an immediate emergency, call the appropriate service directly. This app does not dispatch responders.</p>
                  <div><a href="tel:10111">Call SAPS 10111</a><a href="tel:112">Call 112 from a mobile</a></div>
                </div>
                <button className="button button-primary full-button" type="button" onClick={() => void acknowledgeNotice()} disabled={busy || !!contactNotice.acknowledgedAt}>
                  {contactNotice.acknowledgedAt ? 'Notice acknowledged' : busy ? 'Saving…' : 'Acknowledge notice'}
                </button>
                <p className="fine-print">Acknowledging means you saw this notice. It does not confirm the traveller is safe.</p>
              </>
            ) : contactNotice?.status === 'COMPLETED' ? (
              <div className="empty-contact"><div className="quiet-icon success" aria-hidden="true">✓</div><h2>The traveller checked in</h2><p>This journey was marked complete after the overdue notice. That check-in is not proof of an emergency response.</p></div>
            ) : contactNotice?.status === 'CANCELLED' ? (
              <div className="empty-contact"><div className="quiet-icon" aria-hidden="true">—</div><h2>Journey cancelled</h2><p>The traveller cancelled this journey. No resolution email is sent automatically.</p></div>
            ) : contactNotice ? (
              <div className="empty-contact"><div className="quiet-icon" aria-hidden="true">✓</div><h2>No overdue check-in</h2><p>The journey is still within its arrival window. This page will update if the server marks it overdue.</p></div>
            ) : (
              <div className="empty-contact"><div className="quiet-icon" aria-hidden="true">✓</div><h2>No journey to show</h2><p>Start a fictional demo journey first. This contact view uses a private, temporary capability for that journey.</p><button className="text-button" type="button" onClick={() => setView('traveller')}>Back to traveller view <span aria-hidden="true">→</span></button></div>
            )}
          </section>
        ) : hasJourney && journey ? (
          <section className="journey-layout">
            <div className={`journey-card card ${status === 'overdue' ? 'is-overdue' : ''}`}>
              <div className="card-topline"><span className="section-kicker">SERVER-MANAGED JOURNEY</span><span className={`status-pill ${status}`} role="status" aria-live="polite">{status === 'active' ? 'IN PROGRESS' : 'CHECK-IN OVERDUE'}</span></div>
              <div className="timer-area">
                <div className="timer-ring" role="timer" aria-label={status === 'active' ? `${formatTime(secondsLeft)} remaining` : 'Past deadline'}><span className="timer-value" aria-live="off">{status === 'active' ? formatTime(secondsLeft) : '00:00'}</span><span className="timer-caption">{status === 'active' ? 'remaining' : 'past deadline'}</span></div>
                <p className="journey-deadline">Check in by <strong>{formatLocalTime(journey.deadlineAt, account?.timezone)}</strong></p>
              </div>
              <div className="journey-destination"><span className="pin-icon" aria-hidden="true">⌖</span><div><span className="muted-label">Heading to</span><strong>{journey.destinationLabel}</strong></div></div>
              <div className="journey-contact"><span className={`contact-avatar ${journeyContact?.color ?? 'lavender'}`}>{journeyContact?.initials ?? getInitials(journey.contactName)}</span><div><span className="muted-label">Trusted contact</span><strong>{journey.contactName}</strong></div><span className="contact-check" aria-label="Selected">✓</span></div>
              <div className="location-control">
                {journey.locationShared
                  ? <><p>One-time location shared{journey.locationCapturedAt ? ` at ${formatLocalTime(journey.locationCapturedAt, account?.timezone)}` : ''} (±{journey.locationAccuracyMeters ?? 'unknown'} m). It appears to your contact only if this journey becomes overdue.</p><button className="text-button" type="button" disabled={busy} onClick={() => void removeSharedLocation()}>Remove shared location</button></>
                  : <p>{runtime.locationSharingEnabled ? 'Off by default. Share one current fix; it will appear to your contact only if this journey becomes overdue. No live tracking.' : 'Location sharing is unavailable until encrypted data storage is configured.'}</p>}
                {!journey.locationShared && runtime.locationSharingEnabled && <button className="button button-secondary full-button" type="button" disabled={busy} onClick={() => void shareCurrentLocation()}>{busy ? 'Getting location…' : 'Share one-time location'}</button>}
              </div>
              {status === 'active' ? (
                <>
                  <button className="button button-primary full-button" type="button" disabled={busy} onClick={() => void journeyAction('check-in')}><span aria-hidden="true">✓</span> I’m safely inside</button>
                  {runtime.mode === 'demo' && <button className="text-button simulate-button" type="button" disabled={busy} onClick={() => void journeyAction('demo/expire')}>Simulate a missed check-in</button>}
                  <button className="text-button simulate-button" type="button" disabled={busy} onClick={() => void journeyAction('extend', { minutes: 5 })}>Give me 5 more minutes</button>
                </>
              ) : (
                <div className="overdue-actions">
                  <p>{runtime.mode === 'demo' ? <>Your simulated notice is in <button className="inline-link" onClick={() => setView('contact')} type="button">Contact view</button>.</> : `Email status: ${journey.notificationStatus}. Check the contact inbox; the app cannot confirm they read it.`}</p>
                  <button className="button button-primary full-button" type="button" disabled={busy} onClick={() => void journeyAction('check-in')}>I’m safely inside now</button>
                </div>
              )}
              <button className="cancel-button" type="button" disabled={busy} onClick={() => void journeyAction('cancel')}>Cancel journey</button>
            </div>
            <aside className="side-notes">
              <div className="side-card"><span className="side-icon mint" aria-hidden="true">✦</span><div><h3>A check-in, on your terms</h3><p>The server keeps the deadline. {runtime.mode === 'demo' ? 'Notices are simulated.' : 'Email is attempted after an overdue check-in.'}</p></div></div>
              <div className="side-card"><span className="side-icon sand" aria-hidden="true">⌁</span><div><h3>Plans can change</h3><p>A missed check-in can happen for many reasons. It is not proof that something is wrong.</p></div></div>
              <div className="emergency-panel"><strong>Immediate danger?</strong><p>If you can call safely, contact emergency services directly. SafeArrival cannot dispatch help.</p><div><a href="tel:10111">SAPS 10111</a><a href="tel:112">112 from a mobile</a></div></div>
            </aside>
          </section>
        ) : journey && (status === 'completed' || status === 'cancelled') ? (
          <section className="finished-card card">
            <div className={`quiet-icon ${status === 'completed' ? 'success' : ''}`}>{status === 'completed' ? '✓' : '—'}</div>
            <p className="eyebrow">{status === 'completed' ? 'CHECK-IN COMPLETE' : 'JOURNEY CANCELLED'}</p>
            <h2>{status === 'completed' ? 'Glad you made it in.' : 'Journey cancelled.'}</h2>
            <p className="body-copy">This journey is complete. {journey.notificationStatus === 'SENT' ? 'Gmail accepted the overdue email; that does not confirm inbox delivery.' : `Email status: ${journey.notificationStatus}.`}</p>
            <button className="button button-primary" type="button" onClick={startAnotherJourney}>Start another journey</button>
          </section>
        ) : (
          <section className="setup-layout">
            <form className="setup-card card" onSubmit={startJourney}>
              <div className="card-topline"><span className="section-kicker">NEW JOURNEY</span><span className="step-label">Your check-in</span></div>
              <Label className="field-label" htmlFor="destination">Where are you heading?</Label>
              <div className="input-wrap"><span aria-hidden="true">⌖</span><Input id="destination" maxLength={48} value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g. Home" required /></div>
              <p className="field-hint">A short label is enough. No address needed.</p>

              {runtime.emailNotificationsEnabled ? (
                <>
                  <Label className="field-label contact-label" htmlFor="trusted-name">Trusted contact</Label>
                  <Input className="plain-input" id="trusted-name" value={trustedContactName} onChange={(event) => setTrustedContactName(event.target.value)} maxLength={80} placeholder="Contact’s name" required />
                  <Label className="field-label contact-label" htmlFor="contact-email">Contact email</Label>
                  <Input className="plain-input" id="contact-email" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} maxLength={254} placeholder="name@example.com" required />
                  <p className="field-hint">Live demo sends only to addresses approved in the server environment.</p>
                  <label className="consent-check"><input type="checkbox" checked={emailConsent} onChange={(event) => setEmailConsent(event.target.checked)} required /><span>I have permission to share this email and notify this person if I miss my check-in.</span></label>
                </>
              ) : (
                <>
                  <p className="field-label contact-label" id="contact-options-label">Who should know you arrived?</p>
                  <div className="contact-options" role="group" aria-labelledby="contact-options-label">
                    {contacts.map((item) => (
                      <button className={`contact-option ${contactId === item.id ? 'active' : ''}`} key={item.id} type="button" aria-pressed={contactId === item.id} onClick={() => setContactId(item.id)}>
                        <span className={`contact-avatar ${item.color}`}>{item.initials}</span><span className="contact-option-copy"><strong>{item.name}</strong><small>{item.relation} · Fictional contact</small></span><span className="radio-dot" />
                      </button>
                    ))}
                    {contacts.length === 0 && <p className="field-hint">Loading demo contacts from the API…</p>}
                  </div>
                </>
              )}

              <Label className="field-label window-label" htmlFor="arrival-window">Arrival window</Label>
              <div className="window-control"><span>Time to arrive and check in</span><div className="select-wrap"><select id="arrival-window" value={windowMinutes} onChange={(event) => setWindowMinutes(Number(event.target.value))}><option value={5}>5 min</option><option value={10}>10 min</option><option value={15}>15 min</option><option value={20}>20 min</option><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>1 hour</option><option value={90}>1 hr 30</option><option value={120}>2 hours</option></select><span aria-hidden="true">⌄</span></div></div>
              <label className="consent-check"><input type="checkbox" checked={journeyConsent} onChange={(event) => setJourneyConsent(event.target.checked)} required /><span>{runtime.emailNotificationsEnabled ? 'I understand an overdue check-in may send the selected contact an email. Delivery is not guaranteed.' : 'I understand an overdue check-in creates a simulated notice and contacts nobody.'}</span></label>
              <button className="button button-primary full-button start-button" type="submit" disabled={busy || (!runtime.emailNotificationsEnabled && !contact)}>{busy ? 'Starting…' : 'Start journey'} <span aria-hidden="true">→</span></button>
              <p className="form-footnote">Location is never collected automatically. You can choose a one-time share during a journey.</p>
            </form>
            <aside className="side-notes setup-notes">
              {account && <div className="history-card"><div className="history-heading"><div><span className="section-kicker">YOUR ACTIVITY</span><h3>Recent journeys</h3></div><span className="history-count">{journeyHistory.length}</span></div>{journeyHistory.length ? journeyHistory.slice(0, 4).map((item) => <button className="history-item" type="button" key={item.id} onClick={() => { setJourney(item); setView('traveller'); }}><span className={`history-status ${item.status.toLowerCase()}`} /><span className="history-copy"><strong>{item.destinationLabel}</strong><small>{formatLocalDate(item.startedAt, account.timezone)} · {item.status.toLowerCase()}</small></span><span className="history-arrow">→</span></button>) : <p className="history-empty">Your check-ins will appear here after your first journey.</p>}</div>}
              <div className="side-card"><span className="side-icon mint" aria-hidden="true">✦</span><div><h3>Keep it simple</h3><p>Choose a window that feels right for your usual arrival routine.</p></div></div>
              <div className="side-card"><span className="side-icon sand" aria-hidden="true">⌁</span><div><h3>Your privacy matters</h3><p>Location is off by default. You choose if and when to share one location fix.</p></div></div>
              <div className="quote-card"><span className="quote-mark">“</span><p>A missed check-in is a reason to check in — not a reason to assume.</p><span>SAFEARRIVAL PRINCIPLE</span></div>
            </aside>
          </section>
        )}

        <footer className="page-footer"><span>SafeArrival <i>·</i> A check-in concept for the journey home</span><span>Contact alerts are not emergency dispatch</span></footer>
      </main>
    </div>
  );
}
