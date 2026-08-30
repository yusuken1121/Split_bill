import {
  Client,
  collectPaginatedAPI,
  isFullDatabase,
  isFullPage,
  LogLevel,
  PropertyItemObjectResponse,
  QueryDataSourceResponse,
} from "@notionhq/client";

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

async function getItemsFromNotionDataBase<T>(): Promise<Array<T>> {
  const pages: Array<QueryDataSourceResponse["results"][number]> = [];
  let cursor: string | undefined;

  const shouldContinue = true;
  while (shouldContinue) {
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });
    if (!isFullDatabase(database)) {
      console.error(`No read permissions on database: ${DATABASE_ID}`);
      break;
    }
    const { results, next_cursor } = await notion.dataSources.query({
      data_source_id: database.data_sources[0].id,
      start_cursor: cursor,
    });
    pages.push(...results);
    if (!next_cursor) {
      break;
    }
    cursor = next_cursor;
  }
  console.log(`${pages.length} pages successfully fetched.`);

  const items: Array<T> = [];
  for (const page of pages) {
    const pageId = page.id;

    if (!isFullPage(page)) {
      console.error(`Page ${pageId} is not a full page.`);
      continue;
    }

    const statusPropertyId = page.properties["Status"].id;
    const statusPropertyItem = await getPropertyValue({
      pageId,
      propertyId: statusPropertyId,
    });

    const status = getStatusPropertyValue(statusPropertyItem);

    const titlePropertyId = page.properties["Name"].id;
    const titlePropertyItems = await getPropertyValue({
      pageId,
      propertyId: titlePropertyId,
    });
    const title = getTitlePropertyValue(titlePropertyItems);

    items.push({ pageId, status, title });
  }

  return items;
}

/**
 * Extract status as string from property value
 */
function getStatusPropertyValue(
  property: PropertyItemObjectResponse | Array<PropertyItemObjectResponse>,
): string {
  if (Array.isArray(property)) {
    if (property?.[0]?.type === "select") {
      return property[0].select?.name ?? "No Status";
    } else {
      return "No Status";
    }
  } else {
    if (property.type === "select") {
      return property.select?.name ?? "No Status";
    } else {
      return "No Status";
    }
  }
}

/**
 * Extract title as string from property value
 */
function getTitlePropertyValue(
  property: PropertyItemObjectResponse | Array<PropertyItemObjectResponse>,
): string {
  if (Array.isArray(property)) {
    if (property?.[0].type === "title") {
      return property[0].title.plain_text;
    } else {
      return "No Title";
    }
  } else {
    if (property.type === "title") {
      return property.title.plain_text;
    } else {
      return "No Title";
    }
  }
}

/**
 * If property is paginated, returns an array of property items.
 *
 * Otherwise, it will return a single property item.
 */
async function getPropertyValue({
  pageId,
  propertyId,
}: {
  pageId: string;
  propertyId: string;
}): Promise<PropertyItemObjectResponse | Array<PropertyItemObjectResponse>> {
  let propertyItem = await notion.pages.properties.retrieve({
    page_id: pageId,
    property_id: propertyId,
  });
  if (propertyItem.object === "property_item") {
    return propertyItem;
  }

  // Property is paginated.
  let nextCursor = propertyItem.next_cursor;
  const results = propertyItem.results;

  while (nextCursor !== null) {
    propertyItem = await notion.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
      start_cursor: nextCursor,
    });

    if (propertyItem.object === "list") {
      nextCursor = propertyItem.next_cursor;
      results.push(...propertyItem.results);
    } else {
      nextCursor = null;
    }
  }

  return results;
}
