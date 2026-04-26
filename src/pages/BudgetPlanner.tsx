import React, { useState, useEffect, useRef } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { type BudgetPlanPeriod } from '../types';
import { NeonCard, NeonButton } from '../components/ui';

// ─── Constants ─────────────────────────────────────────────────────────────

const PERIODS: { key: BudgetPlanPeriod; label: string; icon: string; desc: string }[] = [
  { key: 'daily',   label: 'Daily Operation',    icon: 'schedule',  desc: 'Current cycle limit' },
  { key: 'weekly',  label: 'Weekly Sprint',   icon: 'date_range',  desc: '7-day resource allocation' },
  { key: '3months', label: 'Quarterly Audit', icon: 'monitoring',  desc: '90-day trajectory' },
  { key: '6months', label: 'Semi-Annual Plan', icon: 'analytics', desc: '180-day forecast' },
  { key: '1year',   label: 'Annual Strategy',   icon: 'target',  desc: '365-day fiscal goal' },
];

const PALETTE = [
  '#E4FF6E', // action-neon
  '#C4B5FD', // data-lavender
  '#22D3EE', // cyan
  '#F472B6', // pink
  '#FB923C', // orange
];

// ─── Animated Ring ──────────────────────────────────────────────────────────

const Ring: React.FC<{ pct: number; color: string; size?: number; stroke?: number }> = ({
  pct, color, size = 120, stroke = 8,
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const safe = Math.min(Math.max(pct, 0), 100);
  const [animated, setAnimated] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const from = animated;
    const to = safe;
    const dur = 900;
    const step = (ts: number) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setAnimated(from + (to - from) * ease);
      if (prog < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safe]);

  const offset = circ - (animated / 100) * circ;
  const isWarning = safe >= 75 && safe < 100;
  const isDanger  = safe >= 100;
  const ringColor = isDanger ? '#ff4d4d' : isWarning ? '#fb923c' : color;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={ringColor} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${ringColor}88)`, transition: 'stroke 0.3s' }}
      />
    </svg>
  );
};

// ─── Alert Banner ───────────────────────────────────────────────────────────

const AlertBanner: React.FC<{ pct: number; currency: string; remaining: number }> = ({ pct, currency, remaining }) => {
  if (pct < 75) return null;
  const isDanger = pct >= 100;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border animate-pulse-slow text-microcopy font-black uppercase tracking-widest ${
      isDanger
        ? 'bg-red-500/10 border-red-500/30 text-red-400'
        : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
    }`}>
      <span className="material-symbols-outlined text-sm">warning</span>
      {isDanger
        ? `LIMIT EXCEEDED: ${currency}${Math.abs(remaining).toLocaleString()}`
        : `THRESHOLD ALERT: ${pct.toFixed(0)}% UTILIZED`}
    </div>
  );
};

// ─── Entry Row ──────────────────────────────────────────────────────────────

interface EntryDraft {
  label: string;
  amount: string;
  color: string;
}

const DEFAULT_ENTRY: EntryDraft = { label: '', amount: '', color: PALETTE[0] };

// ─── Plan Editor ────────────────────────────────────────────────────────────

const PlanEditor: React.FC<{
  period: BudgetPlanPeriod;
  currency: string;
  onClose: () => void;
}> = ({ period, currency, onClose }) => {
  const { budgetPlans, upsertBudgetPlan } = useExpenses();
  const existing = budgetPlans.find(p => p.period === period);

  const [totalBudget, setTotalBudget] = useState(existing ? existing.totalBudget.toString() : '');
  const [entries, setEntries] = useState<EntryDraft[]>(
    existing?.entries.map(e => ({ label: e.label, amount: e.amount.toString(), color: e.color }))
    ?? [{ ...DEFAULT_ENTRY }]
  );

  const addEntry = () => setEntries(prev => [...prev, { ...DEFAULT_ENTRY, color: PALETTE[prev.length % PALETTE.length] }]);
  const removeEntry = (i: number) => setEntries(prev => prev.filter((_, idx) => idx !== i));
  const updateEntry = (i: number, key: keyof EntryDraft, val: string) => {
    setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e));
  };

  const handleSave = () => {
    const total = parseFloat(totalBudget);
    if (isNaN(total) || total <= 0) return;
    const clean = entries
      .filter(e => e.label.trim() && !isNaN(parseFloat(e.amount)) && parseFloat(e.amount) > 0)
      .map(e => ({ label: e.label.trim(), amount: parseFloat(e.amount), color: e.color }));
    upsertBudgetPlan(period, total, clean);
    onClose();
  };

  const allocatedTotal = entries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const inputClasses = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-action-neon/50 transition-all text-sm";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <label className="text-microcopy text-text-muted font-black uppercase tracking-widest mb-1.5 block">
          CAPITAL CAP
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">{currency}</span>
          <input
            type="number" min="0" placeholder="0.00"
            value={totalBudget}
            onChange={e => setTotalBudget(e.target.value)}
            className={`${inputClasses} w-full pl-8 text-base font-black`}
          />
        </div>
      </div>

      {parseFloat(totalBudget) > 0 && allocatedTotal > parseFloat(totalBudget) && (
        <div className="text-microcopy font-black text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 uppercase tracking-tighter">
          ERROR: ALLOCATION ({currency}{allocatedTotal.toFixed(0)}) EXCEEDS CAP
        </div>
      )}

      <div>
        <label className="text-microcopy text-text-muted font-black uppercase tracking-widest mb-2 block">
          BREAKDOWN ARCHITECTURE
        </label>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={entry.color}
                  onChange={e => updateEntry(i, 'color', e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <div className="w-6 h-6 rounded bg-white/10 border border-white/20 cursor-pointer"
                  style={{ backgroundColor: entry.color }} />
              </div>
              <input
                type="text" placeholder="LABEL"
                value={entry.label}
                onChange={e => updateEntry(i, 'label', e.target.value)}
                className={`${inputClasses} flex-1 text-xs uppercase tracking-tight`}
              />
              <input
                type="number" min="0" placeholder="0"
                value={entry.amount}
                onChange={e => updateEntry(i, 'amount', e.target.value)}
                className={`${inputClasses} w-20 text-xs`}
              />
              <button onClick={() => removeEntry(i)}
                className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))}
        </div>

        <button onClick={addEntry}
          className="mt-3 flex items-center gap-1.5 text-action-neon hover:opacity-80 text-microcopy font-black uppercase tracking-widest transition-all">
          <span className="material-symbols-outlined text-sm">add</span> ADD ALLOCATION
        </button>
      </div>

      <div className="flex gap-2 pt-2">
        <NeonButton className="flex-1 text-microcopy font-black uppercase tracking-widest py-3" onClick={handleSave}>
          DEPLOY PLAN
        </NeonButton>
        <button onClick={onClose} className="px-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  );
};

// ─── Plan Card ──────────────────────────────────────────────────────────────

const PlanCard: React.FC<{
  period: BudgetPlanPeriod;
  label: string;
  icon: string;
  desc: string;
  currency: string;
  spentAmount: number;
}> = ({ period, label, icon, desc, currency, spentAmount }) => {
  const { budgetPlans, deleteBudgetPlan } = useExpenses();
  const plan = budgetPlans.find(p => p.period === period);
  const [editing, setEditing] = useState(false);

  const totalBudget = plan?.totalBudget ?? 0;
  const pct = totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0;
  const remaining = totalBudget - spentAmount;

  const ringColor = PALETTE[PERIODS.findIndex(p => p.key === period) % PALETTE.length];

  return (
    <NeonCard className="flex flex-col gap-6 group relative overflow-hidden inner-glow h-full cyber-border transition-all duration-500 hover:bg-white/[0.04]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-action-neon/5 blur-[80px] pointer-events-none group-hover:bg-action-neon/15 transition-all duration-1000" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 blur-[80px] pointer-events-none group-hover:bg-white/10 transition-all duration-1000" />
      <div className="scanline"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center text-action-neon group-hover:border-action-neon/50 transition-all shadow-2xl">
              <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#242424] ${plan ? 'bg-action-neon shadow-[0_0_8px_#E4FF6E]' : 'bg-neutral-600'}`}></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-base leading-tight uppercase tracking-[0.1em]">{label}</h3>
              <span className="text-[8px] px-1.5 py-0.5 rounded border border-white/10 text-text-muted font-black tracking-tighter">PROTO-{period.toUpperCase()}</span>
            </div>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] mt-0.5">{desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
          {plan && (
            <button onClick={() => deleteBudgetPlan(plan.id)}
              className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          )}
          <button onClick={() => setEditing(e => !e)}
            className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/10 transition-all">
            <span className="material-symbols-outlined text-base">{editing ? 'close' : 'edit'}</span>
          </button>
        </div>
      </div>

      {editing ? (
        <PlanEditor period={period} currency={currency} onClose={() => setEditing(false)} />
      ) : plan ? (
        <div className="flex flex-col gap-6 relative z-10 flex-1">
          <AlertBanner pct={pct} currency={currency} remaining={remaining} />

          <div className="flex items-center gap-8 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <div className="relative shrink-0 scale-110">
              <Ring pct={pct} color={ringColor} size={90} stroke={5} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-white">{pct.toFixed(0)}%</span>
                <span className="text-[7px] text-text-muted uppercase font-black tracking-tighter -mt-1">STRESS</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col">
                <span className="text-[9px] text-text-muted uppercase font-black tracking-[0.2em] mb-1">CAPITAL CEILING</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white font-h1">{currency}{totalBudget.toLocaleString()}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                <div className="flex flex-col">
                  <span className="text-[8px] text-text-muted uppercase font-black tracking-widest mb-1">DRAINAGE</span>
                  <span className="font-black text-red-400 text-sm tracking-tight">{currency}{spentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-text-muted uppercase font-black tracking-widest mb-1">CAPACITY</span>
                  <span className={`font-black text-sm tracking-tight ${remaining >= 0 ? 'text-action-neon' : 'text-red-400'}`}>
                    {currency}{remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {plan.entries.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em]">Operational Breakdown</p>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-action-neon/50"></div>
                  <div className="w-1 h-1 bg-action-neon"></div>
                  <div className="w-1 h-1 bg-action-neon/50"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {plan.entries.slice(0, 4).map(entry => {
                  const entryPct = totalBudget > 0 ? (entry.amount / totalBudget) * 100 : 0;
                  return (
                    <div key={entry.id} className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] text-white font-black uppercase tracking-tight truncate w-20">
                          {entry.label}
                        </span>
                        <span className="text-[8px] text-text-muted font-black">{entryPct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{ width: `${Math.min(entryPct, 100)}%`, backgroundColor: entry.color,
                            boxShadow: `0 0 6px ${entry.color}88` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 gap-5 text-center relative z-10 flex-1 border-2 border-dashed border-white/5 rounded-2xl group-hover:border-action-neon/20 transition-all bg-black/20">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-neutral-700 group-hover:text-action-neon/40 transition-all group-hover:scale-110 duration-500">
              <span className="material-symbols-outlined text-4xl">terminal</span>
            </div>
            <div className="absolute inset-0 border border-action-neon/0 rounded-full group-hover:border-action-neon/30 group-hover:scale-125 transition-all duration-700 animate-pulse-slow"></div>
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em]">AWAITING MISSION INTEL</p>
            <p className="text-[9px] text-neutral-600 uppercase tracking-widest mt-1.5 font-bold">No budget protocol detected in sector</p>
          </div>
          <button 
            onClick={() => setEditing(true)} 
            className="group/btn relative px-6 py-2.5 rounded-xl bg-action-neon text-black text-[9px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(228,255,110,0.2)] overflow-hidden"
          >
            <span className="relative z-10">INITIALIZE PROTOCOL</span>
            <div className="absolute inset-0 shimmer opacity-20"></div>
          </button>
        </div>
      )}
    </NeonCard>
  );
};

// ─── Budget Planner Page ─────────────────────────────────────────────────────

export const BudgetPlanner: React.FC = () => {
  const { settings, expenses } = useExpenses();

  const spentByPeriod = (period: BudgetPlanPeriod): number => {
    const now = new Date();
    const filtered = expenses.filter(e => {
      const d = new Date(e.date);
      switch (period) {
        case 'daily':   return d.toDateString() === now.toDateString();
        case 'weekly': {
          const start = new Date(now); start.setDate(now.getDate() - now.getDay());
          const end   = new Date(start); end.setDate(start.getDate() + 6);
          return d >= start && d <= end;
        }
        case '3months': {
          const start = new Date(now); start.setMonth(now.getMonth() - 3);
          return d >= start && d <= now;
        }
        case '6months': {
          const start = new Date(now); start.setMonth(now.getMonth() - 6);
          return d >= start && d <= now;
        }
        case '1year': {
          const start = new Date(now); start.setFullYear(now.getFullYear() - 1);
          return d >= start && d <= now;
        }
        default: return false;
      }
    });
    return filtered.reduce((s, e) => s + e.amount, 0);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Page header */}
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-black border border-action-neon/20 flex items-center justify-center shadow-lg shrink-0 inner-glow">
          <span className="material-symbols-outlined text-action-neon text-3xl">strategy</span>
        </div>
        <div>
          <h2 className="text-3xl font-black text-white uppercase font-h1 tracking-tight">Intelligence Planner</h2>
          <p className="text-microcopy text-text-muted uppercase tracking-widest mt-1">Configure fiscal protocols and threshold monitoring</p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {PERIODS.map(p => (
          <PlanCard
            key={p.key}
            period={p.key}
            label={p.label}
            icon={p.icon}
            desc={p.desc}
            currency={settings.currency}
            spentAmount={spentByPeriod(p.key)}
          />
        ))}
      </div>
    </div>
  );
};
