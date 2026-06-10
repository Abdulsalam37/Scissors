import { test, expect } from "@playwright/test";

test.describe("Scissor URL Shortener E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the client development server
    await page.goto("/");
  });

  test("should load the landing page successfully", async ({ page }) => {
    // Assert logo/app name is visible
    await expect(page.locator("text=Scissor")).toBeVisible();
    // Assert the shortening heading is present
    await expect(page.locator("text=Shorten a link")).toBeVisible();
  });

  test("should display validation warning for a malformed destination URL", async ({ page }) => {
    // Fill in a bad URL
    await page.fill('input[placeholder*="https://example.com"]', "malformed-url-format");
    
    // Submit the form
    await page.click('button[type="submit"]');

    // Assert the validation banner pops up
    await expect(page.locator("text=Please enter a valid URL")).toBeVisible();
  });

  test("should prevent custom slugs that contain invalid character spaces", async ({ page }) => {
    // Fill in a valid destination URL
    await page.fill('input[placeholder*="https://example.com"]', "https://google.com");

    // Fill in a slug with spaces
    await page.fill('input[placeholder="my-custom-slug"]', "bad slug spaces");

    // Submit the form
    await page.click('button[type="submit"]');

    // Assert custom slug character warning message
    await expect(page.locator("text=Slug can only contain alphanumeric characters and hyphens")).toBeVisible();
  });
});
