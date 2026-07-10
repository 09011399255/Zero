import { ChevronRight } from 'lucide-react';
import { NotificationsDropdown, NotificationItem } from './NotificationsDropdown';

interface TopbarProps {
  clinicName: string;
  currentRoute: string;
  isNotificationsOpen: boolean;
  onToggleNotifications: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
}

export function Topbar({
  clinicName,
  currentRoute,
  isNotificationsOpen,
  onToggleNotifications,
  notifications,
  unreadCount,
  onMarkAllRead,
  onNotificationClick,
}: TopbarProps) {
  return (
    <header className="h-16 bg-surface-base border-b border-surface-border/50 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-secondary font-medium">{clinicName}</span>
        <ChevronRight size={14} className="text-text-muted" />
        <span className="text-text-primary font-semibold capitalize">
          {currentRoute === 'dashboard' ? 'Dashboard' : currentRoute.replace('-', ' ')}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-status-successBg border border-status-success/10 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
          </span>
          <span className="text-xs text-status-success font-medium">Connected</span>
        </div>

        <NotificationsDropdown
          isOpen={isNotificationsOpen}
          onToggle={onToggleNotifications}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={onMarkAllRead}
          onNotificationClick={onNotificationClick}
        />
      </div>
    </header>
  );
}
