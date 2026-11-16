import { image } from '../assets/images';
import { createRestaurant } from './createRestaurant';
export default createRestaurant({
  id: 'urbano', template: 'urbano', templateName: 'Urbano',
  name: 'BARRIO BURGER', logo: '',
  tagline: 'Sin vueltas. Con todo.',
  description: 'Hamburguesas honestas, pizzas al horno y antojos que no esperan.',
  audience: 'Hamburgueserías · Pizzerías',
  primaryColor: '#ff6239', secondaryColor: '#211e1b',
  heroImage: image('burger-double'), heroSmallImage: image('burger-double-small'), whatsappNumber: '', publicUrl: '',
  address: 'Dirección de ejemplo · Uruguay', hours: 'Martes a domingo · 12:00 a 23:00',
  socialLinks: [],
});
