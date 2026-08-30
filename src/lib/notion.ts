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
