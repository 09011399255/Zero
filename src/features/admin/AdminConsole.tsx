// Zero platform-admin console. Reached at /admin, gated by isPlatformAdmin in
// App (and independently by the backend's requirePlatformAdmin on every call).
// A light shell with three tabs: Overview, Clinics, and the WhatsApp pipeline.

import { useEffect, useState } from 'react';
import {
  AlertTriangle, ArrowLeft, Ban, Building2, CheckCircle2, CreditCard, LayoutGrid,
  MessageSquare, RefreshCw, RotateCcw, ScrollText, Search, Users, X,
} from 'lucide-react';
import {
  api, AdminOverview as OverviewStats, AdminClinicRow, AdminClinicDetail,
  AdminBilling, AdminAuditEntry, AdminStaffMember, PlanTier, WhatsAppStatus,
} from '../../api';
import { AdminWhatsApp } from './AdminDashboard';

type View = 'overview' | 'clinics' | 'billing' | 'staff' | 'audit' | 'whatsapp';

function planName(p: string) { return p[0] + p.slice(1).toLowerCase(); }
function roleName(r: string) { return r[0] + r.slice(1).toLowerCase(); }
function fmtNaira(n: number) { return `₦${n.toLocaleString()}`; }
function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}
function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const AUDIT_LABEL: Record<string, string> = {
  'clinic.suspend': 'Suspended clinic',
  'clinic.reactivate': 'Reactivated clinic',
  'clinic.plan_change': 'Changed plan',
  'whatsapp.send_code': 'Sent WhatsApp code',
  'whatsapp.mark_connected': 'Marked WhatsApp connected',
  'whatsapp.reset': 'Reset WhatsApp connection',
  'staff.deactivate': 'Deactivated staff',
  'staff.activate': 'Activated staff',
};

const WA_LABEL: Record<WhatsAppStatus, { label: string; tone: string }> = {
  CONNECTED: { label: 'Live', tone: 'text-status-success' },
  AWAITING_OTP: { label: 'Awaiting code', tone: 'text-status-warning' },
  VERIFICATION_PENDING: { label: 'Pending', tone: 'text-status-warning' },
  NOT_CONNECTED: { label: 'Not connected', tone: 'text-text-muted' },
  SANDBOX: { label: 'Sandbox', tone: 'text-text-muted' },
};

function planBadge(plan: string) {
  const map: Record<string, string> = {
    ENTERPRISE: 'bg-ai-500/10 text-ai-600 border-ai-500/20',
    NAVIGATOR: 'bg-brand-50 text-brand-600 border-brand-100',
  };
  return map[plan] || 'bg-surface-subtle text-text-secondary border-surface-border';
}

function fmtMonth(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

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
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="w-9 h-9 rounded-xl border border-surface-border bg-surface-base hover:bg-surface-subtle flex items-center justify-center text-text-secondary transition"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Zero Admin</h1>
            <p className="text-[11px] text-text-muted">Internal — Zero team only</p>
          </div>
        </div>

        <div className="flex gap-1 border-b border-surface-border">
          {tabs.map((t) => {
            const active = view === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setView(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition ${
                  active
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                <t.icon size={15} />
                {t.label}
              </button>
            );
          })}
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

  if (loading) {
    return <div className="py-16 text-center text-text-muted text-sm flex items-center justify-center gap-2"><RefreshCw size={16} className="animate-spin" /> Loading…</div>;
  }
  if (!stats) {
    return <p className="text-sm text-text-muted">Couldn't load platform stats.</p>;
  }

  const tiles: { label: string; display: string; tone?: string }[] = [
    { label: 'Clinics', display: stats.clinics.toLocaleString() },
    { label: 'Active', display: stats.active.toLocaleString(), tone: 'text-status-success' },
    { label: 'Suspended', display: stats.suspended.toLocaleString(), tone: stats.suspended ? 'text-status-danger' : undefined },
    { label: 'MRR', display: fmtNaira(stats.mrr) },
    { label: 'WhatsApp live', display: stats.whatsappConnected.toLocaleString() },
    { label: 'New this month', display: stats.newThisMonth.toLocaleString() },
    { label: 'Patients', display: stats.patients.toLocaleString() },
    { label: 'Conversations', display: stats.conversations.toLocaleString() },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="bg-surface-base border border-surface-border/60 rounded-xl p-4">
            <div className="text-[11px] text-text-secondary">{t.label}</div>
            <div className={`text-2xl font-bold ${t.tone || 'text-text-primary'}`}>{t.display}</div>
          </div>
        ))}
      </div>
      <button
        onClick={onSeeClinics}
        className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
      >
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

  if (loading) {
    return <div className="py-16 text-center text-text-muted text-sm flex items-center justify-center gap-2"><RefreshCw size={16} className="animate-spin" /> Loading…</div>;
  }
  if (!data) return <p className="text-sm text-text-muted">Couldn't load billing.</p>;

  const List = ({ title, rows, empty, danger }: { title: string; rows: typeof data.renewalsDue; empty: string; danger?: boolean }) => (
    <section className="space-y-2">
      <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{title} ({rows.length})</h3>
      {rows.length === 0 ? (
        <p className="text-[11px] text-text-muted">{empty}</p>
      ) : (
        <div className="bg-surface-base border border-surface-border/60 rounded-xl divide-y divide-surface-border/60">
          {rows.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <div className="text-xs font-bold text-text-primary truncate">{c.name}</div>
                <div className="text-[10px] text-text-muted">{planName(c.plan)}</div>
              </div>
              <span className={`text-[11px] font-semibold ${danger ? 'text-status-danger' : 'text-text-secondary'}`}>
                {fmtDate(c.planExpiresAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-5">
      <div className="bg-surface-base border border-surface-border/60 rounded-xl p-4">
        <div className="text-[11px] text-text-secondary">Monthly recurring revenue</div>
        <div className="text-3xl font-bold text-text-primary">{fmtNaira(data.mrr)}</div>
        <p className="text-[10px] text-text-muted mt-1">
          From active clinics' plans. Set real prices in <code>zero-ai/src/modules/admin/pricing.ts</code>.
        </p>
      </div>

      <div className="bg-surface-base border border-surface-border/60 rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-text-secondary bg-surface-subtle">
              <th className="py-2.5 px-4 font-semibold">Plan</th>
              <th className="py-2.5 px-2 font-semibold text-right">Clinics</th>
              <th className="py-2.5 px-2 font-semibold text-right">Monthly</th>
              <th className="py-2.5 px-4 font-semibold text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.byPlan.map((b) => (
              <tr key={b.plan} className="border-t border-surface-border/60">
                <td className="py-2.5 px-4 font-bold text-text-primary">{planName(b.plan)}</td>
                <td className="py-2.5 px-2 text-right text-text-secondary">{b.count}</td>
                <td className="py-2.5 px-2 text-right text-text-secondary">{fmtNaira(b.monthly)}</td>
                <td className="py-2.5 px-4 text-right font-semibold text-text-primary">{fmtNaira(b.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
    try {
      setRows(await api.admin.staff(query));
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(''); }, []);

  const toggle = async (s: AdminStaffMember) => {
    setBusyId(s.id);
    setError(null);
    try {
      if (s.isActive) await api.admin.deactivateStaff(s.id);
      else await api.admin.activateStaff(s.id);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Action failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 border border-surface-border rounded-xl px-3 py-2 bg-surface-base">
          <Search size={15} className="text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search staff by name or email…"
            className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <button type="submit" className="px-3 py-2 rounded-xl border border-surface-border bg-surface-base hover:bg-surface-subtle text-text-secondary text-xs font-semibold transition">
          Search
        </button>
      </form>

      {error && (
        <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-start gap-2">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-surface-base border border-surface-border/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-text-secondary bg-surface-subtle">
                <th className="py-2.5 px-4 font-semibold">Name</th>
                <th className="py-2.5 px-2 font-semibold">Clinic</th>
                <th className="py-2.5 px-2 font-semibold">Role</th>
                <th className="py-2.5 px-2 font-semibold">Status</th>
                <th className="py-2.5 px-2 font-semibold">Last login</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-text-muted">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-text-muted">No staff found.</td></tr>
              ) : rows.map((s) => (
                <tr key={s.id} className="border-t border-surface-border/60">
                  <td className="py-2.5 px-4">
                    <div className="font-bold text-text-primary">{s.fullName}</div>
                    <div className="text-[11px] text-text-muted">{s.email}</div>
                  </td>
                  <td className="py-2.5 px-2 text-text-secondary">{s.clinic?.name || '—'}</td>
                  <td className="py-2.5 px-2 text-text-secondary">{roleName(s.role)}</td>
                  <td className="py-2.5 px-2">
                    {s.isActive
                      ? <span className="text-status-success font-semibold">Active</span>
                      : <span className="text-status-danger font-semibold">Disabled</span>}
                  </td>
                  <td className="py-2.5 px-2 text-text-secondary">{s.lastLoginAt ? fmtDate(s.lastLoginAt) : 'Never'}</td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => toggle(s)}
                      disabled={busyId === s.id}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition disabled:opacity-60 ${
                        s.isActive
                          ? 'border-status-danger/30 text-status-danger hover:bg-status-dangerBg'
                          : 'border-status-success/30 text-status-success hover:bg-status-successBg'
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

function Audit() {
  const [rows, setRows] = useState<AdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.audit().then(setRows).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-text-muted text-sm flex items-center justify-center gap-2"><RefreshCw size={16} className="animate-spin" /> Loading…</div>;
  }
  if (rows.length === 0) {
    return <p className="text-sm text-text-muted py-8 text-center">No admin actions recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((e) => (
        <div key={e.id} className="flex items-start justify-between gap-3 bg-surface-base border border-surface-border/60 rounded-xl px-4 py-2.5">
          <div className="min-w-0">
            <div className="text-xs font-bold text-text-primary">
              {AUDIT_LABEL[e.action] || e.action}{e.detail ? <span className="text-text-secondary font-normal"> · {e.detail}</span> : null}
            </div>
            <div className="text-[10px] text-text-muted truncate">
              {e.clinicName || '—'} · by {e.actorEmail}
            </div>
          </div>
          <span className="text-[10px] text-text-muted whitespace-nowrap flex-shrink-0">{fmtDateTime(e.createdAt)}</span>
        </div>
      ))}
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
    try {
      setRows(await api.admin.clinics());
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load clinics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) =>
    `${r.name} ${r.adminEmail ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 border border-surface-border rounded-xl px-3 py-2 bg-surface-base">
          <Search size={15} className="text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clinics or email…"
            className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-surface-border bg-surface-base hover:bg-surface-subtle text-text-secondary text-xs font-semibold transition"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-start gap-2">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-surface-base border border-surface-border/60 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-text-secondary bg-surface-subtle">
                <th className="py-2.5 px-4 font-semibold">Clinic</th>
                <th className="py-2.5 px-2 font-semibold">Plan</th>
                <th className="py-2.5 px-2 font-semibold">Status</th>
                <th className="py-2.5 px-2 font-semibold">WhatsApp</th>
                <th className="py-2.5 px-2 font-semibold text-right">Patients</th>
                <th className="py-2.5 px-2 font-semibold text-right">Staff</th>
                <th className="py-2.5 px-2 font-semibold">Joined</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-text-muted">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-text-muted">No clinics found.</td></tr>
              ) : filtered.map((c) => {
                const wa = WA_LABEL[c.whatsappStatus];
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className="border-t border-surface-border/60 hover:bg-surface-subtle cursor-pointer"
                  >
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-text-primary">{c.name}</div>
                      <div className="text-[11px] text-text-muted">{c.adminEmail || '—'}</div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${planBadge(c.plan)}`}>
                        {c.plan[0] + c.plan.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      {c.suspended
                        ? <span className="text-status-danger font-semibold">Suspended</span>
                        : <span className="text-status-success font-semibold">Active</span>}
                    </td>
                    <td className={`py-2.5 px-2 ${wa.tone}`}>{wa.label}</td>
                    <td className="py-2.5 px-2 text-right text-text-secondary">{c.patientCount.toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-right text-text-secondary">{c.staffCount}</td>
                    <td className="py-2.5 px-2 text-text-secondary">{fmtMonth(c.createdAt)}</td>
                    <td className="py-2.5 px-4 text-right text-text-muted">›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId && (
        <ClinicDetailDrawer
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={load}
        />
      )}
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
    } catch (err: any) {
      setError(err?.message || 'Failed to load clinic.');
    } finally {
      setLoading(false);
    }
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
    } catch (err: any) {
      setError(err?.message || 'Couldn\'t update the plan.');
    } finally {
      setPlanBusy(false);
    }
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
    } catch (err: any) {
      setError(err?.message || 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between gap-3 py-1.5 text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary text-right">{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md bg-surface-base h-full overflow-y-auto p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-text-primary">{c?.name || 'Clinic'}</h2>
            {c && (
              <span className={`text-[10px] font-bold ${c.suspended ? 'text-status-danger' : 'text-status-success'}`}>
                {c.suspended ? 'Suspended' : 'Active'}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary transition" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-start gap-2">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading || !c ? (
          <div className="py-16 text-center text-text-muted text-sm flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin" /> Loading…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Patients', value: c.counts.patients },
                { label: 'Appointments', value: c.counts.appointments },
                { label: 'Chats', value: c.counts.conversations },
              ].map((t) => (
                <div key={t.label} className="bg-surface-subtle rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-text-primary">{t.value.toLocaleString()}</div>
                  <div className="text-[10px] text-text-muted">{t.label}</div>
                </div>
              ))}
            </div>

            <div className="border border-surface-border/60 rounded-xl p-4">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Profile</h3>
              <Row label="Plan" value={c.plan[0] + c.plan.slice(1).toLowerCase()} />
              <Row label="WhatsApp" value={WA_LABEL[c.whatsappStatus].label} />
              <Row label="Number" value={c.phoneNumber || '—'} />
              <Row label="Address" value={c.address || '—'} />
              <Row label="Services" value={c.services.length ? c.services.join(', ') : '—'} />
              <Row label="Onboarded" value={c.onboardingCompletedAt ? 'Yes' : 'No'} />
              <Row label="Joined" value={fmtMonth(c.createdAt)} />
            </div>

            <div className="border border-surface-border/60 rounded-xl p-4">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Staff ({c.staff.length})</h3>
              <div className="space-y-2">
                {c.staff.map((s) => (
                  <div key={s.id} className="flex justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="text-text-primary truncate">{s.fullName}</div>
                      <div className="text-[10px] text-text-muted truncate">{s.email}</div>
                    </div>
                    <span className="text-[10px] text-text-secondary flex-shrink-0">{s.role[0] + s.role.slice(1).toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan & billing */}
            <div className="border border-surface-border/60 rounded-xl p-4 space-y-3">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Plan &amp; billing</h3>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Plan</label>
                <select
                  value={planInput}
                  onChange={(e) => { setPlanInput(e.target.value as PlanTier); setPlanSaved(false); }}
                  className="w-full py-2.5 px-3 rounded-xl border border-surface-border bg-surface-base text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                >
                  <option value="STARTER">Starter</option>
                  <option value="NAVIGATOR">Navigator</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Expires</label>
                <input
                  type="date"
                  value={expiryInput}
                  onChange={(e) => { setExpiryInput(e.target.value); setPlanSaved(false); }}
                  className="w-full py-2.5 px-3 rounded-xl border border-surface-border bg-surface-base text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                <p className="text-[10px] text-text-muted">Leave blank for no expiry (e.g. a comped account).</p>
              </div>
              <button
                onClick={savePlan}
                disabled={planBusy}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
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
              <button
                onClick={toggleSuspend}
                disabled={busy}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-60 ${
                  c.suspended
                    ? 'bg-status-success text-white hover:opacity-90'
                    : 'bg-status-danger text-white hover:opacity-90'
                }`}
              >
                {busy ? <RefreshCw size={14} className="animate-spin" /> : c.suspended ? <RotateCcw size={14} /> : <Ban size={14} />}
                {c.suspended ? 'Reactivate clinic' : 'Suspend clinic'}
              </button>
            </div>

            {c.suspended && (
              <p className="text-[10px] text-text-muted text-center flex items-center justify-center gap-1">
                <CheckCircle2 size={11} /> Reactivation is instant.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
