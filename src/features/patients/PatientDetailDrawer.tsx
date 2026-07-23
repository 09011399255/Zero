import { MessageSquare, RefreshCw, X } from 'lucide-react';
import { Conversation, Patient } from '../../api';
import { useToast } from '../../components/shared/Toast';
import { useModalA11y } from '../../hooks/useModalA11y';
import { EmptyState } from '../../components/shared/EmptyState';

const recallStatusLabels: Record<string, string> = {
  UP_TO_DATE: 'Up to date',
  DUE_SOON: 'Due Soon',
  OVERDUE: 'Overdue',
};

interface PatientDetailDrawerProps {
  selectedPatientId: string | null;
  selectedPatient: Patient | null;
  patientDetailLoading: boolean;
  drawerTab: 'history' | 'intake' | 'conversations';
  setDrawerTab: (tab: 'history' | 'intake' | 'conversations') => void;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  threadLoading: boolean;
  onClose: () => void;
  onSendMessage: (patient: Patient) => void;
}

export function PatientDetailDrawer({
  selectedPatientId,
  selectedPatient,
  patientDetailLoading,
  drawerTab,
  setDrawerTab,
  conversations,
  activeConversation,
  threadLoading,
  onClose,
  onSendMessage,
}: PatientDetailDrawerProps) {
  const toast = useToast();
  const panelRef = useModalA11y<HTMLDivElement>(!!selectedPatientId, onClose);
  if (!selectedPatientId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      ></div>

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Patient details"
        className="relative w-full sm:max-w-md bg-surface-base h-full shadow-elevated border-l border-surface-border flex flex-col z-10 animate-slide-in overflow-hidden"
      >
        <div className="p-6 border-b border-surface-border/20 flex-shrink-0">
          {/* Close Button Row */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150 border border-surface-border"
            >
              <X size={16} />
            </button>
          </div>

          {(!selectedPatient || patientDetailLoading) ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="animate-spin text-brand-500 mb-4" size={24} />
              <p className="text-xs text-text-secondary">Loading details...</p>
            </div>
          ) : (
            <>
              {/* Patient Information Row */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 font-bold text-base flex items-center justify-center ring-1 ring-brand-200/60 flex-shrink-0">
                  {selectedPatient.initials || selectedPatient.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'PT'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary leading-snug">{selectedPatient.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">{selectedPatient.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-surface-border/10 text-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Last Visit</span>
                  <span className="text-xs font-bold text-text-primary mt-1">{selectedPatient.lastVisit || '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Next Appt</span>
                  <span className="text-xs font-bold text-text-primary mt-1">{selectedPatient.nextAppointment || '—'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Recall</span>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    (selectedPatient.recallStatus || '').toUpperCase() === 'UP_TO_DATE'
                      ? 'bg-status-successBg text-status-success'
                      : (selectedPatient.recallStatus || '').toUpperCase() === 'DUE_SOON'
                      ? 'bg-status-warningBg text-status-warning'
                      : (selectedPatient.recallStatus || '').toUpperCase() === 'OVERDUE'
                      ? 'bg-status-dangerBg text-status-danger'
                      : 'bg-surface-subtle text-text-muted'
                  }`}>
                    {recallStatusLabels[(selectedPatient.recallStatus || '').toUpperCase()] || selectedPatient.recallStatus || '—'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {selectedPatient && !patientDetailLoading && (
          <>
            <div className="flex border-b border-surface-border/10 px-6 gap-4 flex-shrink-0">
              <button
                onClick={() => setDrawerTab('history')}
                className={`pb-2 pt-1 text-xs font-bold relative transition duration-150 ${
                  drawerTab === 'history' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                History
                {drawerTab === 'history' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setDrawerTab('intake')}
                className={`pb-2 pt-1 text-xs font-bold relative transition duration-150 flex items-center gap-1 ${
                  drawerTab === 'intake' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Intake Notes
                {selectedPatient.intakeNotes && (
                  <span className="w-1.5 h-1.5 bg-ai-500 rounded-full"></span>
                )}
                {drawerTab === 'intake' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => setDrawerTab('conversations')}
                className={`pb-2 pt-1 text-xs font-bold relative transition duration-150 ${
                  drawerTab === 'conversations' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Conversations
                {drawerTab === 'conversations' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
                )}
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {drawerTab === 'history' && (
                <div className="space-y-4">
                  {!selectedPatient.history || selectedPatient.history.length === 0 ? (
                    <div className="text-center py-8 text-xs text-text-secondary">
                      No visit history yet
                    </div>
                  ) : (
                    selectedPatient.history.map((record, index) => (
                      <div key={index} className="bg-surface-subtle/50 rounded-xl p-4 border border-surface-border/10 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-text-primary">{record.date}</span>
                          <span className="text-text-secondary font-medium">{record.doctor}</span>
                        </div>
                        <div className="text-xs font-bold text-brand-600">
                          Reason: {record.reason}
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed bg-white/60 p-2.5 rounded-lg border border-surface-border/5">
                          {record.notes}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {drawerTab === 'intake' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">WhatsApp Pre-Intake</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-ai-50 text-ai-600 border border-ai-100">
                      <span>Captured by Zero</span>
                    </span>
                  </div>

                  {!selectedPatient.intakeNotes || !selectedPatient.intakeNotes.structuredAnswers || selectedPatient.intakeNotes.structuredAnswers.length === 0 ? (
                    <div className="text-center py-8 text-xs text-text-secondary">
                      No intake notes yet — these appear after Zero has collected patient information via WhatsApp.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedPatient.intakeNotes.symptoms && (
                        <div className="bg-ai-50/10 border-l-2 border-ai-400 p-3.5 rounded-r-xl space-y-1">
                          <span className="text-[10px] font-bold text-ai-600 uppercase tracking-wide">Reported Symptoms</span>
                          <p className="text-xs text-text-primary leading-relaxed">
                            "{selectedPatient.intakeNotes.symptoms}"
                          </p>
                        </div>
                      )}

                      <div className="space-y-2.5 pt-2">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Structured Answers</span>
                        {selectedPatient.intakeNotes.structuredAnswers.map((item, idx) => (
                          <div key={idx} className="bg-surface-subtle/50 rounded-xl p-3 border border-surface-border/10 text-xs">
                            <div className="font-semibold text-text-secondary">{item.question}</div>
                            <div className="font-bold text-text-primary mt-1">{item.answer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'conversations' && (() => {
                const patientConv = conversations.find(c => c.patientId === selectedPatient.id);
                if (!patientConv) {
                  return (
                    <EmptyState
                      icon={MessageSquare}
                      title="No message exchange log available"
                      message="This patient hasn't started a WhatsApp conversation yet."
                      tone="muted"
                    />
                  );
                }
                const messagesToShow = activeConversation && activeConversation.id === patientConv.id
                  ? activeConversation.messages
                  : patientConv.messages;

                if (!messagesToShow || messagesToShow.length === 0) {
                  return threadLoading ? (
                    <div className="text-center py-8 text-xs text-text-secondary font-sans font-medium">
                      Loading conversation...
                    </div>
                  ) : (
                    <EmptyState
                      icon={MessageSquare}
                      title="No messages in this conversation"
                      message="Messages exchanged with this patient will appear here."
                      tone="muted"
                    />
                  );
                }

                return (
                  <div className="space-y-3 flex flex-col">
                    {messagesToShow.map((msg, index) => {
                      const isSystem = msg.role === 'system';
                      if (isSystem) {
                        return (
                          <div key={index} className="flex items-center justify-center my-2">
                            <span className="text-[9px] font-bold text-text-muted bg-surface-subtle px-3 py-1 rounded-full border border-surface-border/50 uppercase tracking-wider font-sans">
                              {msg.text}
                            </span>
                          </div>
                        );
                      }

                      const isAI = msg.role === 'ai';
                      const isPatient = msg.role === 'patient';

                      return (
                        <div
                          key={index}
                          className={`flex flex-col max-w-[85%] ${isPatient ? 'self-end items-end' : 'self-start'}`}
                        >
                          <span className={`text-[9px] font-bold mb-1 px-1 font-sans ${
                            isAI ? 'text-ai-600 font-bold' : isPatient ? 'text-text-muted' : 'text-brand-600 font-bold'
                          }`}>
                            {isAI ? 'Zero AI' : isPatient ? patientConv.patientName : (msg.senderName || 'Staff')}
                          </span>

                          <div className={`p-3.5 text-xs leading-relaxed font-sans shadow-sm ${
                            isAI
                              ? 'bg-ai-100 border border-ai-200 text-ai-950 rounded-2xl rounded-tl-none border-l-4 border-l-ai-500'
                              : isPatient
                              ? 'bg-white border border-surface-border text-text-primary rounded-2xl rounded-tr-none'
                              : 'bg-brand-100 border border-brand-200 text-brand-950 rounded-2xl rounded-tl-none border-l-4 border-l-brand-500'
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-text-muted mt-1 px-1 font-sans">
                            {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="px-6 pt-6 pb-8 border-t border-surface-border/20 bg-surface-subtle/20 flex gap-3 flex-shrink-0">
              <button
                onClick={() => toast.info(`Booking flow triggered for ${selectedPatient.name}`)}
                className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-brand-glow transition duration-200 font-sans"
              >
                Book Appointment
              </button>
              <button
                onClick={() => onSendMessage(selectedPatient)}
                className="flex-1 py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150 font-sans"
              >
                Send Message
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
