import { NextRequest, NextResponse } from "next/server";
import {
  createExpense,
  getExpenses,
} from "@/lib/notion";
import { createExpenseSchema } from "@/lib/validators/expense.schema";
import { handleRouteError } from "@/lib/route-error";

export async function GET() {
  try {
    const data = await getExpenses();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError(error, "/api/expenses GET");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createExpenseSchema.parse(body);
    await createExpense(validated);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "/api/expenses POST");
  }
}
