# Budget Tracker Enhancements - Design Specification

## Overview

This spec outlines enhancements to the existing Budget Tracker application, adding team budget management, time-based filtering, expense detail views, alert systems, interactive charts, and dark/light mode support.

## Architecture

### Data Model Changes

**Settings Interface (Extended):**
```typescript
interface Settings {
  currency: string;
  monthYear: string;
  categories: string[];
  theme: 'dark' | 'light';
  overallBudgetLimit: number;  // NEW: Team/overall budget
}
```

**BudgetLimit Interface (Unchanged):**
```typescript
interface BudgetLimit {
  category: Category;
  monthlyLimit: number;
  spent: number;
}
```

**New: AlertThreshold Interface:**
```typescript
interface AlertThreshold {
  warning: number;    // 80 (percent)
  critical: number;   // 90 (percent)
  exceeded: number;   // 100 (percent)
}
```

### Component Structure

```
src/
├── components/
│   ├── ui.tsx                    // Add theme variants, alert components
│   ├── ExpenseForm.tsx           // Existing
│   ├── ExpenseList.tsx           // Existing
│   ├── BudgetSettings.tsx        // ENHANCED: overall budget + per-category
│   ├── ExpenseDetailModal.tsx    // NEW: individual expense detail view
│   ├── TimeDurationFilter.tsx    // NEW: weekly/monthly/3m/6m selector
│   ├── ThemeToggle.tsx           // NEW: dark/light mode toggle
│   ├── BudgetAlert.tsx           // NEW: warning/critical popup
│   └── charts/
│       ├── SpendingTrendChart.tsx    // NEW: interactive line chart
│       ├── CategoryBreakdownChart.tsx // NEW: interactive pie chart
│       └── BudgetVsSpentChart.tsx    // NEW: interactive bar chart
├── context/
│   └── ExpenseContext.tsx        // ENHANCED: theme, overall budget, alerts
├── pages/
│   ├── Dashboard.tsx             // ENHANCED: charts, filters, alerts
│   └── Reports.tsx               // Existing (unchanged)
├── utils/
│   ├── storage.ts                // ENHANCED: new keys for theme, overall budget
│   └── colors.ts                 // Existing (unchanged)
└── types.ts                      // ENHANCED: new interfaces
```

## Feature Specifications

### 1. Team Budget Management

**Purpose:** Allow users to set both an overall team budget and per-category limits.

**Implementation:**
- Add `overallBudgetLimit` field to Settings
- BudgetSettings page gets two sections:
  1. Overall Team Budget (single input)
  2. Per-Category Limits (existing, enhanced)
- Dashboard summary shows both: total budget vs overall budget

**Data Flow:**
```
User sets overall budget → updateSettings() → localStorage → Dashboard calculates remaining
User sets category budget → updateBudgetLimit() → localStorage → Category progress bars update
```

### 2. Time Duration Filter

**Purpose:** Quick preset views for dashboard data (weekly, monthly, quarterly, semi-annual).

**Implementation:**
- New `TimeDurationFilter` component at top of Dashboard
- Options: Weekly (7 days), Monthly (30 days), 3 Months, 6 Months
- Filter state lives in Dashboard component
- Passes date range to chart components and summary calculations

**Date Calculations:**
```typescript
type TimeDuration = 'weekly' | 'monthly' | '3months' | '6months';

const getDateRange = (duration: TimeDuration) => {
  const end = dayjs();
  const start = {
    weekly: end.subtract(7, 'day'),
    monthly: end.subtract(30, 'day'),
    '3months': end.subtract(3, 'month'),
    '6months': end.subtract(6, 'month'),
  }[duration];
  return { start, end };
};
```

### 3. Expense Detail Modal

**Purpose:** Dedicated view for individual expense details with edit/delete actions.

**Implementation:**
- New `ExpenseDetailModal` component
- Triggered by clicking expense in ExpenseList
- Displays: amount (large), category badge, date, description, created timestamp
- Action buttons: Edit (opens ExpenseForm), Delete (with confirmation)
- Consistent with existing modal styling

**Modal Content:**
```
┌─────────────────────────────────────┐
│  [Close ×]                          │
│                                     │
│        $125.50                      │
│        Food                         │
│        March 15, 2026               │
│                                     │
│  Description:                       │
│  Grocery shopping at Walmart        │
│                                     │
│  Created: March 15, 2026 10:30 AM   │
│                                     │
│  [Edit]  [Delete]                   │
└─────────────────────────────────────┘
```

### 4. Alert System

**Purpose:** Warn users before and when budgets are exceeded.

**Thresholds:**
- Warning: 80% of limit reached
- Critical: 90% of limit reached
- Exceeded: 100%+ of limit (alarming popup)

**Implementation:**
- `BudgetAlert` component renders popup when thresholds crossed
- Checks run on every expense add/update
- Two alert types:
  1. Category alert: when specific category exceeds its limit
  2. Overall alert: when total spent exceeds overall budget

**Alert Logic:**
```typescript
const checkAlerts = (budgets: BudgetLimit[], overallBudget: number, totalSpent: number) => {
  const alerts = [];
  
  // Category alerts
  budgets.forEach(b => {
    const percent = (b.spent / b.monthlyLimit) * 100;
    if (percent >= 100) alerts.push({ type: 'category-exceeded', category: b.category, ... });
    else if (percent >= 90) alerts.push({ type: 'category-critical', ... });
    else if (percent >= 80) alerts.push({ type: 'category-warning', ... });
  });
  
  // Overall budget alert
  const overallPercent = (totalSpent / overallBudget) * 100;
  if (overallPercent >= 100) alerts.push({ type: 'overall-exceeded', ... });
  
  return alerts;
};
```

**Visual Design:**
- Warning: Yellow/amber banner at top of dashboard
- Critical: Orange banner with icon
- Exceeded: Red modal popup with alarm icon, requires dismissal

### 5. Dynamic Interactive Charts

**Purpose:** Make charts engaging and useful with animations and interactivity.

**SpendingTrendChart (Line):**
- Smooth bezier curves
- Hover tooltip: date, amount
- Click point: show expenses for that day
- Animate on period change

**CategoryBreakdownChart (Pie):**
- Click slice: filter to show only that category's expenses
- Hover tooltip: category, amount, percentage of total
- Legend with color indicators
- Animate on period change

**BudgetVsSpentChart (Bar):**
- Grouped bars: spent (colored by category) vs limit (gray)
- Click bar: open category expenses
- Hover tooltip: category, spent, limit, remaining
- Animate on period change

**Animation Implementation:**
```typescript
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={data}>
    <AnimateOnChange duration={500} />
    <Line type="monotone" dataKey="amount" stroke={color} strokeWidth={3} />
  </LineChart>
</ResponsiveContainer>
```

### 6. Dark/Light Mode

**Purpose:** User preference for app theme.

**Implementation:**
- `ThemeToggle` component in header (sun/moon icon)
- Auto-detect: `window.matchMedia('(prefers-color-scheme: dark)')`
- Save preference to localStorage via Settings
- CSS variables for theme colors

**Theme Tokens:**
```typescript
const themes = {
  dark: {
    background: '#1a1d26',
    card: '#22262f',
    textMain: '#e2e8f0',
    textMuted: '#94a3b8',
    border: '#2c313d',
    shadow: 'rgba(0,0,0,0.3)',
  },
  light: {
    background: '#f0f2f5',
    card: '#ffffff',
    textMain: '#1e293b',
    textMuted: '#64748b',
    border: '#e2e8f0',
    shadow: 'rgba(0,0,0,0.1)',
  },
};
```

**CSS Implementation:**
```css
:root {
  --bg-primary: #1a1d26;
  --bg-card: #22262f;
  --text-main: #e2e8f0;
  --text-muted: #94a3b8;
}

[data-theme='light'] {
  --bg-primary: #f0f2f5;
  --bg-card: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
}
```

## Error Handling

- Invalid budget values: show inline error, prevent save
- Chart data empty: show "No data for this period" message
- Theme load failure: default to dark mode
- Alert dismiss: store dismissed state for session

## Testing Considerations

- Alert triggers at exact thresholds (80%, 90%, 100%)
- Time filter correctly calculates date ranges
- Theme toggle persists across page reloads
- Chart interactions work on touch devices
- Expense modal opens/closes correctly

## Success Criteria

1. User can set overall budget and per-category limits independently
2. Dashboard data updates when switching time periods
3. Expense detail modal shows complete information
4. Alerts appear at correct thresholds
5. Charts are interactive and animate on data changes
6. Theme toggle works and persists preference
