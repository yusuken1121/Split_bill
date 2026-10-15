# Spec Delta

## Purpose

Lets users inspect how registered fixed costs move month to month on the Fixed costs page, by year and by kind.

## ADDED Requirements

### Requirement: User can view a year of fixed-cost amounts
The Fixed costs page SHALL show a year-scoped trend of registered fixed costs. Only expense rows whose name parses as a fixed-cost kind and month, and that have a date, SHALL be included. The year MUST come from the date; the month MUST come from the parsed name.

#### Scenario: Default to current year
- **WHEN** the user opens the Fixed costs page
- **THEN** the trend uses the current calendar year and shows that year’s total, chart, and table

#### Scenario: Select another year
- **WHEN** the user chooses a year that has registered fixed costs
- **THEN** the headline total, chart, and table update to that year

#### Scenario: Non fixed-cost rows are excluded
- **WHEN** an expense name does not parse as a fixed-cost kind and month, or the row has no date
- **THEN** it MUST NOT appear in the year total, chart, or numbers table

### Requirement: Chart shows twelve months and can focus one kind
The trend SHALL show one column per month of the selected year. Months with no registered amount for a kind MUST render as zero. The user SHALL be able to view all kinds stacked or a single kind.

#### Scenario: All kinds stacked
- **WHEN** the user views All kinds for 2026
- **THEN** each month column shows the stacked amounts for rent, electric, gas, water, and Wi-Fi

#### Scenario: Focus one kind
- **WHEN** the user focuses Electric for 2026
- **THEN** each month column shows only the electric amount for that month

#### Scenario: Empty year
- **WHEN** the selected year has no registered fixed costs
- **THEN** the headline total is 0 and all twelve month columns are zero

### Requirement: Numbers table lists monthly amounts by kind
The trend SHALL include a numbers table for the selected year. Each month row MUST show the amount for every kind and the month total. A footer row MUST show the year total.

#### Scenario: Month with mixed kinds
- **WHEN** 2026-05 has rent, electric, and Wi-Fi registered and no gas or water
- **THEN** the May row shows those three amounts, zero for gas and water, and the sum as the month total

#### Scenario: Duplicate kind and month
- **WHEN** two expense rows parse to the same kind, year, and month
- **THEN** the trend MUST use only the first of those rows
