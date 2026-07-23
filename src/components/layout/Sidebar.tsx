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
  ShieldCheck,
  LucideIcon,
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
  // Shows the internal Zero-team admin link when the signed-in user is a
  // platform operator.
  isPlatformAdmin?: boolean;
  // Mobile drawer control. On lg+ the sidebar is always visible and these
  // are effectively no-ops (the CSS pins it open via lg:translate-x-0).
  isOpen: boolean;
  onClose: () => void;
}

// Active items get a subtle brand-tinted surface + a left accent bar and a
// brand-coloured icon, rather than a jarring light pill. Inactive items are
// muted slate that lift to white on hover — Linear-style restraint.
const navButtonClass = (active: boolean) =>
  `group relative w-full flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 ${
    active
      ? 'bg-white/[0.07] text-white font-semibold shadow-inset-hair'
      : 'text-slate-400/90 font-medium hover:text-white hover:bg-white/[0.04]'
  }`;

// Small left accent bar shown on the active nav item.
const activeBar =
  'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-brand-400';

const sectionLabel =
  'px-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-1.5';

export function Sidebar({ currentRoute, onNavigate, needsReviewCount, adminName, adminEmail, onLogout, isPlatformAdmin, isOpen, onClose }: SidebarProps) {
  const toast = useToast();
  const panelRef = useModalA11y<HTMLElement>(isOpen, onClose);
  // Navigating closes the mobile drawer (harmless no-op on desktop).
  const go = (route: string) => { onNavigate(route); onClose(); };

  // Single nav row. Renders the active accent bar + brand-tinted icon.
  const NavItem = ({ route, icon: Icon, label, badge }: { route: string; icon: LucideIcon; label: string; badge?: number }) => {
    const active = currentRoute === route;
    return (
      <li>
        <button onClick={() => go(route)} className={navButtonClass(active)}>
          {active && <span className={activeBar} aria-hidden="true" />}
          <Icon size={17} className={active ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300 transition-colors'} />
          <span className="flex-1 text-left">{label}</span>
          {badge != null && badge > 0 && (
            <span className="bg-status-danger text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold font-sans">
              {badge}
            </span>
          )}
        </button>
      </li>
    );
  };
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
      className={`w-[260px] bg-ink-900 text-white flex flex-col justify-between fixed top-0 bottom-0 left-0 z-40 select-none border-r border-white/[0.06] shadow-elevated transition-transform duration-300 ease-out pt-16 lg:pt-0 lg:translate-x-0 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div>
        {/* Logo Section */}
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-white/[0.06]">
          <img src={logoWhite} className="h-6 w-auto object-contain" alt="Zero Logo" />
          <div className="h-3.5 w-px bg-white/15"></div>
          <span className="text-[10px] text-slate-400 uppercase tracking-[0.18em] font-bold">Clinic OS</span>
        </div>

        {/* Sidebar Nav Sections */}
        <nav className="px-3 py-5 space-y-6">
          {/* OPERATIONS SECTION */}
          <div>
            <div className={sectionLabel}>Operations</div>
            <ul className="space-y-0.5">
              <NavItem route="dashboard" icon={LayoutGrid} label="Dashboard" />
              <NavItem route="live-queue" icon={Timer} label="Live Queue" />
              <NavItem route="appointments" icon={Calendar} label="Appointments" />
              <NavItem route="zero-chat" icon={MessageSquare} label="ZeroChat" badge={needsReviewCount} />
            </ul>
          </div>

          {/* PATIENTS SECTION */}
          <div>
            <div className={sectionLabel}>Patients</div>
            <ul className="space-y-0.5">
              <NavItem route="patients" icon={Users} label="Patients" />
            </ul>
          </div>

          {/* INSIGHTS SECTION */}
          <div>
            <div className={sectionLabel}>Insights</div>
            <ul className="space-y-0.5">
              <li>
                {/* Analytics isn't built yet — show it as a roadmap item ("Soon")
                    rather than a nav link into an "under development" dead page. */}
                <div
                  className="group w-full flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-500 cursor-default"
                  title="Coming soon"
                >
                  <TrendingUp size={17} className="text-slate-600" />
                  <span className="flex-1 text-left">Analytics</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-white/[0.06] text-slate-400 px-1.5 py-0.5 rounded-md border border-white/[0.06]">
                    Soon
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* SETUP SECTION */}
          <div>
            <div className={sectionLabel}>Setup</div>
            <ul className="space-y-0.5">
              <NavItem route="settings" icon={Settings} label="Settings" />
            </ul>
          </div>

          {/* INTERNAL SECTION — Zero platform operators only */}
          {isPlatformAdmin && (
            <div>
              <div className={sectionLabel}>Internal</div>
              <ul className="space-y-0.5">
                <NavItem route="admin" icon={ShieldCheck} label="WhatsApp Admin" />
              </ul>
            </div>
          )}
        </nav>
      </div>

      {/* User / Footer Info */}
      <div className="border-t border-white/[0.06] p-3 space-y-1">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition duration-150 cursor-pointer">
          <div className="w-9 h-9 shrink-0 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center font-bold text-[13px] text-white shadow-brand-glow ring-1 ring-white/10">
            {adminName.trim().split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'AD'}
          </div>
          <div className="overflow-hidden">
            <div className="text-[13px] font-semibold text-white truncate">{adminName || 'Apex Clinic Admin'}</div>
            <div className="text-[10px] text-slate-400 truncate">{adminEmail || 'admin@apexclinic.com'}</div>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => toast.info('Support module is coming soon!')}
            className="flex items-center gap-3 w-full text-left px-2 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition duration-150"
          >
            <HelpCircle size={15} />
            <span>Support</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full text-left px-2 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition duration-150"
          >
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
