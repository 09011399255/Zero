// Shared WhatsApp connection flow — the single source of truth for the manual
// ("concierge") connect experience. Used in three places:
//   • onboarding Step 3
//   • Settings → WhatsApp Business Connection
//   • the app-wide "enter your code" modal
//
// It's self-contained: it loads its own status on mount, polls while a
// connection is in flight, and renders the right screen for the current status
// (request form → pending → enter-code → connected). Parents only pass CTAs.

import { AlertTriangle, CheckCircle2, Clock, Mail, MessageSquare, RefreshCw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, WhatsAppStatus } from '../../api';
import { isWhatsAppSignupConfigured, launchWhatsAppSignup } from '../../lib/whatsappSignup';

// Meta's self-serve Embedded Signup is parked while our Meta app verification is
// pending — the live flow is the manual concierge one. Flip to `true` once Meta
// approves us; the old popup path is preserved intact behind it.
const USE_EMBEDDED_SIGNUP = false;

interface WhatsAppConnectPanelProps {
  // Wrap the content in a card surface (default). Settings embeds it in its own
  // section, so it passes card={false}.
  card?: boolean;
  // Show the "Connect WhatsApp Business API" title block (default true).
  header?: boolean;
  // Primary CTA shown once connected.
  onDone?: () => void;
  doneLabel?: string;
  // Optional escape button shown in non-connected states (onboarding: skip).
  onSecondary?: () => void;
  secondaryLabel?: string;
  // Fires whenever the status changes — lets a parent (e.g. the modal) react,
  // such as closing itself once CONNECTED.
  onStatusChange?: (status: WhatsAppStatus) => void;
}

export function WhatsAppConnectPanel({
  card = true,
  header = true,
  onDone,
  doneLabel = 'Done',
  onSecondary,
  secondaryLabel = 'Skip for now',
  onStatusChange,
}: WhatsAppConnectPanelProps) {
  const [usesExistingWA, setUsesExistingWA] = useState<'yes' | 'no' | null>(null);
  const [numberChoice, setNumberChoice] = useState<'new' | 'migrate' | null>(null);
  const [waStatus, setWaStatus] = useState<WhatsAppStatus>('NOT_CONNECTED');
  const [waNumber, setWaNumber] = useState<string | null>(null);
  const [waConnecting, setWaConnecting] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);

  const [waPhoneInput, setWaPhoneInput] = useState('');
  const [waEmailInput, setWaEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [waBusy, setWaBusy] = useState(false);
  const [waNotice, setWaNotice] = useState<string | null>(null);
  const [imReadyDone, setImReadyDone] = useState(false);
  const [otpSubmitted, setOtpSubmitted] = useState(false);

  const isWAConnected = waStatus === 'CONNECTED';
  const resolvedChoice: 'new' | 'migrate' | null =
    usesExistingWA === 'no' ? 'new' : usesExistingWA === 'yes' ? numberChoice : null;

  const applyStatus = (s: WhatsAppStatus) => {
    setWaStatus(s);
    onStatusChange?.(s);
  };

  // Load current status on mount so a returning clinic resumes at the right
  // screen (pending / enter-code / connected) instead of the form.
  useEffect(() => {
    let active = true;
    api.clinic.whatsappStatus()
      .then((s) => {
        if (!active) return;
        applyStatus(s.whatsappStatus);
        if (s.phoneNumber) setWaNumber(s.phoneNumber);
        if (s.whatsappRequestedNumber) setWaPhoneInput((p) => p || s.whatsappRequestedNumber || '');
        if (s.whatsappOtpSubmittedAt) setOtpSubmitted(true);
      })
      .catch(() => { /* not fatal — they can still submit */ });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While a connection is in flight, poll so the screen auto-advances the moment
  // our team acts (sends the code / marks it connected).
  useEffect(() => {
    if (waStatus !== 'VERIFICATION_PENDING' && waStatus !== 'AWAITING_OTP') return;
    const id = setInterval(async () => {
      try {
        const s = await api.clinic.whatsappStatus();
        applyStatus(s.whatsappStatus);
        if (s.phoneNumber) setWaNumber(s.phoneNumber);
        if (s.whatsappStatus === 'AWAITING_OTP' && !s.whatsappOtpSubmittedAt) setOtpSubmitted(false);
      } catch { /* transient — keep polling */ }
    }, 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waStatus]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleRequestWhatsApp = async () => {
    if (!resolvedChoice) return;
    setWaError(null);
    if (waPhoneInput.trim().length < 6) { setWaError('Enter the WhatsApp number you want to connect.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(waEmailInput.trim())) { setWaError('Enter a valid email so we can update you.'); return; }
    setWaBusy(true);
    try {
      const status = await api.clinic.requestWhatsapp({
        phoneNumber: waPhoneInput.trim(),
        email: waEmailInput.trim(),
        setupChoice: resolvedChoice,
      });
      applyStatus(status.whatsappStatus);
    } catch (err: any) {
      setWaError(err?.message || "Couldn't submit your request. Please try again.");
    } finally {
      setWaBusy(false);
    }
  };

  const handleImReady = async () => {
    setWaError(null);
    setWaBusy(true);
    try {
      await api.clinic.whatsappReady();
      setImReadyDone(true);
      setWaNotice("Got it — we'll send your code shortly. Keep this tab handy.");
    } catch (err: any) {
      setWaError(err?.message || "Couldn't reach us just now. Please try again.");
    } finally {
      setWaBusy(false);
    }
  };

  const handleSubmitOtp = async () => {
    setWaError(null);
    if (!/^\d{4,8}$/.test(otpInput.trim())) { setWaError('Enter the numeric code Meta sent you.'); return; }
    setWaBusy(true);
    try {
      await api.clinic.submitOtp({ code: otpInput.trim() });
      setOtpSubmitted(true);
      setWaNotice("Code received — we're finishing your setup now.");
    } catch (err: any) {
      setWaError(err?.message || "Couldn't submit the code. Please try again.");
    } finally {
      setWaBusy(false);
    }
  };

  // Parked Meta self-serve popup flow (see USE_EMBEDDED_SIGNUP).
  const handleConnectWhatsApp = async () => {
    if (!resolvedChoice) return;
    setWaError(null);
    setWaConnecting(true);
    try {
      const result = await launchWhatsAppSignup();
      if (!result.phoneNumberId || !result.wabaId) {
        throw new Error("WhatsApp didn't return the number details. Please try connecting again.");
      }
      const status = await api.clinic.connectWhatsapp({
        code: result.code,
        phoneNumberId: result.phoneNumberId,
        wabaId: result.wabaId,
      });
      applyStatus(status.whatsappStatus);
      setWaNumber(status.phoneNumber);
    } catch (err: any) {
      setWaError(err?.message || "Couldn't connect WhatsApp. Please try again.");
    } finally {
      setWaConnecting(false);
    }
  };

  const errorBox = waError && (
    <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-start gap-2">
      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
      <span>{waError}</span>
    </div>
  );

  const secondaryBtn = onSecondary && (
    <button
      onClick={onSecondary}
      className="w-full py-3 border border-surface-border hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl text-xs transition duration-150"
    >
      {secondaryLabel}
    </button>
  );

  const content = (
    <>
      {header && (
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-text-primary">Connect WhatsApp Business API</h2>
          <p className="text-text-secondary">Deploy Zero directly onto your official business number.</p>
        </div>
      )}

      {isWAConnected ? (
        /* ================= CONNECTED ==================================== */
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 bg-status-successBg text-status-success rounded-full flex items-center justify-center mx-auto border border-status-success/20 shadow-sm">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-primary">Connected ✓</h3>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              {waNumber
                ? <>Zero is now live on <strong className="text-text-primary">{waNumber}</strong>. Your patients can book, get reminders, and reach your clinic 24/7 — right from WhatsApp.</>
                : <>Zero is now live on your WhatsApp number. Your patients can book, get reminders, and reach your clinic 24/7 — right from WhatsApp.</>}
            </p>
          </div>
          {onDone && (
            <button
              onClick={onDone}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition duration-150 shadow-brand-glow text-xs"
            >
              {doneLabel}
            </button>
          )}
        </div>
      ) : waStatus === 'VERIFICATION_PENDING' ? (
        /* ================= PENDING (waiting on the Zero team) =========== */
        <div className="py-2 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-ai-500/10 text-ai-600 rounded-full flex items-center justify-center mx-auto border border-ai-500/15">
              <Clock size={30} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-text-primary">We're setting up your WhatsApp</h3>
              <p className="text-[11px] text-text-secondary leading-relaxed max-w-[340px] mx-auto">
                This usually takes a few minutes — sometimes up to an hour. Feel free to close this and carry on with your day.
              </p>
            </div>
          </div>

          <div className="bg-surface-subtle border border-surface-border/60 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-[11px] text-text-secondary">
              <MessageSquare size={13} className="text-text-muted flex-shrink-0" />
              <span>Connecting <strong className="text-text-primary">{waPhoneInput || 'your number'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-secondary">
              <Mail size={13} className="text-text-muted flex-shrink-0" />
              <span>We'll email <strong className="text-text-primary">{waEmailInput || 'you'}</strong> the moment your code is ready.</span>
            </div>
          </div>

          {imReadyDone ? (
            <div className="p-3 bg-status-successBg text-status-success border border-status-success/15 rounded-xl text-[11px] flex items-start gap-2">
              <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
              <span>{waNotice}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleImReady}
              disabled={waBusy}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-brand-glow text-xs flex items-center justify-center gap-2"
            >
              {waBusy ? <RefreshCw className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
              <span>I'm ready to receive my code now</span>
            </button>
          )}
          <p className="text-[10px] text-text-muted text-center leading-relaxed">
            Tap this when you're at your phone — codes expire in ~10 minutes, so it's best to be ready when it arrives.
          </p>

          {errorBox}
          {secondaryBtn}
        </div>
      ) : waStatus === 'AWAITING_OTP' ? (
        /* ================= AWAITING OTP (clinic enters the code) ======== */
        <div className="py-2 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-ai-500/10 text-ai-600 rounded-full flex items-center justify-center mx-auto border border-ai-500/15">
              <ShieldCheck size={30} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-text-primary">Enter your verification code</h3>
              <p className="text-[11px] text-text-secondary leading-relaxed max-w-[340px] mx-auto">
                Meta is sending a 6-digit code to <strong className="text-text-primary">{waPhoneInput || 'your number'}</strong> by SMS or call. Enter it below <strong className="text-text-primary">right away</strong> — codes expire in about 10 minutes.
              </p>
            </div>
          </div>

          {otpSubmitted ? (
            <div className="space-y-4">
              <div className="p-4 bg-status-successBg text-status-success border border-status-success/15 rounded-xl text-[11px] flex items-start gap-2">
                <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" />
                <span>{waNotice || "Code received — we're finishing your setup now. This page will update automatically."}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted">
                <RefreshCw className="animate-spin" size={12} />
                <span>Waiting for confirmation…</span>
              </div>
              <button
                type="button"
                onClick={() => { setOtpSubmitted(false); setOtpInput(''); setWaNotice(null); }}
                className="w-full py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl text-[11px] transition duration-150"
              >
                Entered the wrong code? Re-enter it
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                value={otpInput}
                onChange={(e) => { setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 8)); setWaError(null); }}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter the code"
                className="w-full text-center tracking-[0.4em] text-lg font-bold py-3 rounded-xl border border-surface-border bg-surface-base text-text-primary placeholder:tracking-normal placeholder:text-sm placeholder:font-normal placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
              <button
                type="button"
                onClick={handleSubmitOtp}
                disabled={waBusy}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-brand-glow text-xs flex items-center justify-center gap-2"
              >
                {waBusy ? <RefreshCw className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                <span>Submit code</span>
              </button>
              <button
                type="button"
                onClick={handleImReady}
                disabled={waBusy}
                className="w-full text-[10px] text-text-muted hover:text-text-secondary transition duration-150 leading-relaxed"
              >
                Didn't get a code? Give it a minute, then tap here to ask us to resend it.
              </button>
            </div>
          )}

          {errorBox}
          {secondaryBtn}
        </div>
      ) : (
        /* ================= REQUEST (not connected yet) ================== */
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Does your clinic currently use WhatsApp Business?
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setUsesExistingWA('yes'); setNumberChoice(null); setWaError(null); }}
                className={`py-2.5 rounded-xl border text-xs font-bold transition duration-150 ${
                  usesExistingWA === 'yes'
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                    : 'bg-surface-base border-surface-border text-text-secondary hover:bg-surface-subtle'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => { setUsesExistingWA('no'); setNumberChoice(null); setWaError(null); }}
                className={`py-2.5 rounded-xl border text-xs font-bold transition duration-150 ${
                  usesExistingWA === 'no'
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                    : 'bg-surface-base border-surface-border text-text-secondary hover:bg-surface-subtle'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {usesExistingWA === 'no' && (
            <div className="bg-brand-50/50 border border-brand-100 p-4 rounded-xl flex gap-3 animate-fade-in">
              <span className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-[10px] text-brand-600 font-bold flex-shrink-0">i</span>
              <p className="text-[11px] text-brand-700 leading-relaxed">
                Great. We'll set up a new number for you.
              </p>
            </div>
          )}

          {usesExistingWA === 'yes' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-status-warningBg border border-status-warning/20 rounded-2xl flex gap-3">
                <AlertTriangle size={16} className="text-status-warning flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-status-warning">Heads up</p>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Connecting to Zero will permanently disconnect your current WhatsApp Business app. Your chat history won't transfer. You can use a new number instead if you prefer.
                  </p>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    If you migrate, you'll first need to remove the number from your existing WhatsApp Business app before it can verify.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setNumberChoice('new'); setWaError(null); }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition duration-150 ${
                    numberChoice === 'new'
                      ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                      : 'bg-surface-base border-surface-border text-text-secondary hover:bg-surface-subtle'
                  }`}
                >
                  Use new number
                </button>
                <button
                  type="button"
                  onClick={() => { setNumberChoice('migrate'); setWaError(null); }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition duration-150 ${
                    numberChoice === 'migrate'
                      ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                      : 'bg-surface-base border-surface-border text-text-secondary hover:bg-surface-subtle'
                  }`}
                >
                  Migrate existing number
                </button>
              </div>
            </div>
          )}

          {resolvedChoice && (
            <div className="space-y-3 animate-fade-in">
              {USE_EMBEDDED_SIGNUP ? (
                !isWhatsAppSignupConfigured() ? (
                  <div className="p-4 bg-status-warningBg border border-status-warning/20 rounded-xl flex gap-3">
                    <AlertTriangle size={14} className="text-status-warning flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      WhatsApp connection isn't configured on this environment yet. You can skip this for now and connect later from Settings.
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleConnectWhatsApp}
                      disabled={waConnecting}
                      className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-brand-glow text-xs flex items-center justify-center gap-2"
                    >
                      {waConnecting ? (
                        <><RefreshCw className="animate-spin" size={14} /><span>Waiting for WhatsApp…</span></>
                      ) : (
                        <><MessageSquare size={14} /><span>Connect WhatsApp</span></>
                      )}
                    </button>
                    {waConnecting && (
                      <p className="text-[10px] text-text-muted text-center leading-relaxed">
                        Finish signing in and verify your number in the Meta window. Keep this tab open.
                      </p>
                    )}
                  </>
                )
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      {resolvedChoice === 'migrate' ? 'Number to migrate' : 'WhatsApp number to set up'}
                    </label>
                    <input
                      value={waPhoneInput}
                      onChange={(e) => { setWaPhoneInput(e.target.value); setWaError(null); }}
                      type="tel"
                      placeholder="+234 801 234 5678"
                      className="w-full py-2.5 px-3 rounded-xl border border-surface-border bg-surface-base text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Email for updates
                    </label>
                    <input
                      value={waEmailInput}
                      onChange={(e) => { setWaEmailInput(e.target.value); setWaError(null); }}
                      type="email"
                      placeholder="you@clinic.com"
                      className="w-full py-2.5 px-3 rounded-xl border border-surface-border bg-surface-base text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                  </div>
                  <div className="bg-surface-subtle border border-surface-border/60 rounded-xl p-3">
                    <p className="text-[10px] text-text-muted leading-relaxed">
                      Our team connects your number to WhatsApp for you. After you submit, we'll get it ready and email you a verification code to enter — usually within a few minutes to an hour.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestWhatsApp}
                    disabled={waBusy}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-brand-glow text-xs flex items-center justify-center gap-2"
                  >
                    {waBusy ? <RefreshCw className="animate-spin" size={14} /> : <MessageSquare size={14} />}
                    <span>Connect WhatsApp</span>
                  </button>
                </>
              )}

              {errorBox}
            </div>
          )}

          {secondaryBtn}
        </div>
      )}
    </>
  );

  if (!card) return content;
  return (
    <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
      {content}
    </div>
  );
}
