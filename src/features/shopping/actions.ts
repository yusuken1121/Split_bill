"use server";

import { Client } from "@notionhq/client";
import { ShoppingData } from "./types";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const shoppingDatabaseId =
  process.env.NOTION_SHOPPING_DATABASE_ID || "27d6803817604b1eb2f0fb3de06e771b";

export async function saveShoppingAction(data: ShoppingData) {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not defined in environment variables.");
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties: Record<string, any> = {
      Stuff: {
        title: [
          {
            text: {
              content: data.stuff,
            },
          },
        ],
      },
      Status: {
        status: {
          name: data.status,
        },
      },
      Date: {
        date: {
          start: data.date,
        },
      },
      whose: {
        select: {
          name: data.whose,
        },
      },
    };

    if (data.price !== undefined && !isNaN(data.price)) {
      properties["Price"] = {
        number: data.price, // Ensure property name matches Notion precisely
      };
    }

    if (data.whoPaid) {
      properties["who paid"] = {
        select: {
          name: data.whoPaid,
        },
      };
    }

    await notion.pages.create({
      parent: { database_id: shoppingDatabaseId },
      properties,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save shopping item to Notion:", error);
    throw new Error("Failed to save to Notion");
  }
}
