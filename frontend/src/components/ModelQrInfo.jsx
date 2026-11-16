export default function ModelQrInfo({ id }) {
  return <div className="model-qr-info" id={id}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h-3zM21 13v4M12 3v3M3 12h4M12 9v4h5M12 17v4h4M19 21h2v-2"/>
    </svg>
    <div><strong>Cada menú incluye su código QR imprimible.</strong><p>Podés colocarlo en las mesas de tu negocio para que tus clientes accedan a la carta directamente desde su celular.</p></div>
  </div>;
}
