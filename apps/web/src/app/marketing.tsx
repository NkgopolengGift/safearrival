import { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BellRing, Check, Clock3, HeartHandshake, LockKeyhole, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type MarketingProps = { onSignUp: () => void; onSignIn: () => void };

export function MarketingPage({ onSignUp, onSignIn }: MarketingProps) {
  return (
    <div className="marketing-page">
      <header className="marketing-nav">
        <a className="sa-brand" href="#top" aria-label="SafeArrival home"><span className="sa-brand-icon"><ShieldCheck size={19} strokeWidth={2.2} /></span><span>safe<span>arrival</span></span></a>
        <nav className="marketing-links" aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#privacy">Privacy</a><a href="#about">About</a></nav>
        <div className="marketing-actions"><Button variant="ghost" onClick={onSignIn}>Sign in</Button><Button onClick={onSignUp}>Create an account <ArrowRight size={16} /></Button></div>
      </header>

      <main id="top">
        <section className="marketing-hero">
          <div className="marketing-copy">
            <div className="eyebrow-pill"><span className="eyebrow-dot" /> A calmer way to check in</div>
            <h1>Make it home.<br /><span>Let them know.</span></h1>
            <p className="marketing-lede">Set a time to check in after your journey. If plans change and you miss it, someone you trust can be notified.</p>
            <div className="marketing-cta"><Button size="lg" onClick={onSignUp}>Get started <ArrowUpRight size={18} /></Button><a className="text-cta" href="#how-it-works">See how it works <ArrowDown size={15} /></a></div>
            <div className="hero-reassurance"><LockKeyhole size={15} /><span>Your journey. Your choices. No location tracking by default.</span></div>
          </div>

          <div className="hero-visual" aria-label="Preview of the SafeArrival journey dashboard">
            <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
            <Card className="preview-card">
              <CardContent>
                <div className="preview-top"><div><span className="preview-label">YOUR JOURNEY</span><span className="preview-date">Today · 8:42 PM</span></div><span className="preview-live"><i /> ACTIVE</span></div>
                <div className="preview-heading"><span>On your way</span><span className="preview-clock"><Clock3 size={16} /> 18:24</span></div>
                <div className="preview-route"><div className="route-mark"><span /><i /><MapPin size={18} /></div><div className="route-copy"><span>Starting point</span><strong>City centre</strong><span className="route-destination-label">Destination</span><strong>Home</strong></div></div>
                <div className="preview-divider" />
                <div className="preview-contact"><div className="contact-portrait">N</div><div><strong>Nomsa Dlamini</strong><span>Your trusted contact</span></div><span className="preview-check"><Check size={15} /></span></div>
                <button type="button" className="preview-checkin"><Check size={17} /> I’m safely inside</button>
                <p className="preview-caption">A missed check-in is a prompt to check in — not a reason to assume.</p>
              </CardContent>
            </Card>
            <div className="floating-note"><span className="floating-icon"><BellRing size={16} /></span><span><strong>Only if you miss your check-in</strong><small>Your contact receives a heads-up</small></span></div>
            <div className="visual-caption"><Sparkles size={13} /> Designed to keep the important things simple</div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Product principles"><div><ShieldCheck /><span>Private by design</span></div><div><HeartHandshake /><span>People you choose</span></div><div><MapPin /><span>Location stays off</span></div><div><Clock3 /><span>You set the window</span></div></section>

        <section className="marketing-section" id="how-it-works">
          <div className="section-intro"><span className="section-overline">A SMALL ROUTINE, MADE EASIER</span><h2>Three simple steps.<br />One less thing to worry about.</h2><p>SafeArrival helps you set an expectation with someone you trust, while leaving the decisions in your hands.</p></div>
          <div className="steps-grid">
            <article className="step-card"><span className="step-number">01</span><span className="step-icon"><MapPin /></span><h3>Plan your check-in</h3><p>Choose where you’re heading and how long you expect to take. You don’t need to enter an exact address.</p></article>
            <article className="step-card"><span className="step-number">02</span><span className="step-icon"><Clock3 /></span><h3>Get there at your pace</h3><p>Check in when you arrive. If you need more time, extend your window or cancel the journey.</p></article>
            <article className="step-card"><span className="step-number">03</span><span className="step-icon"><HeartHandshake /></span><h3>Keep someone in the loop</h3><p>If your check-in becomes overdue, your chosen contact can get a notice. They can decide what to do next.</p></article>
          </div>
        </section>

        <section className="privacy-section" id="privacy"><div className="privacy-art"><div className="privacy-card"><span className="privacy-shield"><LockKeyhole size={21} /></span><span className="privacy-small">YOUR JOURNEY DATA</span><strong>Shared on your terms.</strong><div className="privacy-line"><span>Location</span><b>Off</b></div><div className="privacy-line"><span>Contact alert</span><b>On request</b></div><div className="privacy-line"><span>Journey status</span><b>Private</b></div></div><div className="privacy-leaf leaf-a" /><div className="privacy-leaf leaf-b" /></div>
          <div className="privacy-copy"><span className="section-overline">BUILT AROUND YOUR CHOICES</span><h2>Useful when you need it.<br /><span>Quiet when you don’t.</span></h2><p>SafeArrival is a check-in tool, not a tracking app. Your location is off by default. You can choose to share one location fix during a journey and remove it at any time.</p><ul><li><Check /> No background location tracking</li><li><Check /> You choose who can receive an alert</li><li><Check /> Clear status when an email is sent or uncertain</li></ul><a className="text-cta" href="#about">Our approach to safety <ArrowRight size={15} /></a></div></section>

        <section className="disclaimer-section" id="about"><ShieldCheck size={21} /><div><strong>A check-in aid, not an emergency service.</strong><p>SafeArrival does not dispatch responders or guarantee that a contact will see an alert. In an emergency, call your local emergency services directly.</p></div><a href="tel:112">Emergency help <ArrowUpRight size={15} /></a></section>
        <section className="closing-cta"><div><span className="section-overline">START WITH A SIMPLE CHECK-IN</span><h2>A little more peace of mind,<br />on your terms.</h2></div><Button size="lg" onClick={onSignUp}>Create your free account <ArrowRight size={17} /></Button></section>
      </main>
      <footer className="marketing-footer"><a className="sa-brand" href="#top"><span className="sa-brand-icon"><ShieldCheck size={18} /></span><span>safe<span>arrival</span></span></a><span>Thoughtful check-ins for the journey home.</span><span>© 2026 SafeArrival</span></footer>
    </div>
  );
}

type AuthPageProps = { mode: 'signin' | 'signup'; busy: boolean; error: string; onSubmit: (values: { displayName: string; email: string; password: string }) => void; onSwitch: () => void; onHome: () => void };

export function AuthPage({ mode, busy, error, onSubmit, onSwitch, onHome }: AuthPageProps) {
  const signup = mode === 'signup';
  const [passwordError, setPasswordError] = useState('');
  return <div className="auth-layout">
    <aside className="auth-aside"><button type="button" className="auth-back sa-brand" onClick={onHome}><span className="sa-brand-icon"><ShieldCheck size={19} /></span><span>safe<span>arrival</span></span></button><div className="auth-aside-content"><div className="auth-quote-mark">“</div><h2>A little more peace of mind, on your terms.</h2><p>Small, thoughtful check-ins can make it easier to keep the people you care about in the loop.</p><div className="auth-aside-points"><span><Check /> Location stays off by default</span><span><Check /> You choose your trusted contacts</span></div></div><span className="auth-aside-foot">A check-in aid, not emergency dispatch.</span></aside>
    <main className="auth-main"><div className="auth-form-wrap"><div className="auth-mobile-brand"><span className="sa-brand-icon"><ShieldCheck size={18} /></span> safe<span>arrival</span></div><span className="section-overline">{signup ? 'GET STARTED' : 'WELCOME BACK'}</span><h1>{signup ? 'Create your account' : 'Sign in to SafeArrival'}</h1><p className="auth-intro">{signup ? 'Set up your private space for journey check-ins.' : 'Pick up where you left off.'}</p>
      <form className="auth-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const password = String(data.get('password') ?? ''); const confirmation = String(data.get('confirmPassword') ?? ''); if (signup && password !== confirmation) { setPasswordError('Your passwords don’t match.'); return; } setPasswordError(''); onSubmit({ displayName: String(data.get('displayName') ?? ''), email: String(data.get('email') ?? ''), password }); }}>
        {signup && <Label className="ui-field"><span>Your name</span><Input name="displayName" autoComplete="name" placeholder="e.g. Alex Morgan" minLength={2} maxLength={80} required /></Label>}
        <Label className="ui-field"><span>Email address</span><Input name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required /></Label>
        <Label className="ui-field"><span>Password</span><Input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'At least 12 characters' : 'Your password'} minLength={signup ? 12 : undefined} maxLength={72} required />{signup && <small>Use 12–72 characters. A longer passphrase is easier to remember.</small>}</Label>
        {signup && <Label className="ui-field"><span>Confirm password</span><Input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Enter your password again" minLength={12} maxLength={72} required onChange={() => setPasswordError('')} /></Label>}
        {(passwordError || error) && <p className="auth-error" role="alert">{passwordError || error}</p>}
        <Button type="submit" size="lg" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></Button>
      </form>
      <p className="auth-switch">{signup ? 'Already have an account?' : 'New to SafeArrival?'} <button type="button" onClick={() => { setPasswordError(''); onSwitch(); }}>{signup ? 'Sign in' : 'Create an account'}</button></p>
      <p className="auth-terms">By continuing, you agree to use SafeArrival as a check-in aid. It does not provide emergency response.</p>
    </div></main>
  </div>;
}

type OnboardingProps = { name: string; timezone: string; arrivalWindow: number; busy: boolean; error: string; onChangeTimezone: (value: string) => void; onChangeWindow: (value: number) => void; onComplete: () => void; onLogout: () => void };

export function OnboardingPage({ name, timezone, arrivalWindow, busy, error, onChangeTimezone, onChangeWindow, onComplete, onLogout }: OnboardingProps) {
  return <div className="onboarding-layout"><header className="onboarding-nav"><a className="sa-brand" href="#"><span className="sa-brand-icon"><ShieldCheck size={19} /></span><span>safe<span>arrival</span></span></a><button onClick={onLogout} type="button" className="onboarding-logout">Sign out</button></header><main className="onboarding-main"><div className="onboarding-progress" aria-label="Onboarding step 1 of 1"><span className="progress-current" aria-current="step">01</span><small>YOUR PREFERENCES</small></div><span className="section-overline">LET’S MAKE THIS YOURS</span><h1>Welcome, {name.split(' ')[0]}.</h1><p className="onboarding-lede">Set your time zone and usual arrival window. You can review each choice when you plan a journey.</p><Card className="onboarding-card"><CardContent><div className="onboarding-field"><Label htmlFor="timezone">Your time zone</Label><p>Journey deadlines will be shown in your local time.</p><select id="timezone" value={timezone} onChange={(event) => onChangeTimezone(event.target.value)}><option value="Africa/Johannesburg">South Africa (Johannesburg)</option><option value="Africa/Nairobi">East Africa (Nairobi)</option><option value="Europe/London">United Kingdom (London)</option><option value="America/New_York">United States (New York)</option><option value="America/Los_Angeles">United States (Los Angeles)</option><option value="UTC">UTC</option></select></div><div className="onboarding-field"><Label htmlFor="default-window">Usual arrival window</Label><p>This is a starting point; you can adjust it for every journey.</p><select id="default-window" value={arrivalWindow} onChange={(event) => onChangeWindow(Number(event.target.value))}><option value={10}>10 minutes</option><option value={20}>20 minutes</option><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>1 hour</option></select></div>{error && <p className="auth-error" role="alert">{error}</p>}<Button size="lg" className="onboarding-submit" onClick={onComplete} disabled={busy}>{busy ? 'Saving…' : 'Finish setup'} <ArrowRight size={16} /></Button></CardContent></Card><p className="onboarding-privacy"><LockKeyhole size={14} /> Your preferences are private and can be changed later.</p></main></div>;
}
