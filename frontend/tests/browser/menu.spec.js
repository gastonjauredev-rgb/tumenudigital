import { test, expect } from '@playwright/test';
import { menus } from '../../src/data/menus.js';
import { money } from '../../src/components/order.js';
const templates = ['clasico', 'urbano', 'natural', 'fresco'];
for (const width of [320, 375, 390, 430, 768, 1440]) {
  for (const route of ['/', ...templates.map(id => `/demo/${id}`)]) {
    test(`${route} responsive ${width}px, imágenes y consola`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      for (const image of await page.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
      }
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (route === '/' && width <= 390) {
        const phone = await page.locator('.phone').boundingBox();
        const showcase = await page.locator('#plantillas').boundingBox();
        expect(phone.y + phone.height).toBeLessThan(showcase.y);
      }
      expect(errors).toEqual([]);
      await page.evaluate(() => window.scrollTo(0, 0));
      if (route === '/' && width === 1440) await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
      if (route === '/' && width === 390) await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
      if (route.startsWith('/demo/') && width === 390) await page.screenshot({ path: `test-results/${route.split('/').pop()}-mobile.png`, fullPage: true });
    });
  }
}
for (const id of templates) test(`carrito, categorías y QR de ${id}`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/demo/${id}`);
  await page.getByRole('button', { name: /^Agregar / }).first().click();
  await page.getByRole('button', { name: /^Ver pedido/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Enviar por WhatsApp' })).toBeDisabled();
  const before = await dialog.locator('.cart-total strong').innerText();
  await dialog.getByRole('button', { name: /^Sumar / }).click();
  await expect(dialog.locator('.quantity span')).toHaveText('2');
  expect(await dialog.locator('.cart-total strong').innerText()).not.toBe(before);
  await dialog.getByRole('button', { name: /^Restar / }).click();
  await expect(dialog.locator('.cart-total strong')).toHaveText(before);
  await dialog.getByLabel('Observaciones generales').fill('Sin sal, por favor');
  await dialog.getByRole('button', { name: 'Eliminar' }).click();
  await expect(dialog.locator('.empty')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  if (id !== 'natural') {
    const categories = page.getByRole('navigation', { name: 'Categorías de la carta' }).getByRole('button');
    for (let i = 0; i < await categories.count(); i++) { await categories.nth(i).click(); await expect(page.locator('.product').first()).toBeVisible(); }
  } else {
    for (const section of await page.locator('.natural-category').all()) expect(await section.locator('.product').count()).toBeGreaterThan(0);
  }
  await page.getByRole('button', { name: 'Ver código QR' }).click();
  await expect(page.locator('.qr-panel img')).toBeVisible();
  await expect(page.getByText('Vista de desarrollo.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Descargar PNG' })).toHaveCount(0);
});
test('configuración habilita WhatsApp y descarga real del QR', async ({ page }) => {
  await page.goto('/demo/urbano');
  await page.evaluate(async () => {
    const { restaurants } = await import('/src/config/restaurants.js');
    restaurants.urbano.whatsappNumber = '12025550123';
    restaurants.urbano.publicUrl = 'https://example.com/carta';
  });
  await page.getByRole('button', { name: /^Agregar / }).first().click();
  await page.getByRole('button', { name: /^Ver pedido/ }).click();
  await page.getByLabel('Observaciones generales').fill('Sin cebolla & salsa aparte');
  const url = new URL(await page.getByRole('link', { name: 'Continuar en WhatsApp' }).getAttribute('href'));
  expect(url.hostname).toBe('wa.me');
  expect(url.pathname).toBe('/12025550123');
  expect(url.searchParams.get('text')).toContain('Sin cebolla & salsa aparte');
  expect(url.searchParams.get('text')).toContain('BARRIO BURGER');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Ver código QR' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Descargar PNG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('urbano-qr.png');
  expect(await download.failure()).toBeNull();
});
test('navegación comercial y carritos independientes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Abrir menú' }).first().click();
  await expect(page).toHaveURL(/demo\/clasico/);
  await page.getByRole('button', { name: /^Agregar / }).first().click();
  await expect(page.locator('.cart-trigger span')).toHaveText('1');
  await page.getByRole('link', { name: '← Tu Menú Digital' }).click();
  await page.getByRole('link', { name: 'Abrir menú' }).nth(1).click();
  await expect(page.locator('.cart-trigger span')).toHaveText('0');
  await page.goto('/ruta-inexistente');
  await expect(page.getByRole('link', { name: 'Volver al inicio' })).toBeVisible();
});
test('datos editables cambian identidad, colores, categorías, productos y precios', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const { restaurants } = await import('/src/config/restaurants.js');
    const r = restaurants.clasico;
    r.name = 'Restaurante de prueba';
    r.description = 'Descripción comercial configurable';
    r.primaryColor = '#123456';
    r.logo = r.heroImage;
    r.categories = [{ id: 'especial', name: 'Especiales del día' }];
    r.products = [{ id: 'especial-1', categoryId: 'especial', name: 'Plato configurable', description: 'Ingredientes de prueba', price: 725, image: r.heroImage }];
  });
  await page.getByRole('link', { name: 'Abrir menú' }).first().click();
  await expect(page.locator('.identity')).toContainText('Restaurante de prueba');
  await expect(page.locator('.identity img')).toBeVisible();
  await expect(page.getByText('Descripción comercial configurable')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Especiales del día' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Plato configurable' })).toBeVisible();
  expect(await page.locator('.restaurant').evaluate(el => getComputedStyle(el).getPropertyValue('--primary'))).toBe('#123456');
  await page.getByRole('button', { name: 'Agregar Plato configurable' }).click();
  await expect(page.locator('.cart-trigger strong')).toContainText('725');
});
test('home explica la personalización y el QR en los cuatro modelos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Cada emprendimiento tiene su estilo. Tu menú también debería tenerlo.', exact: true })).toBeVisible();
  await expect(page.getByText('Sabemos que detrás de cada emprendimiento hay una identidad, una historia y mucho esfuerzo. Por eso creamos diferentes estilos de cartas digitales, para que elijas el que mejor represente tu negocio.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Elegí el modelo que más te guste', exact: true })).toBeVisible();
  await expect(page.getByText('Explorá nuestros cuatro modelos de cartas digitales. Elegí el diseño que mejor combine con tu negocio y nosotros lo personalizamos con tu logo, tus colores y tu información.', { exact: true })).toBeVisible();
  const examples = page.locator('.demo-example');
  await expect(examples).toHaveCount(4);
  for (const example of await examples.all()) {
    const card = example.locator('.demo-card');
    const qr = example.locator(':scope > .model-qr-info');
    await expect(qr.getByText('Cada menú incluye su código QR imprimible.', { exact: true })).toBeVisible();
    await expect(qr.getByText('Podés colocarlo en las mesas de tu negocio para que tus clientes accedan a la carta directamente desde su celular.', { exact: true })).toBeVisible();
    await expect(card.locator('.model-qr-info')).toHaveCount(0);
    await expect(card).toHaveAttribute('aria-describedby', await qr.getAttribute('id'));
    await expect(card.getByRole('link', { name: 'Abrir menú' })).toBeVisible();
    const cardBox = await card.boundingBox();
    const qrBox = await qr.boundingBox();
    expect(qrBox.y).toBeGreaterThanOrEqual(cardBox.y + cardBox.height);
  }
});
for (const id of templates) test(`${id}: nueve categorías y pedido con los 40 productos`, async ({ page }) => {
  test.slow();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/demo/${id}`);
  const nav = page.getByRole('navigation', { name: 'Categorías de la carta' });
  await expect(nav.getByRole(id === 'natural' ? 'link' : 'button')).toHaveCount(9);
  let total = 0;
  for (const [index, [categoryName, products]] of menus[id].entries()) {
    let container;
    if (id === 'natural') {
      await nav.getByRole('link', { name: `${categoryName} ↗`, exact: true }).click();
      container = page.locator(`[id="${id}-${index}"]`);
    } else {
      await nav.getByRole('button', { name: categoryName, exact: true }).click();
      container = page.locator('.menu-content');
    }
    await expect(container.getByRole('heading', { name: categoryName, exact: true })).toBeVisible();
    await expect(container.locator('.product')).toHaveCount(products.length);
    for (const [name, description, price] of products) {
      const product = container.locator('.product').filter({ has: page.getByRole('heading', { name, exact: true }) });
      await expect(product.getByText(description, { exact: true })).toHaveCount(1);
      await expect(product.locator('.product-bottom strong')).toHaveText(money(price));
      await product.getByRole('button', { name: `Agregar ${name}`, exact: true }).click();
      total += price;
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.cart-trigger strong')).toHaveText(money(total));
  }
  await expect(page.locator('.cart-trigger span')).toHaveText('40');
  await page.getByRole('button', { name: /^Ver pedido/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.cart-lines li')).toHaveCount(40);
  await expect(dialog.locator('.cart-total strong')).toHaveText(money(total));
  expect(errors).toEqual([]);
});
