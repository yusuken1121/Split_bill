"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { notion } from "@/lib/notion";

function revalidateExpensePages() {
  revalidatePath("/pending");
  revalidatePath("/dashboard");
  revalidatePath("/fixed-costs");
  revalidatePath("/");
}

const updateExpenseSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  price: z.number().nonnegative(),
  whose: z.enum(["both", "Y", "E"]),
  whoPaid: z.enum(["Y", "E"]),
});

const deleteExpenseSchema = z.object({
  id: z.string().min(1),
});

export async function updateExpenseAction(input: unknown) {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not defined in environment variables.");
  }

  const parsed = updateExpenseSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid expense update.");
  }

  const { id, name, date, price, whose, whoPaid } = parsed.data;

  try {
    await notion.pages.update({
      page_id: id,
      properties: {
        Stuff: {
          title: [{ text: { content: name } }],
        },
        Date: {
          date: { start: date },
        },
        Price: {
          number: price,
        },
        whose: {
          select: { name: whose },
        },
        "who paid": {
          select: { name: whoPaid },
        },
      },
    });

    revalidateExpensePages();
    return { success: true as const };
  } catch (error) {
    console.error("Failed to update expense in Notion:", error);
    throw new Error("Failed to update expense");
  }
}

export async function deleteExpenseAction(input: unknown) {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not defined in environment variables.");
  }

  const parsed = deleteExpenseSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid expense delete.");
  }

  try {
    await notion.pages.update({
      page_id: parsed.data.id,
      in_trash: true,
    });

    revalidateExpensePages();
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete expense in Notion:", error);
    throw new Error("Failed to delete expense");
  }
}
