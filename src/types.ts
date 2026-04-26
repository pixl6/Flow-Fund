export type Category = string;

export const DEFAULT_CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Software",
  "Office Supplies",
  "Marketing",
  "Utilities",
  "Travel",
  "Miscellaneous",
];

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // YYYY-MM-DD format usually
  createdAt: string; // ISO string
}

export interface BudgetLimit {
  category: Category;
  monthlyLimit: number;
  spent: number;
}

export interface Settings {
  currency: string;
  monthYear: string; // e.g., "2024-08"
  categories: string[];
  monthlyBudget?: number; // user-defined monthly budget cap (overrides category sum)
  darkMode?: boolean;
}

export type BudgetPlanPeriod = 'daily' | 'weekly' | '3months' | '6months' | '1year';

export interface BudgetPlanEntry {
  id: string;
  label: string;         // e.g. "Groceries"
  amount: number;        // planned budget amount
  color: string;         // user-picked color
}

export interface BudgetPlan {
  id: string;
  period: BudgetPlanPeriod;
  totalBudget: number;   // overall cap for this period
  entries: BudgetPlanEntry[];
  createdAt: string;
  updatedAt: string;
}

export type TimelineEventType = 'expense' | 'note' | 'milestone' | 'reminder' | 'income';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  amount?: number;
  category?: string;
  date: string;          // YYYY-MM-DD
  color: string;         // accent color
  pinned: boolean;
  createdAt: string;
}

