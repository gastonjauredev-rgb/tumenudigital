const photos = import.meta.glob('./*.jpg', { eager: true, query: '?url', import: 'default' });
export const image = name => photos[`./${name}.jpg`];
