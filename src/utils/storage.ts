import { type Expense, type BudgetLimit, type Settings, type BudgetPlan, type TimelineEvent, DEFAULT_CATEGORIES } from '../types';
import dayjs from 'dayjs';

const EXPENSES_KEY = 'budget_tracker_expenses';
const BUDGETS_KEY = 'budget_tracker_budgets';
const SETTINGS_KEY = 'budget_tracker_settings';
const BUDGET_PLANS_KEY = 'budget_tracker_plans';

export const loadExpenses = (): Expense[] => {
  try {
    const data = localStorage.getItem(EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

const defaultBudgets: BudgetLimit[] = DEFAULT_CATEGORIES.map(category => ({
  category,
  monthlyLimit: 1000,
  spent: 0,
}));

export const loadBudgets = (): BudgetLimit[] => {
  try {
    const data = localStorage.getItem(BUDGETS_KEY);
    return data ? JSON.parse(data) : defaultBudgets;
  } catch {
    return defaultBudgets;
  }
};

export const saveBudgets = (budgets: BudgetLimit[]) => {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
};

export const loadSettings = (): Settings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (!parsed.categories) {
        parsed.categories = [...DEFAULT_CATEGORIES];
      }
      if (typeof parsed.darkMode === 'undefined') {
        parsed.darkMode = true;
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return {
    currency: '₹',
    monthYear: dayjs().format('YYYY-MM'),
    categories: [...DEFAULT_CATEGORIES],
    darkMode: true,
  };
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadBudgetPlans = (): BudgetPlan[] => {
  try {
    const data = localStorage.getItem(BUDGET_PLANS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveBudgetPlans = (plans: BudgetPlan[]) => {
  localStorage.setItem(BUDGET_PLANS_KEY, JSON.stringify(plans));
};

const TIMELINE_KEY = 'budget_tracker_timeline';

export const loadTimelineEvents = (): TimelineEvent[] => {
  try {
    const data = localStorage.getItem(TIMELINE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveTimelineEvents = (events: TimelineEvent[]) => {
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(events));
};
