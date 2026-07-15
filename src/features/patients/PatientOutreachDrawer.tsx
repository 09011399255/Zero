import { X } from 'lucide-react';
import { Patient } from '../../api';
import { useModalA11y } from '../../hooks/useModalA11y';

interface PatientOutreachDrawerProps {
  patients: Patient[];
  expandedOutreachId: string | null;
  editOutreachId: string | null;
  draftMessageText: string;
  setDraftMessageText: (v: string) => void;
  onClose: () => void;
  onStartEdit: (patientId: string, draft: string) => void;
  onCancelEdit: () => void;
  onApprove: (patientId: string) => void;
  onSaveAndApprove: (patientId: string, draft: string) => void;
}

export function PatientOutreachDrawer({
  patients,
  expandedOutreachId,
  editOutreachId,
  draftMessageText,
  setDraftMessageText,
  onClose,
  onStartEdit,
  onCancelEdit,
  onApprove,
  onSaveAndApprove,
}: PatientOutreachDrawerProps) {
  const panelRef = useModalA11y<HTMLDivElement>(expandedOutreachId !== null, onClose);
  if (expandedOutreachId === null) return null;
  const p = patients.find(patient => patient.id === expandedOutreachId);
  if (!p || !p.aiOutreachDraft) return null;
  const isEditing = editOutreachId === p.id;

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
        aria-label="Recall outreach"
        className="relative w-full sm:max-w-md bg-surface-base h-full shadow-2xl border-l border-surface-border/20 flex flex-col justify-between z-10 animate-slide-in"
      >
        {/* HEADER */}
        <div className="p-6 border-b border-surface-border/20 flex items-center justify-between">
          <div className="overflow-hidden">
            <h3 className="text-base font-bold text-text-primary truncate">{p.name}</h3>
            <p className="text-xs text-text-secondary mt-0.5 truncate">Recall Reason: {p.recallReason || '—'}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150 border border-surface-border/30 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-ai-600 uppercase tracking-wider">Suggested by Zero</span>
            </div>

            {isEditing ? (
              <textarea
                value={draftMessageText}
                onChange={(e) => setDraftMessageText(e.target.value)}
                className="w-full min-h-[160px] p-3.5 text-xs text-text-primary bg-surface-base border border-ai-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-ai-400 font-sans leading-relaxed resize-none"
              />
            ) : (
              <div className="bg-ai-50/70 border border-ai-100/50 text-text-primary rounded-2xl rounded-tl-none shadow-sm p-4 text-xs leading-relaxed font-sans">
                {p.aiOutreachDraft}
              </div>
            )}
          </div>

          {/* ACTIONS STACKED DIRECTLY BELOW */}
          <div className="flex flex-col gap-2.5 w-full">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    if (draftMessageText.trim()) {
                      onSaveAndApprove(p.id, draftMessageText);
                    }
                  }}
                  className="w-full py-2.5 bg-ai-500 hover:bg-ai-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200 font-sans"
                >
                  Save & Send
                </button>
                <button
                  onClick={onCancelEdit}
                  className="w-full py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150 font-sans"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onApprove(p.id)}
                  className="w-full py-2.5 bg-ai-500 hover:bg-ai-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200 font-sans"
                >
                  Approve & Send
                </button>
                <button
                  onClick={() => onStartEdit(p.id, p.aiOutreachDraft || '')}
                  className="w-full py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150 font-sans"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
