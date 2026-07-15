import {
  LayoutGrid,
  Timer,
  Calendar,
  MessageSquare,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import logoWhite from '../../assets/logo-white.svg';
import { useToast } from '../shared/Toast';
import { useModalA11y } from '../../hooks/useModalA11y';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  needsReviewCount: number;
  adminName: string;
  adminEmail: string;
  onLogout: () => void;
  // Mobile drawer control. On lg+ the sidebar is always visible and these
  // are effectively no-ops (the CSS pins it open via lg:translate-x-0).
  isOpen: boolean;
  onClose: () => void;
}

const navButtonClass = (active: boolean) =>
  `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 ${
    active
      ? 'bg-ai-50 text-brand-500 font-semibold'
      : 'text-brand-100/70 hover:text-white hover:bg-white/5'
  }`;

export function Sidebar({ currentRoute, onNavigate, needsReviewCount, adminName, adminEmail, onLogout, isOpen, onClose }: SidebarProps) {
  const toast = useToast();
  const panelRef = useModalA11y<HTMLElement>(isOpen, onClose);
  // Navigating closes the mobile drawer (harmless no-op on desktop).
  const go = (route: string) => { onNavigate(route); onClose(); };
  return (
    <>
      {/* Mobile backdrop — only when the drawer is open, below lg */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    <aside
      ref={panelRef}
      className={`w-[260px] bg-brand-900 text-white flex flex-col justify-between fixed top-0 bottom-0 left-0 z-40 select-none shadow-lg transition-transform duration-300 ease-out pt-16 lg:pt-0 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div>
        {/* Logo Section */}
        <div className="p-6 pb-4 flex items-center gap-2.5">
          <img src={logoWhite} className="h-6 w-auto object-contain" alt="Zero Logo" />
          <div className="h-4 w-px bg-white/20"></div>
          <span className="text-[10px] text-brand-100/60 uppercase tracking-widest font-semibold">Clinic OS</span>
        </div>

        {/* Sidebar Nav Sections */}
        <nav className="px-4 py-3 space-y-6">
          {/* OPERATIONS SECTION */}
          <div>
            <div className="px-3 text-[11px] font-semibold text-brand-100/40 uppercase tracking-widest mb-2">
              Operations
            </div>
            <ul className="space-y-1">
              <li>
                <button onClick={() => go('dashboard')} className={navButtonClass(currentRoute === 'dashboard')}>
                  <LayoutGrid size={16} />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button onClick={() => go('live-queue')} className={navButtonClass(currentRoute === 'live-queue')}>
                  <Timer size={16} />
                  <span>Live Queue</span>
                </button>
              </li>
              <li>
                <button onClick={() => go('appointments')} className={navButtonClass(currentRoute === 'appointments')}>
                  <Calendar size={16} />
                  <span>Appointments</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => go('zero-chat')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 ${
                    currentRoute === 'zero-chat'
                      ? 'bg-ai-50 text-brand-500 font-semibold'
                      : 'text-brand-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} />
                    <span>ZeroChat</span>
                  </div>
                  {needsReviewCount > 0 && (
                    <span className="bg-status-danger text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold font-sans">
                      {needsReviewCount}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>

          {/* PATIENTS SECTION */}
          <div>
            <div className="px-3 text-[11px] font-semibold text-brand-100/40 uppercase tracking-widest mb-2">
              Patients
            </div>
            <ul className="space-y-1">
              <li>
                <button onClick={() => go('patients')} className={navButtonClass(currentRoute === 'patients')}>
                  <Users size={16} />
                  <span>Patients</span>
                </button>
              </li>
            </ul>
          </div>

          {/* INSIGHTS SECTION */}
          <div>
            <div className="px-3 text-[11px] font-semibold text-brand-100/40 uppercase tracking-widest mb-2">
              Insights
            </div>
            <ul className="space-y-1">
              <li>
                <button onClick={() => go('analytics')} className={navButtonClass(currentRoute === 'analytics')}>
                  <TrendingUp size={16} />
                  <span>Analytics</span>
                </button>
              </li>
            </ul>
          </div>

          {/* SETUP SECTION */}
          <div>
            <div className="px-3 text-[11px] font-semibold text-brand-100/40 uppercase tracking-widest mb-2">
              Setup
            </div>
            <ul className="space-y-1">
              <li>
                <button onClick={() => go('settings')} className={navButtonClass(currentRoute === 'settings')}>
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* User / Footer Info */}
      <div className="border-t border-white/10 p-4 space-y-2">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/5 transition duration-150 cursor-pointer">
          <div className="w-9 h-9 bg-brand-700 rounded-full flex items-center justify-center font-bold text-sm border border-brand-500">
            {adminName.trim().split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'AD'}
          </div>
          <div className="overflow-hidden">
            <div className="text-[13px] font-semibold text-white truncate">{adminName || 'Apex Clinic Admin'}</div>
            <div className="text-[10px] text-brand-100/60 truncate">{adminEmail || 'admin@apexclinic.com'}</div>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-1">
          <button
            onClick={() => toast.info('Support module is coming soon!')}
            className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded-lg text-xs text-brand-100/60 hover:text-white hover:bg-white/5 transition duration-150"
          >
            <HelpCircle size={14} />
            <span>Support</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded-lg text-xs text-brand-100/60 hover:text-white hover:bg-white/5 transition duration-150"
          >
            <LogOut size={14} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
