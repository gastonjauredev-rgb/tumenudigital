import { useEffect, useReducer } from 'react';
import { restaurants } from '../config/restaurants';
import { cartReducer } from '../components/order';
import Cart from '../components/Cart';
import { DemoBar, MenuFooter } from '../components/MenuParts';
import Clasico from '../templates/Clasico';
import Urbano from '../templates/Urbano';
import Natural from '../templates/Natural';
import Fresco from '../templates/Fresco';
const templates = { clasico: Clasico, urbano: Urbano, natural: Natural, fresco: Fresco };
export default function Menu({ id }) {
  const restaurant = restaurants[id];
  const Template = templates[restaurant.template];
  const [quantities, dispatch] = useReducer(cartReducer, {});
  useEffect(() => { document.title = `${restaurant.name} · Carta digital`; window.scrollTo(0, 0); }, [restaurant]);
  return <main className={`restaurant ${restaurant.template}`} style={{ '--primary': restaurant.primaryColor, '--secondary': restaurant.secondaryColor }}><DemoBar/><Template restaurant={restaurant} onAdd={id => dispatch({ type: 'add', id })}/><MenuFooter restaurant={restaurant}/><Cart restaurant={restaurant} quantities={quantities} dispatch={dispatch}/><span className="sr-only" role="status">{Object.values(quantities).reduce((a, b) => a + b, 0)} productos en tu pedido</span></main>;
}
