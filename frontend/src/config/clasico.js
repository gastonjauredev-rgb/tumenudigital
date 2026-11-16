import { image } from '../assets/images';
import { createRestaurant } from './createRestaurant';
export default createRestaurant({
  id: 'clasico', template: 'clasico', templateName: 'Clásico',
  name: 'Brasa & Origen', logo: '',
  tagline: 'El sabor de las buenas costumbres.',
  description: 'Tradición que se disfruta sin apuro. Cortes seleccionados y cocina con alma.',
  audience: 'Restaurantes · Parrillas',
  primaryColor: '#c8a666', secondaryColor: '#201e1a',
  heroImage: image('steak'), whatsappNumber: '', publicUrl: '',
  address: 'Dirección de ejemplo · Uruguay', hours: 'Martes a domingo · 12:00 a 23:00',
  socialLinks: [],
});
