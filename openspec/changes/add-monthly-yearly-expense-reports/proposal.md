## Why

The dashboard already shows who owes whom and a single all-time monthly bar chart, but it does not answer “how much did we spend this month?” or let us inspect a chosen year. We need a period-aware report of Done expenses—totals, a chart, and a numbers table—without category/genre filtering.

## What Changes

- Add a **Monthly / Yearly** toggle on the expense dashboard.
- **Monthly view**: pick a month; show that month’s total (sum of Done items), keep a bar chart of all months in the selected year, and add a numbers table for the selected month.
- **Yearly view**: pick a year; show that year’s total (sum of Done items), a bar chart of all months in that year, and a numbers table of monthly totals.
- Keep the existing settlement card.
- Out of scope: genre/category split, store-name mapping (Seiyu → food), and changing how items are saved in Notion.

## Capabilities

### New Capabilities

- `expense-period-reports`: Period-aware spend reporting on the dashboard (monthly vs yearly, period pickers, total for the selected period, bar chart, numbers table). Settlement display stays as-is.

### Modified Capabilities

- None. There are no existing OpenSpec capability specs.

## Impact

- `src/app/dashboard/page.tsx` — pass richer report data into the dashboard UI.
- `src/lib/calculations.ts` — aggregate Done expenses by month/year and by day within a month.
- `src/features/dashboard/ExpenseDashboard.tsx` — period toggle, month/year pickers, total card, chart, numbers table.
- Notion schema unchanged. Reports use existing `ExpenseItem` fields (`status`, `price`, `date`).
- Client-side period selection on already-fetched expenses (no extra Notion queries per toggle).
