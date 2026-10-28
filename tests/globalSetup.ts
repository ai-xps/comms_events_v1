import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** Ensure integration tests always have a SQLite file and schema — never skip. */
export default async function globalSetup() {
  const url = process.env.TEST_DATABASE_URL || "file:./data/test.db";
  process.env.TEST_DATABASE_URL = url;
  process.env.DATABASE_URL = process.env.DATABASE_URL || url;

  const fileMatch = /^file:(.+)$/.exec(url);
  if (fileMatch) {
    const filePath = path.resolve(process.cwd(), fileMatch[1]);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url }
  });
}
