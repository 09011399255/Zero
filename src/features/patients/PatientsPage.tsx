import { ChevronLeft, ChevronRight, LayoutGrid, Plus, RefreshCw, Search, Table2, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Patient } from '../../api';
import { ErrorState } from '../../components/shared/ErrorState';
import { EmptyState } from '../../components/shared/EmptyState';

const recallStatusLabels: Record<string, string> = {
  UP_TO_DATE: 'Up to date',
  DUE_SOON: 'Due Soon',
  OVERDUE: 'Overdue',
};

interface PatientsPageProps {
  patients: Patient[];
  recallPatients: Patient[];
  patientsTab: 'all' | 'recall';
  setPatientsTab: (tab: 'all' | 'recall') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  patientsLoading: boolean;
  recallLoading: boolean;
  patientsError: string | null;
  recallError: string | null;
  onRetryPatients: () => void;
  onRetryRecall: () => void;
  onSelectPatient: (patientId: string) => void;
  onOpenAddPatientModal: () => void;
  onExpandOutreach: (patientId: string, draft: string) => void;
}

export function PatientsPage({
  patients,
  recallPatients,
  patientsTab,
  setPatientsTab,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  patientsLoading,
  recallLoading,
  patientsError,
  recallError,
  onRetryPatients,
  onRetryRecall,
  onSelectPatient,
  onOpenAddPatientModal,
  onExpandOutreach,
}: PatientsPageProps) {
  // Desktop/tablet card-vs-table preference (Part 4). Mobile always shows
  // cards regardless of this — see the md:hidden / hidden md:block split below.
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const currentList = patientsTab === 'recall' ? recallPatients : patients;
  const activeError = patientsTab === 'recall' ? recallError : patientsError;
  const activeLoading = patientsTab === 'recall' ? recallLoading : patientsLoading;

  const filteredPatients = currentList.filter(patient => {
    const query = searchQuery.toLowerCase().trim();
    // name/phone are guarded — a WhatsApp walk-in can exist before intake
    // captured a name, and one null here used to crash the whole page.
    return (patient.name || '').toLowerCase().includes(query) || (patient.phone || '').includes(query);
  });

  if (patientsTab === 'recall') {
    filteredPatients.sort((a, b) => {
      const statusA = (a.recallStatus || '').toUpperCase();
      const statusB = (b.recallStatus || '').toUpperCase();
      if (statusA === 'OVERDUE' && statusB === 'DUE_SOON') return -1;
      if (statusA === 'DUE_SOON' && statusB === 'OVERDUE') return 1;
      return 0;
    });
  }

  const totalPatientsCount = patients.length;
  const totalRecallCount = recallPatients.length > 0 ? recallPatients.length : patients.filter(p => {
    const s = (p.recallStatus || '').toUpperCase();
    return s === 'OVERDUE' || s === 'DUE_SOON';
  }).length;

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  // Recall status pill — shared by the table and the card view.
  const recallBadge = (patient: Patient) => {
    const status = (patient.recallStatus || '').toUpperCase();
    const color =
      status === 'UP_TO_DATE' ? 'success' : status === 'DUE_SOON' ? 'warning' : status === 'OVERDUE' ? 'danger' : 'muted';
    const classes: Record<string, string> = {
      success: 'bg-status-successBg text-status-success',
      warning: 'bg-status-warningBg text-status-warning',
      danger: 'bg-status-dangerBg text-status-danger',
      muted: 'bg-surface-subtle text-text-muted',
    };
    const dotClasses: Record<string, string> = {
      success: 'bg-status-success',
      warning: 'bg-status-warning',
      danger: 'bg-status-danger',
      muted: 'bg-text-muted',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${classes[color]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[color]}`}></span>
        {recallStatusLabels[status] || patient.recallStatus || '—'}
      </span>
    );
  };

  // One patient card — used both for the always-cards mobile view and the
  // desktop/tablet "card" view mode (Part 4: same card design in both places).
  const renderPatientCard = (patient: Patient) => (
    <div
      key={patient.id}
      onClick={() => onSelectPatient(patient.id)}
      className="p-4 flex flex-col gap-3 border border-surface-border rounded-2xl bg-surface-base shadow-card hover:shadow-elevated hover:-translate-y-0.5 active:bg-surface-muted/50 transition-all duration-150 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 font-bold text-[11px] flex items-center justify-center ring-1 ring-brand-200/60 flex-shrink-0">
            {patient.initials}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-text-primary block truncate">{patient.name}</span>
            <span className="text-[10px] text-text-secondary mt-0.5 block truncate">{patient.phone}</span>
          </div>
        </div>
        {recallBadge(patient)}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        <div>
          <span className="text-text-muted">Last Visit</span>
          <div className="text-text-secondary font-medium truncate">{patient.lastVisit || '—'}</div>
        </div>
        <div>
          <span className="text-text-muted">Next Appt.</span>
          <div className="text-text-secondary font-medium truncate">{patient.nextAppointment || '—'}</div>
        </div>
        {patientsTab === 'recall' && (
          <div className="col-span-2">
            <span className="text-text-muted">Recall Reason</span>
            <div className="text-text-secondary font-medium truncate">{patient.recallReason || '—'}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
        {patientsTab === 'recall' ? (
          patient.aiOutreachDraft ? (
            <button
              onClick={() => onExpandOutreach(patient.id, patient.aiOutreachDraft || '')}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border border-ai-100 bg-ai-50 text-ai-600 hover:bg-ai-100/50 transition duration-150 font-sans"
            >
              Draft Ready
            </button>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-status-successBg text-status-success border border-status-success/15 font-sans">
              Sent
            </span>
          )
        ) : (
          <span className="text-[11px] text-text-secondary font-medium">{patient.conversationsCount} conversations</span>
        )}
        <button
          onClick={() => onSelectPatient(patient.id)}
          className="px-3 py-1.5 border border-surface-border text-text-secondary hover:text-brand-600 hover:border-brand-300 bg-surface-base hover:bg-brand-50/50 font-semibold rounded-lg text-xs transition duration-150"
        >
          View
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-bold text-text-primary leading-tight tracking-tighter2">Patients</h2>
          <p className="text-[14px] text-text-secondary mt-1">
            {totalPatientsCount} patients · <span className="font-semibold text-status-warning">{totalRecallCount} overdue for recall</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-text-muted" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search patients by name or phone..."
              className="pl-10 pr-4 py-2 w-full sm:w-[280px] bg-surface-base border border-surface-border rounded-xl text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-500 transition duration-150"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Card/Table view toggle — desktop/tablet only; mobile always shows cards */}
          <div className="hidden md:flex bg-surface-base border border-surface-border p-1 rounded-xl items-center shadow-card flex-shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition duration-150 flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-brand-500 text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Table2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('card')}
              aria-label="Card view"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition duration-150 flex items-center gap-1.5 ${
                viewMode === 'card' ? 'bg-brand-500 text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {/* Add Patient Button */}
          <button
            onClick={onOpenAddPatientModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-[13px] shadow-brand-glow hover:shadow-elevated transition duration-200"
          >
            <Plus size={16} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* TAB SWITCHER — segmented control */}
      <div className="inline-flex items-center gap-1 p-1 bg-surface-muted rounded-xl border border-surface-border/70">
        <button
          onClick={() => {
            setPatientsTab('all');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition duration-150 ${
            patientsTab === 'all' ? 'bg-surface-base text-text-primary shadow-card' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          All Patients
        </button>

        <button
          onClick={() => {
            setPatientsTab('recall');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition duration-150 ${
            patientsTab === 'recall' ? 'bg-surface-base text-text-primary shadow-card' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Recall Due
          <span className={`min-w-[18px] px-1 rounded-md text-[10px] font-bold tabular-nums ${
            totalRecallCount > 0 ? 'bg-status-warningBg text-status-warning' : 'bg-surface-muted text-text-muted'
          }`}>
            {totalRecallCount}
          </span>
        </button>
      </div>

      {/* TABLE / CARD CONTAINER */}
      <div className="bg-surface-base rounded-2xl shadow-card border border-surface-border overflow-hidden flex flex-col justify-between min-h-[500px]">
        {activeLoading ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <RefreshCw className="animate-spin text-brand-500 mb-4" size={32} />
            <p className="text-sm font-semibold text-text-primary">Loading patients...</p>
          </div>
        ) : activeError ? (
          <ErrorState
            message={activeError}
            onRetry={patientsTab === 'recall' ? onRetryRecall : onRetryPatients}
          />
        ) : paginatedPatients.length === 0 ? (
          searchQuery.trim() ? (
            <EmptyState
              icon={Search}
              tone="muted"
              title="No matches"
              message={`Nothing matches "${searchQuery}". Check the spelling or try a different name or phone number.`}
            />
          ) : patientsTab === 'recall' ? (
            <EmptyState
              icon={Users}
              title="No recalls due"
              message="Patients due or overdue for a follow-up will show up here — Zero flags them automatically."
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No patients yet"
              message="Patients appear here automatically as they message your clinic on WhatsApp — or add one manually to get started."
              action={{ label: 'Add Patient', onClick: onOpenAddPatientModal }}
            />
          )
        ) : (
          <>
            {/* Mobile/tablet: always cards, regardless of the desktop toggle */}
            <div className="md:hidden divide-y divide-surface-border/20">
              {paginatedPatients.map((patient) => (
                <div key={patient.id} className="p-2">{renderPatientCard(patient)}</div>
              ))}
            </div>

            {/* Desktop/tablet: table or card grid, per the view toggle */}
            <div className="hidden md:block">
              {viewMode === 'card' ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 p-4">
                  {paginatedPatients.map((patient) => renderPatientCard(patient))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border/30 text-left bg-surface-subtle/35">
                  <th className="py-3 px-6 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] font-sans">Patient</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] font-sans">Phone</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] font-sans">Last Visit</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] font-sans">Next Appointment</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] font-sans">Recall Status</th>

                  {patientsTab === 'recall' && (
                    <>
                      <th className="py-3 px-6 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] font-sans">Recall Reason</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] font-sans">AI Outreach</th>
                    </>
                  )}

                  <th className="py-3 px-6 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] font-sans text-right">Conversations</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] text-right font-sans">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/20">
                {paginatedPatients.map((patient) => {
                  return (
                    <tr
                      key={patient.id}
                      onClick={() => onSelectPatient(patient.id)}
                      className="hover:bg-surface-muted/60 transition duration-150 cursor-pointer"
                    >
                      <td className="py-3 px-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 font-bold text-[11px] flex items-center justify-center ring-1 ring-brand-200/60 flex-shrink-0">
                          {patient.initials}
                        </div>
                        <span className="text-[13px] font-semibold text-text-primary">{patient.name}</span>
                      </td>
                      <td className="py-3 px-6 text-xs font-medium text-text-primary">{patient.phone}</td>
                      <td className="py-3 px-6 text-xs text-text-secondary font-medium">{patient.lastVisit}</td>
                      <td className="py-3 px-6 text-xs text-text-secondary font-medium">{patient.nextAppointment}</td>
                       <td className="py-3 px-6">
                        {recallBadge(patient)}
                      </td>

                      {patientsTab === 'recall' && (
                        <>
                          <td className="py-3 px-6 text-xs text-text-primary font-medium">{patient.recallReason || '—'}</td>
                          <td className="py-3 px-6" onClick={(e) => e.stopPropagation()}>
                            {patient.aiOutreachDraft ? (
                              <button
                                onClick={() => onExpandOutreach(patient.id, patient.aiOutreachDraft || '')}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border border-ai-100 bg-ai-50 text-ai-600 hover:bg-ai-100/50 transition duration-150 font-sans"
                              >
                                Draft Ready
                              </button>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-status-successBg text-status-success border border-status-success/15 font-sans">
                                Sent
                              </span>
                            )}
                          </td>
                        </>
                      )}

                      <td className="py-3 px-6 text-xs text-text-secondary font-semibold text-right font-sans">
                        {patient.conversationsCount}
                      </td>
                      <td className="py-3 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectPatient(patient.id)}
                          className="px-3 py-1.5 border border-surface-border text-text-secondary hover:text-brand-600 hover:border-brand-300 bg-surface-base hover:bg-brand-50/50 font-semibold rounded-lg text-xs transition duration-150"
                        >
                          View
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

        {/* PAGINATION PANEL */}
        {filteredPatients.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border/20 bg-surface-subtle/10 text-xs font-semibold text-text-secondary">
            <div>
              Showing <span className="text-text-primary">{startIndex + 1}</span>–
              <span className="text-text-primary">{Math.min(startIndex + itemsPerPage, filteredPatients.length)}</span> of{' '}
              <span className="text-text-primary">{filteredPatients.length}</span>
            </div>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-1.5 border border-surface-border rounded-xl bg-surface-base hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 shadow-sm flex items-center"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1.5 border border-surface-border rounded-xl bg-surface-base hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 shadow-sm flex items-center"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
