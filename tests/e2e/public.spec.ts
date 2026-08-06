import { expect, test } from "@playwright/test";

test("public order and tracking entry points remain usable", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => sessionStorage.setItem("mrd_loader_seen_v1", "1"));
  await page.reload();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator("#commande").scrollIntoViewIfNeeded();
  await expect(page.getByText("Assistant livraison")).toBeVisible();
  await expect(page.getByRole("link", { name: /WhatsApp/i }).last()).toBeVisible();

  await page.goto("/track/MRD-NOT-VALID");
  await expect(page.getByRole("heading", { name: "Code introuvable" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contacter Mr. Delivery" })).toBeVisible();
});
