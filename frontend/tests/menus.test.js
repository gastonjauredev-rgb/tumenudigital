import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { menus } from '../src/data/menus.js';
import { cartReducer, cartLines, cartTotal, orderMessage } from '../src/components/order.js';
const expectedCategories = {
  clasico: ['Entradas', 'Parrilla', 'Carnes', 'Pastas', 'Guarniciones', 'Ensaladas', 'Bebidas sin alcohol', 'Vinos', 'Postres'],
  urbano: ['Hamburguesas', 'Pizzas', 'Chivitos', 'Milanesas', 'Combos', 'Acompañamientos', 'Refrescos', 'Cervezas', 'Postres'],
  natural: ['Cafés', 'Infusiones', 'Desayunos', 'Brunch', 'Sándwiches', 'Ensaladas', 'Jugos', 'Licuados', 'Pastelería'],
  fresco: ['Entradas', 'Pescados', 'Mariscos', 'Minutas', 'Ensaladas', 'Platos principales', 'Bebidas', 'Tragos', 'Postres'],
};
for (const [id, categories] of Object.entries(menus)) {
  test(`${id}: 40 productos únicos y nueve categorías completas`, () => {
    assert.deepEqual(categories.map(([name]) => name), expectedCategories[id]);
    const products = categories.flatMap(([, items]) => items);
    assert.equal(products.length, 40);
    assert.equal(new Set(products.map(([name]) => name)).size, products.length);
    for (const [categoryName, items] of categories) {
      assert.ok(items.length >= 4, categoryName);
      for (const [name, description, price, photo] of items) {
        assert.ok(name.trim().length > 0);
        assert.ok(description.trim().length > 0);
        assert.ok(Number.isInteger(price) && price > 0);
        if (photo) assert.ok(existsSync(new URL(`../src/assets/${photo}.jpg`, import.meta.url)), photo);
      }
    }
  });
  test(`${id}: todos los productos nuevos calculan y generan el pedido`, () => {
    const products = categories.flatMap(([, items], categoryIndex) => items.map(([name, description, price], index) => ({ id: `${id}-${categoryIndex}-${index}`, name, description, price })));
    let quantities = {};
    for (const p of products) {
      quantities = cartReducer(quantities, { type: 'add', id: p.id });
      quantities = cartReducer(quantities, { type: 'add', id: p.id });
    }
    const expected = products.reduce((sum, p) => sum + p.price * 2, 0);
    const lines = cartLines(products, quantities);
    assert.equal(lines.length, 40);
    assert.equal(cartTotal(lines), expected);
    const message = orderMessage({ name: id }, lines, 'Observación de prueba');
    for (const p of products) assert.ok(message.includes(`2 × ${p.name}`));
    const last = products.at(-1);
    quantities = cartReducer(quantities, { type: 'quantity', id: last.id, quantity: 0 });
    assert.equal(cartTotal(cartLines(products, quantities)), expected - last.price * 2);
  });
}
test('cada hamburguesa de Urbano tiene una fotografía local', () => {
  const burgers = menus.urbano.find(([category]) => category === 'Hamburguesas')[1];
  assert.equal(burgers.length, 5);
  for (const [name, , , photo] of burgers) {
    assert.ok(photo, name);
    assert.ok(existsSync(new URL(`../src/assets/${photo}.jpg`, import.meta.url)), name);
  }
});
