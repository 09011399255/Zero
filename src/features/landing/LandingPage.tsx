// Zero landing — refined premium, light-first (Linear/Framer/Jitter energy) with
// TeleMed's floating pill nav, appointment card and purple CTA band, travelwise's
// curvy sophistication. Real WhatsApp screenshots. Served at /landing (no auth).

import { useEffect, useState } from 'react';
import './landing.css';
import logoBlue from '../../assets/logo-blue.svg';
import logoWhite from '../../assets/logo-white.svg';
import imgPair from '../../assets/343shots_so.png';
import imgMenu from '../../assets/487shots_so.png';
import imgFlat from '../../assets/7shots_so.png';

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6 9 17l-5-5" /></svg>
);
const Sun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
const Moon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
);

export function LandingPage({ onGetStarted, onLogin }: { onGetStarted?: () => void; onLogin?: () => void }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const nav = document.getElementById('lp-nav');
    const onScroll = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.lp-reveal').forEach((el) => io.observe(el));
    const anchors = Array.from(document.querySelectorAll('a[href^="#"]')) as HTMLAnchorElement[];
    const onClick = (ev: Event) => {
      const a = ev.currentTarget as HTMLAnchorElement;
      const id = a.getAttribute('href') || '';
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (t) { ev.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    };
    anchors.forEach((a) => a.addEventListener('click', onClick));
    return () => { window.removeEventListener('scroll', onScroll); anchors.forEach((a) => a.removeEventListener('click', onClick)); io.disconnect(); };
  }, []);

  const go = onGetStarted || (() => {});
  const login = onLogin || (() => {});
  const logo = theme === 'dark' ? logoWhite : logoBlue;

  const features = [
    { i: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />, h: 'Smart intake & queue numbers', p: 'Gathers name, age, and symptoms in natural conversation, routes by department and urgency, and assigns a queue number automatically.' },
    { i: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></>, h: 'Gentle triage, instant escalation', p: 'Asks the right follow-ups with care — and flags anything urgent to your team the moment it happens.' },
    { i: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>, h: 'Appointments & reminders', p: 'Books, confirms, and reminds automatically — the quiet fix for no-shows.' },
    { i: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></>, h: 'Patient records & recall', p: 'Builds a record for every patient and nudges them back for follow-ups and check-ups.' },
  ];

  return (
    <div className="lp" data-lp-theme={theme}>
      {/* NAV — floating pill */}
      <nav className="lp-nav" id="lp-nav">
        <div className="lp-wrap">
          <div className="lp-nav-in">
            <img className="lp-logomark" src={logo} alt="Zero" />
            <div className="lp-nav-links">
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="lp-nav-cta">
              <button className="lp-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
                {theme === 'light' ? <Moon /> : <Sun />}
              </button>
              <button className="lp-btn lp-btn-ghost lp-btn-sm lp-btn-pill" onClick={login}>Log in</button>
              <button className="lp-btn lp-btn-primary lp-btn-sm lp-btn-pill" onClick={go}>Get started</button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="lp-hero">
        <div className="lp-ribbon" aria-hidden="true"><i className="a" /><i className="b" /><span className="sw" /></div>
        <div className="lp-wrap lp-hero-grid">
          <div>
            <span className="lp-pill">Clinic OS · <b>built for WhatsApp</b></span>
            <h1>The front desk that <span className="soft">never sleeps.</span></h1>
            <p className="lede">Zero is an AI receptionist that books, triages, and queues your patients on WhatsApp — around the clock — and hands off to your team the moment a human is needed.</p>
            <div className="lp-hero-cta">
              <button className="lp-btn lp-btn-accent lp-btn-pill" onClick={go}>Get your clinic started</button>
              <a href="#how" className="lp-btn lp-btn-ghost lp-btn-pill">Book a walkthrough</a>
            </div>
            <div className="lp-hero-note">Official WhatsApp Business API · No app for patients · Live in days</div>
          </div>

          <div className="lp-show lp-reveal">
            <img className="lp-showimg" src={imgPair} alt="Zero handling a patient on WhatsApp — intake and confirmation" />
            <div className="lp-float a">
              <div className="h"><span className="lp-pulse" /> New in queue</div>
              <div className="big">Amina Bello</div>
              <div className="sub">Headache, fever · #14</div>
            </div>
            <div className="lp-float b">
              <div className="h">Replied in</div>
              <div className="big tnum">3.2s</div>
              <div className="sub">every time, 24/7</div>
            </div>
          </div>
        </div>
      </header>

      {/* LOGOS */}
      <div className="lp-wrap lp-logos lp-reveal">
        <div className="lead">Trusted by clinics across Nigeria</div>
        <div className="row"><span>Grace Medical</span><span>Apex Clinic</span><span>Bloom Health</span><span>St. Mary's</span></div>
      </div>

      {/* FEATURES — BENTO */}
      <section className="lp-sec" id="features">
        <div className="lp-wrap">
          <div className="lp-head lp-reveal">
            <span className="lp-eyebrow">A whole front desk</span>
            <h2>Everything a great receptionist does</h2>
            <p>Patient, tireless, and always on — one assistant for booking, intake, triage, and the queue.</p>
          </div>
          <div className="lp-bento">
            <div className="lp-cell feature lp-reveal">
              <div className="body">
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" /></svg></div>
                <h3>24/7 WhatsApp conversations</h3>
                <p>Warm, human-sounding replies day and night — never a robotic menu. Patients chat with your clinic on the app they already have.</p>
              </div>
              <div className="shot"><img src={imgMenu} alt="Zero's WhatsApp conversation" /></div>
            </div>
            {features.map((f) => (
              <div className="lp-cell third lp-reveal" key={f.h}>
                <div className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>{f.i}</svg></div>
                <h3>{f.h}</h3>
                <p>{f.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GET SET UP — TeleMed split + appointment card */}
      <section className="lp-sec" id="how" style={{ paddingTop: 0 }}>
        <div className="lp-wrap">
          <div className="lp-setup">
            <div className="lp-reveal">
              <span className="lp-eyebrow">Get set up</span>
              <h2 style={{ fontSize: 'clamp(1.9rem,3.4vw,2.6rem)', fontWeight: 800, marginTop: 14, letterSpacing: '-.04em' }}>Live on your WhatsApp in a few days</h2>
              <p style={{ color: 'var(--muted)', marginTop: 16, fontSize: '1.06rem', maxWidth: '42ch' }}>No engineering, no downtime, nothing for your patients to install. We handle the hard part on Meta's side.</p>
              <div className="steps">
                <div className="stp"><span className="n">1</span><div><h4>Share your number</h4><p>New or existing — we take it from here.</p></div></div>
                <div className="stp"><span className="n">2</span><div><h4>We connect it to WhatsApp</h4><p>Meta verification handled entirely on our side.</p></div></div>
                <div className="stp"><span className="n">3</span><div><h4>Zero goes live</h4><p>Enter the code we email you, and you're on.</p></div></div>
              </div>
            </div>
            <div className="lp-book lp-reveal">
              <span className="clip" aria-hidden="true" />
              <h3>Book a walkthrough</h3>
              <p className="sub">See Zero handle a live patient chat in 15 minutes.</p>
              <div className="lp-field"><label>Clinic name</label><input placeholder="Grace Medical Centre" /></div>
              <div className="lp-field"><label>WhatsApp number</label><input placeholder="+234 801 234 5678" /></div>
              <div className="lp-field"><label>Email</label><input placeholder="you@clinic.com" /></div>
              <button className="lp-btn lp-btn-accent lp-btn-pill" onClick={go}>Book my walkthrough</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{ padding: 'clamp(10px,3vw,30px) 0' }}>
        <div className="lp-wrap">
          <div className="lp-band lp-reveal">
            <span className="blob x" /><span className="blob y" /><span className="sq a" /><span className="sq b" />
            <div>
              <h3>See Zero working before you commit</h3>
              <p>Message our demo line and watch Zero book, triage, and queue a patient — exactly like it will for your clinic.</p>
              <div className="emailrow">
                <input placeholder="you@clinic.com" />
                <button onClick={go}>Get the demo link</button>
              </div>
            </div>
            <div className="bandimg"><img src={imgFlat} alt="Zero conversation on WhatsApp" /></div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-sec" id="pricing">
        <div className="lp-wrap">
          <div className="lp-head center lp-reveal">
            <span className="lp-eyebrow">Pricing</span>
            <h2>Plans that grow with your clinic</h2>
            <p>Start free. Upgrade when Zero is booking more patients than your front desk ever could.</p>
          </div>
          <div className="lp-price">
            <div className="lp-tier lp-reveal">
              <div className="tn">Starter</div>
              <div className="td">For a single clinic finding its feet.</div>
              <div className="amt">Free</div>
              <ul>
                <li><Check /> WhatsApp AI assistant</li>
                <li><Check /> Intake &amp; live queue</li>
                <li><Check /> One connected number</li>
              </ul>
              <button className="lp-btn lp-btn-ghost lp-btn-pill" onClick={go}>Get started</button>
            </div>
            <div className="lp-tier feat lp-reveal">
              <span className="tag">Most popular</span>
              <div className="tn">Navigator</div>
              <div className="td">For a busy clinic that lives on WhatsApp.</div>
              <div className="amt tnum">₦25,000<small> /mo</small></div>
              <ul>
                <li><Check /> Everything in Starter</li>
                <li><Check /> Appointments &amp; reminders</li>
                <li><Check /> Recall &amp; patient records</li>
                <li><Check /> Priority escalation</li>
              </ul>
              <button className="lp-btn lp-btn-accent lp-btn-pill" onClick={go}>Start with Navigator</button>
            </div>
            <div className="lp-tier lp-reveal">
              <div className="tn">Enterprise</div>
              <div className="td">For groups and multi-location practices.</div>
              <div className="amt">Let's talk</div>
              <ul>
                <li><Check /> Everything in Navigator</li>
                <li><Check /> Multiple locations &amp; numbers</li>
                <li><Check /> Custom onboarding &amp; support</li>
              </ul>
              <button className="lp-btn lp-btn-ghost lp-btn-pill" onClick={go}>Contact sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-sec" id="faq" style={{ paddingTop: 0 }}>
        <div className="lp-wrap">
          <div className="lp-head center lp-reveal">
            <span className="lp-eyebrow">Questions</span>
            <h2>Everything you're wondering</h2>
          </div>
          <div className="lp-faq">
            {[
              ['Do my patients need to install anything?', 'No. Zero works inside the WhatsApp your patients already have — they just message your clinic\'s number like they\'d message a friend.'],
              ['Can we use our existing WhatsApp number?', 'Yes — migrate your existing number or set up a fresh one. Either way our team connects it to WhatsApp for you; there\'s nothing technical for you to do.'],
              ['Is our patients\' data safe?', 'Zero runs on the official WhatsApp Business API, and conversations and records are encrypted and access-controlled. Your team decides who sees what.'],
              ['How long does setup take?', 'Most clinics are live within a few days. You give us your number and a few details; we handle the Meta verification, then email you when it\'s ready.'],
              ['Can our staff take over a chat?', 'Anytime. Every chat is on your dashboard, and a staff member can step in with one tap — Zero steps back until they\'re done.'],
              ['What happens in an emergency?', 'Zero recognises urgent symptoms and distress and immediately flags the conversation to your team. It never tries to handle an emergency alone.'],
            ].map(([q, a]) => (
              <details className="lp-reveal" key={q}>
                <summary>{q}<span className="pm">+</span></summary>
                <div className="ans">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: 'clamp(20px,4vw,40px) 0' }}>
        <div className="lp-cta">
          <div className="lp-cta-in lp-reveal">
            <span className="lp-eyebrow" style={{ color: '#9DBBF7' }}>Get started</span>
            <h2>Give your front desk a good night's sleep.</h2>
            <p>Connect your WhatsApp and let Zero handle booking, triage, and queues — so your team can focus on care.</p>
            <div className="lp-hero-cta">
              <button className="lp-btn lp-btn-accent lp-btn-pill" onClick={go}>Get your clinic started</button>
              <button className="lp-btn lp-btn-ghost lp-btn-pill" onClick={go}>Book a demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-foot">
        <div className="lp-wrap">
          <div className="lp-foot-top">
            <div style={{ maxWidth: 300 }}>
              <img className="lp-logomark" src={logo} alt="Zero" style={{ height: 22 }} />
              <p style={{ marginTop: 14, fontSize: 13.5, color: 'var(--muted)' }}>The AI receptionist for clinics — on the WhatsApp your patients already use.</p>
            </div>
            <div className="lp-foot-cols">
              <div><h4>Product</h4><a href="#features">Features</a><a href="#how">How it works</a><a href="#pricing">Pricing</a></div>
              <div><h4>Company</h4><a href="#">About</a><a href="#">Contact</a><a href="#">Careers</a></div>
              <div><h4>Legal</h4><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Data &amp; security</a></div>
            </div>
          </div>
          <div className="lp-foot-bottom">
            <span>© 2026 Zero Clinic OS. Built for clinics in Nigeria and beyond.</span>
            <span>Talk to us on WhatsApp</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
