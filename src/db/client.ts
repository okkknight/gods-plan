import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import fs from "node:fs";
import path from "node:path";

const databasePath = process.env.DATABASE_URL?.replace(/^file:/, "") || path.join(process.cwd(), "data", "english-learning.db");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const sqlite = new Database(databasePath);
sqlite.pragma("foreign_keys = ON");
export const db = drizzle(sqlite, { schema });
export { sqlite };
