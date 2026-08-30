import type { ExpenseItem } from "@/lib/notion";
import {
  BIMONTHLY_KINDS,
  FIXED_COST_KINDS,
  MONTH_NAMES,
  type FixedCostKind,
} from "./constants";

export interface CoverageMonth {
  year: number;
  month: number;
}

export type RegisteredByKind = Record<FixedCostKind, CoverageMonth[]>;

const KIND_NAME_PATTERN =
  /^(rent|gas|water|wifi)-([A-Za-z]+)$/i;
const LEGACY_RENT_PATTERN = /^Rent\s*-\s*([A-Za-z]+)$/i;

function monthIndexFromName(raw: string): number | null {
  const index = MONTH_NAMES.findIndex(
    (name) => name.toLowerCase() === raw.toLowerCase(),
  );
  return index === -1 ? null : index + 1;
}

export function parseFixedCostName(
  name: string,
): { kind: FixedCostKind; month: number } | null {
  const standard = name.trim().match(KIND_NAME_PATTERN);
  if (standard) {
    const kind = standard[1].toLowerCase() as FixedCostKind;
    const month = monthIndexFromName(standard[2]);
    if (month && (FIXED_COST_KINDS as readonly string[]).includes(kind)) {
      return { kind, month };
    }
  }

  const legacyRent = name.trim().match(LEGACY_RENT_PATTERN);
  if (legacyRent) {
    const month = monthIndexFromName(legacyRent[1]);
    if (month) {
      return { kind: "rent", month };
    }
  }

  return null;
}

export function coverageLabel(kind: FixedCostKind, month: number): string {
  return `${kind}-${MONTH_NAMES[month - 1]}`;
}

export function monthKeyFromCoverage(coverage: CoverageMonth): string {
  return `${coverage.year}-${String(coverage.month).padStart(2, "0")}`;
}

export function coverageFromMonthKey(monthKey: string): CoverageMonth {
  return {
    year: Number(monthKey.slice(0, 4)),
    month: Number(monthKey.slice(5, 7)),
  };
}

export function addMonths(coverage: CoverageMonth, count: number): CoverageMonth {
  const zeroBased = coverage.year * 12 + (coverage.month - 1) + count;
  return {
    year: Math.floor(zeroBased / 12),
    month: (zeroBased % 12) + 1,
  };
}

export function collectRegisteredMonths(items: ExpenseItem[]): RegisteredByKind {
  const registered: RegisteredByKind = {
    rent: [],
    wifi: [],
    gas: [],
    water: [],
  };

  for (const item of items) {
    const parsed = parseFixedCostName(item.name);
    if (!parsed || !item.date) {
      continue;
    }
    const year = Number(item.date.slice(0, 4));
    if (!Number.isFinite(year)) {
      continue;
    }
    const already = registered[parsed.kind].some(
      (entry) => entry.year === year && entry.month === parsed.month,
    );
    if (!already) {
      registered[parsed.kind].push({ year, month: parsed.month });
    }
  }

  for (const kind of FIXED_COST_KINDS) {
    registered[kind].sort((a, b) => a.year - b.year || a.month - b.month);
  }

  return registered;
}

export function isMonthRegistered(
  registered: CoverageMonth[],
  coverage: CoverageMonth,
): boolean {
  return registered.some(
    (entry) => entry.year === coverage.year && entry.month === coverage.month,
  );
}

export function lastRegistration(
  registered: CoverageMonth[],
): CoverageMonth | null {
  if (registered.length === 0) {
    return null;
  }
  return registered[registered.length - 1];
}

export function nextBimonthlyDue(
  registered: CoverageMonth[],
): CoverageMonth | null {
  const last = lastRegistration(registered);
  if (!last) {
    return null;
  }
  return addMonths(last, 2);
}

export function isBimonthlyKind(kind: FixedCostKind): boolean {
  return BIMONTHLY_KINDS.includes(kind);
}
