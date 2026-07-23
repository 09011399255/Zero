// Internal Zero-team dashboard for driving the manual ("concierge") WhatsApp
// connection pipeline. Only reachable when the signed-in user is a platform
// admin (App gates the route; the backend 403s every call otherwise).
//
// The team's loop per clinic:
//   1. A clinic requests a connection → shows as "Pending".
//   2. Add its number to our Meta Business Manager, then "Send code" here
//      (flips the clinic to the code-entry screen + emails them).
//   3. The clinic enters the code Meta texted them → it appears on their card.
//   4. Enter that code in Meta; once the number is live, "Mark connected"
//      with its phone number ID.

import { useEffect, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, Copy,
  RefreshCw, Send, ShieldCheck,
} from 'lucide-react';
import { api, AdminClinic, WhatsAppStatus } from '../../api';

const STATUS_META: Record<WhatsAppStatus, { label: string; className: string }> = {
  VERIFICATION_PENDING: { label: 'Pending — needs setup', className: 'bg-status-warningBg text-status-warning border-status-warning/20' },
  AWAITING_OTP: { label: 'Awaiting code', className: 'bg-ai-500/10 text-ai-600 border-ai-500/20' },
  CONNECTED: { label: 'Connected', className: 'bg-status-successBg text-status-success border-status-success/20' },
  NOT_CONNECTED: { label: 'Not connected', className: 'bg-surface-subtle text-text-muted border-surface-border' },
  SANDBOX: { label: 'Sandbox', className: 'bg-surface-subtle text-text-muted border-surface-border' },
};

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

// Embeddable WhatsApp connection pipeline — rendered as a tab inside AdminConsole.
export function AdminWhatsApp() {
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Per-row inline "mark connected" input state.
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [phoneNumberIdInput, setPhoneNumberIdInput] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const rows = await api.admin.whatsappPipeline();
      setClinics(rows);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load clinics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Poll so codes clinics submit appear without a manual refresh.
    const id = setInterval(() => load(true), 10000);
    return () => clearInterval(id);
  }, []);

  const runAction = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await load(true);
    } catch (err: any) {
      setError(err?.message || 'Action failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleSendCode = (id: string) => runAction(id, () => api.admin.sendOtp(id));
  const handleReset = (id: string) => runAction(id, () => api.admin.reset(id));
  const handleMarkConnected = (id: string) =>
    runAction(id, async () => {
      await api.admin.markConnected(id, { phoneNumberId: phoneNumberIdInput.trim() });
      setConnectingId(null);
      setPhoneNumberIdInput('');
    });

  const pipeline = clinics.filter((c) => c.whatsappStatus !== 'CONNECTED');
  const connected = clinics.filter((c) => c.whatsappStatus === 'CONNECTED');

  return (
    <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-text-muted">Clinics moving through the manual WhatsApp connection.</p>
          <button
            onClick={() => load()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-surface-border bg-surface-base hover:bg-surface-subtle text-text-secondary text-xs font-semibold transition"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-start gap-2">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading && clinics.length === 0 ? (
          <div className="py-16 text-center text-text-muted text-sm flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin" /> Loading…
          </div>
        ) : clinics.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-surface-base border border-surface-border flex items-center justify-center mx-auto text-text-muted">
              <ShieldCheck size={26} />
            </div>
            <p className="text-sm font-semibold text-text-primary">No connection requests yet</p>
            <p className="text-[11px] text-text-muted">Clinics that request WhatsApp will appear here.</p>
          </div>
        ) : (
          <>
            {/* Needs action */}
            <section className="space-y-3">
              <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                In progress ({pipeline.length})
              </h2>
              {pipeline.length === 0 && (
                <p className="text-[11px] text-text-muted">Nothing waiting on us right now. 🎉</p>
              )}
              {pipeline.map((c) => {
                const meta = STATUS_META[c.whatsappStatus];
                const busy = busyId === c.id;
                return (
                  <div key={c.id} className="bg-surface-base border border-surface-border rounded-2xl shadow-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">{c.name}</p>
                        <p className="text-[11px] text-text-muted">
                          {c.setupChoice === 'migrate' ? 'Migrate existing number' : 'New number'} · requested {timeAgo(c.requestedAt)}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <span className="text-text-muted">Number:</span>
                        <strong className="text-text-primary">{c.requestedNumber || '—'}</strong>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary min-w-0">
                        <span className="text-text-muted">Email:</span>
                        <span className="truncate">{c.notifyEmail || '—'}</span>
                      </div>
                    </div>

                    {c.setupChoice === 'migrate' && (
                      <div className="p-2.5 bg-status-warningBg border border-status-warning/20 rounded-lg text-[10px] text-status-warning flex items-start gap-2">
                        <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                        <span>Migration — confirm the clinic removed this number from their WhatsApp Business app first.</span>
                      </div>
                    )}

                    {c.clinicReadyAt && c.whatsappStatus === 'VERIFICATION_PENDING' && (
                      <div className="p-2.5 bg-ai-500/10 border border-ai-500/15 rounded-lg text-[10px] text-ai-600 flex items-center gap-2">
                        <Clock size={12} className="flex-shrink-0" />
                        <span>Clinic said they're ready ({timeAgo(c.clinicReadyAt)}) — good time to send the code.</span>
                      </div>
                    )}

                    {/* Submitted OTP — the headline info for AWAITING_OTP rows */}
                    {c.whatsappStatus === 'AWAITING_OTP' && (
                      c.otpCode ? (
                        <div className="p-3 bg-status-successBg border border-status-success/20 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] text-status-success font-semibold uppercase tracking-wide">Code from clinic ({timeAgo(c.otpSubmittedAt)})</p>
                            <p className="text-xl font-bold tracking-[0.3em] text-text-primary">{c.otpCode}</p>
                          </div>
                          <button
                            onClick={() => navigator.clipboard?.writeText(c.otpCode || '')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-base hover:bg-surface-subtle text-text-secondary text-[11px] font-semibold transition"
                          >
                            <Copy size={12} /> Copy
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-surface-subtle border border-surface-border/60 rounded-lg text-[10px] text-text-muted flex items-center gap-2">
                          <Clock size={12} className="flex-shrink-0" />
                          <span>Code sent — waiting for the clinic to enter it.</span>
                        </div>
                      )
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {c.whatsappStatus === 'VERIFICATION_PENDING' && (
                        <button
                          onClick={() => handleSendCode(c.id)}
                          disabled={busy}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white text-xs font-bold shadow-brand-glow transition"
                        >
                          {busy ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                          Send code
                        </button>
                      )}

                      {c.whatsappStatus === 'AWAITING_OTP' && connectingId !== c.id && (
                        <>
                          <button
                            onClick={() => { setConnectingId(c.id); setPhoneNumberIdInput(''); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-brand-glow transition"
                          >
                            <CheckCircle2 size={13} /> Mark connected
                          </button>
                          <button
                            onClick={() => handleSendCode(c.id)}
                            disabled={busy}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-surface-border bg-surface-base hover:bg-surface-subtle text-text-secondary text-xs font-semibold transition"
                          >
                            {busy ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                            Resend code
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleReset(c.id)}
                        disabled={busy}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-surface-border bg-surface-base hover:bg-surface-subtle text-text-muted text-xs font-semibold transition"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Inline "mark connected" form */}
                    {connectingId === c.id && (
                      <div className="pt-2 space-y-2 border-t border-surface-border/60">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          Meta phone number ID
                        </label>
                        <input
                          value={phoneNumberIdInput}
                          onChange={(e) => setPhoneNumberIdInput(e.target.value)}
                          placeholder="e.g. 123456789012345"
                          className="w-full py-2.5 px-3 rounded-xl border border-surface-border bg-surface-base text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        />
                        <p className="text-[10px] text-text-muted leading-relaxed">
                          From Meta Business Manager → WhatsApp → API Setup, once the number is verified and live.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMarkConnected(c.id)}
                            disabled={busy || phoneNumberIdInput.trim().length < 3}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white text-xs font-bold shadow-brand-glow transition"
                          >
                            {busy ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            Confirm connected
                          </button>
                          <button
                            onClick={() => { setConnectingId(null); setPhoneNumberIdInput(''); }}
                            className="px-3 py-2 rounded-xl border border-surface-border bg-surface-base hover:bg-surface-subtle text-text-secondary text-xs font-semibold transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>

            {/* Connected */}
            {connected.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Connected ({connected.length})
                </h2>
                {connected.map((c) => (
                  <div key={c.id} className="bg-surface-base border border-surface-border rounded-2xl shadow-card p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">{c.name}</p>
                      <p className="text-[11px] text-text-muted truncate">
                        {c.phoneNumber || c.requestedNumber || '—'} · ID {c.phoneNumberId || '—'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-status-successBg text-status-success border-status-success/20 whitespace-nowrap flex items-center gap-1">
                      <CheckCircle2 size={11} /> Live
                    </span>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
    </div>
  );
}
