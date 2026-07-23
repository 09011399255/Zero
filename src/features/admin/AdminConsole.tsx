// Zero platform-admin console. Reached at /admin, gated by isPlatformAdmin in
// App (and independently by the backend's requirePlatformAdmin on every call).
// Six tabs: Overview, Clinics, Billing, Staff, Audit, WhatsApp — styled to the
// app's premium design language (ink hero, shadow-card surfaces, segmented tabs,
// gradient avatars, status pills).

import { useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowLeft, Ban, Building2, CheckCircle2, CreditCard,
  LayoutGrid, MessageCircle, MessageSquare, RefreshCw, RotateCcw, ScrollText,
  Search, ShieldCheck, Sparkles, Users, X,
} from 'lucide-react';
import {
  api, AdminOverview as OverviewStats, AdminClinicRow, AdminClinicDetail,
  AdminBilling, AdminAuditEntry, AdminStaffMember, PlanTier, WhatsAppStatus,
} from '../../api';
import { Sparkline } from '../../components/shared/StatTile';
import { AdminWhatsApp } from './AdminDashboard';

type View = 'overview' | 'clinics' | 'billing' | 'staff' | 'audit' | 'whatsapp';

// ── shared helpers ──────────────────────────────────────────────────────────

function planName(p: string) { return p[0] + p.slice(1).toLowerCase(); }
function roleName(r: string) { return r[0] + r.slice(1).toLowerCase(); }
function fmtNaira(n: number) { return `₦${n.toLocaleString()}`; }
function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '—';
}
function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}
function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const PILL = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap';

function planPill(plan: string) {
  const map: Record<string, string> = {
    ENTERPRISE: 'bg-ai-500/10 text-ai-600 border-ai-500/20',
    NAVIGATOR: 'bg-brand-50 text-brand-600 border-brand-100',
  };
  return map[plan] || 'bg-surface-muted text-text-secondary border-surface-border';
}
function waPill(s: WhatsAppStatus): { label: string; cls: string } {
  switch (s) {
    case 'CONNECTED': return { label: 'Live', cls: 'bg-status-successBg text-status-success border-status-success/20' };
    case 'AWAITING_OTP': return { label: 'Awaiting code', cls: 'bg-ai-500/10 text-ai-600 border-ai-500/20' };
    case 'VERIFICATION_PENDING': return { label: 'Pending', cls: 'bg-status-warningBg text-status-warning border-status-warning/20' };
    default: return { label: 'Not connected', cls: 'bg-surface-muted text-text-muted border-surface-border' };
  }
}

function Avatar({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`flex-shrink-0 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 font-bold flex items-center justify-center ring-1 ring-brand-200/60 ${className}`}>
      {initials(name)}
    </span>
  );
}

function Spinner({ label = 'Loading…' }: { label?: string }) {
  return <div className="py-16 text-center text-text-muted text-sm flex items-center justify-center gap-2"><RefreshCw size={16} className="animate-spin" /> {label}</div>;
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-start gap-2">
      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

const CARD = 'bg-surface-base rounded-2xl shadow-card border border-surface-border';
const TH = 'py-3 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted';

// ── shell ───────────────────────────────────────────────────────────────────

export function AdminConsole({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<View>('overview');

  const tabs: { key: View; label: string; icon: typeof LayoutGrid }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutGrid },
    { key: 'clinics', label: 'Clinics', icon: Building2 },
    { key: 'billing', label: 'Billing', icon: CreditCard },
    { key: 'staff', label: 'Staff', icon: Users },
    { key: 'audit', label: 'Audit', icon: ScrollText },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="w-10 h-10 rounded-xl border border-surface-border bg-surface-base hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50 flex items-center justify-center text-text-secondary shadow-card transition duration-200"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={17} />
            </button>
            <div>
              <h1 className="text-[26px] font-bold text-text-primary tracking-tighter2 leading-tight">Zero Admin</h1>
              <p className="text-[12px] text-text-secondary">Platform operations</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-ink-900 text-slate-200 ring-1 ring-white/10">
            <ShieldCheck size={12} className="text-brand-300" /> Internal
          </span>
        </div>

        {/* Segmented tabs */}
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="inline-flex gap-1 p-1 rounded-xl bg-surface-muted min-w-max">
            {tabs.map((t) => {
              const active = view === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setView(t.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    active ? 'bg-surface-base text-text-primary shadow-card' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <t.icon size={14} className={active ? 'text-brand-500' : ''} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {view === 'overview' && <Overview onSeeClinics={() => setView('clinics')} />}
        {view === 'clinics' && <Clinics />}
        {view === 'billing' && <Billing />}
        {view === 'staff' && <Staff />}
        {view === 'audit' && <Audit />}
        {view === 'whatsapp' && <AdminWhatsApp />}
      </div>
    </div>
  );
}

// ── Overview ────────────────────────────────────────────────────────────────

function Overview({ onSeeClinics }: { onSeeClinics: () => void }) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.overview().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <p className="text-sm text-text-muted">Couldn't load platform stats.</p>;

  const hero = [
    { key: 'clinics', label: 'Clinics', value: stats.clinics.toLocaleString(), spark: [12, 15, 14, 19, 22, 28, 33, stats.clinics] },
    { key: 'active', label: 'Active', value: stats.active.toLocaleString(), spark: [10, 13, 13, 18, 20, 26, 30, stats.active] },
    { key: 'mrr', label: 'MRR', value: fmtNaira(stats.mrr), spark: [4, 5, 6, 6, 8, 9, 11, 12] },
    { key: 'wa', label: 'WhatsApp live', value: stats.whatsappConnected.toLocaleString(), spark: [2, 3, 3, 5, 6, 7, 8, stats.whatsappConnected] },
  ];

  const cards = [
    { label: 'Suspended', value: stats.suspended, icon: Ban, cls: 'bg-status-dangerBg text-status-danger' },
    { label: 'New this month', value: stats.newThisMonth, icon: Sparkles, cls: 'bg-brand-50 text-brand-500' },
    { label: 'Patients', value: stats.patients, icon: Activity, cls: 'bg-ai-500/10 text-ai-600' },
    { label: 'Conversations', value: stats.conversations, icon: MessageCircle, cls: 'bg-status-successBg text-status-success' },
  ];

  return (
    <div className="space-y-5">
      {/* Ink hero band */}
      <div className="relative overflow-hidden rounded-2xl bg-ink-900 text-white shadow-elevated ring-1 ring-white/[0.06] p-6">
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-ai-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] ring-1 ring-white/10">
            <Sparkles size={15} className="text-brand-300" />
          </span>
          <span className="text-[13px] font-semibold text-slate-200 tracking-tightish">Platform at a glance</span>
        </div>
        <div className="relative mt-6 grid grid-cols-2 lg:grid-cols-4 border-t border-white/[0.08] pt-5 gap-y-5 lg:gap-y-0 lg:divide-x divide-white/[0.08]">
          {hero.map((s, i) => (
            <div key={s.key} className={`flex flex-col ${i > 0 ? 'lg:pl-6' : ''} ${i < 3 ? 'lg:pr-6' : ''}`}>
              <span className="text-[12px] text-slate-400 font-medium">{s.label}</span>
              <span className="text-[30px] font-bold text-white leading-none tracking-tighter2 tabular-nums mt-1.5">{s.value}</span>
              <div className="mt-2 -mb-1"><Sparkline data={s.spark} color="#93B4FD" id={`admin-hero-${s.key}`} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Compact stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={`relative overflow-hidden ${CARD} p-4`}>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 ring-inset ring-black/[0.03] ${c.cls}`}>
                <c.icon size={16} />
              </span>
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-muted">{c.label}</span>
            </div>
            <div className="text-[28px] font-bold text-text-primary tracking-tighter2 mt-2 tabular-nums">{c.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <button onClick={onSeeClinics} className="text-xs font-bold text-brand-600 hover:text-brand-700 transition">
        View all clinics →
      </button>
    </div>
  );
}

// ── Billing ─────────────────────────────────────────────────────────────────

function Billing() {
  const [data, setData] = useState<AdminBilling | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.billing().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-sm text-text-muted">Couldn't load billing.</p>;

  const List = ({ title, rows, empty, danger }: { title: string; rows: typeof data.renewalsDue; empty: string; danger?: boolean }) => (
    <section className="space-y-2">
      <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.12em]">{title} · {rows.length}</h3>
      {rows.length === 0 ? (
        <p className="text-[11px] text-text-muted">{empty}</p>
      ) : (
        <div className={`${CARD} divide-y divide-surface-border overflow-hidden`}>
          {rows.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar name={c.name} className="w-7 h-7 text-[10px]" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-text-primary truncate">{c.name}</div>
                  <div className="text-[10px] text-text-muted">{planName(c.plan)}</div>
                </div>
              </div>
              <span className={`text-[11px] font-bold ${danger ? 'text-status-danger' : 'text-text-secondary'}`}>{fmtDate(c.planExpiresAt)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-5">
      {/* MRR hero card */}
      <div className={`relative overflow-hidden ${CARD} p-6`}>
        <span className="absolute inset-x-0 top-0 h-[3px] bg-brand-500" aria-hidden="true" />
        <span className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl opacity-[0.10] bg-brand-500" aria-hidden="true" />
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-50 text-brand-500 ring-1 ring-inset ring-black/[0.03]"><CreditCard size={18} /></span>
          <span className="text-[11px] text-text-secondary font-bold tracking-[0.1em] uppercase">Monthly recurring revenue</span>
        </div>
        <div className="text-[46px] font-bold text-text-primary leading-[0.9] tracking-tighter2 tabular-nums mt-4">{fmtNaira(data.mrr)}</div>
        <p className="text-[10px] text-text-muted mt-3">From active clinics' plans. Set real prices in <code className="text-text-secondary">zero-ai/src/modules/admin/pricing.ts</code>.</p>
      </div>

      {/* Plan breakdown */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b border-surface-border">
                <th className={TH}>Plan</th>
                <th className={`${TH} text-right`}>Clinics</th>
                <th className={`${TH} text-right`}>Monthly</th>
                <th className={`${TH} text-right`}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.byPlan.map((b) => (
                <tr key={b.plan} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-muted/60 transition duration-150">
                  <td className="py-3 px-4"><span className={`${PILL} ${planPill(b.plan)}`}>{planName(b.plan)}</span></td>
                  <td className="py-3 px-4 text-right text-text-secondary tabular-nums">{b.count}</td>
                  <td className="py-3 px-4 text-right text-text-secondary tabular-nums">{fmtNaira(b.monthly)}</td>
                  <td className="py-3 px-4 text-right font-bold text-text-primary tabular-nums">{fmtNaira(b.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <List title="Renewals due (next 14 days)" rows={data.renewalsDue} empty="Nothing due soon." />
      <List title="Expired" rows={data.expired} empty="No expired plans." danger />
    </div>
  );
}

// ── Staff lookup ─────────────────────────────────────────────────────────────

function Staff() {
  const [rows, setRows] = useState<AdminStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async (query = q) => {
    setLoading(true);
    try { setRows(await api.admin.staff(query)); setError(null); }
    catch (err: any) { setError(err?.message || 'Failed to load staff.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(''); }, []);

  const toggle = async (s: AdminStaffMember) => {
    setBusyId(s.id);
    setError(null);
    try {
      if (s.isActive) await api.admin.deactivateStaff(s.id);
      else await api.admin.activateStaff(s.id);
      await load();
    } catch (err: any) { setError(err?.message || 'Action failed.'); }
    finally { setBusyId(null); }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 border border-surface-border rounded-xl px-3.5 py-2.5 bg-surface-base shadow-card focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500 transition">
          <Search size={15} className="text-text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search staff by name or email…" className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none" />
        </div>
        <button type="submit" className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-brand-glow transition">Search</button>
      </form>

      {error && <ErrorBanner msg={error} />}

      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b border-surface-border">
                <th className={TH}>Name</th>
                <th className={TH}>Clinic</th>
                <th className={TH}>Role</th>
                <th className={TH}>Status</th>
                <th className={TH}>Last login</th>
                <th className={TH}></th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-muted">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-muted">No staff found.</td></tr>
              ) : rows.map((s) => (
                <tr key={s.id} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-muted/60 transition duration-150">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.fullName} className="w-8 h-8 text-[11px]" />
                      <div className="min-w-0">
                        <div className="font-bold text-text-primary truncate">{s.fullName}</div>
                        <div className="text-[11px] text-text-muted truncate">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{s.clinic?.name || '—'}</td>
                  <td className="py-3 px-4 text-text-secondary">{roleName(s.role)}</td>
                  <td className="py-3 px-4">
                    <span className={`${PILL} ${s.isActive ? 'bg-status-successBg text-status-success border-status-success/20' : 'bg-status-dangerBg text-status-danger border-status-danger/20'}`}>
                      {s.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{s.lastLoginAt ? fmtDate(s.lastLoginAt) : 'Never'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggle(s)}
                      disabled={busyId === s.id}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition disabled:opacity-60 ${
                        s.isActive ? 'border-status-danger/30 text-status-danger hover:bg-status-dangerBg' : 'border-status-success/30 text-status-success hover:bg-status-successBg'
                      }`}
                    >
                      {busyId === s.id ? '…' : s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Audit log ────────────────────────────────────────────────────────────────

const AUDIT_META: Record<string, { label: string; icon: typeof Ban; cls: string }> = {
  'clinic.suspend': { label: 'Suspended clinic', icon: Ban, cls: 'bg-status-dangerBg text-status-danger' },
  'clinic.reactivate': { label: 'Reactivated clinic', icon: RotateCcw, cls: 'bg-status-successBg text-status-success' },
  'clinic.plan_change': { label: 'Changed plan', icon: CreditCard, cls: 'bg-brand-50 text-brand-500' },
  'whatsapp.send_code': { label: 'Sent WhatsApp code', icon: MessageSquare, cls: 'bg-ai-500/10 text-ai-600' },
  'whatsapp.mark_connected': { label: 'Marked WhatsApp connected', icon: CheckCircle2, cls: 'bg-status-successBg text-status-success' },
  'whatsapp.reset': { label: 'Reset WhatsApp connection', icon: RotateCcw, cls: 'bg-surface-muted text-text-muted' },
  'staff.deactivate': { label: 'Deactivated staff', icon: Ban, cls: 'bg-status-dangerBg text-status-danger' },
  'staff.activate': { label: 'Activated staff', icon: CheckCircle2, cls: 'bg-status-successBg text-status-success' },
};

function Audit() {
  const [rows, setRows] = useState<AdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.audit().then(setRows).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (rows.length === 0) return <p className="text-sm text-text-muted py-8 text-center">No admin actions recorded yet.</p>;

  return (
    <div className={`${CARD} divide-y divide-surface-border overflow-hidden`}>
      {rows.map((e) => {
        const m = AUDIT_META[e.action] || { label: e.action, icon: ScrollText, cls: 'bg-surface-muted text-text-muted' };
        return (
          <div key={e.id} className="flex items-start gap-3 px-4 py-3">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ring-1 ring-inset ring-black/[0.03] ${m.cls}`}>
              <m.icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-text-primary">
                {m.label}{e.detail ? <span className="text-text-secondary font-normal"> · {e.detail}</span> : null}
              </div>
              <div className="text-[10px] text-text-muted truncate">{e.clinicName || '—'} · by {e.actorEmail}</div>
            </div>
            <span className="text-[10px] text-text-muted whitespace-nowrap flex-shrink-0">{fmtDateTime(e.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Clinics table ─────────────────────────────────────────────────────────

function Clinics() {
  const [rows, setRows] = useState<AdminClinicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setRows(await api.admin.clinics()); setError(null); }
    catch (err: any) { setError(err?.message || 'Failed to load clinics.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => `${r.name} ${r.adminEmail ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 border border-surface-border rounded-xl px-3.5 py-2.5 bg-surface-base shadow-card focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500 transition">
          <Search size={15} className="text-text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clinics or email…" className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none" />
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-base hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50 text-text-secondary text-xs font-bold shadow-card transition duration-200">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && <ErrorBanner msg={error} />}

      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b border-surface-border">
                <th className={TH}>Clinic</th>
                <th className={TH}>Plan</th>
                <th className={TH}>Status</th>
                <th className={TH}>WhatsApp</th>
                <th className={`${TH} text-right`}>Patients</th>
                <th className={`${TH} text-right`}>Staff</th>
                <th className={TH}>Joined</th>
                <th className={TH}></th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-text-muted">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-text-muted">No clinics found.</td></tr>
              ) : filtered.map((c) => {
                const wa = waPill(c.whatsappStatus);
                return (
                  <tr key={c.id} onClick={() => setSelectedId(c.id)} className="border-b border-surface-border/60 last:border-0 hover:bg-surface-muted/60 cursor-pointer transition duration-150">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} className="w-8 h-8 text-[11px]" />
                        <div className="min-w-0">
                          <div className="font-bold text-text-primary truncate">{c.name}</div>
                          <div className="text-[11px] text-text-muted truncate">{c.adminEmail || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className={`${PILL} ${planPill(c.plan)}`}>{planName(c.plan)}</span></td>
                    <td className="py-3 px-4">
                      <span className={`${PILL} ${c.suspended ? 'bg-status-dangerBg text-status-danger border-status-danger/20' : 'bg-status-successBg text-status-success border-status-success/20'}`}>
                        {c.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4"><span className={`${PILL} ${wa.cls}`}>{wa.label}</span></td>
                    <td className="py-3 px-4 text-right text-text-secondary tabular-nums">{c.patientCount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-text-secondary tabular-nums">{c.staffCount}</td>
                    <td className="py-3 px-4 text-text-secondary">{fmtDate(c.createdAt)}</td>
                    <td className="py-3 px-4 text-right text-text-muted">›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId && <ClinicDetailDrawer id={selectedId} onClose={() => setSelectedId(null)} onChanged={load} />}
    </div>
  );
}

// ── Clinic detail drawer ────────────────────────────────────────────────────

function ClinicDetailDrawer({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [c, setC] = useState<AdminClinicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planInput, setPlanInput] = useState<PlanTier>('STARTER');
  const [expiryInput, setExpiryInput] = useState('');
  const [planBusy, setPlanBusy] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const detail = await api.admin.clinic(id);
      setC(detail);
      setPlanInput(detail.plan as PlanTier);
      setExpiryInput(detail.planExpiresAt ? detail.planExpiresAt.slice(0, 10) : '');
      setError(null);
    } catch (err: any) { setError(err?.message || 'Failed to load clinic.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const toggleSuspend = async () => {
    if (!c) return;
    setBusy(true);
    setError(null);
    try {
      if (c.suspended) await api.admin.reactivate(id);
      else await api.admin.suspend(id);
      await load();
      onChanged();
    } catch (err: any) { setError(err?.message || 'Action failed.'); }
    finally { setBusy(false); }
  };

  const savePlan = async () => {
    setPlanBusy(true);
    setError(null);
    setPlanSaved(false);
    try {
      await api.admin.changePlan(id, { plan: planInput, planExpiresAt: expiryInput || null });
      await load();
      onChanged();
      setPlanSaved(true);
      setTimeout(() => setPlanSaved(false), 2500);
    } catch (err: any) { setError(err?.message || 'Couldn\'t update the plan.'); }
    finally { setPlanBusy(false); }
  };

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between gap-3 py-1.5 text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary text-right">{value}</span>
    </div>
  );

  const fieldCls = 'w-full py-2.5 px-3 rounded-xl border border-surface-border bg-surface-base text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-surface-base h-full overflow-y-auto shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 p-5 border-b border-surface-border sticky top-0 bg-surface-base z-10">
          <div className="flex items-center gap-3 min-w-0">
            {c && <Avatar name={c.name} className="w-10 h-10 text-[13px]" />}
            <div className="min-w-0">
              <h2 className="text-[17px] font-bold text-text-primary tracking-tightish truncate">{c?.name || 'Clinic'}</h2>
              {c && (
                <span className={`${PILL} ${c.suspended ? 'bg-status-dangerBg text-status-danger border-status-danger/20' : 'bg-status-successBg text-status-success border-status-success/20'}`}>
                  {c.suspended ? 'Suspended' : 'Active'}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition flex-shrink-0" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          {error && <ErrorBanner msg={error} />}

          {loading || !c ? <Spinner /> : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Patients', value: c.counts.patients },
                  { label: 'Appointments', value: c.counts.appointments },
                  { label: 'Chats', value: c.counts.conversations },
                ].map((t) => (
                  <div key={t.label} className="bg-surface-muted rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-text-primary tracking-tighter2 tabular-nums">{t.value.toLocaleString()}</div>
                    <div className="text-[10px] text-text-muted">{t.label}</div>
                  </div>
                ))}
              </div>

              <div className="border border-surface-border rounded-xl p-4">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] mb-2">Profile</h3>
                <Row label="Plan" value={<span className={`${PILL} ${planPill(c.plan)}`}>{planName(c.plan)}</span>} />
                <Row label="WhatsApp" value={waPill(c.whatsappStatus).label} />
                <Row label="Number" value={c.phoneNumber || '—'} />
                <Row label="Address" value={c.address || '—'} />
                <Row label="Services" value={c.services.length ? c.services.join(', ') : '—'} />
                <Row label="Onboarded" value={c.onboardingCompletedAt ? 'Yes' : 'No'} />
                <Row label="Joined" value={fmtDate(c.createdAt)} />
              </div>

              <div className="border border-surface-border rounded-xl p-4">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.12em] mb-2">Staff · {c.staff.length}</h3>
                <div className="space-y-2.5">
                  {c.staff.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar name={s.fullName} className="w-6 h-6 text-[9px]" />
                        <div className="min-w-0">
                          <div className="text-xs text-text-primary truncate">{s.fullName}</div>
                          <div className="text-[10px] text-text-muted truncate">{s.email}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-text-secondary flex-shrink-0">{roleName(s.role)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan & billing */}
              <div className="border border-surface-border rounded-xl p-4 space-y-3">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.12em]">Plan &amp; billing</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Plan</label>
                  <select value={planInput} onChange={(e) => { setPlanInput(e.target.value as PlanTier); setPlanSaved(false); }} className={fieldCls}>
                    <option value="STARTER">Starter</option>
                    <option value="NAVIGATOR">Navigator</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Expires</label>
                  <input type="date" value={expiryInput} onChange={(e) => { setExpiryInput(e.target.value); setPlanSaved(false); }} className={fieldCls} />
                  <p className="text-[10px] text-text-muted">Leave blank for no expiry (e.g. a comped account).</p>
                </div>
                <button onClick={savePlan} disabled={planBusy} className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-brand-glow transition">
                  {planBusy ? <RefreshCw size={14} className="animate-spin" /> : planSaved ? <CheckCircle2 size={14} /> : null}
                  {planSaved ? 'Saved' : 'Save plan'}
                </button>
              </div>

              {/* Suspend / reactivate */}
              <div className={`rounded-xl p-4 border ${c.suspended ? 'border-status-success/20 bg-status-successBg/40' : 'border-status-danger/15 bg-status-dangerBg/40'}`}>
                <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
                  {c.suspended
                    ? 'This clinic is switched off — its staff can\'t log in and Zero ignores its patients. Reactivate to bring it back.'
                    : 'Switching off blocks staff login and makes Zero stop answering this clinic\'s patients on WhatsApp.'}
                </p>
                <button onClick={toggleSuspend} disabled={busy} className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-60 ${c.suspended ? 'bg-status-success text-white hover:opacity-90' : 'bg-status-danger text-white hover:opacity-90'}`}>
                  {busy ? <RefreshCw size={14} className="animate-spin" /> : c.suspended ? <RotateCcw size={14} /> : <Ban size={14} />}
                  {c.suspended ? 'Reactivate clinic' : 'Suspend clinic'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
