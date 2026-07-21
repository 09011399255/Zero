import { X } from 'lucide-react';
import { Patient } from '../../api';
import { useModalA11y } from '../../hooks/useModalA11y';

interface NewAppointmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  patients: Patient[];
  formPatientId: string | null;
  setFormPatientId: (id: string) => void;
  formDate: string;
  setFormDate: (v: string) => void;
  formTime: string;
  setFormTime: (v: string) => void;
  formDoctor: string;
  setFormDoctor: (v: string) => void;
  formDept: string;
  setFormDept: (v: string) => void;
  formNotes: string;
  setFormNotes: (v: string) => void;
  newApptError: string | null;
  newApptLoading: boolean;
  doctorOptions: string[];
}

export function NewAppointmentDrawer({
  isOpen,
  onClose,
  onSubmit,
  patients,
  formPatientId, setFormPatientId,
  formDate, setFormDate,
  formTime, setFormTime,
  formDoctor, setFormDoctor,
  formDept, setFormDept,
  formNotes, setFormNotes,
  newApptError,
  newApptLoading,
  doctorOptions,
}: NewAppointmentDrawerProps) {
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
        aria-label="New appointment"
        className="relative w-full sm:max-w-md bg-surface-base h-full shadow-2xl border-l border-surface-border/20 flex flex-col z-10 animate-slide-in overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="p-6 border-b border-surface-border/20 flex items-center justify-between flex-shrink-0">
          <h3 className="text-base font-bold text-text-primary">New Appointment</h3>
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
          {/* Patient select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Patient <span className="text-status-danger">*</span></label>
            <select
              value={formPatientId || ''}
              onChange={(e) => setFormPatientId(e.target.value)}
              required
              className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select a patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>
          </div>

          {/* Date picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Date <span className="text-status-danger">*</span></label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              required
              className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Time slot select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Time Slot <span className="text-status-danger">*</span></label>
            <select
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              required
              className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {[
                "08:00 AM",
                "09:00 AM",
                "10:00 AM",
                "11:00 AM",
                "12:00 PM",
                "01:00 PM",
                "02:00 PM",
                "03:00 PM",
                "04:00 PM",
                "05:00 PM"
              ].map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {/* Doctor select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Doctor <span className="text-status-danger">*</span></label>
            <select
              value={formDoctor}
              onChange={(e) => setFormDoctor(e.target.value)}
              required
              className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {doctorOptions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Visit Type / Department */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Visit Type / Department <span className="text-status-danger">*</span></label>
            <select
              value={formDept}
              onChange={(e) => setFormDept(e.target.value)}
              required
              className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Prenatal">Prenatal</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Notes</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Add any specific clinical notes or reason for visit..."
              className="w-full min-h-[100px] p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans leading-relaxed resize-none font-semibold"
            />
          </div>

          {newApptError && (
            <div className="p-3 bg-status-dangerBg border border-status-danger/20 rounded-xl text-status-danger text-xs font-semibold">
              {newApptError}
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={newApptLoading}
              className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200"
            >
              {newApptLoading ? "Booking..." : "Book Appointment"}
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
