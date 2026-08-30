import { Client, collectPaginatedAPI, isFullDatabase, LogLevel } from "@notionhq/client";

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  logLevel: LogLevel.DEBUG,
});
export const DATABASE_ID =
  process.env.NOTION_SHOPPING_DATABASE_ID || "27d6803817604b1eb2f0fb3de06e771b";

export interface ExpenseItem {
  id: string;
  name: string;
  status: string;
  price: number;
  date: string;
  whose: "both" | "Y" | "E" | null;
  whoPaid: "Y" | "E" | null;
}

async function getShoppingDataSourceId(): Promise<string> {
  try {
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });
    if (isFullDatabase(database) && database.data_sources[0]?.id) {
      return database.data_sources[0].id;
    }
  } catch {
    // DATABASE_ID may already be a data source id
  }
  return DATABASE_ID;
}

function requireNotionApiKey() {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY is not defined in environment variables.");
  }
}

export async function getExpenses(): Promise<ExpenseItem[]> {
  if (!process.env.NOTION_API_KEY) {
    console.error("NOTION_API_KEY is not set.");
    return [];
  }

  try {
    const dataSourceId = await getShoppingDataSourceId();
    const results = await collectPaginatedAPI(notion.dataSources.query, {
      data_source_id: dataSourceId,
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        name: props.Stuff?.title[0]?.plain_text || "無題",
        status: props.Status?.status?.name || "Not bought",
        price: props.Price?.number || 0,
        date: props.Date?.date?.start || "",
        whose: props.whose?.select?.name || null,
        whoPaid: props["who paid"]?.select?.name || null,
      };
    });
  } catch (error) {
    console.error("Failed to fetch expenses:", error);

    return [];
  }
}

export async function createExpense(data: {
  stuff: string;
  date: string;
  price?: number;
  status: string;
  whoPaid: "Y" | "E" | null;
  whose: "both" | "Y" | "E";
}): Promise<void> {
  requireNotionApiKey();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: Record<string, any> = {
    Stuff: {
      title: [{ text: { content: data.stuff } }],
    },
    Status: {
      status: { name: data.status },
    },
    Date: {
      date: { start: data.date },
    },
    whose: {
      select: { name: data.whose },
    },
  };

  if (data.price !== undefined && !Number.isNaN(data.price)) {
    properties.Price = { number: data.price };
  }

  if (data.whoPaid) {
    properties["who paid"] = { select: { name: data.whoPaid } };
  }

  await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties,
  });
}

export async function updateExpense(data: {
  id: string;
  name: string;
  date: string;
  price: number;
  whose: "both" | "Y" | "E";
  whoPaid: "Y" | "E";
}): Promise<void> {
  requireNotionApiKey();

  await notion.pages.update({
    page_id: data.id,
    properties: {
      Stuff: {
        title: [{ text: { content: data.name } }],
      },
      Date: {
        date: { start: data.date },
      },
      Price: {
        number: data.price,
      },
      whose: {
        select: { name: data.whose },
      },
      "who paid": {
        select: { name: data.whoPaid },
      },
    },
  });
}

export async function checkoutExpense(data: {
  id: string;
  price: number;
  whoPaid: "Y" | "E";
}): Promise<void> {
  requireNotionApiKey();

  await notion.pages.update({
    page_id: data.id,
    properties: {
      Status: {
        status: { name: "Done" },
      },
      Price: {
        number: data.price,
      },
      "who paid": {
        select: { name: data.whoPaid },
      },
    },
  });
}

export async function deleteExpense(id: string): Promise<void> {
  requireNotionApiKey();

  await notion.pages.update({
    page_id: id,
    in_trash: true,
  });
}
