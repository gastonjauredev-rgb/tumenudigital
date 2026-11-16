import { test, expect } from '@playwright/test';
import { business, businessWhatsappUrl } from '../../src/config/business.js';

const message = 'Hola, vi Tu Menú Digital y me gustaría recibir información sobre las cartas digitales para mi negocio';

for (const width of [320, 375, 390, 430, 768, 1440]) {
  test(`contacto comercial: destino, mensaje y acceso responsive a ${width}px`, async ({ page, context }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', entry => { if (entry.type() === 'error') errors.push(entry.text()); });
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await context.route('https://wa.me/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Contacto de prueba</title>' }));
    await page.goto('/');
    expect(business.whatsappNumber).toBe('+598 91 602 323');
    expect(business.contactMessage).toBe(message);
    expect(business).not.toHaveProperty('standardPrice');
    await expect(page.locator('body')).not.toContainText(/\$\s*3[.,]?500|precio de referencia|carta digital estándar/i);
    await expect(page.locator('#contacto')).toContainText('presupuesto personalizado');
    await expect(page.locator('#contacto .commercial-phone')).toHaveText('WhatsApp: +598 91 602 323');
    await expect(page.locator('#contacto .commercial-phone')).toBeVisible();
    const contacts = page.getByRole('link', { name: 'Consultá por WhatsApp', exact: true });
    await expect(contacts).toHaveCount(2);
    await expect(page.locator('#plantillas .model-heading').getByRole('link', { name: 'Consultá por WhatsApp', exact: true })).toHaveCount(1);
    await expect(page.locator('#contacto').getByRole('link', { name: 'Consultá por WhatsApp', exact: true })).toHaveCount(1);
    for (const contact of await contacts.all()) {
      await contact.scrollIntoViewIfNeeded();
      await expect(contact).toBeVisible();
      await expect(contact).toHaveAttribute('href', businessWhatsappUrl);
      await expect(contact).toHaveAttribute('target', '_blank');
      await expect(contact).toHaveAttribute('rel', 'noopener noreferrer');
      const url = new URL(await contact.getAttribute('href'));
      expect(url.origin).toBe('https://wa.me');
      expect(url.pathname).toBe('/59891602323');
      expect(url.searchParams.get('text')).toBe(message);
      const box = await contact.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      const popupPromise = page.waitForEvent('popup');
      await contact.click();
      const popup = await popupPromise;
      await expect(popup).toHaveTitle('Contacto de prueba');
      await popup.close();
    }
    await expect(page.getByRole('link', { name: 'Encontrá tu estilo' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Abrir menú' })).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
