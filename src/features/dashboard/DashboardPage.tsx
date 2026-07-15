import { ArrowUpRight, CheckCircle2, ChevronDown, Clock, Download, RefreshCw, ShieldAlert, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Appointment, AppointmentStatus, Conversation, DashboardSummary } from '../../api';
import { useToast } from '../../components/shared/Toast';

const statusToTab: Record<string, string> = {
  WAITING: 'waiting',
  WITH_DOCTOR: 'with_doctor',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
};

const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

interface QueueEntryLike {
  status: string;
}

interface DashboardPageProps {
  clinicName: string;
  queue: QueueEntryLike[];
  appointments: Appointment[];
  conversations: Conversation[];
  dismissedAttentionIds: string[];
  setDismissedAttentionIds: React.Dispatch<React.SetStateAction<string[]>>;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  onStatusChange: (id: string, newStatus: 'Confirmed' | 'Pending' | 'Cancelled') => void;
  onNavigate: (route: string) => void;
  onSelectConversation: (convId: string) => void;
  summary: DashboardSummary | null;
}

export function DashboardPage({
  clinicName,
  queue,
  appointments,
  conversations,
  dismissedAttentionIds,
  setDismissedAttentionIds,
  openDropdownId,
  setOpenDropdownId,
  onStatusChange,
  onNavigate,
  onSelectConversation,
  summary,
}: DashboardPageProps) {
  const toast = useToast();
  const ai = summary?.aiActivity;
  const autonomy = summary?.aiAutonomy;
  return (
    <>
      {/* GREETING HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-text-primary leading-tight">
            Good afternoon, {clinicName}
          </h2>
          <p className="text-[14px] text-text-secondary mt-1">
            {summary?.patientsToday ?? 0} patients today · {summary?.doctorsOnDuty ?? 0} doctors on duty ·{' '}
            <span className="font-semibold text-status-warning">
              {conversations.filter(c => c.status === 'NEEDS_REVIEW' && !dismissedAttentionIds.includes(c.id)).length} conversations need your attention
            </span>
          </p>
        </div>
        <button
          onClick={() => toast.info('Report download started — check your downloads shortly.')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-brand-500 text-brand-500 hover:bg-brand-50 font-medium rounded-xl text-sm transition duration-200"
        >
          <Download size={16} />
          <span>Download Report</span>
        </button>
      </div>

      {/* HERO: AI ACTIVITY CARD */}
      <div className="bg-surface-base border border-surface-border/35 border-l-4 border-l-ai-500 rounded-2xl shadow-soft p-6 relative overflow-hidden flex flex-col gap-6">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-text-secondary">
            Zero is working — AI patient care operations
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-status-successBg text-status-success border border-status-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
              Live
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
              <span className="text-[12px] font-semibold text-status-success">Active</span>
            </div>
          </div>
        </div>

        {/* Stat Row */}
        <div className="grid grid-cols-3 border-t border-surface-border/60 pt-6">
          {/* Conversations Handled Today */}
          <div className="flex flex-col items-center justify-center text-center py-1">
            <span className="text-[24px] font-semibold text-text-primary leading-none">
              {ai?.conversationsHandledToday ?? 0}
            </span>
            <span className="text-[12px] text-text-secondary mt-1.5">
              Conversations handled today
            </span>
          </div>

          {/* Escalated to Staff */}
          <div className="flex flex-col items-center justify-center text-center py-1 border-x border-surface-border/60">
            <span className="text-[24px] font-semibold text-text-primary leading-none">
              {ai?.escalatedToStaff ?? 0}
            </span>
            <span className="text-[12px] text-text-secondary mt-1.5">
              Escalated to staff
            </span>
          </div>

          {/* Avg Response Time */}
          <div className="flex flex-col items-center justify-center text-center py-1">
            <span className="text-[24px] font-semibold text-text-primary leading-none">
              {ai ? `${ai.avgResponseTimeSeconds}s` : '—'}
            </span>
            <span className="text-[12px] text-text-secondary mt-1.5">
              Avg response time
            </span>
          </div>
        </div>
      </div>

      {/* STAT ROW (3 Compact Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Patients Waiting",
            count: queue.filter(q => statusToTab[q.status] === 'waiting').length,
            change: "Live count",
            type: "waiting"
          },
          {
            label: "With Doctor",
            count: queue.filter(q => statusToTab[q.status] === 'with_doctor').length,
            change: "Live count",
            type: "withDoctor"
          },
          {
            label: "Completed Today",
            count: queue.filter(q => statusToTab[q.status] === 'completed').length,
            change: "Live count",
            type: "completed"
          }
        ].map((card) => (
          <div
            key={card.label}
            className="bg-surface-base rounded-2xl p-6 shadow-soft hover:shadow-soft-md transition duration-200 border border-surface-border/20 flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-text-secondary font-medium tracking-wide block uppercase">
                {card.label}
              </span>
              <span className="text-3xl font-bold text-text-primary block mt-1.5">
                {card.count}
              </span>
              <span className={`text-xs font-semibold inline-block mt-2 px-2.5 py-0.5 rounded-full ${
                card.type === 'waiting'
                  ? 'bg-status-warningBg text-status-warning'
                  : card.type === 'withDoctor'
                  ? 'bg-brand-50 text-brand-600'
                  : 'bg-status-successBg text-status-success'
              }`}>
                {card.change}
              </span>
            </div>

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              card.type === 'waiting'
                ? 'bg-status-warningBg text-status-warning'
                : card.type === 'withDoctor'
                ? 'bg-brand-50 text-brand-500'
                : 'bg-status-successBg text-status-success'
            }`}>
              {card.type === 'waiting' && <Clock size={22} />}
              {card.type === 'withDoctor' && <Users size={22} />}
              {card.type === 'completed' && <CheckCircle2 size={22} />}
            </div>
          </div>
        ))}
      </div>

      {/* TWO COLUMN ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Today's Appointments (Mini) - 60% width */}
        <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-text-primary">Today's Appointments</h3>
              <button
                onClick={() => onNavigate('appointments')}
                className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1 transition duration-150"
              >
                <span>View All</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border/30 text-left">
                    <th className="pb-3 text-xs font-semibold text-text-secondary tracking-wider">Patient</th>
                    <th className="pb-3 text-xs font-semibold text-text-secondary tracking-wider">Time</th>
                    <th className="pb-3 text-xs font-semibold text-text-secondary tracking-wider">Doctor</th>
                    <th className="pb-3 text-xs font-semibold text-text-secondary tracking-wider">Status</th>
                    <th className="pb-3 text-xs font-semibold text-text-secondary tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/20">
                  {[...appointments]
                    .filter(a => a && a.date && (a.status?.toLowerCase() ?? '') !== 'cancelled')
                    .sort((a, b) => {
                      if (a.date !== b.date) return a.date.localeCompare(b.date);
                      const getMinutes = (t: string) => {
                        if (!t) return 0;
                        const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
                        if (!m) return 0;
                        let h = parseInt(m[1], 10);
                        const mins = parseInt(m[2], 10);
                        if (m[3]) {
                          const ampm = m[3].toUpperCase();
                          if (ampm === "PM" && h < 12) h += 12;
                          if (ampm === "AM" && h === 12) h = 0;
                        }
                        return h * 60 + mins;
                      };
                      return getMinutes(a.time) - getMinutes(b.time);
                    })
                    .slice(0, 8)
                    .map((apt) => {
                      const aptStatus = apt.status?.toLowerCase();
                      return (
                        <tr key={apt.id} className="hover:bg-surface-subtle/50 transition duration-150">
                          <td className="py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-semibold text-xs flex items-center justify-center border border-brand-100">
                              {apt.patientName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'PT'}
                            </div>
                            <span className="text-xs font-semibold text-text-primary">{apt.patientName ?? ''}</span>
                          </td>
                          <td className="py-3 text-xs font-medium text-text-primary">{apt.time}</td>
                          <td className="py-3 text-xs text-text-secondary font-medium">{apt.doctor}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              aptStatus === 'confirmed'
                                ? 'bg-status-successBg text-status-success'
                                : aptStatus === 'pending'
                                ? 'bg-status-warningBg text-status-warning'
                                : 'bg-status-dangerBg text-status-danger'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${
                                aptStatus === 'confirmed'
                                  ? 'bg-status-success'
                                  : aptStatus === 'pending'
                                  ? 'bg-status-warning'
                                  : 'bg-status-danger'
                              }`}></span>
                              {appointmentStatusLabels[aptStatus as AppointmentStatus] || apt.status}
                            </span>
                          </td>
                          <td className="py-3 text-right relative">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === apt.id ? null : apt.id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-surface-border text-text-secondary hover:text-text-primary bg-surface-base hover:bg-surface-subtle font-medium rounded-xl text-xs transition duration-150 shadow-sm"
                              >
                                <span>Actions</span>
                                <ChevronDown size={12} className="text-text-muted" />
                              </button>

                              {openDropdownId === apt.id && (
                                <div className="absolute right-0 mt-1.5 w-28 bg-surface-base border border-surface-border rounded-xl shadow-lg z-50 py-1 origin-top-right">
                                  <button
                                    onClick={() => {
                                      onStatusChange(apt.id, 'Confirmed');
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-status-success hover:bg-status-successBg font-semibold transition duration-150"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => {
                                      onStatusChange(apt.id, 'Cancelled');
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-status-danger hover:bg-status-dangerBg font-semibold transition duration-150"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Needs Attention - 40% width */}
        <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-6">Needs Attention</h3>

            {conversations.filter(c => c.status === 'NEEDS_REVIEW' && !dismissedAttentionIds.includes(c.id)).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-status-successBg text-status-success rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm font-semibold text-text-primary">Nothing needs attention</p>
                <p className="text-xs text-text-secondary mt-1">AI and queue are running smoothly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations
                  .filter(c => c.status === 'NEEDS_REVIEW' && !dismissedAttentionIds.includes(c.id))
                  .map((conv) => {
                    const isUrgent = conv.urgency === 'urgent';
                    const title = isUrgent ? 'Urgent Medical' : 'Billing/Admin';
                    const type = isUrgent ? 'escalation' : 'warning';
                    return (
                      <div
                        key={conv.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition duration-150 ${
                          type === 'escalation'
                            ? 'bg-status-dangerBg border-status-danger/10'
                            : 'bg-status-warningBg border-status-warning/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              type === 'escalation'
                                ? 'bg-status-danger text-white'
                                : 'bg-status-warning text-white'
                            }`}>
                              {type === 'escalation' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-text-primary leading-tight">{title}</h4>
                              <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                                {conv.escalationReason || 'Requires review'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-text-muted flex-shrink-0">
                            {conv.lastMessageTime || ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-black/[0.03]">
                          <button
                            onClick={() => setDismissedAttentionIds(prev => [...prev, conv.id])}
                            className="px-2.5 py-1 text-[10px] font-bold text-text-secondary hover:text-text-primary rounded-md transition duration-150"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => onSelectConversation(conv.id)}
                            className={`px-3 py-1 rounded-md font-bold text-[10px] transition duration-150 text-white shadow-sm ${
                              type === 'escalation'
                                ? 'bg-status-danger hover:bg-status-danger/90'
                                : 'bg-status-warning hover:bg-status-warning/90'
                            }`}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: TREND CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Booking Trend Chart - 70% width -> Placeholder */}
        <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 lg:col-span-7 flex flex-col justify-center items-center min-h-[340px] relative overflow-hidden group">
          {/* Subtle decorative background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50/10 to-ai-50/10 opacity-30"></div>
          <div className="relative flex flex-col items-center text-center max-w-sm px-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4 animate-pulse">
              <RefreshCw size={24} className="animate-spin text-brand-500" style={{ animationDuration: '4s' }} />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">Analytics Sync Pending</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Real-time booking and conversation trends will populate here once the backend analytics integration goes live.
            </p>
          </div>
        </div>

        {/* AI Performance Insights - 30% width */}
        <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 lg:col-span-3 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <span className="text-[11px] font-semibold text-ai-600 uppercase tracking-widest block">
              AI AUTONOMY RATE
            </span>
            <div>
              <span className="text-4xl font-bold text-text-primary tracking-tight">
                {autonomy ? `${autonomy.autonomyRatePercent}%` : '—'}
              </span>
              <div className="flex items-center gap-1 text-xs text-text-muted font-medium mt-1">
                <TrendingUp size={14} />
                <span>Today's conversations</span>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border/30 space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Autopilot Sessions</span>
                <span className="font-bold text-text-primary">{autonomy?.autopilotSessions ?? 0} sessions</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Manual Escalations</span>
                <span className="font-bold text-text-primary">{autonomy?.manualEscalations ?? 0} sessions</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Recall Success Rate</span>
                <span className="font-bold text-text-primary">{autonomy?.recallSuccessRatePercent ?? 0}% response</span>
              </div>
            </div>
          </div>

          {autonomy?.insightLine && (
            <div className="mt-6 bg-ai-50/50 border border-ai-100/50 rounded-xl p-3 flex items-start">
              <p className="text-[11px] text-ai-600 leading-relaxed font-medium">
                {autonomy.insightLine}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
