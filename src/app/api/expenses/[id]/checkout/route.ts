import { NextRequest, NextResponse } from "next/server";
import { checkoutExpense } from "@/lib/notion";
import { checkoutExpenseSchema } from "@/lib/validators/expense.schema";
import { handleRouteError } from "@/lib/route-error";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = checkoutExpenseSchema.parse(body);
    await checkoutExpense({ id, ...validated });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error, "/api/expenses/[id]/checkout POST");
  }
}
