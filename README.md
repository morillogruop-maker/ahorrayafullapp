# Ahorra Ya · Panel inteligente de ahorro

Ahorra Ya es una aplicación construida con Next.js 14 que te permite orquestar reglas de ahorro, visualizar el impacto mensual y recibir recomendaciones accionables respaldadas por tus propios datos. La experiencia corre completamente en el navegador y persiste tu configuración utilizando `localStorage`.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior (puedes usar pnpm o yarn si lo prefieres)

## Puesta en marcha

```bash
npm install
npm run dev
```

El primer comando instalará las dependencias de Next, React y React DOM. El segundo abrirá el panel en modo desarrollo (por defecto en `http://localhost:3000`). Para generar una versión lista para producción ejecuta `npm run build` y luego `npm start`.

> Si el registro de npm bloquea alguna dependencia en tu entorno, configura el mirror corporativo correspondiente o vuelve a intentar la instalación con una red habilitada para npm.

## Características destacadas

- **Resumen mensual consolidado:** calcula automáticamente el aporte equivalente de cada regla a CLP mensuales y lo compara con tu meta.
- **Constructor de reglas flexible:** soporta categorías, impacto estimado y cuatro frecuencias distintas (semanal, quincenal, mensual y trimestral).
- **Insights inteligentes:** genera recomendaciones personalizadas según la cobertura de tu meta, la tendencia mensual y la mezcla de reglas activas.
- **Persistencia en el navegador:** tanto la meta como las reglas quedan guardadas en `localStorage`, por lo que puedes retomar donde lo dejaste.
- **Interfaz moderna:** layout oscuro responsive, tipografía Inter suministrada por `next/font` y componentes listos para escritorio y móviles.

## Estructura principal

```
app/
  layout.jsx        # Layout raíz y metadata
  page.jsx          # Panel principal con toda la lógica de negocio
  globals.css       # Estilos globales y tokens de diseño
lib/
  finance.js        # Utilidades de cálculo financiero e insights
```

Puedes modificar la lógica de recomendaciones en `lib/finance.js` y personalizar estilos desde `app/globals.css`.

## Producción

1. Ejecuta `npm run build` para generar el bundle optimizado.
2. Usa `npm start` para levantar el servidor en Node.
3. Opcionalmente, despliega el contenido generado en plataformas como Vercel, Netlify o cualquier hosting Node compatible con Next.js 14.

¡Disfruta acelerando tus metas financieras con Ahorra Ya!
