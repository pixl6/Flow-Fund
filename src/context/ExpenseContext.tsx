import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  type Expense, type BudgetLimit, type Settings,
  type BudgetPlan, type BudgetPlanEntry, type BudgetPlanPeriod,
  type TimelineEvent,
} from '../types';
import {
  loadExpenses, saveExpenses,
  loadBudgets, saveBudgets,
  loadSettings, saveSettings,
  loadBudgetPlans, saveBudgetPlans,
  loadTimelineEvents, saveTimelineEvents,
} from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

interface ExpenseContextProps {
  expenses: Expense[];
  budgets: BudgetLimit[];
  settings: Settings;
  budgetPlans: BudgetPlan[];
  timelineEvents: TimelineEvent[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  updateBudgetLimit: (category: string, limit: number) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  upsertBudgetPlan: (period: BudgetPlanPeriod, totalBudget: number, entries: Omit<BudgetPlanEntry, 'id'>[]) => void;
  deleteBudgetPlan: (id: string) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'createdAt'>) => void;
  updateTimelineEvent: (id: string, updated: Partial<Omit<TimelineEvent, 'id' | 'createdAt'>>) => void;
  deleteTimelineEvent: (id: string) => void;
  togglePinEvent: (id: string) => void;
}

const ExpenseContext = createContext<ExpenseContextProps | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses());
  const [baseBudgets, setBaseBudgets] = useState<BudgetLimit[]>(loadBudgets());
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>(loadBudgetPlans());
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(loadTimelineEvents());

  const budgets = React.useMemo(() => {
    const currentMonthExpenses = expenses.filter(e =>
      dayjs(e.date).format('YYYY-MM') === settings.monthYear
    );
    return baseBudgets.map(budget => {
      const spent = currentMonthExpenses
        .filter(e => e.category === budget.category)
        .reduce((sum, e) => sum + e.amount, 0);
      return { ...budget, spent };
    });
  }, [baseBudgets, expenses, settings.monthYear]);

  useEffect(() => { saveExpenses(expenses); }, [expenses]);
  useEffect(() => { saveBudgets(baseBudgets); }, [baseBudgets]);
  useEffect(() => { saveSettings(settings); }, [settings]);
  useEffect(() => { saveBudgetPlans(budgetPlans); }, [budgetPlans]);
  useEffect(() => { saveTimelineEvents(timelineEvents); }, [timelineEvents]);

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = { ...expenseData, id: uuidv4(), createdAt: new Date().toISOString() };
    setExpenses(prev => [...prev, newExpense]);
  };
  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updated } : e)));
  };
  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };
  const updateBudgetLimit = (category: string, limit: number) => {
    setBaseBudgets(prev => prev.map(b => b.category === category ? { ...b, monthlyLimit: limit } : b));
  };
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  const addCategory = (category: string) => {
    if (settings.categories.includes(category)) return;
    setSettings(prev => ({ ...prev, categories: [...prev.categories, category] }));
    setBaseBudgets(prev => [...prev, { category, monthlyLimit: 0, spent: 0 }]);
  };
  const deleteCategory = (category: string) => {
    const hasExpenses = expenses.some(e => e.category === category);
    if (hasExpenses) { alert("Cannot delete category with existing expenses."); return; }
    setSettings(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }));
    setBaseBudgets(prev => prev.filter(b => b.category !== category));
  };

  const upsertBudgetPlan = (period: BudgetPlanPeriod, totalBudget: number, entries: Omit<BudgetPlanEntry, 'id'>[]) => {
    const now = new Date().toISOString();
    setBudgetPlans(prev => {
      const existing = prev.find(p => p.period === period);
      if (existing) {
        return prev.map(p =>
          p.period === period
            ? { ...p, totalBudget, entries: entries.map(e => ({ ...e, id: uuidv4() })), updatedAt: now }
            : p
        );
      }
      return [...prev, { id: uuidv4(), period, totalBudget, entries: entries.map(e => ({ ...e, id: uuidv4() })), createdAt: now, updatedAt: now }];
    });
  };
  const deleteBudgetPlan = (id: string) => setBudgetPlans(prev => prev.filter(p => p.id !== id));

  // ── Timeline actions ──────────────────────────────────────────────────────
  const addTimelineEvent = (event: Omit<TimelineEvent, 'id' | 'createdAt'>) => {
    const newEvent: TimelineEvent = { ...event, id: uuidv4(), createdAt: new Date().toISOString() };
    setTimelineEvents(prev => [newEvent, ...prev]);
  };
  const updateTimelineEvent = (id: string, updated: Partial<Omit<TimelineEvent, 'id' | 'createdAt'>>) => {
    setTimelineEvents(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
  };
  const deleteTimelineEvent = (id: string) => setTimelineEvents(prev => prev.filter(e => e.id !== id));
  const togglePinEvent = (id: string) => {
    setTimelineEvents(prev => prev.map(e => e.id === id ? { ...e, pinned: !e.pinned } : e));
  };

  // Sync new expenses → timeline automatically
  useEffect(() => {
    // intentionally empty — we derive expense events on-the-fly in Timeline page
  }, [expenses]);

  return (
    <ExpenseContext.Provider value={{
      expenses, budgets, settings, budgetPlans, timelineEvents,
      addExpense, updateExpense, deleteExpense,
      updateBudgetLimit, updateSettings, addCategory, deleteCategory,
      upsertBudgetPlan, deleteBudgetPlan,
      addTimelineEvent, updateTimelineEvent, deleteTimelineEvent, togglePinEvent,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error("useExpenses must be used within an ExpenseProvider");
  return context;
};
