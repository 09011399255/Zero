import { AlertTriangle, ArrowLeft, ChevronDown, MessageSquare, RefreshCw, Search, Send } from 'lucide-react';
import { api, Conversation } from '../../api';
import { ConversationRow } from './ConversationRow';
import { ErrorState } from '../../components/shared/ErrorState';

interface ExpandedSections {
  needs_review: boolean;
  ai_handling: boolean;
  resolved: boolean;
}

interface ZeroChatPageProps {
  conversations: Conversation[];
  conversationsLoading: boolean;
  conversationsError: string | null;
  onRetryConversations: () => void;
  activeConversation: Conversation | null;
  setActiveConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  selectedChatId: string | null;
  setSelectedChatId: (id: string) => void;
  chatInputText: string;
  setChatInputText: (v: string) => void;
  chatSearchQuery: string;
  setChatSearchQuery: (v: string) => void;
  sendingMessage: boolean;
  setSendingMessage: (v: boolean) => void;
  threadLoading: boolean;
  expandedSections: ExpandedSections;
  setExpandedSections: React.Dispatch<React.SetStateAction<ExpandedSections>>;
  getInitials: (name: string) => string;
  onSelectPatient: (patientId: string) => void;
  onTakeOver: (convId: string) => void;
  onResolve: (convId: string) => void;
  onReopen: (convId: string) => void;
}

export function ZeroChatPage({
  conversations,
  conversationsLoading,
  conversationsError,
  onRetryConversations,
  activeConversation,
  setActiveConversation,
  setConversations,
  selectedChatId,
  setSelectedChatId,
  chatInputText,
  setChatInputText,
  chatSearchQuery,
  setChatSearchQuery,
  sendingMessage,
  setSendingMessage,
  threadLoading,
  expandedSections,
  setExpandedSections,
  getInitials,
  onSelectPatient,
  onTakeOver,
  onResolve,
  onReopen,
}: ZeroChatPageProps) {
  const filteredConversations = conversations.filter(c =>
    c.patientName.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const needsReviewList = filteredConversations.filter(c => c.status === 'NEEDS_REVIEW');
  const aiHandlingList = filteredConversations.filter(c => c.status === 'AI_HANDLING' || c.status === 'STAFF_TOOK_OVER');
  const resolvedList = filteredConversations.filter(c => c.status === 'RESOLVED');

  const selectedConv = conversations.find(c => c.id === selectedChatId) || conversations[0];
  const messagesToShow = activeConversation && activeConversation.id === selectedConv?.id
    ? activeConversation.messages || []
    : selectedConv?.messages || [];

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInputText.trim() || !selectedConv || !selectedConv.assignedStaff) return;

    try {
      setSendingMessage(true);
      const newMsg = await api.conversations.reply(selectedConv.id, { text: chatInputText });
      if (activeConversation && activeConversation.id === selectedConv.id) {
        setActiveConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...(prev.messages || []), newMsg]
          };
        });
      }
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConv.id ? { ...c, lastMessage: newMsg.text } : c
        )
      );
      setChatInputText('');
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSelectConv = (convId: string) => {
    setSelectedChatId(convId);
    setChatInputText('');
  };

  return (
    <div className="flex bg-surface-base rounded-2xl border border-surface-border/25 shadow-soft overflow-hidden h-[calc(100vh-170px)] animate-fade-in">
      {/* CONVERSATION LIST (LEFT PANEL) — full-width on mobile, hidden there once a thread is open */}
      <div className={`w-full lg:w-[320px] border-r border-surface-border/25 flex-col bg-surface-base h-full flex-shrink-0 ${selectedChatId ? 'hidden lg:flex' : 'flex'}`}>
        {/* List Search Header */}
        <div className="p-4 border-b border-surface-border/15">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-text-muted" size={14} />
            <input
              type="text"
              placeholder="Search patient..."
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-surface-subtle border border-surface-border/50 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans"
            />
          </div>
        </div>

        {/* Collapsible Sections Container */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
          {conversationsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
              <RefreshCw size={18} className="animate-spin text-brand-500" />
              <span className="text-[11px] font-medium font-sans">Loading chats...</span>
            </div>
          ) : conversationsError && conversations.length === 0 ? (
            <ErrorState message={conversationsError} onRetry={onRetryConversations} />
          ) : (
            <>
              {/* Needs Review Section */}
              <div>
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, needs_review: !prev.needs_review }))}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider hover:text-text-primary transition duration-150 font-sans"
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronDown size={12} className={`transition-transform duration-150 ${expandedSections.needs_review ? '' : '-rotate-90'}`} />
                    <span>Needs Review</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-sans ${
                    needsReviewList.length > 0
                      ? 'bg-status-dangerBg text-status-danger border border-status-danger/10'
                      : 'bg-surface-subtle text-text-muted'
                  }`}>
                    {needsReviewList.length}
                  </span>
                </button>

                {expandedSections.needs_review && (
                  <div className="mt-1.5 space-y-1">
                    {needsReviewList.length === 0 ? (
                      <div className="text-[11px] text-text-muted text-center py-4 italic font-sans">No items need review</div>
                    ) : (
                      needsReviewList.map(conv => (
                        <ConversationRow key={conv.id} conv={conv} selectedConv={selectedConv} getInitials={getInitials} onSelect={handleSelectConv} />
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* AI Handling Section */}
              <div>
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, ai_handling: !prev.ai_handling }))}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider hover:text-text-primary transition duration-150 font-sans"
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronDown size={12} className={`transition-transform duration-150 ${expandedSections.ai_handling ? '' : '-rotate-90'}`} />
                    <span>AI Handling</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-ai-50 text-ai-600 border border-ai-100/50 font-sans">
                    {aiHandlingList.length}
                  </span>
                </button>

                {expandedSections.ai_handling && (
                  <div className="mt-1.5 space-y-1">
                    {aiHandlingList.length === 0 ? (
                      <div className="text-[11px] text-text-muted text-center py-4 italic font-sans">No active AI conversations</div>
                    ) : (
                      aiHandlingList.map(conv => (
                        <ConversationRow key={conv.id} conv={conv} selectedConv={selectedConv} getInitials={getInitials} onSelect={handleSelectConv} />
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Resolved Section */}
              <div>
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, resolved: !prev.resolved }))}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider hover:text-text-primary transition duration-150 font-sans"
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronDown size={12} className={`transition-transform duration-150 ${expandedSections.resolved ? '' : '-rotate-90'}`} />
                    <span>Resolved</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-status-successBg text-status-success border border-status-success/10 font-sans">
                    {resolvedList.length}
                  </span>
                </button>

                {expandedSections.resolved && (
                  <div className="mt-1.5 space-y-1">
                    {resolvedList.length === 0 ? (
                      <div className="text-[11px] text-text-muted text-center py-4 italic font-sans">No resolved conversations</div>
                    ) : (
                      resolvedList.map(conv => (
                        <ConversationRow key={conv.id} conv={conv} selectedConv={selectedConv} getInitials={getInitials} onSelect={handleSelectConv} />
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ACTIVE THREAD (RIGHT PANEL) — full-screen on mobile once a thread is open, hidden there otherwise */}
      <div className={`flex-1 flex-col bg-surface-subtle/15 h-full min-w-0 ${selectedChatId ? 'flex' : 'hidden lg:flex'}`}>
        {selectedConv ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-surface-border/20 bg-surface-base flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedChatId('')}
                  aria-label="Back to conversations"
                  className="lg:hidden flex-shrink-0 w-8 h-8 -ml-1 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-500 font-semibold text-xs flex items-center justify-center border border-brand-100 flex-shrink-0 font-sans">
                  {getInitials(selectedConv.patientName)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-text-primary truncate">{selectedConv.patientName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-sans whitespace-nowrap ${
                      selectedConv.status === 'NEEDS_REVIEW'
                        ? selectedConv.urgency === 'urgent'
                          ? 'bg-status-dangerBg text-status-danger border border-status-danger/10'
                          : 'bg-status-warningBg text-status-warning border border-status-warning/10'
                        : selectedConv.status === 'AI_HANDLING' || selectedConv.status === 'STAFF_TOOK_OVER'
                        ? 'bg-ai-50 text-ai-600 border border-ai-100/50'
                        : 'bg-status-successBg text-status-success border border-status-success/10'
                    }`}>
                      {selectedConv.status === 'NEEDS_REVIEW'
                        ? `Needs Review · ${selectedConv.urgency === 'urgent' ? 'Urgent' : 'Admin'}`
                        : selectedConv.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                    <span className="text-text-secondary font-sans">{selectedConv.patientPhone}</span>
                    <span className="text-text-muted">·</span>
                    <button
                      onClick={() => onSelectPatient(selectedConv.patientId)}
                      className="font-bold text-brand-500 hover:text-brand-600 transition"
                    >
                      View Patient
                    </button>
                  </div>
                </div>
              </div>

              {/* Take Over & Resolve Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!selectedConv.assignedStaff && selectedConv.status !== 'RESOLVED' && (
                  <button
                    onClick={() => onTakeOver(selectedConv.id)}
                    className="px-3 py-1.5 text-xs font-bold border border-status-warning/45 text-status-warning hover:bg-status-warningBg/80 rounded-xl transition duration-150 shadow-sm"
                  >
                    Take Over
                  </button>
                )}
                {selectedConv.status !== 'RESOLVED' && (
                  <button
                    onClick={() => onResolve(selectedConv.id)}
                    className="px-3 py-1.5 text-xs font-bold bg-status-success hover:bg-status-success/90 text-white rounded-xl transition duration-150 shadow-sm"
                  >
                    Resolve
                  </button>
                )}
                {selectedConv.status === 'RESOLVED' && (
                  <button
                    onClick={() => onReopen(selectedConv.id)}
                    className="px-3 py-1.5 text-xs font-bold border border-brand-500 text-brand-500 hover:bg-brand-50 rounded-xl transition duration-150 shadow-sm"
                  >
                    Reopen Thread
                  </button>
                )}
              </div>
            </div>

            {/* Escalation Context Banner */}
            {selectedConv.status === 'NEEDS_REVIEW' && selectedConv.escalationReason && (
              <div className={`p-3.5 mx-6 mt-4 border-l-4 rounded-r-xl flex items-start gap-3 shadow-sm ${
                selectedConv.urgency === 'urgent'
                  ? 'bg-status-dangerBg border-status-danger text-status-danger'
                  : 'bg-status-warningBg border-status-warning text-status-warning'
              }`}>
                <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider font-sans">Escalation Triggered</h5>
                  <p className="text-xs mt-0.5 font-medium leading-relaxed font-sans">{selectedConv.escalationReason}</p>
                </div>
              </div>
            )}

            {/* Message List area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col justify-start">
              {threadLoading ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                  <span className="text-[11px] text-text-muted mt-2 font-sans">Loading thread...</span>
                </div>
              ) : messagesToShow.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                  <MessageSquare size={36} className="text-text-muted mb-2" />
                  <p className="text-xs text-text-secondary font-sans font-medium">No messages in this thread yet.</p>
                </div>
              ) : (
                messagesToShow.map((msg, index) => {
                  const isSystem = msg.role === 'system';
                  if (isSystem) {
                    return (
                      <div key={index} className="flex items-center justify-center my-2">
                        <span className="text-[9px] font-bold text-text-muted bg-surface-subtle px-3 py-1 rounded-full border border-surface-border/50 uppercase tracking-wider font-sans">
                          {msg.text} · {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  }

                  const isAI = msg.role === 'ai';
                  const isPatient = msg.role === 'patient';

                  return (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[75%] ${isPatient ? 'self-end items-end' : 'self-start'}`}
                    >
                      {/* Name / Sender Indicator */}
                      <span className={`text-[9px] font-bold mb-1 px-1 font-sans ${
                        isAI ? 'text-ai-600 font-bold' : isPatient ? 'text-text-muted' : 'text-brand-600 font-bold'
                      }`}>
                        {isAI ? 'Zero AI' : isPatient ? selectedConv.patientName : (msg.senderName || 'Staff')}
                      </span>

                      {/* Bubble */}
                      <div className={`p-3.5 text-xs leading-relaxed font-sans shadow-sm ${
                        isAI
                          ? 'bg-ai-100 border border-ai-200 text-ai-950 rounded-2xl rounded-tl-none border-l-4 border-l-ai-500'
                          : isPatient
                          ? 'bg-white border border-surface-border text-text-primary rounded-2xl rounded-tr-none'
                          : 'bg-brand-100 border border-brand-200 text-brand-950 rounded-2xl rounded-tl-none border-l-4 border-l-brand-500'
                      }`}>
                        {msg.text}
                      </div>

                      {/* Time */}
                      <span className="text-[8px] text-text-muted mt-1 px-1 font-sans">
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Panel */}
            <div className="p-4 bg-surface-base border-t border-surface-border/20 flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  disabled={!selectedConv.assignedStaff || selectedConv.status === 'RESOLVED' || sendingMessage}
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  placeholder={
                    selectedConv.status === 'RESOLVED'
                      ? "This conversation is resolved."
                      : selectedConv.assignedStaff
                      ? sendingMessage
                        ? "Sending..."
                        : "Type your message..."
                      : "Click 'Take Over' to reply manually..."
                  }
                  className={`flex-1 px-4 py-3 bg-surface-subtle border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans ${
                    !selectedConv.assignedStaff || selectedConv.status === 'RESOLVED' || sendingMessage
                      ? 'cursor-not-allowed text-text-muted border-surface-border/50'
                      : 'text-text-primary border-surface-border/80'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!chatInputText.trim() || !selectedConv.assignedStaff || selectedConv.status === 'RESOLVED' || sendingMessage}
                  className={`p-3 rounded-xl transition duration-150 flex items-center justify-center ${
                    !chatInputText.trim() || !selectedConv.assignedStaff || selectedConv.status === 'RESOLVED' || sendingMessage
                      ? 'bg-surface-subtle border border-surface-border/50 text-text-muted cursor-not-allowed'
                      : 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
                  }`}
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <MessageSquare size={48} className="text-text-muted mb-4" />
            <h3 className="text-sm font-semibold text-text-primary">No conversation selected</h3>
            <p className="text-xs text-text-secondary mt-1">Select a conversation from the left menu to view the chat history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
