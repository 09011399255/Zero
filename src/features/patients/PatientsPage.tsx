import { ChevronLeft, ChevronRight, Plus, RefreshCw, Search, X } from 'lucide-react';
import { Patient } from '../../api';

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
  onSelectPatient,
  onOpenAddPatientModal,
  onExpandOutreach,
}: PatientsPageProps) {
  const currentList = patientsTab === 'recall' ? recallPatients : patients;

  const filteredPatients = currentList.filter(patient => {
    const query = searchQuery.toLowerCase().trim();
    return patient.name.toLowerCase().includes(query) || patient.phone.includes(query);
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

  return (
    <div className="space-y-6 relative animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-text-primary leading-tight">Patients</h2>
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

          {/* Add Patient Button */}
          <button
            onClick={onOpenAddPatientModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-brand-500 text-brand-500 hover:bg-brand-50 font-semibold rounded-xl text-xs transition duration-200"
          >
            <Plus size={16} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* TAB SWITCHER */}
      <div className="flex border-b border-surface-border/30 gap-6">
        <button
          onClick={() => {
            setPatientsTab('all');
            setCurrentPage(1);
          }}
          className={`pb-3 text-sm font-semibold relative transition duration-150 ${
            patientsTab === 'all' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          All Patients
          {patientsTab === 'all' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => {
            setPatientsTab('recall');
            setCurrentPage(1);
          }}
          className={`pb-3 text-sm font-semibold relative flex items-center gap-2 transition duration-150 ${
            patientsTab === 'recall' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Recall Due
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            totalRecallCount > 0 ? 'bg-status-warningBg text-status-warning' : 'bg-surface-subtle text-text-muted'
          }`}>
            {totalRecallCount}
          </span>
          {patientsTab === 'recall' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 overflow-hidden flex flex-col justify-between min-h-[500px]">
        <div className="overflow-x-auto">
          {patientsLoading || recallLoading ? (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <RefreshCw className="animate-spin text-brand-500 mb-4" size={32} />
              <p className="text-sm font-semibold text-text-primary">Loading patients...</p>
            </div>
          ) : paginatedPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 bg-surface-subtle text-text-secondary rounded-full flex items-center justify-center mb-4">
                <Search size={22} />
              </div>
              <p className="text-sm font-semibold text-text-primary">No patients found</p>
              <p className="text-xs text-text-secondary mt-1 max-w-xs">
                We couldn't find any results matching "{searchQuery}". Check the spelling or try a different term.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border/30 text-left bg-surface-subtle/35">
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Patient</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Phone</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Last Visit</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Next Appointment</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Recall Status</th>

                  {patientsTab === 'recall' && (
                    <>
                      <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Recall Reason</th>
                      <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">AI Outreach</th>
                    </>
                  )}

                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans text-right">Conversations</th>
                  <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider text-right font-sans">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/20">
                {paginatedPatients.map((patient) => {
                  return (
                    <tr
                      key={patient.id}
                      onClick={() => onSelectPatient(patient.id)}
                      className="hover:bg-surface-subtle/50 transition duration-150 cursor-pointer"
                    >
                      <td className="py-3.5 px-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-semibold text-xs flex items-center justify-center border border-brand-100 flex-shrink-0">
                          {patient.initials}
                        </div>
                        <span className="text-xs font-semibold text-text-primary">{patient.name}</span>
                      </td>
                      <td className="py-3.5 px-6 text-xs font-medium text-text-primary">{patient.phone}</td>
                      <td className="py-3.5 px-6 text-xs text-text-secondary font-medium">{patient.lastVisit}</td>
                      <td className="py-3.5 px-6 text-xs text-text-secondary font-medium">{patient.nextAppointment}</td>
                       <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          (patient.recallStatus || '').toUpperCase() === 'UP_TO_DATE'
                            ? 'bg-status-successBg text-status-success'
                            : (patient.recallStatus || '').toUpperCase() === 'DUE_SOON'
                            ? 'bg-status-warningBg text-status-warning'
                            : (patient.recallStatus || '').toUpperCase() === 'OVERDUE'
                            ? 'bg-status-dangerBg text-status-danger'
                            : 'bg-surface-subtle text-text-muted'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (patient.recallStatus || '').toUpperCase() === 'UP_TO_DATE'
                              ? 'bg-status-success'
                              : (patient.recallStatus || '').toUpperCase() === 'DUE_SOON'
                              ? 'bg-status-warning'
                              : (patient.recallStatus || '').toUpperCase() === 'OVERDUE'
                              ? 'bg-status-danger'
                              : 'bg-text-muted'
                          }`}></span>
                          {recallStatusLabels[(patient.recallStatus || '').toUpperCase()] || patient.recallStatus || '—'}
                        </span>
                      </td>

                      {patientsTab === 'recall' && (
                        <>
                          <td className="py-3.5 px-6 text-xs text-text-primary font-medium">{patient.recallReason || '—'}</td>
                          <td className="py-3.5 px-6" onClick={(e) => e.stopPropagation()}>
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

                      <td className="py-3.5 px-6 text-xs text-text-secondary font-semibold text-right font-sans">
                        {patient.conversationsCount}
                      </td>
                      <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectPatient(patient.id)}
                          className="px-3 py-1.5 border border-surface-border text-text-secondary hover:text-text-primary bg-surface-base hover:bg-surface-subtle font-medium rounded-xl text-xs transition duration-150 shadow-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

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
