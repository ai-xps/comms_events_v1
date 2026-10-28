import { test, expect } from "@playwright/test";
import { dismissAttendancePrompt, expectNavLacks, login } from "./helpers";

test.describe("member paths", () => {
  test("home dashboard + calendar views + no admin nav", async ({ page }) => {
    await login(page, "member");
    await page.goto("/");
    await dismissAttendancePrompt(page);
    await expect(page.getByTestId("home-dashboard")).toBeVisible();
    await expect(page.getByTestId("home-upcoming")).toBeVisible();
    await expect(page.getByTestId("home-confirm")).toBeVisible();
    await expect(page.getByTestId("home-new")).toBeVisible();

    await page.goto("/calendar?view=week");
    await dismissAttendancePrompt(page);
    await expect(page.getByTestId("week-time-grid")).toBeVisible();
    await page.goto("/calendar?view=day");
    await dismissAttendancePrompt(page);
    await expect(page.getByTestId("week-time-grid")).toBeVisible();
    await page.goto("/calendar?view=month");
    await dismissAttendancePrompt(page);
    await expect(page.getByTestId("month-grid")).toBeVisible();
    await page.goto("/calendar?view=list");
    await dismissAttendancePrompt(page);
    await expect(page.getByText(/no events|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday/i).first()).toBeVisible();

    await expectNavLacks(page, /scraper/i);
    await expectNavLacks(page, /import/i);
    await page.goto("/insights");
    await expect(page.getByText(/for admins and cell leaders/i)).toBeVisible();
  });

  test("attend and cancel on an event", async ({ page }) => {
    await login(page, "member");
    await page.goto("/calendar?view=list");
    await dismissAttendancePrompt(page);

    const link = page.locator('a[href^="/events/"]').filter({ hasNotText: /add/i }).first();
    await expect(link).toBeVisible();
    await link.click();
    await dismissAttendancePrompt(page);
    await expect(page).toHaveURL(/\/events\//);

    const attend = page.getByRole("button", { name: /^attend$/i });
    if (await attend.isVisible()) {
      await attend.click();
      await expect(page.getByText(/planning to go|you clicked attend/i).first()).toBeVisible();
    }
    const cancel = page.getByRole("button", { name: /cancel booking/i });
    if (await cancel.isVisible()) {
      await cancel.click();
      const confirm = page.getByRole("button", { name: /cancel my place/i });
      if (await confirm.isVisible()) await confirm.click();
    }
  });

  test("bookings show coloured attendance chips; empty far-future month still renders", async ({ page }) => {
    await login(page, "member");
    await page.goto("/bookings");
    await dismissAttendancePrompt(page);
    const chip = page.getByTestId("attendance-chip").first();
    await expect(chip).toBeVisible();
    await expect(chip).toHaveClass(/attendance-chip/);
    await expect(chip).toHaveClass(/attendance-(attended|absent|unconfirmed)/);
    await expect(chip).toHaveText(/Attended|Didn’t|Unconfirmed/);

    await page.goto("/calendar?view=month&d=2035-06-15");
    await dismissAttendancePrompt(page);
    await expect(page.getByTestId("month-grid")).toBeVisible();
    await expect(page.locator(".range-heading")).toContainText(/june 2035/i);
    // Far future seed has no events — day count badges should be absent.
    await expect(page.locator(".month-day-count")).toHaveCount(0);
  });
});
