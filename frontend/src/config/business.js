import { whatsappUrl } from '../components/order.js';

export const business = {
  name: 'Tu Menú Digital',
  whatsappNumber: '+598 91 602 323',
  contactMessage: 'Hola, vi Tu Menú Digital y me gustaría recibir información sobre las cartas digitales para mi negocio',
};

export const businessWhatsappUrl = whatsappUrl(business.whatsappNumber, business.contactMessage);
