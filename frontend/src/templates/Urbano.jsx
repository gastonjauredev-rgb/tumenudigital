import { useState } from 'react';
import { Categories, Identity, Product } from '../components/MenuParts';
import './urbano.css';
export default function Urbano({ restaurant: r, onAdd }) {
  const [selected, setSelected] = useState(r.categories[0].id);
  const categoryIndex = r.categories.findIndex(c => c.id === selected);
  const products = r.products.filter(p => p.categoryId === selected);
  return <>
    <header className="urban-header"><div className="urban-wordmark"><span className="urban-mark" aria-hidden="true">B.</span><Identity restaurant={r}/></div><a href="#carta">La carta ↘</a></header>
    <section className="urban-hero">
      <div className="urban-hero-copy"><span className="urban-kicker"><i/>EL BARRIO TIENE HAMBRE.</span><h1>{r.tagline}</h1><p>{r.description}</p><a className="button" href="#carta">Elegí tu próximo antojo <span>↘</span></a></div>
      <div className="urban-hero-photo"><img src={r.heroImage} srcSet={r.heroSmallImage ? `${r.heroSmallImage} 480w, ${r.heroImage} 960w` : undefined} sizes="(min-width: 768px) 55vw, 100vw" alt="Hamburguesa doble con queso y panceta" width="960" height="720" fetchPriority="high"/><span className="urban-photo-label">BUENA COMIDA.<br/><strong>BUEN BARRIO.</strong></span></div>
      <div className="urban-hero-bottom"><span>BURGERS / PIZZAS / MUCHO MÁS</span><span aria-hidden="true">✳</span><span>EL ANTOJO LO PONÉS VOS.</span></div>
    </section>
    <div id="carta" className="menu-content urban-menu">
      <div className="urban-navigation"><span className="urban-nav-label">¿QUÉ SALE HOY?</span><Categories restaurant={r} selected={selected} onSelect={setSelected}/></div>
      <div className="urban-menu-heading"><div><span className="eyebrow">LA CARTA DEL BARRIO</span><h2 className="category-title">{r.categories[categoryIndex].name}</h2></div><div className="urban-category-count"><strong>{String(categoryIndex + 1).padStart(2, '0')}<span> / {String(r.categories.length).padStart(2, '0')}</span></strong><small>{products.length} opciones para elegir</small></div></div>
      <div className="urban-products">{products.map(p => <Product key={p.id} product={p} onAdd={onAdd}/>)}</div>
      <p className="urban-menu-note">Elegí tus favoritos. El resto lo charlamos por WhatsApp. ↗</p>
    </div>
  </>;
}
