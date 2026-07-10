import { Clock, X } from 'lucide-react';
import { api, Appointment, AppointmentStatus } from '../../api';

const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

interface AppointmentDetailDrawerProps {
  selectedAppointmentId: string | null;
  appointments: Appointment[];
  isRescheduling: boolean;
  setIsRescheduling: (v: boolean) => void;
  rescheduleDate: string;
  setRescheduleDate: (v: string) => void;
  rescheduleTime: string;
  setRescheduleTime: (v: string) => void;
  formatTime12h: (time: string) => string;
  convertTo24Hour: (time: string) => string;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

export function AppointmentDetailDrawer({
  selectedAppointmentId,
  appointments,
  isRescheduling,
  setIsRescheduling,
  rescheduleDate,
  setRescheduleDate,
  rescheduleTime,
  setRescheduleTime,
  formatTime12h,
  convertTo24Hour,
  onClose,
  onUpdated,
}: AppointmentDetailDrawerProps) {
  if (selectedAppointmentId === null) return null;
  const appt = appointments.find(a => a.id === selectedAppointmentId);
  if (!appt) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-surface-base h-full shadow-2xl border-l border-surface-border/20 flex flex-col z-10 animate-slide-in overflow-hidden font-sans">
        <div className="p-6 border-b border-surface-border/20 flex-shrink-0">
          {/* Close Button Row */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150 border border-surface-border/30"
            >
              <X size={16} />
            </button>
          </div>

          {/* Patient Information Row */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-500 font-bold text-base flex items-center justify-center border border-brand-100 flex-shrink-0">
              {appt.patientName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'PT'}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary leading-snug">{appt.patientName ?? ''}</h3>
              <p className="text-xs text-text-secondary mt-0.5">{appt.patientPhone ?? ''}</p>
            </div>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Appointment Info</span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                appt.status?.toLowerCase() === 'confirmed'
                  ? 'bg-status-successBg text-status-success border border-status-success/15'
                  : appt.status?.toLowerCase() === 'pending'
                  ? 'bg-status-warningBg text-status-warning border border-status-warning/15'
                  : appt.status?.toLowerCase() === 'completed'
                  ? 'bg-brand-50 text-brand-500 border border-brand-100'
                  : 'bg-status-dangerBg text-status-danger border border-status-danger/15'
              }`}>
                {appointmentStatusLabels[appt.status?.toLowerCase() as AppointmentStatus] || appt.status}
              </span>
            </div>

            {/* Display Info Table */}
            <div className="bg-surface-subtle/50 rounded-xl p-4 border border-surface-border/10 space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary font-semibold">Doctor</span>
                <span className="font-bold text-text-primary">{appt.doctor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-semibold">Department</span>
                <span className="font-bold text-text-primary">{appt.visitType ?? ''}</span>
              </div>
              {!isRescheduling ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-text-secondary font-semibold">Date</span>
                    <span className="font-bold text-text-primary">
                      {new Date(appt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary font-semibold">Time Slot</span>
                    <span className="font-bold text-text-primary flex items-center gap-1">
                      <Clock size={12} className="text-text-muted" />
                      {appt.time}
                    </span>
                  </div>
                </>
              ) : (
                <div className="pt-2 border-t border-surface-border/20 space-y-3">
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wide block">Reschedule Appointment</span>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary block">New Date</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full p-2 bg-surface-base border border-surface-border rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary block">New Time Slot</label>
                    <select
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full p-2 bg-surface-base border border-surface-border rounded-xl text-xs font-semibold focus:outline-none"
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
                  <div className="flex gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        if (rescheduleDate) {
                          try {
                            await api.appointments.update(appt.id, {
                              date: rescheduleDate,
                              time: convertTo24Hour(rescheduleTime)
                            });
                            setIsRescheduling(false);
                            onClose();
                            await onUpdated();
                          } catch (err) {
                            console.error("Failed to reschedule appointment:", err);
                          }
                        }
                      }}
                      className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-xs transition duration-150"
                    >
                      Save Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="flex-1 py-2 border border-surface-border hover:bg-surface-subtle text-text-secondary font-bold rounded-lg text-xs transition duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notes / Visit details */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Notes</span>
              <div className="bg-white border border-surface-border/30 rounded-xl p-3.5 text-xs text-text-primary leading-relaxed font-semibold">
                {appt.notes || "No additional visit notes provided."}
              </div>
            </div>

            {/* Booking source details */}
            <div className="pt-2 border-t border-surface-border/10 space-y-1.5">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Booking Attribution</span>
              <div className="flex items-center gap-2 text-xs">
                {appt.bookedVia === 'zero' ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-ai-500 flex-shrink-0"></span>
                    <span className="font-bold text-ai-600">Booked via Zero AI (WhatsApp Agent)</span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-text-secondary flex-shrink-0"></span>
                    <span className="font-bold text-text-secondary">Booked manually by clinic staff</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        {!isRescheduling && (
          <div className="px-6 pt-6 pb-8 border-t border-surface-border/20 bg-surface-subtle/20 flex flex-col gap-2.5 flex-shrink-0">
            <div className="flex gap-3">
              {appt.status?.toLowerCase() !== 'completed' && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.appointments.update(appt.id, { status: "completed" });
                      onClose();
                      await onUpdated();
                    } catch (err) {
                      console.error("Failed to complete appointment:", err);
                    }
                  }}
                  className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200"
                >
                  Mark Complete
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setRescheduleDate(appt.date);
                  setRescheduleTime(formatTime12h(appt.time));
                  setIsRescheduling(true);
                }}
                className="flex-1 py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150"
              >
                Reschedule
              </button>
            </div>
            {appt.status?.toLowerCase() !== 'cancelled' && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.appointments.update(appt.id, { status: "cancelled" });
                    onClose();
                    await onUpdated();
                  } catch (err) {
                    console.error("Failed to cancel appointment:", err);
                  }
                }}
                className="w-full py-2.5 border border-status-danger/30 hover:bg-status-dangerBg text-status-danger font-bold rounded-xl text-xs transition duration-150"
              >
                Cancel Appointment
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
