# Aplicación prueba FullStack IACele


## Descripción de la aplicación

La aplicación es de prueba, pero es funcional. No tiene nada de "lógica de negocios" todía. Sin embargo la lógica de programación está casí completa.



El código es público:
 -El código del backend está en [GitHub](https://github.com/ecostichp/inventario_app_backend)
 -El código del frontend está en [GitHub](https://github.com/ecostichp/prueba_iacele_frontend)



La estructura de la aplicación queda de la siguiente manera:

1.- Backend FastAPI
  1.1.- Hosting: Google Cloud Run (con Docker)
  1.2.- ORM: SQLAlchemy

2.- Database Motor SQLite
  2.1.- Hosting: dentro del contenedor Docker del backend


3.- Frontend ReactJS
  3.1.- Hosting: Vercel
  3.2.- Ruteador: React-Router-Dom
  3.3.- Peticiones HTTP: Axios
  3.4.- CSS: TailwindCSS
  3.4.- UI components: TailwindUI





## El Frontend

Este repositorio sólo abarca la parte del frontend


### 1. Actualiza yarn
```
npm install --global yarn
```

### 2. Crea el proyecto ReactJS usando Vite
Se va a utilizar la herramienta Vite para crear el proyecto ReactJS. Lo haremos con el comando yarn.

En este ejemplo, el proyecto lleva por nombre "app".

El template que usará la herramienta Vite es react + swc.

```
yarn create vite app --template react-swc
```

### 3. Instala las dependencias.
Ingresa a la carpeta del proyecto. En este ejemplo el proyecto se llamó "app", por lo tanto:

```
cd .\app\
```

Ya dentro de la carpeta, donde está el archivo "package.json" corre el comando yarn para instalar sus dependencias.

```
yarn
yarn add axios react-router-dom localforage match-sorter sort-by
yarn add -D tailwindcss postcss autoprefixer
yarn tailwindcss init -p
yarn add @headlessui/react @heroicons/react
```

### 4. Configura TailWindCSS y TailWindUI.
4.1: Para TaiwindCSS:

4.1.1: Agrega este código al archivo "tailwind.config.js", en el apartado de 'content':
```
"./index.html",
"./src/**/*.{js,ts,jsx,tsx}",
```

Es decir, antes de veía así:
```
export default {
  content: [],
  "más código..."
```

Después se verá así:
```
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  "más código..."
```

4.1.2: Por último, agrega el código siguiente al archivo "./src/index.css":
```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Las instrucciones completas para instalar TailwindCSS-Vite/ReactJS están [aquí](https://tailwindcss.com/docs/guides/vite)



### 5. Corre la aplicación en modo develpment.
```
yarn dev
```
si prefieres correr la aplición en un puerto específico (ej: 3010):
```
yarn dev -p 3010
```
si prefieres correr la aplición exponiendola en tu red local:
```
yarn dev --host
```



## Creando un archivo .env.local
Para tener variables de entorno debes crear un archivo ".env.local" y el archivo ".env.production".  Estos archivos se crean en la carpeta del proyecto, que en este ejemplo llamaste "app".


Después de esto, escribe el siguiente código dentro del archivo local:
```
VITE_API_HOST = "http://127.0.0.1:8000"
```
Es aquí donde Axios hará las peticiones que el frontend tiene para el backend.

Cuando tengas la dirección del backen de producción, haces lo mismo en el .env.production.
