import { Conversation } from '../../api';

interface ConversationRowProps {
  conv: Conversation;
  selectedConv: Conversation | undefined;
  getInitials: (name: string) => string;
  onSelect: (convId: string) => void;
}

export function ConversationRow({ conv, selectedConv, getInitials, onSelect }: ConversationRowProps) {
  const isSelected = selectedConv && selectedConv.id === conv.id;
  const initials = getInitials(conv.patientName);
  const lastMsgText = conv.lastMessage || (conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].text : "No messages");
  const lastMsgTime = conv.lastMessageTime || "";

  return (
    <button
      key={conv.id}
      onClick={() => onSelect(conv.id)}
      className={`w-full text-left p-3 rounded-xl transition duration-150 flex items-start gap-3 border ${
        isSelected
          ? 'bg-brand-50/50 border-brand-100/80 shadow-sm font-semibold'
          : 'bg-transparent border-transparent hover:bg-surface-subtle/40'
      }`}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-semibold text-[11px] flex items-center justify-center border border-brand-100 flex-shrink-0 mt-0.5 font-sans">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-xs font-bold text-text-primary truncate">{conv.patientName}</span>
          <span className="text-[9px] text-text-muted font-medium whitespace-nowrap font-sans">{lastMsgTime}</span>
        </div>

        <p className="text-[11px] text-text-secondary truncate mt-1 leading-normal font-medium font-sans">
          {lastMsgText}
        </p>

        {/* Sub-tag or urgency badge inside row */}
        {conv.status === 'NEEDS_REVIEW' && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${conv.urgency === 'urgent' ? 'bg-status-danger' : 'bg-status-warning'}`}></span>
            <span className={`text-[9px] font-bold uppercase tracking-wider font-sans ${conv.urgency === 'urgent' ? 'text-status-danger' : 'text-status-warning'}`}>
              {conv.urgency === 'urgent' ? 'Urgent Medical' : 'Billing/Admin'}
            </span>
          </div>
        )}

        {conv.assignedStaff && (
          <div className="flex items-center gap-1.5 mt-1.5 text-brand-600">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
            <span className="text-[9px] font-bold uppercase tracking-wider font-sans">
              Assigned: {conv.assignedStaff}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
