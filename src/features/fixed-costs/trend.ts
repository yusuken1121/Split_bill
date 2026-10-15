import { FIXED_COST_KINDS, type FixedCostKind } from "./constants";
import type { AmountsByKind } from "./parse";

export interface FixedCostMonthRow {
  month: string;
  rent: number;
  electric: number;
  gas: number;
  water: number;
  wifi: number;
  total: number;
}

function emptyMonthRow(monthKey: string): FixedCostMonthRow {
  return {
    month: monthKey,
    rent: 0,
    electric: 0,
    gas: 0,
    water: 0,
    wifi: 0,
    total: 0,
  };
}

export function buildFixedCostYearSeries(
  amounts: AmountsByKind,
  year: number,
): FixedCostMonthRow[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const row = emptyMonthRow(`${year}-${String(month).padStart(2, "0")}`);
    for (const kind of FIXED_COST_KINDS) {
      const entry = amounts[kind].find(
        (item) => item.year === year && item.month === month,
      );
      const price = entry?.price ?? 0;
      row[kind] = price;
      row.total += price;
    }
    return row;
  });
}

export function availableFixedCostYears(
  amounts: AmountsByKind,
  selectedYear: number,
): number[] {
  const years = new Set<number>([selectedYear, new Date().getFullYear()]);
  for (const kind of FIXED_COST_KINDS) {
    for (const entry of amounts[kind]) {
      years.add(entry.year);
    }
  }
  return [...years].sort((a, b) => b - a);
}

export function yearTotalForKind(
  series: FixedCostMonthRow[],
  kind: FixedCostKind | "all",
): number {
  return series.reduce(
    (sum, row) => sum + (kind === "all" ? row.total : row[kind]),
    0,
  );
}
