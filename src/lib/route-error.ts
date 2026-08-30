import { NextResponse } from "next/server";
import { z } from "zod";

export function handleRouteError(
  error: unknown,
  context: string,
): NextResponse {
  console.error(`Error in ${context}:`, error);

  if (error instanceof z.ZodError) {
    const errorMessage = error.issues.map((issue) => issue.message).join(", ");
    return NextResponse.json(
      { error: `Validation error: ${errorMessage}` },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : "Internal Server Error",
    },
    { status: 500 },
  );
}
