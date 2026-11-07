import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const PORT = Number(process.env.E2E_PORT || 3100);
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${PORT}`;
const dbUrl = process.env.E2E_DATABASE_URL || "file:./data/e2e.db";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "chromium-desktop",
      // Local: system Chrome (avoids Playwright Chromium download). CI: bundled Chromium after install.
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.CI ? {} : { channel: "chrome" as const }),
        viewport: { width: 1280, height: 800 }
      }
    },
    {
      name: "chromium-phone",
      // Emulate a phone viewport in Chrome (iPhone device preset is WebKit and rejects channel chrome).
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.CI ? {} : { channel: "chrome" as const }),
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
      }
    }
  ],
  webServer: {
    command: `npx prisma db push --skip-generate && npx tsx prisma/seed.ts && npx next dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    cwd: path.resolve(__dirname),
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
      SESSION_SECRET: process.env.SESSION_SECRET || "e2e-session-secret-not-for-production-0123456789",
      APP_ORIGIN: baseURL,
      NODE_ENV: "development",
      CRON_SECRET: "e2e-cron-secret"
    }
  }
});
