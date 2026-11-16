import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { money, publicMenuUrl } from './order';
export function DemoBar() { return <div className="demo-bar"><Link to="/">← Tu Menú Digital</Link><span>Carta de demostración</span></div>; }
export function Identity({ restaurant: r }) { return <div className="identity">{r.logo && <img src={r.logo} alt=""/>}<span>{r.name}</span></div>; }
export function Product({ product: p, onAdd, compact = false }) { return <article className={`product ${compact ? 'compact' : ''}`}>{p.image && <img src={p.image} srcSet={p.imageSmall ? `${p.imageSmall} 480w, ${p.image} 960w` : undefined} sizes={p.imageSmall ? '(min-width: 1100px) 380px, (min-width: 600px) 50vw, 100vw' : undefined} alt={p.name} loading="lazy" decoding="async"/>}<div className="product-copy"><h3>{p.name}</h3><p>{p.description}</p><div className="product-bottom"><strong>{money(p.price)}</strong><button onClick={() => onAdd(p.id)} aria-label={`Agregar ${p.name}`}>+ <span>Agregar</span></button></div></div></article>; }
export function Categories({ restaurant: r, selected, onSelect }) { return <nav className="categories" aria-label="Categorías de la carta">{r.categories.map(c => <button key={c.id} aria-pressed={selected === c.id} onClick={() => onSelect(c.id)}>{c.name}</button>)}</nav>; }
export function MenuFooter({ restaurant: r }) {
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const publicUrl = publicMenuUrl(r.publicUrl);
  const qrUrl = publicUrl || (import.meta.env.DEV ? window.location.href : null);
  useEffect(() => {
    let active = true;
    setQr('');
    setError('');
    if (!qrUrl) return;
    QRCode.toDataURL(qrUrl, { width: 640, margin: 3, errorCorrectionLevel: 'M' }).then(value => { if (active) setQr(value); }).catch(() => { if (active) setError('No se pudo generar el QR. Intentá nuevamente.'); });
    return () => { active = false; };
  }, [qrUrl]);
  return <footer className="menu-footer"><div><h3>{r.name}</h3><p>{r.address}</p><p>{r.hours}</p>{r.socialLinks.filter(link => publicMenuUrl(link.url)).map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗ </a>)}</div><div><button className="text-button" onClick={() => setShow(!show)} aria-expanded={show}>{show ? 'Ocultar QR' : 'Ver código QR'} ↗</button>{show && <div className="qr-panel">{qrUrl && qr && <img src={qr} alt={`Código QR de ${r.name}`}/>}<p>{publicUrl ? 'QR listo para compartir.' : import.meta.env.DEV ? 'Vista de desarrollo. Configurá una URL pública para descargar el QR.' : 'Configurá una URL pública para generar y descargar el QR.'}</p>{error && <p role="alert">{error}</p>}{publicUrl && qr && <a href={qr} download={`${r.id}-qr.png`}>Descargar PNG ↓</a>}</div>}</div><small>Datos ficticios · Fotos ilustrativas · Precios en UYU<br/>Creado con <Link to="/">Tu Menú Digital</Link></small></footer>;
}

