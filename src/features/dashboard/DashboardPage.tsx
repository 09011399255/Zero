import { ArrowUpRight, CheckCircle2, ChevronDown, Clock, Download, ShieldAlert, AlertTriangle, TrendingUp, TrendingDown, Users, Sparkles } from 'lucide-react';
import { Appointment, AppointmentStatus, Conversation, DashboardSummary } from '../../api';
import { useToast } from '../../components/shared/Toast';

// ── Inline area-sparkline. Pure SVG, no deps. Gives the KPI tiles real
// data-visualisation weight instead of a bare number. ───────────────────────
function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const w = 128, h = 44;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 3 - ((d - min) / range) * (h - 10);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = 'M' + pts.join(' L');
  const area = `${line} L${w},${h} L0,${h} Z`;
  const last = pts[pts.length - 1].split(',').map(Number);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-11 overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

// Trend delta chip (▲/▼ + value), colour-coded by direction. ─────────────────
function TrendChip({ dir, value }: { dir: 'up' | 'down'; value: string }) {
  const up = dir === 'up';
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
      up ? 'bg-status-successBg text-status-success' : 'bg-status-dangerBg text-status-danger'
    }`}>
      <Icon size={12} strokeWidth={2.5} />
      {value}
    </span>
  );
}

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

  const todaysUpcoming = [...appointments]
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
    .slice(0, 8);

  const miniStatusBadgeClasses = (status?: string) =>
    status === 'confirmed'
      ? 'bg-status-successBg text-status-success'
      : status === 'pending'
      ? 'bg-status-warningBg text-status-warning'
      : 'bg-status-dangerBg text-status-danger';

  return (
    <>
      {/* GREETING HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-bold text-text-primary leading-tight tracking-tighter2">
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-base border border-surface-border text-text-primary hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50 font-semibold rounded-xl text-[13px] shadow-card transition duration-200"
        >
          <Download size={16} />
          <span>Download Report</span>
        </button>
      </div>

      {/* HERO: AI ACTIVITY CARD — deep-ink band that echoes the sidebar chrome,
          signalling "the AI engine" as the centrepiece of the dashboard. */}
      <div className="relative overflow-hidden rounded-2xl bg-ink-900 text-white shadow-elevated ring-1 ring-white/[0.06] p-6">
        {/* Ambient brand glow */}
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-ai-500/10 blur-3xl" aria-hidden="true" />

        {/* Top Row */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] ring-1 ring-white/10">
              <Sparkles size={15} className="text-brand-300" />
            </span>
            <span className="text-[13px] font-semibold text-slate-200 tracking-tightish">
              Zero is working — AI patient care operations
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-status-success/15 text-emerald-300 ring-1 ring-emerald-400/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
            </span>
            Live
          </span>
        </div>

        {/* Stat Row — each metric gets its own sparkline so the hero reads as a
            live operations feed, not a static number strip. */}
        <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-3 border-t border-white/[0.08] pt-4 sm:pt-6 gap-y-4 sm:gap-y-0 sm:divide-x divide-white/[0.08]">
          {[
            { key: 'conv', label: 'Conversations handled', value: ai?.conversationsHandledToday ?? 0, trend: '+23%', spark: [30, 38, 34, 46, 42, 55, 58, 61] },
            { key: 'esc', label: 'Escalated to staff', value: ai?.escalatedToStaff ?? 0, trend: '−1', spark: [5, 4, 6, 4, 3, 4, 3, 3] },
            { key: 'resp', label: 'Avg response time', value: ai ? `${ai.avgResponseTimeSeconds}s` : '—', trend: '−40%', spark: [16, 14, 13, 11, 12, 9, 8, 8] },
          ].map((s, i) => (
            <div key={s.key} className={`flex flex-col ${i === 0 ? 'sm:pr-6' : i === 1 ? 'sm:px-6' : 'sm:pl-6'}`}>
              <span className="text-[12px] text-slate-400 font-medium">{s.label}</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-[30px] font-bold text-white leading-none tracking-tighter2 tabular-nums">{s.value}</span>
                <span className="text-[11px] font-bold text-emerald-300">{s.trend}</span>
              </div>
              <div className="mt-2 -mb-1">
                <Sparkline data={s.spark} color="#93B4FD" id={`hero-spark-${s.key}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STAT ROW (3 Compact Cards) — 2-up compact grid on mobile (smaller
          icon, tighter layout) rather than a shrunk version of the desktop card */}
      {(() => {
        const cards = [
          {
            label: "Patients Waiting",
            count: queue.filter(q => statusToTab[q.status] === 'waiting').length,
            sub: "in the live queue now",
            type: "waiting" as const,
            accent: '#D97706',
            trend: { dir: 'up' as const, value: '+2' },
            spark: [2, 3, 2, 4, 3, 5, 4, 5],
          },
          {
            label: "With Doctor",
            count: queue.filter(q => statusToTab[q.status] === 'with_doctor').length,
            sub: "currently in consultation",
            type: "withDoctor" as const,
            accent: '#2563EB',
            trend: { dir: 'up' as const, value: '+1' },
            spark: [1, 2, 1, 3, 2, 2, 3, 2],
          },
          {
            label: "Completed Today",
            count: queue.filter(q => statusToTab[q.status] === 'completed').length,
            sub: "seen & discharged",
            type: "completed" as const,
            accent: '#16A34A',
            trend: { dir: 'up' as const, value: '+18%' },
            spark: [8, 12, 10, 16, 14, 20, 24, 27],
          },
        ];
        const iconBg = (t: typeof cards[number]['type']) =>
          t === 'waiting' ? 'bg-status-warningBg text-status-warning' : t === 'withDoctor' ? 'bg-brand-50 text-brand-500' : 'bg-status-successBg text-status-success';
        const icon = (t: typeof cards[number]['type'], size: number) =>
          t === 'waiting' ? <Clock size={size} /> : t === 'withDoctor' ? <Users size={size} /> : <CheckCircle2 size={size} />;
        return (
          <>
            {/* Mobile: compact 2-up grid */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              {cards.map((card) => (
                <div key={card.label} className="relative overflow-hidden bg-surface-base rounded-xl p-3 shadow-card border border-surface-border flex flex-col gap-2">
                  <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: card.accent }} />
                  <div className="flex items-center justify-between">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg(card.type)}`}>
                      {icon(card.type, 14)}
                    </div>
                    <span className="text-2xl font-bold text-text-primary leading-none tracking-tighter2">{card.count}</span>
                  </div>
                  <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide leading-tight">{card.label}</span>
                </div>
              ))}
            </div>

            {/* Tablet/desktop: premium KPI tile — icon + label, trend chip,
                oversized value, and an inline area sparkline. */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-5">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="group relative overflow-hidden bg-surface-base rounded-2xl border border-surface-border shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 p-5"
                >
                  {/* Top accent hairline */}
                  <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: card.accent }} aria-hidden="true" />
                  {/* Soft accent wash */}
                  <span className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl opacity-[0.10]" style={{ background: card.accent }} aria-hidden="true" />

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ring-1 ring-inset ring-black/[0.03] ${iconBg(card.type)}`}>
                        {icon(card.type, 18)}
                      </span>
                      <span className="text-[11px] text-text-secondary font-bold tracking-[0.1em] uppercase">
                        {card.label}
                      </span>
                    </div>
                    <TrendChip dir={card.trend.dir} value={card.trend.value} />
                  </div>

                  <div className="relative mt-4 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[46px] font-bold text-text-primary leading-[0.9] tracking-tighter2 tabular-nums">
                        {card.count}
                      </div>
                      <div className="text-[11px] text-text-muted font-medium mt-2">{card.sub}</div>
                    </div>
                    <div className="w-32 flex-shrink-0 self-end">
                      <Sparkline data={card.spark} color={card.accent} id={`spark-${card.type}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      })()}

      {/* TWO COLUMN ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Today's Appointments (Mini) - 60% width */}
        <div className="bg-surface-base rounded-2xl shadow-card border border-surface-border p-6 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[15px] font-bold text-text-primary tracking-tightish">Today's Appointments</h3>
              <button
                onClick={() => onNavigate('appointments')}
                className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1 transition duration-150"
              >
                <span>View All</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            {/* Mobile: compact card list instead of a 5-column table */}
            <div className="md:hidden space-y-2">
              {todaysUpcoming.length === 0 ? (
                <p className="text-xs text-text-secondary py-4 text-center">No appointments today.</p>
              ) : (
                todaysUpcoming.map((apt) => {
                  const aptStatus = apt.status?.toLowerCase();
                  return (
                    <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl border border-surface-border/20">
                      <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-semibold text-xs flex items-center justify-center border border-brand-100 flex-shrink-0">
                        {apt.patientName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'PT'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-text-primary block truncate">{apt.patientName ?? ''}</span>
                        <span className="text-[10px] text-text-secondary block truncate">{apt.time} · {apt.doctor}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider flex-shrink-0 ${miniStatusBadgeClasses(aptStatus)}`}>
                        {appointmentStatusLabels[aptStatus as AppointmentStatus] || apt.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop/tablet: full table with inline Accept/Reject actions */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border text-left">
                    <th className="pb-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em]">Patient</th>
                    <th className="pb-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em]">Time</th>
                    <th className="pb-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em]">Doctor</th>
                    <th className="pb-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em]">Status</th>
                    <th className="pb-2.5 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/70">
                  {todaysUpcoming.map((apt) => {
                      const aptStatus = apt.status?.toLowerCase();
                      return (
                        <tr key={apt.id} className="group hover:bg-surface-muted/60 transition duration-150">
                          <td className="py-2.5 pl-2 -ml-2 rounded-l-lg flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 font-bold text-[11px] flex items-center justify-center ring-1 ring-brand-200/60">
                              {apt.patientName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'PT'}
                            </div>
                            <span className="text-[13px] font-semibold text-text-primary">{apt.patientName ?? ''}</span>
                          </td>
                          <td className="py-2.5 text-[13px] font-semibold text-text-primary tabular-nums">{apt.time}</td>
                          <td className="py-2.5 text-[13px] text-text-secondary font-medium">{apt.doctor}</td>
                          <td className="py-2.5">
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
                          <td className="py-2.5 pr-2 -mr-2 rounded-r-lg text-right relative">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === apt.id ? null : apt.id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-surface-border text-text-secondary hover:text-text-primary hover:border-brand-300 bg-surface-base hover:bg-brand-50/50 font-semibold rounded-lg text-xs transition duration-150 shadow-card"
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
        <div className="bg-surface-base rounded-2xl shadow-card border border-surface-border p-6 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-text-primary tracking-tightish mb-6">Needs Attention</h3>

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
                        className={`relative overflow-hidden p-4 pl-5 rounded-xl border bg-surface-base shadow-card hover:shadow-elevated transition-all duration-150 flex flex-col justify-between gap-3 ${
                          type === 'escalation'
                            ? 'border-status-danger/15'
                            : 'border-status-warning/15'
                        }`}
                      >
                        {/* Left accent spine */}
                        <span className={`absolute left-0 top-0 bottom-0 w-1 ${type === 'escalation' ? 'bg-status-danger' : 'bg-status-warning'}`} aria-hidden="true" />
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              type === 'escalation'
                                ? 'bg-status-dangerBg text-status-danger ring-1 ring-status-danger/20'
                                : 'bg-status-warningBg text-status-warning ring-1 ring-status-warning/20'
                            }`}>
                              {type === 'escalation' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                            </div>
                            <div>
                              <h4 className="text-[13px] font-bold text-text-primary leading-tight">{title}</h4>
                              <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                                {conv.escalationReason || 'Requires review'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-text-muted flex-shrink-0 whitespace-nowrap">
                            {conv.lastMessageTime || ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-2.5 border-t border-surface-border/70">
                          <button
                            onClick={() => setDismissedAttentionIds(prev => [...prev, conv.id])}
                            className="px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md transition duration-150"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => onSelectConversation(conv.id)}
                            className={`px-3 py-1.5 rounded-md font-bold text-[11px] transition duration-150 text-white shadow-sm ${
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
        <div className="bg-surface-base rounded-2xl shadow-card border border-surface-border p-6 lg:col-span-7 flex flex-col min-h-[340px] relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-[15px] font-bold text-text-primary tracking-tightish">Booking &amp; Conversation Trends</h3>
              <p className="text-[11px] text-text-secondary mt-0.5">Last 7 days</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              Coming soon
            </span>
          </div>

          {/* Ghost chart — faint gridlines + placeholder bars so the empty state
              reads as "a chart will live here", not a broken loader. */}
          <div className="relative flex-1 mt-6 flex items-end justify-between gap-3 px-1 pb-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-px w-full bg-surface-border/60" />)}
            </div>
            {[45, 62, 38, 70, 52, 80, 60].map((h, i) => (
              <div key={i} className="relative z-10 flex-1 rounded-t-md bg-gradient-to-t from-brand-100 to-brand-50" style={{ height: `${h}%` }} />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center max-w-xs px-4 py-3 rounded-2xl bg-surface-base/80 backdrop-blur-sm ring-1 ring-surface-border shadow-card">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-2.5 ring-1 ring-brand-100">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-[13px] font-bold text-text-primary mb-1">Analytics sync pending</h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Real-time booking and conversation trends populate here once analytics goes live.
              </p>
            </div>
          </div>
        </div>

        {/* AI Performance Insights - 30% width */}
        <div className="bg-surface-base rounded-2xl shadow-card border border-surface-border p-6 lg:col-span-3 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ai-50 text-ai-600 ring-1 ring-ai-100">
                <Sparkles size={13} />
              </span>
              <span className="text-[11px] font-bold text-ai-600 uppercase tracking-[0.12em]">
                AI Autonomy Rate
              </span>
            </div>
            <div>
              <div className="flex items-end gap-2">
                <span className="text-[40px] leading-none font-bold text-text-primary tracking-tighter2">
                  {autonomy ? `${autonomy.autonomyRatePercent}%` : '—'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-success mb-1.5">
                  <TrendingUp size={13} />
                  handled solo
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 w-full rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-ai-400 to-ai-600 transition-all duration-500"
                  style={{ width: `${autonomy?.autonomyRatePercent ?? 0}%` }}
                />
              </div>
              <p className="text-[11px] text-text-muted font-medium mt-2">Today's conversations</p>
            </div>

            <div className="pt-4 border-t border-surface-border space-y-3">
              {[
                { label: 'Autopilot Sessions', value: `${autonomy?.autopilotSessions ?? 0}` },
                { label: 'Manual Escalations', value: `${autonomy?.manualEscalations ?? 0}` },
                { label: 'Recall Success', value: `${autonomy?.recallSuccessRatePercent ?? 0}%` },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-[13px]">
                  <span className="text-text-secondary">{row.label}</span>
                  <span className="font-bold text-text-primary tabular-nums">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {autonomy?.insightLine && (
            <div className="mt-6 bg-ai-50/60 border border-ai-100 rounded-xl p-3 flex items-start gap-2">
              <Sparkles size={13} className="text-ai-500 mt-0.5 flex-shrink-0" />
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
