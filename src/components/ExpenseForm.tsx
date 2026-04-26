import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useExpenses } from '../context/ExpenseContext';
import { type Category, type Expense } from '../types';

import dayjs from 'dayjs';

interface ExpenseFormData {
  amount: number;
  category: Category;
  description: string;
  date: string;
}

interface Props {
  expenseToEdit?: Expense | null;
  onSuccess?: () => void;
}

export const ExpenseForm: React.FC<Props> = ({ expenseToEdit, onSuccess }) => {
  const { addExpense, updateExpense, settings } = useExpenses();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    defaultValues: {
      amount: 0,
      category: settings.categories[0] || 'Food',
      description: '',
      date: dayjs().format('YYYY-MM-DD')
    }
  });

  useEffect(() => {
    if (expenseToEdit) {
      reset({
        amount: expenseToEdit.amount,
        category: expenseToEdit.category,
        description: expenseToEdit.description,
        date: expenseToEdit.date
      });
    } else {
      reset({
        amount: 0,
        category: settings.categories[0] || 'Food',
        description: '',
        date: dayjs().format('YYYY-MM-DD')
      });
    }
  }, [expenseToEdit, reset, settings.categories]);

  const onSubmit = (data: ExpenseFormData) => {
    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, data);
    } else {
      addExpense(data);
    }
    if (onSuccess) onSuccess();
    if (!expenseToEdit) reset();
  };



  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white/[0.01] p-1 rounded-2xl">
      <div>
        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-2.5 ml-1">
          <span className="material-symbols-outlined text-sm text-action-neon">payments</span> CAPITAL DRAIN
        </label>
        <div className="relative group/input">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 font-black text-xl group-focus-within/input:text-action-neon transition-colors">{settings.currency}</span>
          <input 
            type="number" 
            step="0.01" 
            {...register('amount', { required: true, min: 0.01, valueAsNumber: true })}
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-5 text-3xl font-black text-white outline-none focus:border-action-neon/50 focus:ring-4 focus:ring-action-neon/5 transition-all font-h1 tracking-tighter placeholder-neutral-800 shadow-inner"
            placeholder="0.00"
            autoFocus
          />
          <div className="absolute inset-0 rounded-2xl border border-action-neon/0 group-focus-within/input:border-action-neon/20 pointer-events-none transition-all"></div>
        </div>
        {errors.amount && <span className="text-red-400 text-[10px] font-black uppercase tracking-tighter mt-2 ml-1 block">CRITICAL: VALID AMOUNT REQUIRED</span>}
      </div>
      
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-2.5 ml-1">
            <span className="material-symbols-outlined text-sm text-action-neon">hub</span> SECTOR
          </label>
          <div className="relative">
            <select 
              {...register('category', { required: true })}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-action-neon/50 transition-all appearance-none cursor-pointer"
            >
              {settings.categories.map(c => <option key={c} value={c} className="bg-[#1A1A1A]">{c.toUpperCase()}</option>)}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-600 pointer-events-none text-sm">expand_more</span>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-2.5 ml-1">
            <span className="material-symbols-outlined text-sm text-action-neon">schedule</span> TIMESTAMP
          </label>
          <input 
            type="date" 
            {...register('date', { required: true })}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-action-neon/50 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-2.5 ml-1">
          <span className="material-symbols-outlined text-sm text-action-neon">description</span> MISSION INTEL
        </label>
        <textarea 
          {...register('description')}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-medium placeholder-neutral-700 outline-none focus:border-action-neon/50 transition-all resize-none h-28"
          placeholder="Enter operational details..."
        />
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          className="w-full py-4 bg-action-neon hover:bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl transition-all shadow-[0_10px_30px_rgba(228,255,110,0.15)] active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined text-xl">{expenseToEdit ? 'sync' : 'bolt'}</span>
          {expenseToEdit ? 'UPDATE INTEL' : 'COMMIT TRANSACTION'}
        </button>
      </div>
    </form>
  );
};
