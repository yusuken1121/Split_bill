import { NextRequest, NextResponse } from "next/server";
import { deleteExpense, updateExpense } from "@/lib/notion";
import { updateExpenseSchema } from "@/lib/validators/expense.schema";
import { handleRouteError } from "@/lib/route-error";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = updateExpenseSchema.parse(body);
    await updateExpense({ id, ...validated });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "/api/expenses/[id] PATCH");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteExpense(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "/api/expenses/[id] DELETE");
  }
}
