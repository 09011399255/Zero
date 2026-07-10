import { Activity, Calendar, ChevronLeft, ChevronRight, Clock, Plus, Search } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../api';

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
}

export function AppointmentsPage({
  appointments,
  appointmentsLoading,
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
}: AppointmentsPageProps) {
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-text-primary leading-tight flex items-center gap-2">
            <span>Appointments</span>
            {appointmentsLoading && (
              <span className="text-xs font-normal text-text-muted animate-pulse">(Updating...)</span>
            )}
          </h2>
          <p className="text-[14px] text-text-secondary mt-1">
            {weekAppts.length} active appointments this week · {todayAppts.length} today
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          {/* New Appointment Button */}
          <button
            type="button"
            onClick={() => onOpenNewAppointment({ date: "2026-06-23", time: "09:00 AM" })}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl text-sm transition duration-200 shadow-sm"
          >
            <Plus size={16} />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* DATE NAVIGATION & CONTROLS ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-base p-4 rounded-2xl border border-surface-border/50 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const prev = new Date(currentWeekStart);
              prev.setDate(prev.getDate() - 7);
              setCurrentWeekStart(prev);
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition duration-150"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentWeekStart(new Date('2026-06-22')); // Jump back to current week
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
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition duration-150"
          >
            <ChevronRight size={16} />
          </button>

          <span className="text-sm font-bold text-text-primary pl-2">
            {formatRangeLabel(currentWeekStart)}
          </span>
        </div>

        {/* Quick Stats or Sub-filters */}
        {apptViewMode === 'list' && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
              className="px-3 py-1.5 text-xs bg-surface-subtle border border-surface-border rounded-xl text-text-primary font-medium focus:outline-none"
            >
              <option value="all">All Doctors</option>
              <option value="Dr. Lan Mandragoran">Dr. Lan Mandragoran</option>
              <option value="Dr. Moiraine Damodred">Dr. Moiraine Damodred</option>
            </select>

            {/* Status filter */}
            <select
              value={apptStatusFilter}
              onChange={(e) => {
                setApptStatusFilter(e.target.value);
                setApptCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-surface-subtle border border-surface-border rounded-xl text-text-primary font-medium focus:outline-none"
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
              className="px-3 py-1.5 text-xs bg-surface-subtle border border-surface-border rounded-xl text-text-primary font-medium hover:bg-surface-border/30 transition duration-150 focus:outline-none"
            >
              Sort: {apptSortOrder === 'asc' ? 'Soonest first' : 'Latest first'}
            </button>
          </div>
        )}
      </div>

      {/* MAIN VIEWS */}
      {apptViewMode === 'calendar' ? (
        <div className="bg-surface-base rounded-2xl border border-surface-border/50 shadow-soft overflow-x-auto">
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
      ) : (
        <div className="bg-surface-base rounded-2xl border border-surface-border/50 shadow-soft overflow-hidden">
          {/* Table layout */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border/50 text-[11px] font-bold text-text-muted uppercase tracking-wider bg-surface-subtle/30">
                  <th className="p-4 pl-6">Patient</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Department / Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Booking Source</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/30 text-xs">
                {paginatedAppts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-secondary">
                      No appointments found matching current filters.
                    </td>
                  </tr>
                ) : (
                  paginatedAppts.map((appt) => {
                    const isZero = appt.bookedVia === 'zero';
                    return (
                      <tr key={appt.id} className="hover:bg-surface-subtle/30 transition duration-150 font-medium">
                        {/* Patient info */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-bold text-[11px] flex items-center justify-center border border-brand-100 flex-shrink-0">
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
                            className="px-3 py-1.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-[10px] transition duration-150"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

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
