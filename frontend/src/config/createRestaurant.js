import { menus } from '../data/menus';
import { image } from '../assets/images';
export function createRestaurant(config) {
  return {
    ...config,
    categories: menus[config.id].map(([name], index) => ({ id: `${config.id}-${index}`, name })),
    products: menus[config.id].flatMap(([, products], index) => products.map(([name, description, price, photo], position) => ({ id: `${config.id}-${index}-${position}`, categoryId: `${config.id}-${index}`, name, description, price, image: image(photo), imageSmall: image(`${photo}-small`) }))),
    ...config.menu,
  };
}
