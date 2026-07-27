import fs from "node:fs";
import path from "node:path";
import { importCourse } from "../src/domain/courses/import-course";
import "../src/db/migrate";

const dir = path.join(process.cwd(), "content", "courses");
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json")).sort();
for (const file of files) importCourse(JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")), "update");
console.log(`Seeded ${files.length} courses`);
