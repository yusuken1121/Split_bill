import { NextRequest, NextResponse } from "next/server";
import { createExpense, getExpenses } from "@/lib/notion";
import { FIXED_COST_DEFAULTS, RENT_PRICE } from "@/features/fixed-costs/constants";
import {
  collectRegisteredMonths,
  coverageFromMonthKey,
  coverageLabel,
  isMonthRegistered,
  lastDayOfCoverageMonth,
} from "@/features/fixed-costs/parse";
import { saveFixedCostSchema } from "@/lib/validators/expense.schema";
import { handleRouteError } from "@/lib/route-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kind, coverageMonth, price: inputPrice } =
      saveFixedCostSchema.parse(body);

    const coverage = coverageFromMonthKey(coverageMonth);
    if (!coverage.month || coverage.month < 1 || coverage.month > 12) {
      throw new Error("Invalid coverage month.");
    }

    const expenses = await getExpenses();
    const registered = collectRegisteredMonths(expenses);
    const stuff = coverageLabel(kind, coverage.month);
    if (isMonthRegistered(registered[kind], coverage)) {
      throw new Error(`${stuff} is already registered.`);
    }

    await createExpense({
      stuff,
      date: lastDayOfCoverageMonth(coverage),
      price: kind === "rent" ? RENT_PRICE : inputPrice,
      status: FIXED_COST_DEFAULTS.status,
      whoPaid: FIXED_COST_DEFAULTS.whoPaid,
      whose: FIXED_COST_DEFAULTS.whose,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "/api/fixed-costs POST");
  }
}
