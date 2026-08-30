import { NextRequest, NextResponse } from "next/server";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "@/lib/notion";
import {
  createExpenseSchema,
  deleteExpenseSchema,
  updateExpenseSchema,
} from "@/lib/validators/expense.schema";
import { handleRouteError } from "@/lib/route-error";

export const dynamic = "force-dynamic";

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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = updateExpenseSchema.parse(body);
    await updateExpense(validated);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "/api/expenses PATCH");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = deleteExpenseSchema.parse(body);
    await deleteExpense(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "/api/expenses DELETE");
  }
}
