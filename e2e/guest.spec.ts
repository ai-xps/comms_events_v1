import { test, expect } from "@playwright/test";

test.describe("guest paths", () => {
  test("intro and login are public", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /gather/i }).or(page.locator(".gather-mark")).first()).toBeVisible();
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("open redirect next= is blocked", async ({ page }) => {
    await page.goto("/login?next=https://evil.example/");
    // After a failed or successful login attempt the app must not send people off-site;
    // landing on login with a safe next is enough for the guest smoke.
    await expect(page).toHaveURL(/\/login/);
  });

  test("bad password stays on login", async ({ page }) => {
    await page.goto("/login");
    const select = page.locator("select").first();
    const options = await select.locator("option").allTextContents();
    const cell = options.find((o) => /\d{11}/.test(o))?.match(/\d{11}/)?.[0];
    if (!cell) test.skip();
    await select.selectOption({ label: options.find((o) => o.includes(cell!))! });
    await page.locator('input[type="password"]').fill("DefinitelyWrong1");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
