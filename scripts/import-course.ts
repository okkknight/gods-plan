import fs from "node:fs";
import { importCourse } from "../src/domain/courses/import-course";
import "../src/db/migrate";

const file = process.argv[2];
const mode = process.argv.includes("--update") ? "update" : "create";
if (!file) throw new Error("Usage: npm run course:import -- path/to/course.json [--update]");
console.log(importCourse(JSON.parse(fs.readFileSync(file, "utf8")), mode));
