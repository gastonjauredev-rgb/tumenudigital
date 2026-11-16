import { test, expect } from '@playwright/test';

const models = [
  ['clasico', 'Clásico'], ['urbano', 'Urbano'], ['natural', 'Natural'], ['fresco', 'Fresco'],
];
const hint = 'Tocá cualquiera de los modelos para explorar cómo se vería la carta digital de tu negocio';

for (const width of [320, 375, 390, 430, 768, 1440]) {
  test(`modelos interactivos: superficie, botón y acceso responsive a ${width}px`, async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', entry => { if (entry.type() === 'error') errors.push(entry.text()); });
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByText(hint, { exact: true })).toBeVisible();
    const cards = page.locator('.demo-card');
    await expect(cards).toHaveCount(4);
    for (const [index, [id, name]] of models.entries()) {
      const card = cards.nth(index);
      const link = card.getByRole('link', { name: `Abrir menú ${name}`, exact: true });
      await expect(card.locator('a')).toHaveCount(1);
      await expect(link.locator('a, button, input, [tabindex]')).toHaveCount(0);
      await expect(link).toHaveAttribute('href', `/demo/${id}`);
      await expect(card.locator('.demo-details h3')).toHaveText(name);
      await expect(link.locator('.demo-open')).toContainText('Abrir menú');
      await expect(link.locator('.demo-open > span:last-child')).toHaveText('→');
      const button = link.locator('.demo-open');
      await button.scrollIntoViewIfNeeded();
      const size = await button.boundingBox();
      const innerWidth = await card.locator('.demo-details').evaluate(el => {
        const style = getComputedStyle(el);
        return el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      });
      expect(size.height).toBeGreaterThanOrEqual(48);
      expect(Math.abs(size.width - innerWidth)).toBeLessThanOrEqual(1);
      const photo = link.locator('.demo-visual img');
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(() => photo.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
      const targets = [photo, card.locator('h3'), button, link];
      const target = targets[index];
      await target.scrollIntoViewIfNeeded();
      if (index === 3) await link.click({ position: { x: 5, y: 5 } });
      else await target.click();
      await expect(page).toHaveURL(new RegExp(`/demo/${id}$`));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.goBack();
    }
    await expect(page.getByRole('link', { name: 'Consultá por WhatsApp', exact: true })).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    if (width === 390 || width === 1440) {
      await page.locator('#plantillas').scrollIntoViewIfNeeded();
      await page.locator('#plantillas').screenshot({ path: testInfo.outputPath('modelos.png') });
    }
  });
}

test('modelos: foco visible, un único enlace por tarjeta y navegación por teclado', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('.demo-card-link');
  for (const [index, [id, name]] of models.entries()) {
    const link = links.nth(index);
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toHaveAccessibleName(`Abrir menú ${name}`);
    expect(await link.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`/demo/${id}$`));
    await page.goBack();
    if (index < models.length - 1) {
      await links.nth(index).focus();
      await page.keyboard.press('Tab');
      await expect(links.nth(index + 1)).toBeFocused();
    }
  }
});

test('modelos: el hover refuerza la interacción sin alterar la ruta', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const card = page.locator('.demo-card').first();
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const shadow = await card.evaluate(el => getComputedStyle(el).boxShadow);
  await card.hover();
  expect(await card.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe(shadow);
  await expect(page).toHaveURL(/\/$/);
});
