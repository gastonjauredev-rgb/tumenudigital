import { useState } from 'react';
import { Categories, Identity, Product } from '../components/MenuParts';
import './clasico.css';
export default function Clasico({ restaurant: r, onAdd }) {
  const [selected, setSelected] = useState(r.categories[0].id);
  return <><header className="classic-header"><Identity restaurant={r}/><span>COCINA DE ORIGEN · URUGUAY</span></header><section className="classic-hero"><img src={r.heroImage} alt="Carne a las brasas"/><div><span className="eyebrow">EL ARTE DE COMER BIEN</span><h1>{r.tagline}</h1><p>{r.description}</p><a href="#carta" className="button">Descubrí nuestra carta ↓</a></div></section><div className="classic-menu menu-content" id="carta"><div className="section-intro"><span className="eyebrow">HECHO CON TIEMPO Y FUEGO</span><h2>Nuestra carta</h2></div><Categories restaurant={r} selected={selected} onSelect={setSelected}/><h2 className="category-title">{r.categories.find(c => c.id === selected).name}</h2><div className="classic-products">{r.products.filter(p => p.categoryId === selected).map(p => <Product key={p.id} product={p} onAdd={onAdd} compact/>)}</div></div></>;
}
