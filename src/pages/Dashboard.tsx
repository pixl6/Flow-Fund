import React, { useMemo, useState, useRef } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { ProgressBar } from '../components/ui';
import dayjs from 'dayjs';
import { Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Inline budget editor ─────────────────────────────────────────────────────

const BudgetEditor: React.FC<{
  value: number;
  currency: string;
  categorySum?: number;
  onSave: (val: number) => void;
  onClear?: () => void;
}> = ({ value, currency, onSave, onClear }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value.toString());
  const inputRef              = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setDraft(value > 0 ? value.toString() : '');
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n) && n > 0) { onSave(n); }
    setEditing(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter')  commit();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-2 animate-in fade-in zoom-in-95 duration-200">
        <span className="text-xl font-black text-text-muted">{currency}</span>
        <input
          ref={inputRef}
          type="number"
          min="0"
          step="0.01"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder="0.00"
          className="w-32 bg-white/5 border-b-2 border-action-neon py-1 text-2xl font-black text-white outline-none transition-all placeholder-neutral-800"
        />
        <button onClick={commit} className="p-2 text-action-neon hover:scale-110 transition-transform">
          <span className="material-symbols-outlined">check</span>
        </button>
         <button onClick={() => setEditing(false)} className="p-2 text-white/40 hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
        {onClear && (
          <button 
            onClick={() => { onClear(); setEditing(false); }} 
            className="p-2 text-orange-400 hover:text-white transition-colors"
            title="Reset to category sum"
          >
            <span className="material-symbols-outlined">restart_alt</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-3 cursor-pointer group/budget" onClick={handleStartEdit}>
      <span className="text-[52px] font-black tracking-tighter text-white font-h1 transition-colors group-hover/budget:text-action-neon">
        {currency}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <div className="flex flex-col opacity-0 group-hover/budget:opacity-100 transition-opacity">
        <span className="text-[10px] text-action-neon font-black uppercase tracking-widest">EDIT CAPITAL</span>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const { budgets, expenses, settings, updateSettings } = useExpenses();

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => dayjs(e.date).format('YYYY-MM') === settings.monthYear);
  }, [expenses, settings.monthYear]);

  const categorySum  = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalBudget  = settings.monthlyBudget ?? categorySum;
  const totalSpent   = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining    = totalBudget - totalSpent;
  const percentUsed  = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isRisk       = percentUsed >= 75 && percentUsed < 100;
  const isExceeded   = percentUsed >= 100;

  const chartData = useMemo(() => {
    const [yearStr, monthStr] = settings.monthYear.split('-');
    const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
    const isCurrentMonth = dayjs().format('YYYY-MM') === settings.monthYear;
    const today = isCurrentMonth ? dayjs().date() : daysInMonth;
    
    const expensesByDay: Record<number, number> = {};
    currentMonthExpenses.forEach(e => {
      const day = dayjs(e.date).date();
      expensesByDay[day] = (expensesByDay[day] || 0) + e.amount;
    });

    const data = [];
    let cumulative = 0;
    const avgBurn = today > 0 ? totalSpent / today : 0;
    
    // If no expenses yet, show a nice mock slope so the graph looks active
    const useMockData = totalSpent === 0;

    for (let i = 1; i <= daysInMonth; i++) {
      if (useMockData) {
        // Generate a smooth rising curve for demonstration
        const mockVal = 100 + Math.sin(i / 3) * 30 + (i * 15);
        if (i <= today) {
          data.push({ name: `Day ${i}`, Actual: Math.round(mockVal), Projected: i === today ? Math.round(mockVal) : null });
        } else {
          data.push({ name: `Day ${i}`, Actual: null, Projected: Math.round(mockVal) });
        }
      } else {
        if (i <= today) {
          cumulative += (expensesByDay[i] || 0);
          data.push({
            name: `Day ${i}`,
            Actual: cumulative,
            Projected: i === today ? cumulative : null,
          });
        } else {
          data.push({
            name: `Day ${i}`,
            Actual: null,
            Projected: cumulative + (avgBurn * (i - today))
          });
        }
      }
    }
    return data;
  }, [currentMonthExpenses, settings.monthYear, totalSpent]);

  const handleSaveBudget = (val: number) => updateSettings({ monthlyBudget: val });
  const handleClearBudget = () => updateSettings({ monthlyBudget: undefined });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-12 gap-6">
        {/* Main Balance Card */}
        <section className="col-span-12 lg:col-span-7 bg-[#242424] border border-white/10 rounded-xl p-8 flex flex-col justify-between relative overflow-hidden inner-glow h-[320px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E4FF6E]/5 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-widget-title text-text-muted uppercase mb-1 font-widget-title tracking-widest">Total Intelligence Capital</h3>
                <BudgetEditor
                  value={totalBudget}
                  currency={settings.currency}
                  categorySum={categorySum}
                  onSave={handleSaveBudget}
                  onClear={handleClearBudget}
                />
              </div>
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-tighter uppercase transition-all duration-500 ${
                isExceeded 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' 
                  : isRisk
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                    : 'bg-[#E4FF6E]/10 text-action-neon border border-[#E4FF6E]/20'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isExceeded ? 'bg-red-400' : isRisk ? 'bg-orange-400' : 'bg-action-neon'}`}></div>
                {isExceeded ? 'Limit Exceeded' : isRisk ? 'Risk Zone Detected' : `${Math.max(0, 100 - percentUsed).toFixed(1)}% Safe`}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                <span className="text-microcopy text-text-muted block mb-1 uppercase tracking-widest">TOTAL DRAIN</span>
                <span className={`text-lg font-bold transition-colors ${isExceeded ? 'text-red-400' : isRisk ? 'text-orange-400' : 'text-white'}`}>
                  {settings.currency}{totalSpent.toLocaleString()}
                </span>
                <ProgressBar 
                  percentage={Math.min(percentUsed, 100)} 
                  className="mt-3" 
                  colorClass={isExceeded ? 'bg-red-500' : isRisk ? 'bg-orange-500' : 'bg-action-neon'} 
                />
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                <span className="text-microcopy text-text-muted block mb-1 uppercase tracking-widest">REMAINING</span>
                <span className={`text-lg font-bold ${remaining >= 0 ? 'text-data-lavender' : 'text-red-400'}`}>
                  {remaining < 0 ? '-' : ''}{settings.currency}{Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <ProgressBar percentage={remaining > 0 ? (remaining / (totalBudget || 1)) * 100 : 0} className="mt-3" colorClass="bg-data-lavender" />
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                <span className="text-microcopy text-text-muted block mb-1 uppercase tracking-widest">EFFICIENCY</span>
                <span className={`text-lg font-bold ${isExceeded ? 'text-red-400' : 'text-white'}`}>
                  {Math.max(0, 100 - percentUsed).toFixed(0)}%
                </span>
                <div className="h-1 w-full bg-white/5 mt-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${isExceeded ? 'bg-red-500' : isRisk ? 'bg-orange-500' : 'bg-action-neon'}`} 
                    style={{ width: `${Math.max(0, 100 - percentUsed)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Trend Chart Section */}
        <section className="col-span-12 lg:col-span-5 bg-[#242424] border border-white/10 rounded-xl p-6 inner-glow flex flex-col justify-between overflow-hidden h-[320px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-action-neon glow-neon"></div>
                <h3 className="text-widget-title text-text-muted uppercase font-widget-title tracking-widest">Expenditure Trajectory</h3>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <div className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Burn Rate</div>
                  <div className="text-sm font-bold text-action-neon">{settings.currency}{(totalSpent / Math.max(1, dayjs().date())).toFixed(2)}/day</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Projected</div>
                  <div className="text-sm font-bold text-data-lavender">
                    {settings.currency}
                    {(() => {
                      const [year, month] = settings.monthYear.split('-');
                      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
                      return ((totalSpent / Math.max(1, dayjs().date())) * daysInMonth).toLocaleString(undefined, { maximumFractionDigits: 0 });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative flex-1 mt-2 -mx-4 -mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E4FF6E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E4FF6E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C4B5FD" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis 
                  stroke="#555555" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${settings.currency}${value}`}
                  width={50}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Actual" stroke="#E4FF6E" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="Projected" stroke="#C4B5FD" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorProjected)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Categories Section */}
        <section className="col-span-12 lg:col-span-8 bg-[#242424] border border-white/10 rounded-xl p-8 inner-glow">
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-1">Intelligence Nodes</h3>
              <p className="text-[10px] text-text-muted uppercase tracking-[0.3em]">Active Sector Monitoring</p>
            </div>
            <button className="text-action-neon text-[10px] font-black flex items-center gap-1 hover:text-white transition-all tracking-[0.2em] border-b border-action-neon/30 pb-1">
              EXPAND MAPPING <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {budgets.slice(0, 6).map((b, idx) => (
              <div key={b.category} className="relative p-5 bg-white/[0.03] rounded-xl border border-white/5 hover:border-action-neon/30 hover:bg-white/[0.06] transition-all group cyber-border overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                  <span className="text-[32px] font-black text-white italic tracking-tighter select-none">0{idx + 1}</span>
                </div>
                
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center border border-white/10 group-hover:border-action-neon/50 transition-all shadow-xl">
                    <span className="material-symbols-outlined text-xl text-action-neon group-hover:scale-110 transition-transform">
                      {idx % 2 === 0 ? 'monitoring' : 'data_thresholding'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="font-black text-white text-base uppercase tracking-tight">{b.category}</p>
                      <p className="text-sm font-black text-white/90">{settings.currency}{b.spent.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] text-text-muted font-black uppercase tracking-widest">SECTOR LOAD</span>
                      <span className="text-[9px] text-action-neon font-black tracking-widest">{(b.spent / (b.monthlyLimit || 1) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-action-neon shadow-[0_0_8px_rgba(228,255,110,0.5)] transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min((b.spent / (b.monthlyLimit || 1)) * 100, 100)}%` }}
                      >
                        <div className="absolute inset-0 shimmer opacity-30"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mini Donut Charts / Goals */}
        <section className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[#242424] border border-white/10 rounded-xl p-8 inner-glow">
            <h3 className="text-widget-title text-text-muted uppercase mb-6 font-widget-title tracking-widest">Operational Efficiency</h3>
            <div className="flex items-center justify-around">
              <div className="relative w-28 h-28">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="transparent" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="2.5"></path>
                  <path className={`${isExceeded ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : isRisk ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'text-action-neon drop-shadow-[0_0_8px_rgba(228,255,110,0.5)]'} transition-all duration-1000`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="transparent" stroke="currentColor" strokeDasharray={`${Math.max(0, 100 - percentUsed).toFixed(0)}, 100`} strokeLinecap="round" strokeWidth="2.5"></path>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${isExceeded ? 'text-red-400' : 'text-white'}`}>
                    {Math.max(0, 100 - percentUsed).toFixed(0)}%
                  </span>
                  <span className="text-[8px] text-text-muted uppercase tracking-widest font-black">STABILITY</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className={`flex items-center gap-2 transition-opacity duration-500 ${!isRisk && !isExceeded ? 'opacity-100' : 'opacity-30'}`}>
                  <span className={`w-2 h-2 rounded-full ${!isRisk && !isExceeded ? 'bg-action-neon shadow-[0_0_8px_#E4FF6E]' : 'bg-white/10'}`}></span>
                  <span className={`text-[10px] uppercase font-black tracking-widest transition-colors ${!isRisk && !isExceeded ? 'text-white' : 'text-text-muted'}`}>OPTIMAL</span>
                </div>
                <div className={`flex items-center gap-2 transition-opacity duration-500 ${isRisk || isExceeded ? 'opacity-100' : 'opacity-30'}`}>
                  <span className={`w-2 h-2 rounded-full ${isExceeded ? 'bg-red-500 shadow-[0_0_8px_#EF4444]' : isRisk ? 'bg-orange-500 shadow-[0_0_8px_#F97316]' : 'bg-white/10'}`}></span>
                  <span className={`text-[10px] uppercase font-black tracking-widest transition-colors ${isExceeded ? 'text-red-400' : isRisk ? 'text-orange-400' : 'text-text-muted'}`}>RISK ZONE</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#242424] border border-white/10 rounded-xl p-8 inner-glow bg-gradient-to-br from-[#242424] to-[#2a2a2a]">
            <h3 className="text-widget-title text-text-muted uppercase mb-4 font-widget-title tracking-widest">AI Intelligence</h3>
            <div className="flex items-start gap-4 mb-6">
              <div className="h-10 w-10 rounded-xl bg-data-lavender/20 flex items-center justify-center shrink-0 border border-data-lavender/30">
                <Sparkles size={18} className="text-data-lavender" />
              </div>
              <p className="text-body text-on-surface leading-relaxed text-sm">
                {remaining > 0 ? (
                  <>System analysis suggests reallocating <span className="text-action-neon font-bold">{settings.currency}{(remaining * 0.4).toFixed(0)}</span> to secure reserves based on current velocity.</>
                ) : (
                  <>Immediate <span className="text-red-400 font-bold">Austerity Protocols</span> recommended. Intelligence identifies a <span className="text-red-400 font-bold">{settings.currency}{Math.abs(remaining).toFixed(0)}</span> deficit in operational capital.</>
                )}
              </p>
            </div>
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-microcopy font-black text-white uppercase hover:bg-action-neon hover:text-black transition-all tracking-[0.2em]">
              EXECUTE REALLOCATION
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
