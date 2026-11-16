import { useState } from 'react';
import { Categories, Identity, Product } from '../components/MenuParts';
import './fresco.css';
export default function Fresco({ restaurant: r, onAdd }) {
  const [selected, setSelected] = useState(r.categories[0].id);
  return <><header className="fresh-header"><Identity restaurant={r}/><span>BUENA ONDA, BUENA MESA ☀</span></header><section className="fresh-hero"><img src={r.heroImage} alt="Plato fresco de pescado"/><div><span className="eyebrow">SABORES CON AIRE DE MAR</span><h1>{r.tagline}</h1><p>{r.description}</p><a href="#carta" className="button">Un verano de sabores ↓</a></div></section><div className="fresh-strip">☀ Fresco, simple y para disfrutar ☀</div><div id="carta" className="menu-content"><Categories restaurant={r} selected={selected} onSelect={setSelected}/><div className="fresh-heading"><h2>{r.categories.find(c => c.id === selected).name}</h2><span>Una pausa que sabe bien.</span></div><div className="fresh-products">{r.products.filter(p => p.categoryId === selected).map(p => <Product key={p.id} product={p} onAdd={onAdd}/>)}</div></div></>;
}
