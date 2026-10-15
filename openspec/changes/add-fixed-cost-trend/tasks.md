# Tasks

## 1. Aggregation

- [x] 1.1 Collect price with each registered coverage month in `src/features/fixed-costs/parse.ts`, keep first-row-wins on kind+year+month, and verify `collectRegisteredMonths` still returns the same months
- [x] 1.2 Add `buildFixedCostYearSeries` and year-list helpers in `src/features/fixed-costs/trend.ts` and verify a mixed year fills Jan–Dec, zeros missing kinds, and ignores non-fixed-cost rows

## 2. Fixed costs UI

- [x] 2.1 Add `FixedCostsTrend` with year picker (default current year), year total, stacked bar chart, kind-focus control, and monthly numbers table
- [x] 2.2 Render the trend on the Fixed costs page from the already-fetched expense list and verify a save still refreshes both registration chips and the trend

## 3. Verification

- [ ] 3.1 Verify all-kinds view: year with data shows stacked amounts, table month totals match the chart, empty year is ¥0 with twelve zero months
- [ ] 3.2 Verify kind focus, year change, and that shopping (non fixed-cost) rows never appear in the trend
