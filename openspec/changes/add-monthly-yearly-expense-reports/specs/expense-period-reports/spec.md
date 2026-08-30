## ADDED Requirements

### Requirement: User can switch between monthly and yearly expense reports
The dashboard SHALL provide a Monthly and a Yearly report mode. Only expenses with status Done and a non-empty date SHALL be included in totals, charts, and tables.

#### Scenario: Default to current month
- **WHEN** the user opens the dashboard
- **THEN** the report is in Monthly mode for the current calendar month

#### Scenario: Switch to yearly mode
- **WHEN** the user selects Yearly
- **THEN** the report uses the year of the previously selected month (or the current year if none) and shows that year’s totals

#### Scenario: Incomplete items are excluded
- **WHEN** an expense has status Not bought, or has no date
- **THEN** it MUST NOT appear in the period total, chart, or numbers table

### Requirement: Monthly report shows a selectable month total, chart, and table
In Monthly mode the system SHALL let the user choose a year-month. The headline total MUST be the sum of Done prices in that month. The bar chart MUST show all twelve months of that year. The numbers table MUST list each Done expense in the selected month.

#### Scenario: Select a month and see its total
- **WHEN** the user chooses Monthly and selects 2026-08
- **THEN** the headline total equals the sum of Done item prices whose date starts with 2026-08

#### Scenario: Monthly chart shows the whole year
- **WHEN** the user is in Monthly mode for 2026-08
- **THEN** the bar chart has one bar per month of 2026 and the August bar is visually distinct

#### Scenario: Monthly numbers table lists line items
- **WHEN** the user is in Monthly mode for a month that has Done expenses
- **THEN** the table shows each item’s date, name, and amount, and a row for the month total

#### Scenario: Empty month
- **WHEN** the selected month has no Done expenses
- **THEN** the headline total is 0, the table has no line items, and other months in the chart still render

### Requirement: Yearly report shows a selectable year total, monthly chart, and monthly table
In Yearly mode the system SHALL let the user choose a year. The headline total MUST be the sum of Done prices in that year. The bar chart MUST show all twelve months of that year. The numbers table MUST show each month’s total.

#### Scenario: Select a year and see its total
- **WHEN** the user chooses Yearly and selects 2026
- **THEN** the headline total equals the sum of Done item prices whose date starts with 2026

#### Scenario: Yearly chart shows month-to-month transition
- **WHEN** the user is in Yearly mode for 2026
- **THEN** the bar chart has one bar per month from 2026-01 through 2026-12 in chronological order

#### Scenario: Yearly numbers table lists monthly totals
- **WHEN** the user is in Yearly mode for a year
- **THEN** the table shows each month and its Done total, and a row for the year total

#### Scenario: Empty year
- **WHEN** the selected year has no Done expenses
- **THEN** the headline total is 0 and all twelve month bars are zero

### Requirement: Settlement remains available on the dashboard
The dashboard SHALL continue to show the existing settlement summary (who owes whom and how much) in addition to the period report.

#### Scenario: Settlement still visible
- **WHEN** the user views monthly or yearly reports
- **THEN** the settlement card remains visible and its amount is unchanged by the period toggle
