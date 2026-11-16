import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const templates = ['clasico', 'urbano', 'natural', 'fresco'];
test('build incluye reglas Pages, recursos y ninguna configuración privada', async ({ request }) => {
  expect(readFileSync('dist/_redirects', 'utf8').trim()).toBe('/demo/* /index.html 200');
  expect(existsSync('dist/404.html')).toBe(false);
  expect(readdirSync('dist').some(name => name.startsWith('.env'))).toBe(false);
  const assets = readdirSync('dist/assets');
  expect(assets.filter(name => name.endsWith('.jpg'))).toHaveLength(18);
  for (const name of ['favicon.svg', ...assets.map(name => `assets/${name}`)]) {
    const response = await request.get(`/${name}`);
    expect(response.ok(), name).toBe(true);
    expect(response.headers()['content-type'], name).not.toContain('text/html');
    expect((await response.body()).length, name).toBeGreaterThan(0);
  }
  const scripts = assets.filter(name => name.endsWith('.js')).map(name => readFileSync(resolve('dist/assets', name), 'utf8')).join('\n');
  expect(scripts.includes('Vista de desarrollo.')).toBe(false);
  expect(/https?:\/\/(?:localhost|127\.0\.0\.1):(?:5173|4173)/.test(scripts)).toBe(false);
  const configurations = readdirSync('src/config').filter(name => name.endsWith('.js')).map(name => readFileSync(resolve('src/config', name), 'utf8')).join('\n');
  expect(/https?:\/\/(?:localhost|127\.0\.0\.1)/.test(configurations)).toBe(false);
  expect(scripts.includes('wa.me/000000000')).toBe(false);
  expect(assets.some(name => name.endsWith('.map'))).toBe(false);
});
test('home de producción ofrece el contacto comercial configurado', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/\$\s*3[.,]?500|precio de referencia|carta digital estándar/i);
  await expect(page.locator('#contacto')).toContainText('presupuesto personalizado');
  await expect(page.locator('#contacto .commercial-phone')).toHaveText('WhatsApp: +598 91 602 323');
  const contacts = page.getByRole('link', { name: 'Consultá por WhatsApp', exact: true });
  await expect(contacts).toHaveCount(2);
  for (const contact of await contacts.all()) {
    const url = new URL(await contact.getAttribute('href'));
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/59891602323');
    expect(url.searchParams.get('text')).toBe('Hola, vi Tu Menú Digital y me gustaría recibir información sobre las cartas digitales para mi negocio');
    await expect(contact).toHaveAttribute('target', '_blank');
    await expect(contact).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await expect(page.getByText('El canal comercial está pendiente de configuración.')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Abrir menú' })).toHaveCount(4);
});
for (const id of templates) test(`${id}: acceso directo, recarga, imágenes, pedido y QR sin localhost`, async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto(`/demo/${id}`);
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const reload = await page.reload();
  expect(reload.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  for (const img of await page.locator('img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await page.getByRole('button', { name: /^Agregar / }).first().click();
  await page.getByRole('button', { name: /^Ver pedido/ }).click();
  await expect(page.getByRole('dialog').locator('.cart-lines li')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Enviar por WhatsApp' })).toBeDisabled();
  await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Cerrar carrito' }).click();
  await page.getByRole('button', { name: 'Ver código QR' }).click();
  await expect(page.getByText('Configurá una URL pública para generar y descargar el QR.', { exact: true })).toBeVisible();
  await expect(page.locator('.qr-panel img')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Descargar PNG' })).toHaveCount(0);
  expect(await page.locator('a[href]').evaluateAll(links => links.filter(link => /^https?:\/\/(localhost|127\.0\.0\.1)/.test(link.getAttribute('href'))).length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
