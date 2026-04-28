import { expect, test } from "@playwright/test";
import { PNG } from "pngjs";

test("debug mode reaches the arcade office without auth", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /oficina 2d/i })).toBeVisible();
  await page.getByRole("link", { name: /entrar o registrarme/i }).click();
  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByRole("heading", { name: /entra en tu oficina arcade/i })).toBeVisible();

  await page.getByRole("link", { name: /entrar en modo debug/i }).click();
  await expect(page).toHaveURL(/\/onboarding\/avatar$/);
  await expect(page.getByRole("heading", { name: /elige tu personaje/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /adam mirando al frente/i })).toBeVisible();

  await page.getByRole("button", { name: /personaje siguiente/i }).click();
  await expect(page.getByRole("img", { name: /alex mirando al frente/i })).toBeVisible();
  await page.getByRole("button", { name: /entrar a la oficina/i }).click();

  await expect(page).toHaveURL(/\/office$/);
  await expect(page.getByText("DEBUG", { exact: true })).toBeVisible();
  await expect(page.getByText("40 x 24")).toBeVisible();
  await expect(page.getByText("Seguimiento")).toBeVisible();
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect.poll(async () => canvas.boundingBox()).toMatchObject({
    width: expect.any(Number),
    height: expect.any(Number),
  });
  const canvasBox = await canvas.boundingBox();
  const viewport = page.viewportSize();

  expect(canvasBox?.width).toBeGreaterThanOrEqual((viewport?.width ?? 0) - 340);
  expect(canvasBox?.height).toBeGreaterThanOrEqual((viewport?.height ?? 0) - 80);
  await expect
    .poll(async () => {
      const image = PNG.sync.read(await canvas.screenshot());
      const uniqueColors = new Set<string>();

      for (let index = 0; index < image.data.length; index += 4 * 180) {
        uniqueColors.add(
          `${image.data[index]}-${image.data[index + 1]}-${image.data[index + 2]}-${image.data[index + 3]}`,
        );
      }

      return uniqueColors.size > 4;
    })
    .toBe(true);

  for (const key of ["KeyA", "KeyD"]) {
    await page.keyboard.press(key);
    await expect(canvas).toBeVisible();
  }
});
