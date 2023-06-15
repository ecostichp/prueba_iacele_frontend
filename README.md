# Ejercicio 01 de FullStack

Para generar esta aplicación FullStack me basé casi en su totalidad a la aplicación de Sixfwa en el canal de Youtube Rithmic. El video de [YouTube](https://youtu.be/UbSONbZ8t4g) y el código [GitHub](https://github.com/sixfwa/react-fastapi) son públicos.


Mi aplicación queda de la siguiente manera:
1.- Backend FastAPI
2.- Frontend ReactJS
3.- Database Motor SQLite
4.- ORM SQLAlchemy.

A diferencia de Rithmic, yo cree el proyecto con VITE. Además incluí "Axios" para las peticiones al backend y para el CSS incluí "TailwindCSS".



# El Front-end


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
yarn add -D moment axios
```

### 4. Instala TailwindCSS.
4.1: Para TaiwindCSS:
```
yarn add -D tailwindcss postcss autoprefixer @headlessui/react @heroicons/react
yarn tailwindcss init -p
```

4.2: Agrega este código al archivo "tailwind.config.js", en el apartado de 'content':
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

4.3: Por último, agrega el código siguiente al archivo "./src/index.css":
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
si prefieres correr la aplición en un host diferente al local (ej: 192.168.1.72):
```
yarn dev -H 192.168.1.72
```



## Creando un archivo .env.local
Para tener variables de entorno debes crear un archivo ".env.local" y el archivo ".env.production".  Estos archivos se crean en la carpeta del proyecto, que en este ejemplo llamaste "app".


Después de esto, escribe el siguiente código dentro del archivo local:
```
VITE_API_HOST = "http://127.0.0.1:8000"
```
Es aquí donde Axios hará las peticiones que el frontend tiene para el backend.

Cuando tengas la dirección del backen de producción, haces lo mismo en el .env.production.
