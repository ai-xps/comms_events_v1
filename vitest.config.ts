import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") }
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/globalSetup.ts"],
    env: {
      // Integration suites must never skip locally — match CI’s always-on DB.
      TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || "file:./data/test.db",
      DATABASE_URL: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL || "file:./data/test.db",
      SESSION_SECRET: process.env.SESSION_SECRET || "vitest-session-secret-not-for-production-012345",
      APP_ORIGIN: process.env.APP_ORIGIN || "http://localhost:3000"
    },
    // Integration tests share one database; run files one at a time.
    fileParallelism: false,
    coverage: {
      provider: "v8",
      include: [
        "src/lib/calendar.ts",
        "src/lib/security.ts",
        "src/lib/policy.ts",
        "src/lib/insights/aggregate.ts",
        "src/lib/insights/format.ts",
        "src/lib/insights/share.ts",
        "src/lib/export-format.ts",
        "src/lib/geocode.ts",
        "src/lib/scraper/apply.ts",
        "src/lib/scraper/allowlist.ts",
        "src/lib/scraper/harvest.ts",
        "src/lib/scraper/categorise.ts",
        "src/lib/scraper/ics.ts",
        "src/lib/scraper/jsonld.ts"
      ],
      thresholds: { lines: 90, functions: 90, branches: 80, statements: 90 }
    }
  }
});
