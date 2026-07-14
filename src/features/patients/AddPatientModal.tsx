import { RefreshCw, X } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  addPatientError: string | null;
  addPatientLoading: boolean;
  addPatientName: string;
  setAddPatientName: (v: string) => void;
  addPatientPhone: string;
  setAddPatientPhone: (v: string) => void;
  addPatientEmail: string;
  setAddPatientEmail: (v: string) => void;
  addPatientDob: string;
  setAddPatientDob: (v: string) => void;
  addPatientGender: string;
  setAddPatientGender: (v: string) => void;
  addPatientDoctor: string;
  setAddPatientDoctor: (v: string) => void;
  addPatientRecallStatus: string;
  setAddPatientRecallStatus: (v: string) => void;
  addPatientRecallReason: string;
  setAddPatientRecallReason: (v: string) => void;
}

export function AddPatientModal({
  isOpen,
  onClose,
  onSubmit,
  addPatientError,
  addPatientLoading,
  addPatientName, setAddPatientName,
  addPatientPhone, setAddPatientPhone,
  addPatientEmail, setAddPatientEmail,
  addPatientDob, setAddPatientDob,
  addPatientGender, setAddPatientGender,
  addPatientDoctor, setAddPatientDoctor,
  addPatientRecallStatus, setAddPatientRecallStatus,
  addPatientRecallReason, setAddPatientRecallReason,
}: AddPatientModalProps) {
  const panelRef = useModalA11y<HTMLDivElement>(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      ></div>

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add patient"
        className="relative w-full max-w-md bg-surface-base h-full shadow-2xl border-l border-surface-border/20 flex flex-col z-10 animate-slide-in overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="p-6 border-b border-surface-border/20 flex items-center justify-between flex-shrink-0">
          <h3 className="text-base font-bold text-text-primary">Add Patient</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150 border border-surface-border/30"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="p-6 space-y-5 flex-1 overflow-y-auto text-xs font-semibold"
        >
          {addPatientError && (
            <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/20 rounded-xl text-xs">
              {addPatientError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Full Name <span className="text-status-danger">*</span></label>
            <input
              type="text"
              required
              value={addPatientName}
              onChange={(e) => setAddPatientName(e.target.value)}
              placeholder="Rand al'Thor"
              className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Phone Number <span className="text-status-danger">*</span></label>
            <input
              type="tel"
              required
              value={addPatientPhone}
              onChange={(e) => setAddPatientPhone(e.target.value)}
              placeholder="+1 555-0199"
              className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={addPatientEmail}
              onChange={(e) => setAddPatientEmail(e.target.value)}
              placeholder="rand@tworivers.net"
              className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Date of Birth</label>
              <input
                type="date"
                value={addPatientDob}
                onChange={(e) => setAddPatientDob(e.target.value)}
                className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-text-secondary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Gender</label>
              <select
                value={addPatientGender}
                onChange={(e) => setAddPatientGender(e.target.value)}
                className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Primary Doctor</label>
            <select
              value={addPatientDoctor}
              onChange={(e) => setAddPatientDoctor(e.target.value)}
              className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
            >
              <option value="Dr. Lan Mandragoran">Dr. Lan Mandragoran</option>
              <option value="Dr. Nynaeve al'Meara">Dr. Nynaeve al'Meara</option>
              <option value="Dr. Elayne Trakand">Dr. Elayne Trakand</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Recall Status</label>
              <select
                value={addPatientRecallStatus}
                onChange={(e) => setAddPatientRecallStatus(e.target.value)}
                className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
              >
                <option value="UP_TO_DATE">Up to date</option>
                <option value="DUE_SOON">Due Soon</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Recall Reason</label>
              <input
                type="text"
                value={addPatientRecallReason}
                onChange={(e) => setAddPatientRecallReason(e.target.value)}
                placeholder="6-month cleaning"
                className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={addPatientLoading}
              className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200 flex items-center justify-center gap-2"
            >
              {addPatientLoading ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Patient</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
