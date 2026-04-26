import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import type { Expense } from '../types';
import { NeonCard } from './ui';
import dayjs from 'dayjs';

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
}

export const ExpenseList: React.FC<Props> = ({ expenses, onEdit }) => {
  const { deleteExpense, settings } = useExpenses();

  if (expenses.length === 0) {
    return (
      <NeonCard className="text-center py-12">
        <p className="text-text-muted uppercase tracking-widest font-black">NO TRANSACTION DATA DETECTED</p>
      </NeonCard>
    );
  }

  const sortedExpenses = [...expenses].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

  return (
    <div className="space-y-3">
      {sortedExpenses.map((expense) => (
        <div 
          key={expense.id} 
          className="relative flex items-center justify-between p-4 bg-white/[0.02] rounded-xl hover:bg-white/[0.05] transition-all border border-white/5 hover:border-action-neon/30 group cyber-border overflow-hidden"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="relative">
              <div className="w-11 h-11 rounded-lg bg-black/50 flex items-center justify-center border border-white/10 group-hover:border-action-neon/50 transition-all shadow-xl">
                <span className="material-symbols-outlined text-action-neon text-xl group-hover:scale-110 transition-transform">
                  {expense.category === 'Food' ? 'restaurant' : 
                   expense.category === 'Transport' ? 'directions_car' : 
                   expense.category === 'Software' ? 'terminal' : 
                   expense.category === 'Travel' ? 'flight' : 'payments'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-action-neon shadow-[0_0_8px_#E4FF6E] border-2 border-[#242424]"></div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-black text-white text-sm uppercase tracking-tight">{expense.category}</p>
                <span className="text-[7px] text-text-muted font-black tracking-widest border border-white/10 px-1 rounded uppercase">TRX-{expense.id.slice(0, 4)}</span>
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-medium">
                {expense.description || 'No description'} • {dayjs(expense.date).format('DD MMM YYYY')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-8 relative z-10">
            <div className="text-right">
              <p className="font-black text-white text-lg font-h1 tracking-tighter">
                -{settings.currency}{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-action-neon animate-pulse"></div>
                <p className="text-[8px] text-action-neon font-black uppercase tracking-[0.2em]">INTEL VERIFIED</p>
              </div>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              <button 
                onClick={() => onEdit(expense)}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <button 
                onClick={() => deleteExpense(expense.id)}
                className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
