import { expect, type Page } from "@playwright/test";

/** Demo seed accounts — only used against the local/CI e2e DB, never printed into docs. */
export const accounts = {
  admin: { cell: "07000000001", password: "AdminPass1" },
  leader: { cell: "07000000002", password: "LeaderPass1" },
  member: { cell: "07000000004", password: "MemberPass1" }
} as const;

/** Seed leaves past unconfirmed bookings; the Attend prompt blocks clicks until dismissed. */
export async function dismissAttendancePrompt(page: Page) {
  const askLater = page.getByRole("button", { name: /ask me next time/i });
  if (await askLater.isVisible({ timeout: 1500 }).catch(() => false)) {
    await askLater.click();
  }
}

export async function login(page: Page, who: keyof typeof accounts) {
  const { cell, password } = accounts[who];
  await page.goto("/login");
  await page.locator('select[name="cellNumber"]').selectOption(cell);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page).not.toHaveURL(/\/login/);
  await dismissAttendancePrompt(page);
}

export async function expectNavHas(page: Page, label: string | RegExp) {
  await expect(page.getByRole("navigation").getByRole("link", { name: label })).toBeVisible();
}

export async function expectNavLacks(page: Page, label: string | RegExp) {
  await expect(page.getByRole("navigation").getByRole("link", { name: label })).toHaveCount(0);
}
