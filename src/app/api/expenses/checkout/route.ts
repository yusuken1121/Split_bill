import { NextRequest, NextResponse } from "next/server";
import { checkoutExpense } from "@/lib/notion";
import { checkoutExpenseSchema } from "@/lib/validators/expense.schema";
import { handleRouteError } from "@/lib/route-error";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = checkoutExpenseSchema.parse(body);
    await checkoutExpense(validated);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "/api/expenses/checkout POST");
  }
}
