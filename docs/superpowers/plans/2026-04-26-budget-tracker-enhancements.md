# Budget Tracker Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement team budget management, time-based filtering, expense detail views, alert systems, interactive charts, and dark/light mode support for the Budget Tracker application.

**Architecture:** Extend existing types and context with new fields, create new UI components for enhanced features, integrate charts with interactivity, and apply theme system via CSS variables and context.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Recharts, dayjs, localStorage persistence

---

## File Structure

**Files to Create:**
- `src/components/ExpenseDetailModal.tsx` - Individual expense detail view
- `src/components/TimeDurationFilter.tsx` - Weekly/monthly/3m/6m selector
- `src/components/ThemeToggle.tsx` - Dark/light mode toggle
- `src/components/BudgetAlert.tsx` - Warning/critical/exceeded alerts
- `src/components/charts/SpendingTrendChart.tsx` - Interactive line chart
- `src/components/charts/CategoryBreakdownChart.tsx` - Interactive pie chart
- `src/components/charts/BudgetVsSpentChart.tsx` - Interactive bar chart
- `src/hooks/useTheme.ts` - Theme management hook
- `src/hooks/useBudgetAlerts.ts` - Alert logic hook
- `src/utils/theme.ts` - Theme constants and utilities

**Files to Modify:**
- `src/types.ts` - Add theme and overallBudgetLimit to Settings
- `src/utils/storage.ts` - Add theme persistence
- `src/context/ExpenseContext.tsx` - Add theme and overall budget methods
- `src/App.tsx` - Add ThemeToggle to header
- `src/pages/Dashboard.tsx` - Integrate all new features
- `src/components/BudgetSettings.tsx` - Add overall budget input
- `src/components/ExpenseList.tsx` - Add click handler for detail modal
- `src/components/ui.tsx` - Add theme-aware styles if needed
- `src/index.css` or `src/index.css` - Add CSS variables for themes

---

## Task 1: Extend Types and Storage

**Files:**
- Modify: `src/types.ts`
- Modify: `src/utils/storage.ts`
- Test: Manual testing via browser console

- [ ] **Step 1: Update types.ts with new interfaces**

Add `theme` and `overallBudgetLimit` to Settings interface:

```typescript
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
  date: string;
  createdAt: string;
}

export interface BudgetLimit {
  category: Category;
  monthlyLimit: number;
  spent: number;
}

export interface Settings {
  currency: string;
  monthYear: string;
  categories: string[];
  theme: 'dark' | 'light';
  overallBudgetLimit: number;
}

export interface AlertThreshold {
  warning: number;
  critical: number;
  exceeded: number;
}

export interface BudgetAlert {
  type: 'category-warning' | 'category-critical' | 'category-exceeded' | 'overall-exceeded';
  category?: string;
  spent: number;
  limit: number;
  percentage: number;
}
```

- [ ] **Step 2: Update storage.ts with theme defaults**

Modify `loadSettings` to include theme and overallBudgetLimit defaults:

```typescript
import { type Expense, type BudgetLimit, type Settings, DEFAULT_CATEGORIES } from '../types';
import dayjs from 'dayjs';

const EXPENSES_KEY = 'budget_tracker_expenses';
const BUDGETS_KEY = 'budget_tracker_budgets';
const SETTINGS_KEY = 'budget_tracker_settings';

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
      if (parsed.theme === undefined) {
        parsed.theme = 'dark';
      }
      if (parsed.overallBudgetLimit === undefined) {
        parsed.overallBudgetLimit = 5000;
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return {
    currency: '$',
    monthYear: dayjs().format('YYYY-MM'),
    categories: [...DEFAULT_CATEGORIES],
    theme: 'dark',
    overallBudgetLimit: 5000,
  };
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
```

- [ ] **Step 3: Commit**

```bash
git add src/types.ts src/utils/storage.ts
git commit -m "feat: extend Settings with theme and overallBudgetLimit"
```

---

## Task 2: Create Theme Hook and Utilities

**Files:**
- Create: `src/utils/theme.ts`
- Create: `src/hooks/useTheme.ts`
- Test: Manual testing in browser

- [ ] **Step 1: Create theme.ts utilities**

```typescript
export const THEME_KEY = 'budget_tracker_theme';

export const themeColors = {
  dark: {
    background: '#1a1d26',
    card: '#22262f',
    textMain: '#e2e8f0',
    textMuted: '#94a3b8',
    border: '#2c313d',
    shadow: 'rgba(0, 0, 0, 0.3)',
    alertWarning: '#f59e0b',
    alertCritical: '#ea580c',
    alertExceeded: '#dc2626',
  },
  light: {
    background: '#f0f2f5',
    card: '#ffffff',
    textMain: '#1e293b',
    textMuted: '#64748b',
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    alertWarning: '#d97706',
    alertCritical: '#c2410c',
    alertExceeded: '#b91c1c',
  },
};

export const applyTheme = (theme: 'dark' | 'light') => {
  const colors = themeColors[theme];
  const root = document.documentElement;
  
  root.style.setProperty('--bg-primary', colors.background);
  root.style.setProperty('--bg-card', colors.card);
  root.style.setProperty('--text-main', colors.textMain);
  root.style.setProperty('--text-muted', colors.textMuted);
  root.style.setProperty('--border-color', colors.border);
  root.style.setProperty('--shadow-color', colors.shadow);
  root.style.setProperty('--alert-warning', colors.alertWarning);
  root.style.setProperty('--alert-critical', colors.alertCritical);
  root.style.setProperty('--alert-exceeded', colors.alertExceeded);
  
  root.setAttribute('data-theme', theme);
};

export const detectSystemTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
```

- [ ] **Step 2: Create hooks directory and useTheme.ts**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { applyTheme, detectSystemTheme, THEME_KEY } from '../utils/theme';
import { useExpenses } from '../context/ExpenseContext';

export const useTheme = () => {
  const { settings, updateSettings } = useExpenses();
  const [theme, setTheme] = useState<'dark' | 'light'>(settings.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
  }, [theme, updateSettings]);

  return { theme, toggleTheme };
};
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/theme.ts src/hooks/useTheme.ts
git commit -m "feat: add theme utilities and useTheme hook"
```

---

## Task 3: Create Theme Toggle Component

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Test: Manual testing

- [ ] **Step 1: Create ThemeToggle component**

```typescript
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-card shadow-neu-outer hover:scale-105 transition-transform"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-yellow-400" />
      ) : (
        <Moon size={20} className="text-slate-600" />
      )}
    </button>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle component"
```

---

## Task 4: Add Theme Toggle to App Header

**Files:**
- Modify: `src/App.tsx`
- Test: Manual testing

- [ ] **Step 1: Import and add ThemeToggle to App.tsx header**

Modify the header section in App.tsx to include ThemeToggle:

```typescript
<header className="flex justify-between items-center bg-card p-4 rounded-2xl shadow-neu-card border border-[#2c313d]">
  <div className="flex items-center gap-4">
    <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
  </div>
  <div className="flex items-center gap-4">
    <ThemeToggle />
    <NeumorphicButton 
      className="!px-4 !py-2 flex items-center gap-2 text-sm" 
      onClick={() => { setExpenseToEdit(null); setIsModalOpen(true); }}
    >
      <Plus size={16} />
      <span className="hidden sm:inline">Add Expense</span>
    </NeumorphicButton>
  </div>
</header>
```

Add import at top:
```typescript
import { ThemeToggle } from './components/ThemeToggle';
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate ThemeToggle in app header"
```

---

## Task 5: Create Budget Alert Hook

**Files:**
- Create: `src/hooks/useBudgetAlerts.ts`
- Test: Manual testing

- [ ] **Step 1: Create useBudgetAlerts hook**

```typescript
import { useMemo } from 'react';
import { type BudgetLimit, type BudgetAlert } from '../types';

const THRESHOLDS = {
  warning: 80,
  critical: 90,
  exceeded: 100,
};

export const useBudgetAlerts = (
  budgets: BudgetLimit[],
  overallBudgetLimit: number,
  totalSpent: number
) => {
  const alerts = useMemo(() => {
    const result: BudgetAlert[] = [];

    // Category alerts
    budgets.forEach(budget => {
      if (budget.monthlyLimit <= 0) return;
      
      const percentage = (budget.spent / budget.monthlyLimit) * 100;
      
      if (percentage >= THRESHOLDS.exceeded) {
        result.push({
          type: 'category-exceeded',
          category: budget.category,
          spent: budget.spent,
          limit: budget.monthlyLimit,
          percentage,
        });
      } else if (percentage >= THRESHOLDS.critical) {
        result.push({
          type: 'category-critical',
          category: budget.category,
          spent: budget.spent,
          limit: budget.monthlyLimit,
          percentage,
        });
      } else if (percentage >= THRESHOLDS.warning) {
        result.push({
          type: 'category-warning',
          category: budget.category,
          spent: budget.spent,
          limit: budget.monthlyLimit,
          percentage,
        });
      }
    });

    // Overall budget alert
    if (overallBudgetLimit > 0) {
      const overallPercentage = (totalSpent / overallBudgetLimit) * 100;
      
      if (overallPercentage >= THRESHOLDS.exceeded) {
        result.push({
          type: 'overall-exceeded',
          spent: totalSpent,
          limit: overallBudgetLimit,
          percentage: overallPercentage,
        });
      }
    }

    return result;
  }, [budgets, overallBudgetLimit, totalSpent]);

  return alerts;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useBudgetAlerts.ts
git commit -m "feat: add useBudgetAlerts hook with threshold logic"
```

---

## Task 6: Create Budget Alert Component

**Files:**
- Create: `src/components/BudgetAlert.tsx`
- Test: Manual testing

- [ ] **Step 1: Create BudgetAlert component**

```typescript
import React from 'react';
import { type BudgetAlert as BudgetAlertType } from '../types';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';

interface BudgetAlertProps {
  alert: BudgetAlertType;
  onDismiss: () => void;
}

export const BudgetAlert: React.FC<BudgetAlertProps> = ({ alert, onDismiss }) => {
  const getAlertStyles = (type: BudgetAlertType['type']) => {
    switch (type) {
      case 'category-exceeded':
      case 'overall-exceeded':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500',
          text: 'text-red-400',
          icon: <AlertCircle size={24} className="text-red-400" />,
        };
      case 'category-critical':
        return {
          bg: 'bg-orange-500/20',
          border: 'border-orange-500',
          text: 'text-orange-400',
          icon: <AlertTriangle size={24} className="text-orange-400" />,
        };
      case 'category-warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500',
          text: 'text-yellow-400',
          icon: <AlertTriangle size={24} className="text-yellow-400" />,
        };
    }
  };

  const styles = getAlertStyles(alert.type);
  const isExceeded = alert.type.includes('exceeded');

  const getMessage = () => {
    if (alert.type === 'overall-exceeded') {
      return `Overall budget exceeded! You've spent ${alert.percentage.toFixed(0)}% of your total budget.`;
    }
    if (alert.type === 'category-exceeded') {
      return `${alert.category} budget exceeded! You've spent ${alert.percentage.toFixed(0)}% of the ${alert.category} budget.`;
    }
    if (alert.type === 'category-critical') {
      return `${alert.category} budget almost exceeded (${alert.percentage.toFixed(0)}%).`;
    }
    return `${alert.category} budget warning (${alert.percentage.toFixed(0)}% used).`;
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl ${styles.bg} border ${styles.border} animate-in slide-in-from-top duration-300`}>
      <div className="flex items-center gap-3">
        {styles.icon}
        <span className={`font-semibold ${styles.text}`}>{getMessage()}</span>
      </div>
      {isExceeded && (
        <button
          onClick={onDismiss}
          className={`p-1 rounded-full hover:bg-black/20 transition-colors ${styles.text}`}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export const BudgetAlertModal: React.FC<{
  alerts: BudgetAlertType[];
  onDismiss: () => void;
}> = ({ alerts, onDismiss }) => {
  const exceededAlerts = alerts.filter(a => a.type.includes('exceeded'));

  if (exceededAlerts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="bg-card rounded-2xl p-6 shadow-2xl border border-red-500/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
              <AlertCircle size={28} />
              Budget Alert
            </h3>
            <button
              onClick={onDismiss}
              className="p-2 rounded-full hover:bg-red-500/20 transition-colors text-red-400"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-3">
            {exceededAlerts.map((alert, idx) => (
              <div key={idx} className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-red-400 font-semibold">
                  {alert.type === 'overall-exceeded'
                    ? `Overall budget exceeded by ${alert.percentage.toFixed(0)}%`
                    : `${alert.category} budget exceeded by ${alert.percentage.toFixed(0)}%`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BudgetAlert.tsx
git commit -m "feat: add BudgetAlert and BudgetAlertModal components"
```

---

## Task 7: Create Time Duration Filter Component

**Files:**
- Create: `src/components/TimeDurationFilter.tsx`
- Test: Manual testing

- [ ] **Step 1: Create TimeDurationFilter component**

```typescript
import React from 'react';

export type TimeDuration = 'weekly' | 'monthly' | '3months' | '6months';

interface TimeDurationFilterProps {
  value: TimeDuration;
  onChange: (duration: TimeDuration) => void;
}

export const TimeDurationFilter: React.FC<TimeDurationFilterProps> = ({ value, onChange }) => {
  const options: { value: TimeDuration; label: string }[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            value === option.value
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-card text-textMuted hover:text-textMain shadow-neu-outer'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TimeDurationFilter.tsx
git commit -m "feat: add TimeDurationFilter component"
```

---

## Task 8: Create Expense Detail Modal Component

**Files:**
- Create: `src/components/ExpenseDetailModal.tsx`
- Test: Manual testing

- [ ] **Step 1: Create ExpenseDetailModal component**

```typescript
import React from 'react';
import { type Expense } from '../types';
import { X, Edit2, Trash2, Calendar, Tag, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import { getCategoryColor } from '../utils/colors';

interface ExpenseDetailModalProps {
  expense: Expense;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  currency: string;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  onClose,
  onEdit,
  onDelete,
  currency,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-200">
        <div className="bg-card rounded-2xl shadow-2xl border border-[#2c313d] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2c313d]">
            <h2 className="text-2xl font-bold text-textMain">Expense Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-background transition-colors text-textMuted hover:text-textMain"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Amount */}
            <div className="text-center">
              <p className="text-4xl font-extrabold" style={{ color: getCategoryColor(expense.category) }}>
                {currency}{expense.amount.toFixed(2)}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Tag size={20} className="text-textMuted" />
                <div>
                  <p className="text-xs text-textMuted uppercase font-medium">Category</p>
                  <p className="font-semibold" style={{ color: getCategoryColor(expense.category) }}>
                    {expense.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Calendar size={20} className="text-textMuted" />
                <div>
                  <p className="text-xs text-textMuted uppercase font-medium">Date</p>
                  <p className="font-semibold text-textMain">
                    {dayjs(expense.date).format('MMMM D, YYYY')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <FileText size={20} className="text-textMuted" />
                <div>
                  <p className="text-xs text-textMuted uppercase font-medium">Description</p>
                  <p className="text-textMain">
                    {expense.description || 'No description provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <Calendar size={20} className="text-textMuted" />
                <div>
                  <p className="text-xs text-textMuted uppercase font-medium">Created</p>
                  <p className="text-textMain">
                    {dayjs(expense.createdAt).format('MMMM D, YYYY h:mm A')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 border-t border-[#2c313d]">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
            >
              <Edit2 size={18} />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ExpenseDetailModal.tsx
git commit -m "feat: add ExpenseDetailModal component"
```

---

## Task 9: Create Interactive Chart Components

**Files:**
- Create: `src/components/charts/SpendingTrendChart.tsx`
- Create: `src/components/charts/CategoryBreakdownChart.tsx`
- Create: `src/components/charts/BudgetVsSpentChart.tsx`
- Test: Manual testing

- [ ] **Step 1: Create charts directory**

```bash
mkdir -p src/components/charts
```

- [ ] **Step 2: Create SpendingTrendChart.tsx**

```typescript
import React, { useMemo } from 'react';
import { type Expense } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';

interface SpendingTrendChartProps {
  expenses: Expense[];
  startDate: string;
  endDate: string;
  currency: string;
  onDayClick?: (date: string) => void;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  expenses,
  startDate,
  endDate,
  currency,
  onDayClick,
}) => {
  const data = useMemo(() => {
    const days: Record<string, number> = {};
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    
    while (current.isSameOrBefore(end)) {
      days[current.format('YYYY-MM-DD')] = 0;
      current = current.add(1, 'day');
    }

    expenses.forEach(expense => {
      if (days[expense.date] !== undefined) {
        days[expense.date] += expense.amount;
      }
    });

    return Object.keys(days).map(date => ({
      date: dayjs(date).format('MMM D'),
      fullDate: date,
      amount: days[date],
    }));
  }, [expenses, startDate, endDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-[#2c313d] rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-textMuted mb-1">{label}</p>
          <p className="text-lg font-bold text-emerald-400">
            {currency}{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2c313d" opacity={0.5} />
        <XAxis 
          dataKey="date" 
          stroke="#94a3b8" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(val) => `${currency}${val}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="#4ecdc4" 
          strokeWidth={3} 
          dot={{ fill: '#4ecdc4', r: 4 }}
          activeDot={{ r: 8, fill: '#4ecdc4', stroke: '#22262f', strokeWidth: 2 }}
          onClick={(data: any) => onDayClick?.(data.fullDate)}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

- [ ] **Step 3: Create CategoryBreakdownChart.tsx**

```typescript
import React from 'react';
import { type BudgetLimit } from '../../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { getCategoryColor } from '../../utils/colors';

interface CategoryBreakdownChartProps {
  budgets: BudgetLimit[];
  currency: string;
  onSliceClick?: (category: string) => void;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  budgets,
  currency,
  onSliceClick,
}) => {
  const data = budgets
    .filter(b => b.spent > 0)
    .map(b => ({
      name: b.category,
      value: b.spent,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const total = data.reduce((sum, d) => sum + d.value, 0);
      const percentage = ((item.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-card border border-[#2c313d] rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium" style={{ color: item.fill }}>
            {item.name}
          </p>
          <p className="text-lg font-bold text-textMain">
            {currency}{item.value.toFixed(2)}
          </p>
          <p className="text-xs text-textMuted">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-textMuted">No spending data for this period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          innerRadius={80}
          outerRadius={110}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
          onClick={(item: any) => onSliceClick?.(item.name)}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => (
            <span className="text-sm text-textMuted">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
```

- [ ] **Step 4: Create BudgetVsSpentChart.tsx**

```typescript
import React from 'react';
import { type BudgetLimit } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { getCategoryColor } from '../../utils/colors';

interface BudgetVsSpentChartProps {
  budgets: BudgetLimit[];
  currency: string;
  onBarClick?: (category: string) => void;
}

export const BudgetVsSpentChart: React.FC<BudgetVsSpentChartProps> = ({
  budgets,
  currency,
  onBarClick,
}) => {
  const data = budgets
    .filter(b => b.monthlyLimit > 0 || b.spent > 0)
    .map(b => ({
      name: b.category,
      spent: b.spent,
      limit: b.monthlyLimit,
      remaining: b.monthlyLimit - b.spent,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const data = item.payload;
      
      return (
        <div className="bg-card border border-[#2c313d] rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-textMain mb-2">{data.name}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-textMuted">Spent:</span>
              <span className="text-sm font-semibold text-red-400">
                {currency}{data.spent.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-textMuted">Limit:</span>
              <span className="text-sm font-semibold text-textMain">
                {currency}{data.limit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-[#2c313d]">
              <span className="text-xs text-textMuted">Remaining:</span>
              <span className={`text-sm font-semibold ${data.remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {currency}{data.remaining.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={32}>
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(val) => `${currency}${val}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="spent" 
          name="Spent" 
          radius={[4, 4, 0, 0]}
          onClick={(bar: any) => onBarClick?.(bar.name)}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
          ))}
        </Bar>
        <Bar 
          dataKey="limit" 
          name="Limit" 
          fill="#3d4455" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

- [ ] **Step 5: Commit**

```bash
git add src/components/charts/
git commit -m "feat: add interactive chart components"
```

---

## Task 10: Update ExpenseContext with Overall Budget Method

**Files:**
- Modify: `src/context/ExpenseContext.tsx`
- Test: Manual testing

- [ ] **Step 1: Add updateOverallBudget method to context**

Add new method to the interface:
```typescript
interface ExpenseContextProps {
  // ... existing methods
  updateOverallBudget: (limit: number) => void;
}
```

Add implementation in ExpenseProvider:
```typescript
const updateOverallBudget = (limit: number) => {
  if (!isNaN(limit) && limit >= 0) {
    updateSettings({ overallBudgetLimit: limit });
  }
};
```

Add to provider value:
```typescript
return (
  <ExpenseContext.Provider value={{ 
    expenses, 
    budgets, 
    settings, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    updateBudgetLimit, 
    updateSettings, 
    addCategory, 
    deleteCategory,
    updateOverallBudget,
  }}>
    {children}
  </ExpenseContext.Provider>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/context/ExpenseContext.tsx
git commit -m "feat: add updateOverallBudget method to context"
```

---

## Task 11: Update BudgetSettings with Overall Budget Input

**Files:**
- Modify: `src/components/BudgetSettings.tsx`
- Test: Manual testing

- [ ] **Step 1: Add overall budget section to BudgetSettings**

Add at the top of the component, before the "Budget Limits" section:

```typescript
const { budgets, updateBudgetLimit, updateOverallBudget, settings } = useExpenses();
const [editingOverall, setEditingOverall] = useState(false);
const [tempOverallBudget, setTempOverallBudget] = useState(settings.overallBudgetLimit.toString());

const handleSaveOverallBudget = () => {
  const parsed = parseFloat(tempOverallBudget);
  if (!isNaN(parsed) && parsed >= 0) {
    updateOverallBudget(parsed);
  }
  setEditingOverall(false);
};

// Add new section before existing budget limits section:
<NeumorphicCard className="w-full mb-6">
  <h2 className="text-xl font-bold mb-6">Overall Team Budget</h2>
  <div className="flex items-center justify-between p-4 rounded-xl bg-background shadow-neu-inner">
    <div>
      <p className="text-sm text-textMuted mb-1">Monthly Budget</p>
      <p className="text-lg font-semibold text-textMain">
        {editingOverall 
          ? `${settings.currency}${tempOverallBudget}` 
          : `${settings.currency}${settings.overallBudgetLimit.toFixed(2)}`}
      </p>
    </div>
    {editingOverall ? (
      <div className="flex items-center gap-2">
        <span className="text-textMuted">{settings.currency}</span>
        <input 
          type="number" 
          value={tempOverallBudget}
          onChange={(e) => setTempOverallBudget(e.target.value)}
          className="w-32 bg-card rounded px-3 py-2 text-textMain border-none focus:ring-1 focus:ring-blue-500 outline-none"
          autoFocus
        />
        <NeumorphicButton variant="ghost" className="!px-3 !py-2 !shadow-none text-blue-400" onClick={handleSaveOverallBudget}>
          Save
        </NeumorphicButton>
      </div>
    ) : (
      <NeumorphicButton 
        variant="ghost" 
        className="!px-4 !py-2 !shadow-none text-blue-400"
        onClick={() => {
          setTempOverallBudget(settings.overallBudgetLimit.toString());
          setEditingOverall(true);
        }}
      >
        Edit
      </NeumorphicButton>
    )}
  </div>
</NeumorphicCard>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BudgetSettings.tsx
git commit -m "feat: add overall team budget input to settings"
```

---

## Task 12: Update ExpenseList with Detail Modal Integration

**Files:**
- Modify: `src/components/ExpenseList.tsx`
- Modify: `src/App.tsx`
- Test: Manual testing

- [ ] **Step 1: Update ExpenseList to accept onExpenseClick prop**

Modify the component signature:
```typescript
interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onExpenseClick?: (expense: Expense) => void;
}
```

Add click handler to the expense card:
```typescript
<NeumorphicCard 
  key={expense.id} 
  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 transition-all hover:scale-[1.01] cursor-pointer"
  onClick={() => props.onExpenseClick?.(expense)}
>
```

- [ ] **Step 2: Update App.tsx to handle expense detail modal**

Add state for selected expense:
```typescript
const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
```

Add handler:
```typescript
const handleExpenseClick = (expense: Expense) => {
  setSelectedExpense(expense);
};

const handleDeleteFromModal = () => {
  if (selectedExpense) {
    deleteExpense(selectedExpense.id);
    setSelectedExpense(null);
  }
};
```

Render modal:
```typescript
{selectedExpense && (
  <ExpenseDetailModal
    expense={selectedExpense}
    currency={settings.currency}
    onClose={() => setSelectedExpense(null)}
    onEdit={() => {
      setExpenseToEdit(selectedExpense);
      setIsModalOpen(true);
      setSelectedExpense(null);
    }}
    onDelete={handleDeleteFromModal}
  />
)}
```

Add imports:
```typescript
import { ExpenseDetailModal } from './components/ExpenseDetailModal';
import { useExpenses } from './context/ExpenseContext';
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ExpenseList.tsx src/App.tsx
git commit -m "feat: integrate ExpenseDetailModal with expense list"
```

---

## Task 13: Update Dashboard with All New Features

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Test: Manual testing

- [ ] **Step 1: Rewrite Dashboard to integrate time filter, alerts, and charts**

This is a complete rewrite of the Dashboard component. The component should:
1. Import and use TimeDurationFilter
2. Calculate date range based on selected duration
3. Filter expenses by date range
4. Calculate budgets/spending for filtered period
5. Use useBudgetAlerts hook
6. Render BudgetAlert components
7. Use new chart components
8. Show overall budget summary

Due to size, this will be committed as one complete file replacement.

- [ ] **Step 2: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: integrate all enhancements into Dashboard"
```

---

## Task 14: Add CSS Variables for Theme Support

**Files:**
- Modify: `src/index.css`
- Test: Manual testing

- [ ] **Step 1: Add CSS variables for theming**

Add to the top of the CSS file:
```css
:root {
  /* Dark theme (default) */
  --bg-primary: #1a1d26;
  --bg-card: #22262f;
  --text-main: #e2e8f0;
  --text-muted: #94a3b8;
  --border-color: #2c313d;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --alert-warning: #f59e0b;
  --alert-critical: #ea580c;
  --alert-exceeded: #dc2626;
}

[data-theme='light'] {
  --bg-primary: #f0f2f5;
  --bg-card: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --alert-warning: #d97706;
  --alert-critical: #c2410c;
  --alert-exceeded: #b91c1c;
}
```

- [ ] **Step 2: Update existing CSS classes to use variables where appropriate**

Update neumorphic-card and neumorphic-btn classes to use theme-aware colors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add CSS variables for theme support"
```

---

## Task 15: Final Testing and Cleanup

**Files:**
- All modified files
- Test: Full manual testing

- [ ] **Step 1: Test all features in browser**

1. Start dev server: `npm run dev`
2. Test theme toggle (dark/light modes)
3. Test overall budget setting
4. Test time duration filter
5. Test expense detail modal
6. Test budget alerts (add expenses to trigger thresholds)
7. Test chart interactions

- [ ] **Step 2: Fix any issues found**

- [ ] **Step 3: Final commit**

```bash
git commit -am "fix: address final testing issues"
```

---

## Verification

After all tasks complete, verify:

1. **Theme toggle works** - Sun/moon icon in header, persists preference
2. **Overall budget editable** - Settings page has overall budget input
3. **Time filter functional** - Dashboard shows weekly/monthly/3m/6m options
4. **Expense detail modal opens** - Click expense to see full details
5. **Alerts trigger correctly** - Add expenses to hit 80%, 90%, 100% thresholds
6. **Charts are interactive** - Hover tooltips, click handlers work
