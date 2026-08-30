import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = process.env.NOTION_SHOPPING_DATABASE_ID;

async function check() {
  console.log("Checking DB ID:", dbId);
  try {
    const res = await notion.databases.retrieve({
      database_id: dbId as string,
    });
    console.log("databases.retrieve SUCCESS:", res.id);
  } catch (e: any) {
    console.log("databases.retrieve ERROR:", e.message);
  }
}

check();
