import { AlertTriangle, Plus, RefreshCw, Search, X } from 'lucide-react';
import { api, Patient } from '../../api';
import { useToast } from '../../components/shared/Toast';
import { useModalA11y } from '../../hooks/useModalA11y';

export interface QueueEntry {
  id: string;
  patientId?: string | null;
  name: string;
  initials: string;
  phone: string;
  arrivalTime: string;
  doctor: string;
  reason: string;
  waitTime: string;
  source: 'zero' | 'walk-in' | 'manual';
  status: string;
}

const statusToTab: Record<string, string> = {
  WAITING: 'waiting',
  WITH_DOCTOR: 'with_doctor',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
};

const statusLabels: Record<string, string> = {
  WAITING: 'Waiting',
  WITH_DOCTOR: 'With Doctor',
  COMPLETED: 'Completed',
  NO_SHOW: 'No-show',
};

interface LiveQueuePageProps {
  queue: QueueEntry[];
  queueTab: 'waiting' | 'with_doctor' | 'completed' | 'no_show';
  setQueueTab: (tab: 'waiting' | 'with_doctor' | 'completed' | 'no_show') => void;
  queueLoading: boolean;
  queueError: string | null;
  setQueueError: (err: string | null) => void;
  loadQueue: () => Promise<void>;
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;

  isNewWalkInDrawerOpen: boolean;
  setIsNewWalkInDrawerOpen: (open: boolean) => void;
  walkInType: 'registered' | 'new';
  setWalkInType: (type: 'registered' | 'new') => void;
  walkInPatientId: string | null;
  setWalkInPatientId: (id: string | null) => void;
  walkInNewPatientName: string;
  setWalkInNewPatientName: (name: string) => void;
  walkInNewPatientPhone: string;
  setWalkInNewPatientPhone: (phone: string) => void;
  walkInReason: string;
  setWalkInReason: (reason: string) => void;
  walkInDoctor: string;
  setWalkInDoctor: (doctor: string) => void;
  walkInLoading: boolean;
  setWalkInLoading: (loading: boolean) => void;
  doctorOptions: string[];
}

export function LiveQueuePage({
  queue,
  queueTab,
  setQueueTab,
  queueLoading,
  queueError,
  setQueueError,
  loadQueue,
  patients,
  onSelectPatient,
  isNewWalkInDrawerOpen,
  setIsNewWalkInDrawerOpen,
  walkInType,
  setWalkInType,
  walkInPatientId,
  setWalkInPatientId,
  walkInNewPatientName,
  setWalkInNewPatientName,
  walkInNewPatientPhone,
  setWalkInNewPatientPhone,
  walkInReason,
  setWalkInReason,
  walkInDoctor,
  setWalkInDoctor,
  walkInLoading,
  setWalkInLoading,
  doctorOptions,
}: LiveQueuePageProps) {
  const toast = useToast();
  const walkInPanelRef = useModalA11y<HTMLDivElement>(isNewWalkInDrawerOpen, () => setIsNewWalkInDrawerOpen(false));
  const waitingCount = queue.filter(q => statusToTab[q.status] === 'waiting').length;
  const withDoctorCount = queue.filter(q => statusToTab[q.status] === 'with_doctor').length;
  const completedCount = queue.filter(q => statusToTab[q.status] === 'completed').length;
  const noShowCount = queue.filter(q => statusToTab[q.status] === 'no_show').length;

  const filteredQueue = queue.filter(q => statusToTab[q.status] === queueTab);

  const handleCallIn = async (id: string) => {
    const entry = queue.find(q => q.id === id);
    const patientId = entry?.patientId;
    if (!patientId) return;
    try {
      await api.queue.updateStatus(patientId, "WITH_DOCTOR");
      await loadQueue();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleComplete = async (id: string) => {
    const entry = queue.find(q => q.id === id);
    const patientId = entry?.patientId;
    if (!patientId) return;
    try {
      await api.queue.updateStatus(patientId, "COMPLETED");
      await loadQueue();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleMarkArrived = async (id: string) => {
    const entry = queue.find(q => q.id === id);
    const patientId = entry?.patientId;
    if (!patientId) return;
    try {
      await api.queue.updateStatus(patientId, "WAITING");
      await loadQueue();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Status pill — shared by the desktop table and the mobile cards.
  const statusBadge = (status: string) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
      statusToTab[status] === 'waiting'
        ? 'bg-status-warningBg text-status-warning'
        : statusToTab[status] === 'with_doctor'
        ? 'bg-brand-50 text-brand-500'
        : statusToTab[status] === 'completed'
        ? 'bg-status-successBg text-status-success'
        : 'bg-status-dangerBg text-status-danger'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        statusToTab[status] === 'waiting'
          ? 'bg-status-warning'
          : statusToTab[status] === 'with_doctor'
          ? 'bg-brand-500'
          : statusToTab[status] === 'completed'
          ? 'bg-status-success'
          : 'bg-status-danger'
      }`}></span>
      {statusLabels[status] || status}
    </span>
  );

  // Primary action for a queue entry — shared by table and cards.
  const rowAction = (item: QueueEntry) => {
    const tab = statusToTab[item.status];
    if (tab === 'waiting') return (
      <button onClick={() => handleCallIn(item.id)} className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-[11px] shadow-sm transition duration-150">Call In</button>
    );
    if (tab === 'with_doctor') return (
      <button onClick={() => handleComplete(item.id)} className="px-3 py-1.5 bg-status-success hover:bg-status-success/90 text-white font-bold rounded-xl text-[11px] shadow-sm transition duration-150">Complete</button>
    );
    if (tab === 'completed' && item.patientId) return (
      <button onClick={() => onSelectPatient(item.patientId!)} className="text-brand-500 hover:text-brand-600 hover:underline font-bold text-xs transition duration-150">View</button>
    );
    if (tab === 'no_show') return (
      <button onClick={() => handleMarkArrived(item.id)} className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-[11px] shadow-sm transition duration-150">Mark Arrived</button>
    );
    return null;
  };

  return (
    <div className="space-y-6 relative animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-text-primary leading-tight">Live Queue</h2>
          <p className="text-[14px] text-text-secondary mt-1">
            {waitingCount} waiting · {withDoctorCount} with doctor · {completedCount} completed today
          </p>
        </div>

        <button
          onClick={() => {
            setWalkInType('registered');
            setWalkInPatientId(null);
            setWalkInNewPatientName('');
            setWalkInReason('');
            setWalkInDoctor(doctorOptions[0]);
            setIsNewWalkInDrawerOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-brand-500 text-brand-500 hover:bg-brand-50 font-semibold rounded-xl text-xs transition duration-200"
        >
          <Plus size={16} />
          <span>Add Walk-in</span>
        </button>
      </div>

      {/* ERROR BANNER */}
      {queueError && (
        <div className="flex items-center justify-between p-4 bg-status-dangerBg border border-status-danger/20 rounded-xl text-sm text-status-danger animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{queueError}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadQueue()}
              className="px-3 py-1 bg-white hover:bg-status-dangerBg border border-status-danger/20 text-status-danger text-xs font-bold rounded-lg transition duration-150"
            >
              Retry
            </button>
            <button
              onClick={() => setQueueError(null)}
              className="text-status-danger/60 hover:text-status-danger transition duration-150"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STATUS TABS */}
      <div className="flex border-b border-surface-border/30 gap-6 overflow-x-auto">
        <button
          onClick={() => setQueueTab('waiting')}
          className={`pb-3 text-sm font-semibold relative transition duration-150 flex items-center gap-2 ${
            queueTab === 'waiting' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Waiting</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            queueTab === 'waiting' ? 'bg-status-warningBg text-status-warning' : 'bg-surface-subtle text-text-muted'
          }`}>
            {waitingCount}
          </span>
          {queueTab === 'waiting' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => setQueueTab('with_doctor')}
          className={`pb-3 text-sm font-semibold relative transition duration-150 flex items-center gap-2 ${
            queueTab === 'with_doctor' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>With Doctor</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            queueTab === 'with_doctor' ? 'bg-brand-100 text-brand-700' : 'bg-surface-subtle text-text-muted'
          }`}>
            {withDoctorCount}
          </span>
          {queueTab === 'with_doctor' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => setQueueTab('completed')}
          className={`pb-3 text-sm font-semibold relative transition duration-150 flex items-center gap-2 ${
            queueTab === 'completed' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Completed</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            queueTab === 'completed' ? 'bg-status-successBg text-status-success' : 'bg-surface-subtle text-text-muted'
          }`}>
            {completedCount}
          </span>
          {queueTab === 'completed' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => setQueueTab('no_show')}
          className={`pb-3 text-sm font-semibold relative transition duration-150 flex items-center gap-2 ${
            queueTab === 'no_show' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>No-show</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            queueTab === 'no_show' ? 'bg-status-dangerBg text-status-danger' : 'bg-surface-subtle text-text-muted'
          }`}>
            {noShowCount}
          </span>
          {queueTab === 'no_show' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* QUEUE TABLE — table on lg+, stacked cards below lg */}
      <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 overflow-hidden flex flex-col justify-between min-h-[500px]">
        {queueLoading ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <RefreshCw className="animate-spin text-brand-500 mb-4" size={32} />
            <p className="text-sm font-semibold text-text-primary">Loading live queue...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 bg-surface-subtle text-text-secondary rounded-full flex items-center justify-center mb-4">
              <Search size={22} />
            </div>
            <p className="text-sm font-semibold text-text-primary">No patients in queue</p>
            <p className="text-xs text-text-secondary mt-1 max-w-xs capitalize">
              There are no patients currently marked as {queueTab.replace('_', ' ')}.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile/tablet card list */}
            <div className="lg:hidden divide-y divide-surface-border/20">
              {filteredQueue.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.patientId && onSelectPatient(item.patientId)}
                  className={`p-4 flex flex-col gap-3 ${item.patientId ? 'active:bg-surface-subtle/50 cursor-pointer' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-500 font-semibold text-xs flex items-center justify-center border border-brand-100 flex-shrink-0">
                        {item.initials}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-text-primary block truncate">{item.name}</span>
                        <span className="text-[10px] text-text-secondary mt-0.5 block truncate">{item.phone}</span>
                      </div>
                    </div>
                    {statusBadge(item.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                    <div>
                      <span className="text-text-muted">Doctor</span>
                      <div className="text-text-secondary font-medium truncate">{item.doctor || '—'}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Wait Time</span>
                      <div className="text-text-secondary font-medium">{item.waitTime}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-text-muted">Reason</span>
                      <div className="text-text-secondary font-medium truncate">{item.reason || '—'}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {item.source === 'zero' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-ai-50 text-ai-600 border border-ai-100/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-ai-500"></span>
                        via Zero
                      </span>
                    ) : (
                      <span className="text-[11px] text-text-secondary font-medium">Walk-in</span>
                    )}
                    <div onClick={(e) => e.stopPropagation()}>{rowAction(item)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border/30 text-left bg-surface-subtle/35">
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans w-16">No.</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Patient</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Arrival Time</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Doctor</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Reason</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Wait Time</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Source</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Status</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider text-right font-sans">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/20">
                {filteredQueue.map((item, index) => {
                  const positionNumber = index + 1;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        if (item.patientId) {
                          onSelectPatient(item.patientId);
                        }
                      }}
                      className={`transition duration-150 ${
                        item.patientId ? 'hover:bg-surface-subtle/50 cursor-pointer' : ''
                      }`}
                    >
                      <td className="py-3.5 px-6 text-xs font-bold text-text-secondary">
                        {positionNumber}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-semibold text-xs flex items-center justify-center border border-brand-100 flex-shrink-0">
                            {item.initials}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-text-primary block">{item.name}</span>
                            <span className="text-[10px] text-text-secondary mt-0.5 block">{item.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-xs font-medium text-text-primary">
                        {item.arrivalTime}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-text-secondary font-medium">
                        {item.doctor}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-text-secondary font-medium max-w-[200px] truncate">
                        {item.reason}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-text-secondary font-medium">
                        {item.waitTime}
                      </td>
                      <td className="py-3.5 px-6">
                        {item.source === 'zero' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-ai-50 text-ai-600 border border-ai-100/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-ai-500"></span>
                            via Zero
                          </span>
                        ) : (
                          <span className="text-xs text-text-secondary font-medium">Walk-in</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        {statusBadge(item.status)}
                      </td>
                      <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        {rowAction(item)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>

      {/* ADD WALK-IN SIDE DRAWER */}
      {isNewWalkInDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsNewWalkInDrawerOpen(false)}
          ></div>

          <div
            ref={walkInPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Add walk-in patient"
            className="relative w-full sm:max-w-md bg-surface-base h-full shadow-2xl border-l border-surface-border/20 flex flex-col z-10 animate-slide-in overflow-hidden font-sans text-xs font-semibold"
          >
            {/* Header */}
            <div className="p-6 border-b border-surface-border/20 flex items-center justify-between flex-shrink-0">
              <h3 className="text-base font-bold text-text-primary">Add Walk-in Patient</h3>
              <button
                onClick={() => setIsNewWalkInDrawerOpen(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150 border border-surface-border/30"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                let patientName = '';
                let patientPhone = '';

                if (walkInType === 'registered') {
                  if (!walkInPatientId) {
                    toast.error("Please select a patient.");
                    return;
                  }
                  const patient = patients.find(p => p.id === walkInPatientId);
                  if (!patient) return;
                  patientName = patient.name;
                  patientPhone = patient.phone;
                } else {
                  if (!walkInNewPatientName.trim()) {
                    toast.error("Please enter patient name.");
                    return;
                  }
                  if (!walkInNewPatientPhone.trim()) {
                    toast.error("Please enter phone number.");
                    return;
                  }
                  patientName = walkInNewPatientName.trim();
                  patientPhone = walkInNewPatientPhone.trim();
                }

                try {
                  setWalkInLoading(true);
                  await api.queue.addWalkIn({
                    name: patientName,
                    phone: patientPhone,
                    reason: walkInReason || "General consultation",
                    doctor: walkInDoctor,
                    source: "walk-in",
                  });
                  setIsNewWalkInDrawerOpen(false);
                  await loadQueue();
                  toast.success(`${patientName} added to the queue.`);
                } catch (err) {
                  console.error("Failed to add walk-in:", err);
                  toast.error("Couldn't add walk-in. Please try again.");
                } finally {
                  setWalkInLoading(false);
                }
              }}
              className="p-6 space-y-5 flex-1 overflow-y-auto"
            >
              {/* Select Patient Mode (Registered vs New) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Patient Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="walkInType"
                      checked={walkInType === 'registered'}
                      onChange={() => setWalkInType('registered')}
                      className="text-brand-500 focus:ring-brand-500"
                    />
                    <span>Registered Patient</span>
                  </label>
                  <label className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="walkInType"
                      checked={walkInType === 'new'}
                      onChange={() => setWalkInType('new')}
                      className="text-brand-500 focus:ring-brand-500"
                    />
                    <span>New / Unregistered</span>
                  </label>
                </div>
              </div>

              {/* Registered Patient Select */}
              {walkInType === 'registered' ? (
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Select Patient <span className="text-status-danger">*</span></label>
                  <select
                    value={walkInPatientId || ''}
                    onChange={(e) => setWalkInPatientId(e.target.value)}
                    required
                    className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="">Select patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Patient Full Name <span className="text-status-danger">*</span></label>
                    <input
                      type="text"
                      value={walkInNewPatientName}
                      onChange={(e) => setWalkInNewPatientName(e.target.value)}
                      placeholder="Enter full name..."
                      required
                      className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Patient Phone Number <span className="text-status-danger">*</span></label>
                    <input
                      type="text"
                      value={walkInNewPatientPhone}
                      onChange={(e) => setWalkInNewPatientPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 012-3456"
                      required
                      className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              )}

              {/* Doctor select */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Doctor Assignment</label>
                <select
                  value={walkInDoctor}
                  onChange={(e) => setWalkInDoctor(e.target.value)}
                  required
                  className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {doctorOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Reason for visit */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Reason for Visit</label>
                <input
                  type="text"
                  value={walkInReason}
                  onChange={(e) => setWalkInReason(e.target.value)}
                  placeholder="e.g. Hypertension checkup, general consulting..."
                  className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Form Actions Footer */}
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={walkInLoading}
                  className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200 flex items-center justify-center gap-2"
                >
                  {walkInLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add to Queue</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewWalkInDrawerOpen(false)}
                  className="flex-1 py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
