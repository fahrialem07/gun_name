import { test, expect } from "@playwright/test";
test("görev, etkinlik, rutin, günlük ve yerel kalıcılık", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const nav = () =>
    page.locator(
      testInfo.project.name === "mobile" ? ".bottom-nav" : ".sidebar nav",
    );
  await expect(
    page.getByRole("heading", { name: "Bugün, güzel bir gün." }),
  ).toBeVisible();
  await nav().getByRole("button", { name: "Görevler", exact: true }).click();
  await page.getByRole("button", { name: "Görev ekle", exact: true }).click();
  await page.getByLabel("Başlık", { exact: true }).fill("Faturayı öde");
  await page.getByLabel("Son tarih").fill("");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Faturayı öde tamamlandı işaretle",
      exact: true,
    })
    .click();
  await page.reload();
  await nav().getByRole("button", { name: "Görevler", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Faturayı öde tamamlanmadı işaretle",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Faturayı öde düzenle", exact: true })
    .click();
  await page.getByLabel("Başlık", { exact: true }).fill("Faturayı kontrol et");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(
    page.getByText("Faturayı kontrol et", { exact: true }),
  ).toBeVisible();
  await nav().getByRole("button", { name: "Takvim", exact: true }).click();
  await page.getByRole("button", { name: "Etkinlik", exact: true }).click();
  await page.getByLabel("Başlık", { exact: true }).fill("Matematik dersi");
  await page.getByLabel("Tekrar", { exact: true }).selectOption("weekly");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(
    page.getByRole("button").filter({ hasText: "Matematik dersi" }).last(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Hafta", exact: true }).click();
  await expect(
    page.locator(".schedule-event").filter({ hasText: "Matematik dersi" }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Yıl", exact: true }).click();
  await expect(page.locator(".mini-month")).toHaveCount(12);
  await nav().getByRole("button", { name: "Rutinler", exact: true }).click();
  await page.getByRole("button", { name: "Rutin ekle", exact: true }).click();
  await page.getByLabel("Başlık", { exact: true }).fill("Yürüyüş yap");
  await page.getByLabel("Sıklık").selectOption("weekly");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Yürüyüş yap tamamlandı işaretle",
      exact: true,
    })
    .click();
  await expect(page.getByText("1 gün", { exact: false }).last()).toBeVisible();
  await nav().getByRole("button", { name: "Günlük", exact: true }).click();
  await page.getByLabel("Günlük başlığı").fill("İyi bir başlangıç");
  await page.getByLabel("Günlük metni").fill("Bugün kendime zaman ayırdım.");
  await expect(page.getByText("✓ Kaydedildi", { exact: true })).toBeVisible();
  await page.reload();
  await nav().getByRole("button", { name: "Günlük", exact: true }).click();
  await expect(page.getByLabel("Günlük metni")).toHaveValue(
    "Bugün kendime zaman ayırdım.",
  );
  await nav().getByRole("button", { name: "Bugün", exact: true }).click();
  await page.getByRole("button", { name: "Sabah", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sabah", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Sabah", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-today.png`,
    fullPage: true,
  });
  await nav().getByRole("button", { name: "Görevler", exact: true }).click();
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Faturayı kontrol et sil", exact: true })
    .click();
  await expect(
    page.getByText("Faturayı kontrol et", { exact: true }),
  ).toHaveCount(0);
});

test("etkinlik serisi düzenlenir, silinir ve saat doğrulanır", async ({
  page,
}, testInfo) => {
  await page.clock.setFixedTime(new Date(2026, 10, 10, 8, 0, 0));
  await page.goto("/");
  await expect(page.locator(".next-card")).toContainText("Gününü planla");
  await expect(page.locator(".next-bottom")).toContainText("1 sa 0 dk sonra");
  const nav = page.locator(
    testInfo.project.name === "mobile" ? ".bottom-nav" : ".sidebar nav",
  );
  await nav.getByRole("button", { name: "Takvim", exact: true }).click();
  await page.getByRole("button", { name: "Etkinlik", exact: true }).click();
  await page.getByLabel("Başlık", { exact: true }).fill("Haftalık ders");
  await page.getByLabel("Başlangıç", { exact: true }).fill("11:00");
  await page.getByLabel("Bitiş", { exact: true }).fill("10:00");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Bitiş saati");
  await page.getByLabel("Bitiş", { exact: true }).fill("12:00");
  await page.getByLabel("Tekrar", { exact: true }).selectOption("weekly");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await page.locator(".event-row").filter({ hasText: "Haftalık ders" }).click();
  await page.getByLabel("Başlık", { exact: true }).fill("Türkçe dersi");
  await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await page.getByRole("button", { name: "Hafta", exact: true }).click();
  await page
    .getByRole("button", { name: "Sonraki dönem", exact: true })
    .click();
  await expect(
    page.locator(".schedule-event").filter({ hasText: "Türkçe dersi" }),
  ).toHaveCount(1);
  await page
    .locator(".schedule-event")
    .filter({ hasText: "Türkçe dersi" })
    .click();
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Sil", exact: true }).click();
  await expect(
    page.locator(".schedule-event").filter({ hasText: "Türkçe dersi" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.locator(".event-row").filter({ hasText: "Türkçe dersi" }),
  ).toHaveCount(0);
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
});
