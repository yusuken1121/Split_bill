## Context

The dashboard already loads all Notion shopping rows, computes settlement, and renders a single Recharts bar chart of monthly totals (`src/lib/calculations.ts`, `src/features/dashboard/ExpenseDashboard.tsx`). Items have no category field. Genre reporting was dropped. Users now want period-aware totals plus a numbers table, with a Monthly / Yearly switch.

Constraints: keep using existing `ExpenseItem` fields; only `status === "Done"` counts; do not change the Notion schema; follow the current dashboard data flow rather than a Clean Architecture refactor of Notion access.

## Goals / Non-Goals

**Goals:**

- Let the user switch Monthly vs Yearly on the dashboard.
- Monthly: choose a year-month; total is the sum of Done prices in that month.
- Yearly: choose a year; total is the sum of Done prices in that year.
- Keep a bar chart of all months in the relevant year (existing visualization).
- Add a numbers table that matches the current view.
- Keep the settlement card.

**Non-Goals:**

- Genre / store-name category mapping.
- New Notion properties or backfill.
- Filtering by `whose` / `whoPaid`.
- Export, budgets, or comparison to a previous period.
- Moving Notion access into `src/core` / `src/infrastructure` as part of this change.

## Decisions

### 1. Chart stays month-grained; the toggle changes total + table + which month is in focus

The existing chart (one bar per `YYYY-MM`) is kept. A daily-in-month chart would be a different visualization and was not requested.

- **Yearly**: year picker; chart = 12 months of that year; table = month | amount; total = year sum.
- **Monthly**: month picker (`YYYY-MM`); chart = the 12 months of that month’s year, with the selected month highlighted; table = each Done item in that month (date, name, amount); total = month sum.

**Alternative considered:** Daily bars in monthly view. Rejected to honor “keep the existing bar chart (all months in a row).”

### 2. Aggregate on the server, select period on the client

`getExpenses()` already returns the full list. The server computes settlement plus a compact report payload (monthly totals, items grouped by `YYYY-MM`). The client holds `viewMode`, `selectedYear`, and `selectedMonth` so toggling does not refetch Notion.

**Alternative considered:** Query Notion again per period. Rejected (latency, rate limits, no extra filters needed).

### 3. Only Done items with a date contribute

Matches current `calculateDashboardData`. Items without `date` are excluded from period reports (they cannot be bucketed). `Not bought` is excluded.

### 4. Defaults and empty periods

- Default view: Monthly, current calendar month (local date).
- Switching to Yearly uses that month’s year (or the current year).
- Empty month/year: total `¥0`, empty table, zero-height bars for months with no data. Always show Jan–Dec for the selected year so the yearly transition is visible.

### 5. Stay on the existing dashboard module

Extend `calculateDashboardData` and `ExpenseDashboard` instead of a new route. Recharts is already a dependency.

**Alternative considered:** New `/reports` page. Rejected; the Dashboard menu item is the natural home and settlement should stay nearby.

## Risks / Trade-offs

- **[Risk] Fetching all expenses may get slow as the Notion DB grows** → Mitigation: same as today; pagination already exists in `getExpenses`. Revisit server-side date filters only if this becomes a problem.
- **[Risk] Timezone: `date` is a Notion date (`YYYY-MM-DD`) with no time** → Mitigation: bucket by the date string prefix (`YYYY-MM` / `YYYY`), not `Date` in the server TZ.
- **[Trade-off] Monthly table is line items, yearly table is month totals** → Different columns per mode; clearer than forcing one table shape.

## Migration Plan

No data migration. Deploy with the existing dashboard route. Rollback is reverting the dashboard/calculation UI changes.

## Open Questions

None blocking. Yearly total (year sum) is included even though the user defined “total expense” as a monthly sum, so the Yearly view has a matching headline number.
