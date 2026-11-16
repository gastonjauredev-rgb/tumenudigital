import { image } from '../assets/images';
import { createRestaurant } from './createRestaurant';
export default createRestaurant({
  id: 'fresco', template: 'fresco', templateName: 'Fresco',
  name: 'Costa Clara', logo: '',
  tagline: 'El verano se sirve acá.',
  description: 'Sabores livianos, bebidas frescas y una pausa junto al mar.',
  audience: 'Paradores · Heladerías',
  primaryColor: '#087f87', secondaryColor: '#ffdc95',
  heroImage: image('fish'), whatsappNumber: '', publicUrl: '',
  address: 'Dirección de ejemplo · Uruguay', hours: 'Martes a domingo · 12:00 a 23:00',
  socialLinks: [],
});
