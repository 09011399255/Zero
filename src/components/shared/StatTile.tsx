import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

// ── Shared premium KPI building blocks ──────────────────────────────────────
// Inline area-sparkline, trend chip, and the analytics tile that wraps them.
// Used on the dashboard hero + KPI row and as the summary strip on the list
// screens, so every metric across the app reads as one system.

export function Sparkline({ data, color, id, className }: { data: number[]; color: string; id: string; className?: string }) {
  const w = 128, h = 44;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 3 - ((d - min) / range) * (h - 10);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = 'M' + pts.join(' L');
  const area = `${line} L${w},${h} L0,${h} Z`;
  const last = pts[pts.length - 1].split(',').map(Number);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className ?? 'w-full h-11 overflow-visible'}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

export function TrendChip({ dir, value }: { dir: 'up' | 'down'; value: string }) {
  const up = dir === 'up';
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
      up ? 'bg-status-successBg text-status-success' : 'bg-status-dangerBg text-status-danger'
    }`}>
      <Icon size={12} strokeWidth={2.5} />
      {value}
    </span>
  );
}

export interface StatTileProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent: string;            // hex, e.g. '#2563EB'
  iconClass: string;         // tailwind bg + text, e.g. 'bg-brand-50 text-brand-500'
  trend?: { dir: 'up' | 'down'; value: string };
  spark?: number[];
  id: string;                // unique key for the sparkline gradient
}

export function StatTile({ label, value, sub, icon: Icon, accent, iconClass, trend, spark, id }: StatTileProps) {
  return (
    <div className="group relative overflow-hidden bg-surface-base rounded-2xl border border-surface-border shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 p-5">
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} aria-hidden="true" />
      <span className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl opacity-[0.10]" style={{ background: accent }} aria-hidden="true" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center ring-1 ring-inset ring-black/[0.03] ${iconClass}`}>
            <Icon size={18} />
          </span>
          <span className="text-[11px] text-text-secondary font-bold tracking-[0.1em] uppercase">{label}</span>
        </div>
        {trend && <TrendChip dir={trend.dir} value={trend.value} />}
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[46px] font-bold text-text-primary leading-[0.9] tracking-tighter2 tabular-nums">{value}</div>
          {sub && <div className="text-[11px] text-text-muted font-medium mt-2">{sub}</div>}
        </div>
        {spark && (
          <div className="w-32 flex-shrink-0 self-end">
            <Sparkline data={spark} color={accent} id={id} />
          </div>
        )}
      </div>
    </div>
  );
}
