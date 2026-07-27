import fs from "node:fs";
import { courseSchema } from "../src/domain/courses/course-schema";

const file = process.argv[2];
if (!file) throw new Error("Usage: npm run course:validate -- path/to/course.json");
courseSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
console.log(`Valid course: ${file}`);
