## Why

The Fixed costs page already records rent, electric, gas, water, and Wi-Fi by coverage month, but it only shows which months are registered. Users cannot see how those amounts change over time, so they have to open the all-expense dashboard or Notion to compare bills.

## What Changes

- Add a **year-scoped trend** on the Fixed costs page: year picker, year total, stacked monthly chart by kind, and a numbers table.
- Let the user focus the chart on one kind (or all kinds) so a single utility’s movement is easy to read.
- Derive the series from existing expense rows whose names parse as fixed costs (`kind-Month` / legacy `Rent - Month`). No new Notion fields or save API.

## Capabilities

### New Capabilities

- `fixed-cost-trend`: Year-scoped fixed-cost reporting on the Fixed costs page (year picker, year total, monthly chart by kind, numbers table).

### Modified Capabilities

- None. There are no existing OpenSpec capability specs.

## Impact

- `src/features/fixed-costs/parse.ts` — collect prices with coverage months, not only registration flags.
- `src/features/fixed-costs/trend.ts` — build a 12-month series and year list from those amounts.
- `src/features/fixed-costs/FixedCostsTrend.tsx` — year picker, total, stacked (or single-kind) bar chart, numbers table.
- `src/features/fixed-costs/FixedCostsForm.tsx` — render the trend above the registration cards using the already-fetched expense list.
- Notion schema and `POST /api/fixed-costs` stay unchanged. Recharts is already a dependency.
