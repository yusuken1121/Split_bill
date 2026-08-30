## 1. Report aggregation

- [x] 1.1 Extend `calculateDashboardData` to return Done items grouped by `YYYY-MM` (date, name, price) and monthly totals, excluding undated and Not bought rows
- [x] 1.2 Add a helper that builds a 12-month series for a given year (Jan–Dec), filling missing months with 0

## 2. Dashboard UI

- [x] 2.1 Add Monthly / Yearly toggle and period pickers (month input in monthly mode, year select in yearly mode), defaulting to the current month
- [x] 2.2 Add a headline total card for the selected month (monthly mode) or selected year (yearly mode)
- [x] 2.3 Limit the existing bar chart to the twelve months of the relevant year and highlight the selected month in monthly mode
- [x] 2.4 Add a numbers table: line items (date, name, amount + month total) in monthly mode; month totals + year total in yearly mode
- [x] 2.5 Keep the settlement card unchanged and wire the new payload from `src/app/dashboard/page.tsx`

## 3. Verification

- [x] 3.1 Verify monthly: pick a month with data, empty month, and that Not bought items are excluded
- [x] 3.2 Verify yearly: pick a year, confirm 12 bars, table totals match the headline, and settlement is unchanged when toggling
