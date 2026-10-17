import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") }
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
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
        "src/lib/scraper/apply.ts",
        "src/lib/scraper/allowlist.ts",
        "src/lib/scraper/categorise.ts",
        "src/lib/scraper/ics.ts",
        "src/lib/scraper/jsonld.ts"
      ],
      thresholds: { lines: 90, functions: 90, branches: 80, statements: 90 }
    }
  }
});
