import { expect, test } from "@playwright/test";

test("landing links to the auth screen", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /oficina 2d/i })).toBeVisible();
  await page.getByRole("link", { name: /entrar o registrarme/i }).click();
  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByRole("heading", { name: /entra en tu oficina/i })).toBeVisible();
});
