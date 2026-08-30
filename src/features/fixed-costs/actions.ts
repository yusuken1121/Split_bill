"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getExpenses } from "@/lib/notion";
import { saveShoppingAction } from "@/features/shopping/actions";
import { FIXED_COST_DEFAULTS, FIXED_COST_KINDS, RENT_PRICE } from "./constants";
import {
  collectRegisteredMonths,
  coverageFromMonthKey,
  coverageLabel,
  isMonthRegistered,
  lastDayOfCoverageMonth,
} from "./parse";

const saveFixedCostSchema = z.object({
  kind: z.enum(FIXED_COST_KINDS),
  coverageMonth: z.string().regex(/^\d{4}-\d{2}$/),
  price: z.number().positive(),
});

export async function saveFixedCostAction(input: unknown) {
  const parsed = saveFixedCostSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid fixed cost input.");
  }

  const { kind, coverageMonth } = parsed.data;
  const coverage = coverageFromMonthKey(coverageMonth);
  if (!coverage.month || coverage.month < 1 || coverage.month > 12) {
    throw new Error("Invalid coverage month.");
  }

  const date = lastDayOfCoverageMonth(coverage);

  const price = kind === "rent" ? RENT_PRICE : parsed.data.price;
  const stuff = coverageLabel(kind, coverage.month);

  const expenses = await getExpenses();
  const registered = collectRegisteredMonths(expenses);
  if (isMonthRegistered(registered[kind], coverage)) {
    throw new Error(`${stuff} is already registered.`);
  }

  await saveShoppingAction({
    stuff,
    date,
    price,
    status: FIXED_COST_DEFAULTS.status,
    whoPaid: FIXED_COST_DEFAULTS.whoPaid,
    whose: FIXED_COST_DEFAULTS.whose,
  });

  revalidatePath("/fixed-costs");
  return { success: true as const };
}
