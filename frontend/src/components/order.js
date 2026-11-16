export const money = (amount) => new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(amount);
export function cartReducer(state, action) {
  if (action.type === 'clear') return {};
  const quantity = action.type === 'add' ? (state[action.id] || 0) + 1 : Math.max(0, Math.floor(Number(action.quantity) || 0));
  const next = { ...state, [action.id]: quantity };
  if (!quantity) delete next[action.id];
  return next;
}
export const cartLines = (products, quantities) => products.filter(p => quantities[p.id] > 0).map(p => ({ ...p, quantity: quantities[p.id] }));
export const cartTotal = (lines) => lines.reduce((total, p) => total + p.price * p.quantity, 0);
export function orderMessage(restaurant, lines, notes) {
  return `¡Hola, ${restaurant.name}! Quiero pedir:\n\n${lines.map(p => `${p.quantity} × ${p.name} · ${money(p.price)} c/u · ${money(p.quantity * p.price)}`).join('\n')}\n\nTotal: ${money(cartTotal(lines))}\nObservaciones: ${notes.trim() || 'Sin observaciones'}`;
}
export function whatsappUrl(number, message) {
  const digits = String(number || '').replace(/[\s+()-]/g, '');
  return /^[1-9]\d{7,14}$/.test(digits) && !/^(\d)\1+$/.test(digits) ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}
export function publicMenuUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const local = /^(localhost|127\.|0\.|192\.168\.|10\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[)/.test(host) || /\.(localhost|local|test|invalid)$/.test(host);
    return ['https:', 'http:'].includes(url.protocol) && !local && host.includes('.') && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
