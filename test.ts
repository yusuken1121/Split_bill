import { Client } from "@notionhq/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const shoppingDatabaseId = process.env.NOTION_SHOPPING_DATABASE_ID || "27d6803817604b1eb2f0fb3de06e771b";

async function run() {
  try {
    await notion.pages.create({
      parent: { database_id: shoppingDatabaseId },
      properties: {
        "Stuff": {
          title: [ { text: { content: "Test Stuff" } } ]
        },
        "Status": {
          status: { name: "Not bought" }
        },
        "Date": {
          date: { start: new Date().toISOString().split("T")[0] }
        },
        "whose": {
          select: { name: "both" }
        }
      }
    });
    console.log("Success");
  } catch (err: any) {
    console.error("Error:", err.body || err);
  }
}
run();
