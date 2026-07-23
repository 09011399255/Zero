// App-wide nudge to enter the WhatsApp verification code. Renders only when the
// clinic is in AWAITING_OTP — i.e. our team has triggered Meta and a code is
// expected. Two layers, by design:
//   • a persistent banner that CANNOT be dismissed (only clears once connected)
//   • a modal that auto-opens but IS closable ("Remind me later")
// So the clinic can't forget, but is never locked out of their dashboard while
// waiting on a code that may be delayed.

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { api, WhatsAppStatus } from '../../api';
import { WhatsAppConnectPanel } from './WhatsAppConnectPanel';

export function WhatsAppCodePrompt() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const prev = useRef<WhatsAppStatus | null>(null);

  // Poll the clinic's status so the prompt appears the moment our team sends the
  // code, and disappears once the number goes live.
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const s = await api.clinic.whatsappStatus();
        if (active) setStatus(s.whatsappStatus);
      } catch { /* ignore transient errors */ }
    };
    load();
    const id = setInterval(load, 20000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // Auto-open the modal the first time we see AWAITING_OTP; force it shut once
  // we leave that state.
  useEffect(() => {
    if (status === 'AWAITING_OTP' && prev.current !== 'AWAITING_OTP') setModalOpen(true);
    if (status !== 'AWAITING_OTP') setModalOpen(false);
    prev.current = status;
  }, [status]);

  if (status !== 'AWAITING_OTP') return null;

  return (
    <>
      {/* Persistent banner — no dismiss control on purpose. */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-status-warning/25 bg-status-warningBg px-4 py-3">
        <AlertTriangle size={16} className="text-status-warning flex-shrink-0" />
        <p className="flex-1 text-[12px] text-text-secondary leading-snug">
          <strong className="text-text-primary">Your WhatsApp code is ready to enter.</strong>{' '}
          Codes expire in about 10 minutes — enter it now to finish connecting.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition"
        >
          Enter code
        </button>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md bg-surface-base rounded-3xl shadow-elevated border border-surface-border/30 p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-secondary transition"
              aria-label="Remind me later"
            >
              <X size={18} />
            </button>
            <WhatsAppConnectPanel
              card={false}
              header
              onStatusChange={(s) => { if (s === 'CONNECTED') setModalOpen(false); }}
              onDone={() => setModalOpen(false)}
              doneLabel="Done"
              onSecondary={() => setModalOpen(false)}
              secondaryLabel="Remind me later"
            />
          </div>
        </div>
      )}
    </>
  );
}
