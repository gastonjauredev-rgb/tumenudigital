import { test, expect } from '@playwright/test';
import { menus } from '../../src/data/menus.js';
import { money } from '../../src/components/order.js';
const widths = [320, 375, 390, 430, 768, 1440];
const templates = ['clasico', 'urbano', 'natural', 'fresco'];
test.use({ hasTouch: true });
async function expectTouchable(locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(await locator.evaluate(el => {
    const r = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
  })).toBe(true);
}
for (const width of widths) {
  test(`Burger: las cinco hamburguesas tienen fotos visibles y proporcionadas a ${width}px`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/demo/urbano');
    const cards = page.locator('.urban-products .product');
    await expect(cards).toHaveCount(5);
    const sources = [];
    for (const card of await cards.all()) {
      const photo = card.locator('img');
      await expect(photo).toHaveCount(1);
      await photo.scrollIntoViewIfNeeded();
      await expect(photo).toBeVisible();
      await expect.poll(() => photo.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
      expect(await photo.evaluate(async el => {
        const original = new Image();
        original.src = el.currentSrc;
        await original.decode();
        return original.naturalWidth;
      })).toBeGreaterThanOrEqual(480);
      const size = await photo.boundingBox();
      expect(size.width).toBeGreaterThan(150);
      expect(size.height).toBeGreaterThan(150);
      expect(await photo.evaluate(el => getComputedStyle(el).objectFit)).toBe('cover');
      sources.push(await photo.getAttribute('src'));
      await expectTouchable(card.getByRole('button', { name: /^Agregar / }));
    }
    expect(new Set(sources).size).toBe(5);
    await page.getByRole('button', { name: 'Combos', exact: true }).tap();
    for (const name of ['Combo Doble', 'Combo veggie']) {
      const card = page.locator('.product').filter({ has: page.getByRole('heading', { name, exact: true }) });
      await card.locator('img').scrollIntoViewIfNeeded();
      await expect.poll(() => card.locator('img').evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    if (width === 390 || width === 1440) {
      await page.getByRole('button', { name: 'Hamburguesas', exact: true }).tap();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `test-results/burger-${width}.png`, fullPage: true });
    }
  });
  for (const id of templates) test(`${id}: carrito táctil, WhatsApp y QR a ${width}px`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 640 });
    await page.goto(`/demo/${id}`);
    await page.evaluate(async (id) => {
      const { restaurants } = await import('/src/config/restaurants.js');
      restaurants[id].whatsappNumber = '12025550123';
      restaurants[id].publicUrl = 'https://example.com/carta';
    }, id);
    const [first, second] = menus[id][0][1];
    const buttons = page.getByRole('button', { name: /^Agregar / });
    await expectTouchable(buttons.nth(0));
    await buttons.nth(0).tap();
    await buttons.nth(0).tap();
    await expectTouchable(buttons.nth(1));
    await buttons.nth(1).tap();
    const trigger = page.getByRole('button', { name: /^Ver pedido/ });
    await expectTouchable(trigger);
    await trigger.tap();
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('.cart-total strong')).toHaveText(money(first[2] * 2 + second[2]));
    const dialogBounds = await dialog.boundingBox();
    expect(dialogBounds.x).toBeGreaterThanOrEqual(0);
    expect(dialogBounds.y).toBeGreaterThanOrEqual(0);
    expect(dialogBounds.y + dialogBounds.height).toBeLessThanOrEqual(641);
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    const firstLine = dialog.locator('.cart-lines li').nth(0);
    const secondLine = dialog.locator('.cart-lines li').nth(1);
    const plus = firstLine.getByRole('button', { name: /^Sumar / });
    await expectTouchable(plus);
    await plus.tap();
    await expect(firstLine.locator('.quantity span')).toHaveText('3');
    const minus = firstLine.getByRole('button', { name: /^Restar / });
    await expectTouchable(minus);
    await minus.tap();
    await expect(dialog.locator('.cart-total strong')).toHaveText(money(first[2] * 2 + second[2]));
    const remove = secondLine.getByRole('button', { name: 'Eliminar' });
    await expectTouchable(remove);
    await remove.tap();
    await expect(dialog.locator('.cart-total strong')).toHaveText(money(first[2] * 2));
    const notes = dialog.getByLabel('Observaciones generales');
    await notes.fill('Sin sal & salsas aparte');
    expect(await notes.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    const whatsapp = dialog.getByRole('link', { name: 'Continuar en WhatsApp' });
    await expectTouchable(whatsapp);
    const url = new URL(await whatsapp.getAttribute('href'));
    expect(url.pathname).toBe('/12025550123');
    const text = url.searchParams.get('text');
    expect(text).toContain(`2 × ${first[0]}`);
    expect(text).not.toContain(`× ${second[0]}`);
    expect(text).toContain(`Total: ${money(first[2] * 2)}`);
    expect(text).toContain('Sin sal & salsas aparte');
    const close = dialog.getByRole('button', { name: 'Cerrar carrito' });
    await expectTouchable(close);
    await close.tap();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    const nav = page.getByRole('navigation', { name: 'Categorías de la carta' });
    for (const [index, [category]] of menus[id].entries()) {
      const target = nav.getByRole(id === 'natural' ? 'link' : 'button', { name: id === 'natural' ? `${category} ↗` : category, exact: true });
      await expectTouchable(target);
      await target.tap();
      const heading = id === 'natural' ? page.locator(`[id="${id}-${index}"]`).getByRole('heading', { name: category, exact: true }) : page.locator('.menu-content').getByRole('heading', { name: category, exact: true });
      await expect(heading).toBeVisible();
    }
    const qrButton = page.getByRole('button', { name: 'Ver código QR' });
    await expectTouchable(qrButton);
    await qrButton.tap();
    await expect(page.locator('.qr-panel img')).toBeVisible();
    const download = page.getByRole('link', { name: 'Descargar PNG' });
    await expectTouchable(download);
    const pending = page.waitForEvent('download');
    await download.tap();
    expect(await (await pending).failure()).toBeNull();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const footer = await page.locator('.menu-footer').boundingBox();
    const bar = await trigger.boundingBox();
    expect(footer.y + footer.height).toBeLessThanOrEqual(bar.y + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
