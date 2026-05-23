import { test, expect } from "@playwright/test";

/**
 * E2E: Librarian generates a report from the web dashboard.
 *
 * Flow:
 * 1. Navigate to the Reports page.
 * 2. Select a report type (e.g. "Overdue Loans").
 * 3. Choose a date range.
 * 4. Click "Generate Report".
 * 5. Assert the report table/download appears.
 */

test.describe("Report Generation", () => {
  test.beforeEach(async ({ page }) => {
    // Assume librarian is already authenticated via storageState or login helper
    await page.goto("/reports");
  });

  test("librarian can generate an overdue loans report", async ({ page }) => {
    // Select report type
    await page.getByLabel("Report Type").selectOption("overdue-loans");

    // Pick date range
    await page.getByLabel("Start Date").fill("2025-01-01");
    await page.getByLabel("End Date").fill("2025-12-31");

    // Generate
    await page.getByRole("button", { name: /generate report/i }).click();

    // Wait for results
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText(/overdue/i)).toBeVisible();
  });
});
