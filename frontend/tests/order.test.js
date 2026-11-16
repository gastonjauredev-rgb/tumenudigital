import test from 'node:test';
import assert from 'node:assert/strict';
import { cartReducer, cartLines, cartTotal, orderMessage, whatsappUrl, publicMenuUrl } from '../src/components/order.js';
const products = [{ id: 'burger', name: 'Doble & queso', price: 440 }, { id: 'fries', name: 'Papas', price: 190 }];
test('agregar, cambiar cantidades y eliminar conserva totales correctos', () => {
  let state = cartReducer({}, { type: 'add', id: 'burger' });
  state = cartReducer(state, { type: 'add', id: 'burger' });
  state = cartReducer(state, { type: 'quantity', id: 'fries', quantity: 3 });
  assert.equal(cartTotal(cartLines(products, state)), 1450);
  state = cartReducer(state, { type: 'quantity', id: 'burger', quantity: 1 });
  assert.equal(cartTotal(cartLines(products, state)), 1010);
  state = cartReducer(state, { type: 'quantity', id: 'fries', quantity: 0 });
  assert.deepEqual(state, { burger: 1 });
  assert.deepEqual(cartReducer(state, { type: 'clear' }), {});
});
test('cantidades negativas, inválidas y productos ajenos no inflan el total', () => {
  assert.deepEqual(cartReducer({ burger: 2 }, { type: 'quantity', id: 'burger', quantity: -4 }), {});
  assert.deepEqual(cartReducer({}, { type: 'quantity', id: 'burger', quantity: 'x' }), {});
  assert.equal(cartTotal(cartLines(products, { other: 20 })), 0);
});
test('mensaje incluye local, cantidades, precio unitario, subtotales, total y observaciones', () => {
  const lines = cartLines(products, { burger: 2, fries: 1 });
  const message = orderMessage({ name: 'Local de prueba' }, lines, 'Sin sal & sin cebolla');
  for (const fragment of ['Local de prueba', '2 × Doble & queso', '1 × Papas', '440', '880', '190', '1.070', 'Sin sal & sin cebolla']) assert.ok(message.includes(fragment), fragment);
  assert.ok(orderMessage({ name: 'Test' }, lines, '').includes('Sin observaciones'));
  const url = whatsappUrl('12025550123', message);
  assert.equal(new URL(url).searchParams.get('text'), message);
});
test('no permite envíos sin número válido', () => {
  for (const number of ['', null, 'pendiente', '123', '+598<script>', '000000000', '111111111', '+000 000 000']) assert.equal(whatsappUrl(number, 'Hola'), null);
  assert.ok(whatsappUrl('+1 (202) 555-0123', 'Hola').startsWith('https://wa.me/12025550123?'));
});
test('QR descargable requiere URL pública HTTP válida', () => {
  for (const value of ['', 'javascript:alert(1)', 'http://localhost:5173/demo', 'http://127.0.0.1', 'http://192.168.1.2', 'http://172.20.1.1', 'https://carta.local', 'https://user:pass@example.com']) assert.equal(publicMenuUrl(value), null);
  assert.equal(publicMenuUrl('https://example.com/carta'), 'https://example.com/carta');
});
