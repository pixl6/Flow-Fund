import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { NeonCard } from './ui';

export const BudgetSettings: React.FC = () => {
  const { budgets, updateBudgetLimit, settings, addCategory, deleteCategory } = useExpenses();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');

  const handleEdit = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setTempLimit(currentLimit.toString());
  };

  const handleSave = (category: string) => {
    const parsed = parseFloat(tempLimit);
    if (!isNaN(parsed) && parsed >= 0) {
      updateBudgetLimit(category, parsed);
    }
    setEditingCategory(null);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !settings.categories.includes(newCategory.trim())) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white uppercase font-h1 tracking-tight">System Configuration</h2>
        <p className="text-microcopy text-text-muted uppercase tracking-[0.4em]">Calibrate operational parameters and sector definitions</p>
      </div>

      {/* Section 1: Budget Limits */}
      <NeonCard className="w-full inner-glow relative overflow-hidden cyber-border p-8 transition-all duration-700 hover:bg-white/[0.02]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-action-neon/5 blur-[100px] pointer-events-none" />
        <div className="scanline"></div>
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-black border border-action-neon/20 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-action-neon text-2xl">account_balance_wallet</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Mission Budget Limits</h2>
              <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-black">Adjust capital ceilings per sector</p>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="w-8 h-1 bg-action-neon/20 rounded-full"></div>
            <div className="w-4 h-1 bg-action-neon rounded-full"></div>
          </div>
        </div>

        <div className="grid gap-4 relative z-10">
          {budgets.map(b => (
            <div key={b.category} className="flex items-center justify-between p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-action-neon/40 transition-all group relative overflow-hidden">
              <div className="flex flex-col relative z-10">
                <span className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-action-neon/50"></div> OPERATIONAL SECTOR
                </span>
                <span className="font-black text-white text-xl tracking-tight uppercase">{b.category}</span>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                {editingCategory === b.category ? (
                  <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                    <div className="relative group/edit">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-action-neon font-black text-lg">{settings.currency}</span>
                      <input 
                        type="number" 
                        value={tempLimit}
                        onChange={(e) => setTempLimit(e.target.value)}
                        className="w-40 bg-black/80 border border-action-neon/50 rounded-xl pl-10 pr-4 py-3 text-white text-xl font-black outline-none shadow-[0_0_15px_rgba(228,255,110,0.1)] transition-all font-h1"
                        autoFocus
                      />
                    </div>
                    <button 
                      onClick={() => handleSave(b.category)}
                      className="px-6 py-3.5 bg-action-neon text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(228,255,110,0.2)]"
                    >
                      COMMIT
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-end cursor-pointer group/val" onClick={() => handleEdit(b.category, b.monthlyLimit)}>
                    <span className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1.5 group-hover/val:text-action-neon transition-colors">Monthly Ceiling</span>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-white group-hover/val:text-action-neon transition-all font-h1 tracking-tighter shadow-neon">
                        {settings.currency}{b.monthlyLimit.toLocaleString()}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 group-hover/val:text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </NeonCard>

      {/* Section 2: Manage Categories */}
      <NeonCard className="w-full inner-glow relative overflow-hidden cyber-border p-8 transition-all duration-700 hover:bg-white/[0.02]">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-data-lavender/5 blur-[100px] pointer-events-none" />
        <div className="scanline"></div>
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-black border border-data-lavender/20 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-data-lavender text-2xl">category</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Classification Registry</h2>
              <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-black">Register or decommission tactical sectors</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mb-10 p-2 bg-black/40 border border-white/10 rounded-2xl focus-within:border-data-lavender/50 transition-all relative z-10">
          <input 
            type="text" 
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="NEW SECTOR IDENTIFIER..."
            className="flex-1 bg-transparent border-none px-4 py-3 text-white text-[10px] font-black uppercase tracking-[0.3em] outline-none placeholder-neutral-700"
          />
          <button 
            className="px-8 py-3 bg-data-lavender text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(196,181,253,0.2)] flex items-center gap-2" 
            onClick={handleAddCategory}
          >
            <span className="material-symbols-outlined text-lg">add</span>
            REGISTER
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {settings.categories.map(category => (
            <div key={category} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-data-lavender/40 hover:bg-white/[0.05] transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-data-lavender animate-pulse" />
                <span className="font-black text-xs text-neutral-400 uppercase tracking-widest group-hover:text-white transition-colors">{category}</span>
              </div>
              <button 
                className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white" 
                onClick={() => deleteCategory(category)}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          ))}
        </div>
      </NeonCard>
    </div>
  );
};
