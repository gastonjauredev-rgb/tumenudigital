import { image } from '../assets/images';
import { createRestaurant } from './createRestaurant';
export default createRestaurant({
  id: 'natural', template: 'natural', templateName: 'Natural',
  name: 'Miga & Calma', logo: '',
  tagline: 'Un momento para lo simple.',
  description: 'Café rico, pan de verdad y pequeños placeres hechos a mano.',
  audience: 'Cafeterías · Artesanales',
  primaryColor: '#53684d', secondaryColor: '#eee6d8',
  heroImage: image('coffee'), whatsappNumber: '', publicUrl: '',
  address: 'Dirección de ejemplo · Uruguay', hours: 'Martes a domingo · 12:00 a 23:00',
  socialLinks: [],
});
