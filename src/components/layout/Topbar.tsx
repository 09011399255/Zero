import { ChevronRight, Menu, X } from 'lucide-react';
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
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
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
  isSidebarOpen,
  onToggleSidebar,
}: TopbarProps) {
  // z-[45]: above the mobile sidebar drawer + its backdrop (z-40/z-30) so the
  // hamburger/X toggle stays visible and clickable while the drawer is open,
  // but below modals/side-drawers (z-50) so their close buttons aren't
  // covered when the Topbar and a drawer are both on screen.
  return (
    <header className="h-16 bg-surface-base border-b border-surface-border/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-[45] gap-3">
      <div className="flex items-center gap-2 text-sm min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isSidebarOpen}
          className="lg:hidden flex-shrink-0 w-9 h-9 -ml-1 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="text-text-secondary font-medium truncate hidden sm:inline">{clinicName}</span>
        <ChevronRight size={14} className="text-text-muted flex-shrink-0 hidden sm:inline" />
        <span className="text-text-primary font-semibold capitalize truncate">
          {currentRoute === 'dashboard' ? 'Dashboard' : currentRoute.replace('-', ' ')}
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-status-successBg border border-status-success/10 rounded-full">
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
