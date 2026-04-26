import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { NeonCard } from '../components/ui';
import { ExpenseList } from '../components/ExpenseList';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

export const Reports: React.FC = () => {
  const { expenses, settings } = useExpenses();
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const isDateMatch = dayjs(e.date).isBetween(startDate, endDate, 'day', '[]');
      const isCatMatch = selectedCategory === 'All' || e.category === selectedCategory;
      return isDateMatch && isCatMatch;
    });
  }, [expenses, startDate, endDate, selectedCategory]);

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Category', 'Amount', 'Description', 'Created At'];
    const rows = filteredExpenses.map(e => [
      e.id,
      e.date,
      e.category,
      e.amount.toString(),
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-black border border-action-neon/20 flex items-center justify-center shadow-lg shrink-0 inner-glow">
          <span className="material-symbols-outlined text-action-neon text-3xl">analytics</span>
        </div>
        <div>
          <h2 className="text-3xl font-black text-white uppercase font-h1 tracking-tight">Audit Terminal</h2>
          <p className="text-microcopy text-text-muted uppercase tracking-widest mt-1">Execute deep scan and fiscal export protocols</p>
        </div>
      </div>

      <NeonCard className="inner-glow cyber-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-action-neon/5 blur-[100px] pointer-events-none"></div>
        <div className="scanline"></div>

        <div className="relative z-10">
          <div className="grid grid-cols-12 gap-8 mb-12">
            <div className="col-span-12 lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <label className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2.5">
                  <span className="material-symbols-outlined text-sm text-action-neon">event_repeat</span> RANGE START
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none focus:border-action-neon/50 transition-all"
                />
              </div>
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <label className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2.5">
                  <span className="material-symbols-outlined text-sm text-action-neon">event_available</span> RANGE END
                </label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none focus:border-action-neon/50 transition-all"
                />
              </div>
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <label className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2.5">
                  <span className="material-symbols-outlined text-sm text-action-neon">hub</span> SECTOR
                </label>
                <select 
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-bold outline-none focus:border-action-neon/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="All">ALL SECTORS</option>
                  {settings.categories.map((c: string) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-3 flex items-end">
              <button 
                onClick={exportCSV} 
                className="w-full h-[64px] bg-action-neon hover:bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all shadow-[0_0_20px_rgba(228,255,110,0.2)] active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                EXPORT INTEL
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-black text-white uppercase tracking-tight">Audit Log</h2>
                  <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] text-text-muted font-black tracking-widest">
                    {filteredExpenses.length} ENTRIES
                  </div>
                </div>
              </div>
              <ExpenseList expenses={filteredExpenses} onEdit={() => {}} />
            </div>

            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-8 space-y-6">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <span className="material-symbols-outlined text-6xl">account_balance</span>
                  </div>
                  <span className="text-[9px] text-text-muted uppercase font-black tracking-[0.3em] block mb-4">Aggregated Capital Drain</span>
                  <span className="text-4xl font-black text-action-neon font-h1 tracking-tighter block mb-2 shadow-neon">
                    {settings.currency}{totalFiltered.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-action-neon animate-pulse"></span>
                    Verified Scan Result
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
                  <h3 className="text-[10px] text-white font-black uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2">Fiscal Insight</h3>
                  <p className="text-xs text-text-muted leading-relaxed font-medium">
                    The current filtered set represents <span className="text-white font-bold">{(totalFiltered / (expenses.reduce((s,e) => s+e.amount, 1))).toFixed(1)}%</span> of total lifetime drainage. Velocity is within nominal parameters for this selection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NeonCard>
    </div>
  );
};
