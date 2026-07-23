import { Bell } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'escalation' | 'recall' | 'no-show';
  title: string;
  description: string;
  time: string;
  read: boolean;
  linkData: {
    route: string;
    patientId?: string;
    tab?: string;
  };
}

interface NotificationsDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
}

export function NotificationsDropdown({
  isOpen,
  onToggle,
  notifications,
  unreadCount,
  onMarkAllRead,
  onNotificationClick,
}: NotificationsDropdownProps) {
  return (
    <div className="relative">
      <button
        id="notification-bell-btn"
        onClick={onToggle}
        className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition duration-150 border ${
          isOpen
            ? 'bg-brand-50 border-brand-200 text-brand-600'
            : 'text-text-secondary hover:bg-surface-muted border-surface-border'
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-status-danger text-white rounded-full border border-surface-base text-[9px] font-extrabold flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="notification-dropdown-panel"
          className="absolute right-0 mt-2 w-80 bg-surface-base rounded-2xl shadow-elevated border border-surface-border py-3 z-50 animate-fade-in text-xs"
        >
          <div className="px-4 pb-2.5 border-b border-surface-border flex items-center justify-between">
            <span className="font-bold text-text-primary text-xs">Notifications</span>
            <button
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className={`font-bold transition duration-150 text-[11px] ${
                unreadCount > 0
                  ? 'text-brand-500 hover:text-brand-600 cursor-pointer'
                  : 'text-text-muted cursor-not-allowed'
              }`}
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-surface-border/60">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-text-muted">
                You're all caught up!
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.read;
                return (
                  <div
                    key={notif.id}
                    onClick={() => onNotificationClick(notif)}
                    className={`px-4 py-3 cursor-pointer transition duration-150 flex items-start gap-3 hover:bg-surface-muted/60 ${
                      isUnread ? 'bg-brand-50/20' : ''
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        notif.type === 'escalation'
                          ? notif.description.includes('dispute')
                            ? 'bg-status-warning'
                            : 'bg-status-danger'
                          : notif.type === 'recall'
                          ? 'bg-status-warning'
                          : 'bg-status-danger'
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] leading-relaxed text-text-primary ${isUnread ? 'font-bold' : 'font-medium'}`}>
                        {notif.description}
                      </p>
                      <span className="text-[10px] text-text-muted mt-1 block">
                        {notif.time}
                      </span>
                    </div>

                    {isUnread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
