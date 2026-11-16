# Tu Menú Digital

Cartas digitales personalizables para negocios gastronómicos de Uruguay. El proyecto combina una home comercial con cuatro modelos de menú, un carrito de pedidos por WhatsApp y códigos QR descargables.

## Tecnologías

React, Vite, React Router y CSS. Generación local de QR con `qrcode`; pruebas con Node.js Test Runner y Playwright.

## Funcionalidades

- Cuatro diseños independientes: **Clásico**, **Urbano**, **Natural** y **Fresco**.
- 160 productos de demostración, organizados en nueve categorías por carta y con precios en pesos uruguayos.
- Configuración editable de identidad, colores, información del local, categorías y productos.
- Carrito con cantidades, eliminación de productos, observaciones y cálculo del total.
- Generación del mensaje de pedido para WhatsApp, con productos, cantidades y precios.
- QR descargable en PNG cuando la carta tiene una URL pública configurada.
- Diseño responsive para celulares, tablets y computadoras.

Es un frontend estático. No incluye API, autenticación, pagos ni almacenamiento de pedidos. El carrito vive en memoria y se vacía al salir de la carta o recargar. Los negocios y productos publicados son ejemplos ficticios.

## Estructura

```text
frontend/
  public/          Favicon y reglas de rutas para Cloudflare Pages
  src/
    assets/        Fotografías locales y documentación de licencias
    components/    Carrito, productos, navegación y QR compartidos
    config/        Configuración comercial y de cada restaurante
    data/          Categorías y productos de demostración
    pages/         Home y composición de las cartas
    templates/     Cuatro plantillas con sus propios estilos
    styles/        Estilos generales y adaptación responsive
  tests/           Pruebas unitarias, de navegador y de producción
backend/           Reservado; no contiene una API implementada
```

## Instalación y ejecución

Requiere Node.js y npm. La versión de Node utilizada para el build está definida en `frontend/.node-version`.

```bash
git clone https://github.com/gastonjauredev-rgb/tumenudigital.git
cd tumenudigital/frontend
npm ci
npm run dev
```

Abrir la dirección que muestra Vite, normalmente `http://localhost:5173`. En Windows, si PowerShell bloquea `npm.ps1`, usar `npm.cmd` en lugar de `npm`.

| Ruta | Página |
| --- | --- |
| `/` | Home comercial |
| `/demo/clasico` | Restaurante y parrilla |
| `/demo/urbano` | Hamburguesería y comida urbana |
| `/demo/natural` | Cafetería y cocina artesanal |
| `/demo/fresco` | Cocina de temporada y costa |

## Configuración de las plantillas

Editar el archivo del restaurante en `frontend/src/config/`: `clasico.js`, `urbano.js`, `natural.js` o `fresco.js`. Los campos permiten cambiar nombre, logo, descripción, colores, dirección, horarios, redes sociales, `whatsappNumber`, `publicUrl` y `template`.

`template` selecciona la presentación entre `clasico`, `urbano`, `natural` y `fresco`, sin modificar componentes. El `id` identifica los datos de la carta. La configuración comercial de la home está en `business.js`.

Los datos de ejemplo están en `frontend/src/data/menus.js`. Cada producto contiene nombre, descripción, precio numérico y una clave opcional de fotografía. También se pueden reemplazar categorías y productos desde el archivo del restaurante mediante `menu`:

```js
menu: {
  categories: [{ id: 'entradas', name: 'Entradas' }],
  products: [{
    id: 'provoleta',
    categoryId: 'entradas',
    name: 'Provoleta',
    description: 'Con orégano y tomates asados.',
    price: 320,
    image: '/restaurantes/provoleta.jpg',
  }],
},
```

Usar IDs únicos, categorías existentes y precios enteros positivos en UYU. Las imágenes propias pueden guardarse en `frontend/public/restaurantes/`. `imageSmall` permite indicar una variante opcional para pantallas pequeñas. `socialLinks` admite objetos con `label` y `url` pública.

### WhatsApp y QR

Configurar WhatsApp con el número internacional real del negocio, incluido el código de país. Si falta un número válido, el envío permanece deshabilitado. La web prepara el mensaje; la confirmación del pedido se realiza conversando con el local.

`publicUrl` debe contener la URL pública completa y estable de la carta. En producción, el QR no se genera hasta configurar esa dirección; no se utiliza localhost como reemplazo. En desarrollo se permite una vista del QR de la URL local. Configurar una URL no crea hosting ni nuevas rutas: publicar la carta y probar el QR antes de imprimirlo.

## Compilación y pruebas

Desde `frontend/`:

```bash
npm run build
npm run preview
```

El build se genera en `frontend/dist/`. Para ejecutar las pruebas:

```bash
npm test
npm run test:browser
npm run test:production
```

Las pruebas de navegador requieren Google Chrome instalado. `test:production` necesita un build previo y comprueba el contenido de `dist` con Vite Preview. Las suites verifican rutas, categorías, imágenes, carrito, mensajes de WhatsApp, QR y adaptación a seis anchos de pantalla. Los resultados y capturas generados se excluyen de Git.

## Despliegue en Cloudflare Pages

Conectar el repositorio de GitHub a un proyecto de Pages con esta configuración:

| Campo | Valor |
| --- | --- |
| Framework | React (Vite) |
| Rama de producción | `main` |
| Directorio raíz | `frontend` |
| Comando de build | `npm run build` |
| Directorio de salida | `dist` |
| Versión de Node | La indicada en `frontend/.node-version` |

Instalar también las dependencias de desarrollo durante el build: Vite es necesario para compilar. No se requieren secretos ni una API.

`frontend/public/_redirects` se copia al build y permite abrir y recargar las rutas `/demo/*`. El resto del enrutamiento utiliza el fallback SPA de Pages; no agregar un `404.html` de raíz sin revisar ese comportamiento. La [documentación de Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/) describe este mecanismo.

Tras publicar, comprobar las cinco rutas y sus recargas en el dominio real. Completar los WhatsApp y las URLs públicas desde los archivos de configuración y volver a desplegar. Mientras esos campos estén vacíos, el sitio funciona como demostración y muestra los destinos pendientes de configuración.

La configuración del frontend y las variables `VITE_*` son públicas. No guardar credenciales en el código, en `public/` ni en esas variables.

## Recursos gráficos

Las fotografías se sirven localmente y son ilustrativas. Su procedencia y condiciones de uso están documentadas en [LICENSES.md](frontend/src/assets/LICENSES.md).
