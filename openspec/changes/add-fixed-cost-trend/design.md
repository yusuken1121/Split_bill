# Design

## Context

The Fixed costs page already loads the full expense list via `useExpenses()` and uses `collectRegisteredMonths` to mark coverage months. Amounts live on those same rows (`price`), named `kind-Month` (plus legacy `Rent - Month`). The dashboard already uses Recharts for year-month bars. See proposal.md for motivation.

Constraints: do not add Notion properties or a new fetch; keep registration cards as they are; follow the existing client pipeline (UI → React Query → `/api/expenses`).

## Goals / Non-Goals

**Goals:**

- Aggregate existing fixed-cost rows into a 12-month series for a chosen year.
- Render that series on the Fixed costs page with a year total, stacked (or single-kind) chart, and numbers table.
- Reuse the already-fetched expense list so saving a cost refreshes the trend.

**Non-Goals:**

- New API routes or Notion queries.
- Monthly/Yearly toggle like the dashboard (this page is already month-oriented for entry).
- Comparing two years side by side, budgets, or export.
- Changing how fixed costs are saved.

## Decisions

### 1. Client-side aggregation from the existing expense list

`getExpenses()` already returns every shopping row. Parse names with `parseFixedCostName`, take the year from `date` (`YYYY-MM-DD` prefix), and keep `price`. No extra Notion call.

**Alternative considered:** `GET /api/fixed-costs` that returns a pre-aggregated series. Rejected: the page already has the list, and toggling year/kind must not refetch.

### 2. Share collection with registration months

Extend collection so each registered coverage month also carries `price`. `collectRegisteredMonths` can project those entries down to `{ year, month }` so duplicate handling stays in one place (first row wins).

**Alternative considered:** A second independent loop. Rejected: two loops would drift on parse rules and duplicates.

### 3. Year picker + kind focus, not a Monthly/Yearly report mode

The useful question here is “how did each bill move this year?” A year of stacked bars plus a kind filter answers that. A monthly line-item table would duplicate the registration cards.

- Default year: current calendar year.
- Year options: years present in the data, plus the current year and the selected year.
- Kind focus: All (stacked) or one of rent / electric / gas / water / wifi.

**Alternative considered:** Line chart only. Rejected: stacked bars match the dashboard and make the monthly total obvious.

### 4. Bimonthly kinds stay as zeros on off months

Gas and water are billed every two months. Do not spread or interpolate. Zeros are the real payment pattern.

### 5. Stay on the Fixed costs feature module

Add `trend.ts` helpers and `FixedCostsTrend` next to `FixedCostsForm`. Pass the already-loaded expenses in; do not call Notion or a use case from the component.

**Alternative considered:** Put aggregation in `src/lib/calculations.ts`. Rejected: name parsing and kind constants already live in `src/features/fixed-costs`.

## Risks / Trade-offs

- **[Risk] Fetching all expenses may get slow as Notion grows** → Mitigation: same as today; revisit server-side date filters only if this becomes a problem.
- **[Risk] Date year vs name month mismatch** → Mitigation: keep the current rule (year from date, month from name) so the trend matches registered-month chips.
- **[Trade-off] First-row-wins on duplicates** → Matches registration; the save API already blocks a second row for the same kind and coverage month.

## Migration Plan

No data migration. Deploy the Fixed costs UI change. Rollback is reverting the feature-module files.

## Open Questions

None blocking.
