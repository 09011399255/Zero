import { Activity, Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, LayoutGrid, Plus, Search, SlidersHorizontal, Table2 } from 'lucide-react';
import { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../api';
import { ErrorState } from '../../components/shared/ErrorState';
import { EmptyState } from '../../components/shared/EmptyState';

const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

interface AppointmentsPageProps {
  appointments: Appointment[];
  appointmentsLoading: boolean;
  appointmentsError: string | null;
  onRetryAppointments: () => void;
  currentWeekStart: Date;
  setCurrentWeekStart: (date: Date) => void;
  apptViewMode: 'calendar' | 'list';
  setApptViewMode: (mode: 'calendar' | 'list') => void;
  apptSearchQuery: string;
  setApptSearchQuery: (q: string) => void;
  apptDoctorFilter: string;
  setApptDoctorFilter: (v: string) => void;
  apptStatusFilter: string;
  setApptStatusFilter: (v: string) => void;
  apptSortOrder: 'asc' | 'desc';
  setApptSortOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  apptCurrentPage: number;
  setApptCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  onSelectAppointment: (id: string) => void;
  onOpenNewAppointment: (defaults: { date: string; time: string }) => void;
  getWeekDays: (start: Date) => Date[];
  formatDateString: (date: Date) => string;
  formatRangeLabel: (start: Date) => string;
  doctorOptions: string[];
}

export function AppointmentsPage({
  appointments,
  appointmentsLoading,
  appointmentsError,
  onRetryAppointments,
  currentWeekStart,
  setCurrentWeekStart,
  apptViewMode,
  setApptViewMode,
  apptSearchQuery,
  setApptSearchQuery,
  apptDoctorFilter,
  setApptDoctorFilter,
  apptStatusFilter,
  setApptStatusFilter,
  apptSortOrder,
  setApptSortOrder,
  apptCurrentPage,
  setApptCurrentPage,
  onSelectAppointment,
  onOpenNewAppointment,
  getWeekDays,
  formatDateString,
  formatRangeLabel,
  doctorOptions,
}: AppointmentsPageProps) {
  // Desktop/tablet card-vs-table preference for List View (Part 4). Mobile
  // always shows cards regardless — see the md:hidden / hidden md:block split.
  const [listViewMode, setListViewMode] = useState<'table' | 'card'>('table');
  // Mobile filter panel collapse (List View).
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  // Mobile Calendar View shows one day at a time instead of the 7-day grid —
  // a real behavior difference from desktop, not just a CSS breakpoint change.
  const [mobileDayIndex, setMobileDayIndex] = useState(0);

  // 1. Calculations & Week days
  const weekDays = getWeekDays(currentWeekStart);
  const startStr = formatDateString(weekDays[0]);
  const endStr = formatDateString(weekDays[6]);

  // Current week appointments count
  const weekAppts = appointments.filter(a => a.date >= startStr && a.date <= endStr && (a.status?.toLowerCase() ?? '') !== 'cancelled');
  const todayStr = "2026-06-23"; // Today's date in mock clinic OS
  const todayAppts = appointments.filter(a => a.date === todayStr && (a.status?.toLowerCase() ?? '') !== 'cancelled');

  // 2. Filter logic (especially for List view)
  const filteredAppts = appointments.filter(a => {
    const query = apptSearchQuery.toLowerCase().trim();
    const matchesSearch = (a.patientName ?? '').toLowerCase().includes(query) || (a.patientPhone ?? '').includes(query);
    const matchesDoctor = apptDoctorFilter === 'all' || a.doctor === apptDoctorFilter;
    const matchesStatus = apptStatusFilter === 'all' || a.status?.toLowerCase() === apptStatusFilter.toLowerCase();
    return matchesSearch && matchesDoctor && matchesStatus;
  });

  // Sort by Date/Time
  const sortedAppts = [...filteredAppts]
    .filter(appt => appt && appt.date)
    .sort((a, b) => {
    const getMinutes = (t: string) => {
      const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!m) return 0;
      let h = parseInt(m[1], 10);
      if (m[3].toUpperCase() === "PM" && h < 12) h += 12;
      if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
      return h * 60 + parseInt(m[2], 10);
    };
    const diff = a.date !== b.date
      ? a.date.localeCompare(b.date)
      : getMinutes(a.time) - getMinutes(b.time);
    return apptSortOrder === 'asc' ? diff : -diff;
  });

  // Pagination for list view
  const itemsPerPage = 8;
  const totalPages = Math.ceil(sortedAppts.length / itemsPerPage);
  const startIndex = (apptCurrentPage - 1) * itemsPerPage;
  const paginatedAppts = sortedAppts.slice(startIndex, startIndex + itemsPerPage);

  // Time Slots
  const timeSlots = [
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
  ];

  // Handle clicking empty calendar slot
  const handleEmptySlotClick = (dateStr: string, timeSlot: string) => {
    onOpenNewAppointment({ date: dateStr, time: timeSlot });
  };

  // Mobile Calendar View day navigation — crosses week boundaries when
  // stepping past the first/last day of the currently loaded week.
  const goToAdjacentDay = (direction: -1 | 1) => {
    const next = mobileDayIndex + direction;
    if (next < 0) {
      const prevWeek = new Date(currentWeekStart);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentWeekStart(prevWeek);
      setMobileDayIndex(6);
    } else if (next > 6) {
      const nextWeek = new Date(currentWeekStart);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentWeekStart(nextWeek);
      setMobileDayIndex(0);
    } else {
      setMobileDayIndex(next);
    }
  };

  const statusBadgeClasses = (status?: string) =>
    status?.toLowerCase() === 'confirmed'
      ? 'bg-status-successBg text-status-success border border-status-success/15'
      : status?.toLowerCase() === 'pending'
      ? 'bg-status-warningBg text-status-warning border border-status-warning/15'
      : status?.toLowerCase() === 'completed'
      ? 'bg-brand-50 text-brand-500 border border-brand-100'
      : 'bg-status-dangerBg text-status-danger border border-status-danger/15';

  // One appointment card — used for the always-cards mobile List View, the
  // desktop/tablet "card" view mode (Part 4), and the mobile single-day
  // Calendar View, so there's one card design across all three contexts.
  const renderAppointmentCard = (appt: Appointment) => {
    const isZero = appt.bookedVia === 'zero';
    return (
      <div
        key={appt.id}
        onClick={() => onSelectAppointment(appt.id)}
        className="p-4 flex flex-col gap-3 border border-surface-border rounded-2xl bg-surface-base shadow-card hover:shadow-elevated hover:-translate-y-0.5 active:bg-surface-muted/50 transition-all duration-150 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 font-bold text-[11px] flex items-center justify-center ring-1 ring-brand-200/60 flex-shrink-0">
              {appt.patientName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'PT'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-text-primary block truncate">{appt.patientName ?? ''}</span>
              <span className="text-[10px] text-text-secondary mt-0.5 block truncate">{appt.patientPhone ?? ''}</span>
            </div>
          </div>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${statusBadgeClasses(appt.status)}`}>
            {appointmentStatusLabels[appt.status?.toLowerCase() as AppointmentStatus] || appt.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
          <div>
            <span className="text-text-muted">Date & Time</span>
            <div className="text-text-secondary font-medium flex items-center gap-1">
              <Clock size={10} className="flex-shrink-0" />
              {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {appt.time}
            </div>
          </div>
          <div>
            <span className="text-text-muted">Doctor</span>
            <div className="text-text-secondary font-medium truncate">{appt.doctor}</div>
          </div>
          <div className="col-span-2">
            <span className="text-text-muted">Department / Type</span>
            <div className="text-text-secondary font-medium truncate">{appt.visitType ?? '—'}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
          {isZero ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-ai-50 text-ai-600 border border-ai-100/50">via Zero</span>
          ) : (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-surface-subtle text-text-secondary border border-surface-border">Manual</span>
          )}
          <button
            type="button"
            onClick={() => onSelectAppointment(appt.id)}
            className="px-3 py-1.5 border border-surface-border hover:border-brand-300 hover:bg-brand-50/50 text-text-secondary hover:text-brand-600 font-semibold rounded-lg text-[11px] transition duration-150"
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-bold text-text-primary leading-tight tracking-tighter2 flex items-center gap-2">
            <span>Appointments</span>
            {appointmentsLoading && (
              <span className="text-xs font-normal text-text-muted animate-pulse">(Updating...)</span>
            )}
          </h2>
          <p className="text-[14px] text-text-secondary mt-1">
            {weekAppts.length} active appointments this week · {todayAppts.length} today
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="bg-surface-base border border-surface-border/50 p-1 rounded-xl flex items-center shadow-soft">
            <button
              type="button"
              onClick={() => setApptViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-150 flex items-center gap-1.5 ${
                apptViewMode === 'calendar'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Calendar size={14} />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setApptViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-150 flex items-center gap-1.5 ${
                apptViewMode === 'list'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Activity size={14} />
              <span>List View</span>
            </button>
          </div>

          {/* Card/Table view toggle — List View only, desktop/tablet only */}
          {apptViewMode === 'list' && (
            <div className="hidden md:flex bg-surface-base border border-surface-border/50 p-1 rounded-xl items-center shadow-soft">
              <button
                type="button"
                onClick={() => setListViewMode('table')}
                aria-label="Table view"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition duration-150 flex items-center gap-1.5 ${
                  listViewMode === 'table' ? 'bg-brand-500 text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Table2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setListViewMode('card')}
                aria-label="Card view"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition duration-150 flex items-center gap-1.5 ${
                  listViewMode === 'card' ? 'bg-brand-500 text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          )}

          {/* New Appointment Button */}
          <button
            type="button"
            onClick={() => onOpenNewAppointment({ date: "2026-06-23", time: "09:00 AM" })}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-[13px] transition duration-200 shadow-brand-glow hover:shadow-elevated"
          >
            <Plus size={16} />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* DATE NAVIGATION & CONTROLS ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-base p-4 rounded-2xl border border-surface-border shadow-card">
        {/* Week nav — the primary control on desktop/tablet always; on mobile
            it's replaced by the single-day nav below when in Calendar View
            (List View isn't week-scoped, so it keeps this nav on mobile too). */}
        <div className={`items-center gap-3 ${apptViewMode === 'calendar' ? 'hidden md:flex' : 'flex'}`}>
          <button
            type="button"
            onClick={() => {
              const prev = new Date(currentWeekStart);
              prev.setDate(prev.getDate() - 7);
              setCurrentWeekStart(prev);
              setMobileDayIndex(0);
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition duration-150"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentWeekStart(new Date('2026-06-22')); // Jump back to current week
              setMobileDayIndex(0);
            }}
            className="px-3 py-1.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-semibold rounded-xl text-xs transition duration-150"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => {
              const next = new Date(currentWeekStart);
              next.setDate(next.getDate() + 7);
              setCurrentWeekStart(next);
              setMobileDayIndex(0);
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition duration-150"
          >
            <ChevronRight size={16} />
          </button>

          <span className="text-sm font-bold text-text-primary pl-2">
            {formatRangeLabel(currentWeekStart)}
          </span>
        </div>

        {/* Mobile single-day nav — Calendar View only. Real behavior change
            from desktop: one day at a time instead of the 7-day grid. */}
        {apptViewMode === 'calendar' && (
          <div className="md:hidden flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToAdjacentDay(-1)}
                aria-label="Previous day"
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-surface-border hover:bg-surface-subtle text-text-secondary transition duration-150"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-bold text-text-primary">
                {weekDays[mobileDayIndex].toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={() => goToAdjacentDay(1)}
                aria-label="Next day"
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-surface-border hover:bg-surface-subtle text-text-secondary transition duration-150"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {weekDays.map((day, idx) => {
                const dateStr = formatDateString(day);
                const isTodayStr = dateStr === "2026-06-23";
                const isSelected = idx === mobileDayIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMobileDayIndex(idx)}
                    className={`flex-shrink-0 w-12 h-14 rounded-xl flex flex-col items-center justify-center border transition duration-150 ${
                      isSelected
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : isTodayStr
                        ? 'border-brand-300 text-brand-600'
                        : 'border-surface-border text-text-secondary'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-bold opacity-80">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-sm font-extrabold">{day.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Stats or Sub-filters */}
        {apptViewMode === 'list' && (
          <div className="w-full md:w-auto">
            {/* Mobile filter panel toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(v => !v)}
              className="md:hidden w-full flex items-center justify-between px-3 py-2 border border-surface-border rounded-xl text-xs font-semibold text-text-secondary"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={14} />
                Filters
              </span>
              <ChevronDown size={14} className={`transition-transform duration-150 ${showMobileFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className={`${showMobileFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-3 w-full md:w-auto mt-3 md:mt-0`}>
              {/* Search */}
              <div className="relative flex-1 md:w-60">
                <Search size={14} className="absolute left-3 top-3 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={apptSearchQuery}
                  onChange={(e) => {
                    setApptSearchQuery(e.target.value);
                    setApptCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-surface-subtle border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                />
              </div>

              {/* Doctor filter */}
              <select
                value={apptDoctorFilter}
                onChange={(e) => {
                  setApptDoctorFilter(e.target.value);
                  setApptCurrentPage(1);
                }}
                className="w-full md:w-auto px-3 py-1.5 text-xs bg-surface-subtle border border-surface-border rounded-xl text-text-primary font-medium focus:outline-none"
              >
                <option value="all">All Doctors</option>
                {doctorOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              {/* Status filter */}
              <select
                value={apptStatusFilter}
                onChange={(e) => {
                  setApptStatusFilter(e.target.value);
                  setApptCurrentPage(1);
                }}
                className="w-full md:w-auto px-3 py-1.5 text-xs bg-surface-subtle border border-surface-border rounded-xl text-text-primary font-medium focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Sort order toggle button */}
              <button
                type="button"
                onClick={() => {
                  setApptSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  setApptCurrentPage(1);
                }}
                className="w-full md:w-auto px-3 py-1.5 text-xs bg-surface-subtle border border-surface-border rounded-xl text-text-primary font-medium hover:bg-surface-border/30 transition duration-150 focus:outline-none"
              >
                Sort: {apptSortOrder === 'asc' ? 'Soonest first' : 'Latest first'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MAIN VIEWS */}
      {appointmentsError && appointments.length === 0 ? (
        <div className="bg-surface-base rounded-2xl border border-surface-border shadow-card">
          <ErrorState message={appointmentsError} onRetry={onRetryAppointments} />
        </div>
      ) : apptViewMode === 'calendar' ? (
        <>
          {/* Mobile: single-day vertical list — the 7-day grid genuinely
              doesn't fit a phone screen, so this is a real layout swap, not
              a shrunk version of the desktop grid. */}
          <div className="md:hidden bg-surface-base rounded-2xl border border-surface-border shadow-card divide-y divide-surface-border/30">
            {timeSlots.map((slot) => {
              const dateStr = formatDateString(weekDays[mobileDayIndex]);
              const slotAppts = appointments.filter(a => a.date === dateStr && a.time === slot);
              return (
                <div key={slot} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={11} className="text-text-muted" />
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{slot}</span>
                  </div>
                  {slotAppts.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => handleEmptySlotClick(dateStr, slot)}
                      className="w-full py-3 rounded-xl border border-dashed border-surface-border text-text-muted text-xs font-medium hover:bg-brand-50/10 hover:border-brand-200 transition duration-150 flex items-center justify-center gap-1.5"
                    >
                      <Plus size={12} />
                      Add appointment
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {slotAppts.map((appt) => renderAppointmentCard(appt))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop/tablet: full 7-day grid */}
          <div className="hidden md:block bg-surface-base rounded-2xl border border-surface-border shadow-card overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Calendar Grid Header */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-surface-border/50">
              {/* Time Label Header */}
              <div className="p-3 bg-surface-subtle/50 flex items-center justify-center border-r border-surface-border/35">
                <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Time</span>
              </div>
              {/* Days Headers */}
              {weekDays.map((day, idx) => {
                const dateStr = formatDateString(day);
                const isTodayStr = dateStr === "2026-06-23";
                return (
                  <div
                    key={idx}
                    className={`p-3 text-center border-r border-surface-border/35 last:border-r-0 flex flex-col items-center justify-center ${
                      isTodayStr ? 'bg-brand-50/50' : 'bg-surface-subtle/20'
                    }`}
                  >
                    <span className={`text-[11px] font-bold ${isTodayStr ? 'text-brand-600' : 'text-text-secondary'}`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className={`text-base font-extrabold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center ${
                      isTodayStr ? 'bg-brand-500 text-white shadow-sm' : 'text-text-primary'
                    }`}>
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Grid Body */}
            <div className="divide-y divide-surface-border/35">
              {timeSlots.map((slot, sIdx) => (
                <div key={sIdx} className="grid grid-cols-[80px_repeat(7,1fr)]">
                  {/* Time Indicator Cell */}
                  <div className="p-3 bg-surface-subtle/20 border-r border-surface-border/35 flex items-start justify-end pr-4 pt-4">
                    <span className="text-[11px] font-bold text-text-muted whitespace-nowrap">{slot}</span>
                  </div>

                  {/* 7 Days Cells */}
                  {weekDays.map((day, dIdx) => {
                    const dateStr = formatDateString(day);
                    const slotAppts = appointments.filter(a => a.date === dateStr && a.time === slot);
                    return (
                      <div
                        key={dIdx}
                        onClick={() => slotAppts.length === 0 && handleEmptySlotClick(dateStr, slot)}
                        className={`p-2 border-r border-surface-border/35 last:border-r-0 min-h-[90px] relative group transition-colors ${
                          slotAppts.length === 0 ? 'hover:bg-brand-50/10 cursor-pointer' : ''
                        }`}
                      >
                        {slotAppts.length === 0 ? (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="w-7 h-7 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center border border-brand-100 shadow-sm">
                              <Plus size={14} />
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5 h-full justify-start">
                            {slotAppts.map((appt) => {
                              const isZero = appt.bookedVia === 'zero';
                              let statusClasses = 'bg-brand-50/50 border-brand-200/50 text-brand-700';
                              const apptStatus = appt.status?.toLowerCase();
                              if (apptStatus === 'pending') statusClasses = 'bg-status-warningBg border-status-warning/20 text-status-warning';
                              else if (apptStatus === 'completed') statusClasses = 'bg-status-successBg border-status-success/20 text-status-success';
                              else if (apptStatus === 'cancelled') statusClasses = 'bg-status-dangerBg/30 border-status-danger/10 text-text-muted line-through opacity-70';

                              return (
                                <div
                                  key={appt.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectAppointment(appt.id);
                                  }}
                                  className={`p-2.5 rounded-xl border ${statusClasses} text-[11px] leading-tight font-semibold shadow-soft cursor-pointer hover:shadow-soft-md hover:scale-[1.01] transition-all flex flex-col justify-between h-full select-none`}
                                >
                                  <div className="flex items-start justify-between gap-1.5">
                                    <span className="truncate block font-bold text-text-primary">{appt.patientName ?? ''}</span>
                                    {isZero && (
                                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-ai-500 inline-block" title="Booked via Zero AI"></span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between mt-2.5 text-[10px] text-text-secondary font-medium font-semibold">
                                    <span>{(appt.doctor ?? '').split(' ')[1] || ''}</span>
                                    <span className="opacity-80 text-[9px] px-1.5 py-0.5 rounded-md bg-white/60 border border-surface-border/5">{appt.visitType ?? ''}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          </div>
        </>
      ) : (
        <div className="bg-surface-base rounded-2xl border border-surface-border shadow-card overflow-hidden">
          {paginatedAppts.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments"
              message="Nothing matches your current filters. Book one manually, or Zero will add appointments here as patients schedule on WhatsApp."
              action={{ label: 'New Appointment', onClick: () => onOpenNewAppointment({ date: '2026-06-23', time: '09:00 AM' }) }}
            />
          ) : (
            <>
              {/* Mobile/tablet: always cards, regardless of the desktop toggle */}
              <div className="md:hidden divide-y divide-surface-border/20">
                {paginatedAppts.map((appt) => (
                  <div key={appt.id} className="p-2">{renderAppointmentCard(appt)}</div>
                ))}
              </div>

              {/* Desktop/tablet: table or card grid, per the view toggle */}
              <div className="hidden md:block">
                {listViewMode === 'card' ? (
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 p-4">
                    {paginatedAppts.map((appt) => renderAppointmentCard(appt))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] bg-surface-subtle">
                  <th className="p-4 pl-6">Patient</th>
                  <th className="p-4">Date &amp; Time</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Department / Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Booking Source</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/70 text-xs">
                {paginatedAppts.map((appt) => {
                    const isZero = appt.bookedVia === 'zero';
                    return (
                      <tr key={appt.id} className="hover:bg-surface-muted/60 transition duration-150 font-medium">
                        {/* Patient info */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 font-bold text-[11px] flex items-center justify-center ring-1 ring-brand-200/60 flex-shrink-0">
                              {appt.patientName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'PT'}
                            </div>
                            <div>
                              <span className="font-bold text-text-primary block">{appt.patientName ?? ''}</span>
                              <span className="text-[10px] text-text-secondary font-medium">{appt.patientPhone ?? ''}</span>
                            </div>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-text-primary block">
                              {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-text-secondary font-medium flex items-center gap-1">
                              <Clock size={10} />
                              {appt.time}
                            </span>
                          </div>
                        </td>

                        {/* Doctor */}
                        <td className="p-4 text-text-primary font-semibold">{appt.doctor}</td>

                        {/* Department */}
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-lg bg-surface-subtle border border-surface-border/40 text-[10px] text-text-secondary">
                            {appt.visitType ?? ''}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusBadgeClasses(appt.status)}`}>
                            {appointmentStatusLabels[appt.status?.toLowerCase() as AppointmentStatus] || appt.status}
                          </span>
                        </td>

                        {/* Booking Source */}
                        <td className="p-4">
                          {isZero ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-ai-50 text-ai-600 border border-ai-100/50 font-semibold">
                              <span>via Zero</span>
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-surface-subtle text-text-secondary border border-surface-border">
                              Manual
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="p-4 text-right pr-6">
                          <button
                            type="button"
                            onClick={() => onSelectAppointment(appt.id)}
                            className="px-3 py-1.5 border border-surface-border hover:border-brand-300 hover:bg-brand-50/50 text-text-secondary hover:text-brand-600 font-semibold rounded-lg text-[11px] transition duration-150"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-surface-border/30 bg-surface-subtle/10 flex items-center justify-between text-xs">
              <span className="text-text-secondary font-medium">
                Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, sortedAppts.length)} of {sortedAppts.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={apptCurrentPage === 1}
                  onClick={() => setApptCurrentPage(prev => prev - 1)}
                  className="px-3 py-1.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary rounded-xl font-bold transition duration-150 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <span className="text-text-primary font-semibold">
                  {apptCurrentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={apptCurrentPage === totalPages}
                  onClick={() => setApptCurrentPage(prev => prev + 1)}
                  className="px-3 py-1.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary rounded-xl font-bold transition duration-150 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
