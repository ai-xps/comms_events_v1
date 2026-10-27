import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("admin paths", () => {
  test("pending approve/discard controls, scraper empty priority, members delete control", async ({ page }) => {
    await login(page, "admin");

    await page.goto("/pending");
    const tile = page.getByTestId("pending-tile").first();
    if (await tile.count()) {
      await expect(tile.getByTestId("pending-approve")).toBeVisible();
      await expect(tile.getByTestId("pending-discard")).toBeVisible();
    } else {
      await expect(page.getByText(/nothing waiting/i)).toBeVisible();
    }

    await page.goto("/scraper");
    await expect(page.getByRole("heading", { name: /scraper/i })).toBeVisible();
    // Either empty notice or Priority URLs field present
    const empty = page.getByTestId("priority-empty");
    const urls = page.locator("textarea[name='priorityUrls']");
    await expect(empty.or(urls).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /organisations/i })).toBeVisible();

    await page.goto("/members");
    const edit = page.locator('a[href*="/members/"]').filter({ hasNotText: /add|new/i }).first();
    if (await edit.count()) {
      await edit.click();
      await expect(page.getByTestId("member-delete")).toBeVisible();
    }

    await page.goto("/reports");
    await expect(page.getByText(/export|events|date/i).first()).toBeVisible();
  });

  test("logout clears session", async ({ page }) => {
    await login(page, "admin");
    await page.getByRole("button", { name: /sign out/i }).first().click();
    await expect(page).toHaveURL(/\/(login)?$/);
    await page.goto("/calendar");
    await expect(page).toHaveURL(/login/);
  });
});
