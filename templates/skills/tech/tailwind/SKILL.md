---
name: tailwind
description: Estilos con Tailwind CSS. Usa cuando escribas clases de Tailwind o crees componentes con estilos.
scope: ui
tools: [read, write]
---

# Tailwind CSS

## Clases Más Usadas

### Layout
```
flex flex-col flex-row items-center justify-center justify-between
grid grid-cols-2 grid-cols-3 gap-4
container mx-auto px-4
```

### Spacing
```
p-4 px-4 py-2 pt-4 pb-4 pl-4 pr-4
m-4 mx-auto my-2 mt-4 mb-4 ml-4 mr-4
space-x-4 space-y-2
```

### Sizing
```
w-full w-1/2 w-64 w-screen
h-full h-screen h-64 min-h-screen
max-w-md max-w-lg max-w-xl max-w-2xl
```

### Typography
```
text-sm text-base text-lg text-xl text-2xl
font-bold font-medium font-normal
text-center text-left text-right
text-gray-500 text-blue-600
```

### Colors & Background
```
bg-white bg-gray-100 bg-blue-500
text-white text-gray-900
border border-gray-200 border-blue-500
```

### Efectos
```
rounded rounded-lg rounded-full
shadow shadow-md shadow-lg
opacity-50 opacity-75
hover:bg-blue-600 focus:ring-2
transition duration-200
```

## Responsive

```html
<!-- Mobile first: sm:, md:, lg:, xl:, 2xl: -->
<div class="
  w-full          /* móvil */
  md:w-1/2        /* tablet */
  lg:w-1/3        /* desktop */
">
```

## Componentes Comunes

### Botón
```html
<button class="
  px-4 py-2 
  bg-blue-500 hover:bg-blue-600 
  text-white font-medium 
  rounded-lg 
  transition duration-200
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
">
  Click me
</button>
```

### Card
```html
<div class="
  bg-white 
  rounded-lg shadow-md 
  p-6 
  border border-gray-200
">
  <h3 class="text-lg font-bold mb-2">Título</h3>
  <p class="text-gray-600">Contenido</p>
</div>
```

### Input
```html
<input class="
  w-full px-4 py-2 
  border border-gray-300 rounded-lg
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
  placeholder-gray-400
" placeholder="Email" />
```

### Flex Center
```html
<div class="flex items-center justify-center min-h-screen">
  <!-- contenido centrado -->
</div>
```

## Dark Mode

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <!-- Se adapta automáticamente -->
</div>
```

## Reglas

1. Mobile-first: diseñar para móvil, agregar breakpoints para larger
2. Usar clases utilitarias, evitar CSS custom cuando posible
3. Componentes reutilizables con `@apply` solo si necesario
4. Consistencia: usar la escala de Tailwind (4, 8, 16, 32...)
5. Dark mode: siempre considerar `dark:` variants
