import { Link } from 'react-router-dom';

const captions = {
  clasico: 'COCINA DE ORIGEN',
  urbano: 'HECHO EN EL BARRIO',
  natural: 'HECHO A MANO',
  fresco: 'CON AIRE DE MAR',
};

export default function ModelCard({ restaurant: r, index }) {
  return <article className={`demo-card card-${r.id}`} aria-describedby={`qr-${r.id}`}>
    <Link className="demo-card-link" to={`/demo/${r.id}`} aria-labelledby={`model-action-${r.id} model-name-${r.id}`} aria-describedby={`model-description-${r.id}`}>
      <span className="demo-ribbon" aria-hidden="true">VER EJEMPLO {index + 1}</span>
      <div className="demo-visual">
        <img src={r.heroImage} alt={`Propuesta gastronómica ${r.templateName}`} loading="lazy"/>
        <span className="demo-number">0{index + 1}</span>
        <div className="demo-preview"><small>{captions[r.id]}</small><strong>{r.name}</strong><span>{r.tagline}</span></div>
        <span className="preview-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="demo-details">
        <h3 id={`model-name-${r.id}`}>{r.templateName}</h3>
        <p id={`model-description-${r.id}`}>{r.audience}</p>
        <span className="button demo-open"><span id={`model-action-${r.id}`}>Abrir menú</span><span aria-hidden="true">→</span></span>
      </div>
    </Link>
  </article>;
}
