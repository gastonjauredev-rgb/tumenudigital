import clasico from './clasico';
import urbano from './urbano';
import natural from './natural';
import fresco from './fresco';
export { image } from '../assets/images';
export const restaurants = { clasico, urbano, natural, fresco };
export async function getRestaurant(id) { return restaurants[id] ?? null; }
