import { useEffect, useRef, useState } from 'react';
import { cartLines, cartTotal, money, orderMessage, whatsappUrl } from './order';
export default function Cart({ restaurant, quantities, dispatch }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const dialog = useRef(null);
  const trigger = useRef(null);
  const lines = cartLines(restaurant.products, quantities);
  const total = cartTotal(lines);
  const url = whatsappUrl(restaurant.whatsappNumber, orderMessage(restaurant, lines, notes));
  useEffect(() => { if (open) dialog.current.showModal(); else if (dialog.current.open) dialog.current.close(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);
  function close() { setOpen(false); trigger.current?.focus(); }
  return <><button ref={trigger} className="cart-trigger" onClick={() => setOpen(true)}>Ver pedido <span>{lines.reduce((n, p) => n + p.quantity, 0)}</span><strong>{money(total)}</strong></button>
    <dialog ref={dialog} className="cart-dialog" onCancel={close} onClick={e => { if (e.target === dialog.current) close(); }} aria-labelledby="cart-title">
      <div className="cart-heading"><div><small>{restaurant.name}</small><h2 id="cart-title">Tu pedido</h2></div><button className="icon-button" onClick={close} aria-label="Cerrar carrito">×</button></div>
      {lines.length === 0 ? <p className="empty">Tu próxima comida empieza acá.<br/>Agregá algo rico de la carta.</p> : <ul className="cart-lines">{lines.map(p => <li key={p.id}><div><strong>{p.name}</strong><p>{money(p.price)} c/u</p><button className="text-button" onClick={() => dispatch({ type: 'quantity', id: p.id, quantity: 0 })}>Eliminar</button></div><div className="quantity"><button aria-label={`Restar ${p.name}`} onClick={() => dispatch({ type: 'quantity', id: p.id, quantity: p.quantity - 1 })}>−</button><span aria-live="polite">{p.quantity}</span><button aria-label={`Sumar ${p.name}`} onClick={() => dispatch({ type: 'add', id: p.id })}>+</button></div><strong>{money(p.price * p.quantity)}</strong></li>)}</ul>}
      <label className="notes">Observaciones generales<textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={1000} placeholder="Por ejemplo: sin sal, salsas aparte…"/></label>
      <div className="cart-total"><span>Total en pesos uruguayos</span><strong>{money(total)}</strong></div>
      {!url && <p className="notice" role="status">El envío por WhatsApp está pendiente de configuración. Esta es una carta de demostración.</p>}
      {url && lines.length > 0 ? <a className="button full" href={url} target="_blank" rel="noreferrer">Continuar en WhatsApp ↗</a> : <button className="button full" disabled>Enviar por WhatsApp</button>}
      <small className="cart-help">El pedido se confirma conversando con el local. Sin pagos online.</small>
    </dialog></>;
}
