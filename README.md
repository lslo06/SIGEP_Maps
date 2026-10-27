# Módulo de mapas

Módulo independiente de React, Vite y JavaScript para visualizar mapas de calles, satélite y topográfico. Las tres vistas se solicitan al WMS de QGIS Server.

## Estructura

```text
src/
├── pages/
│   └── MapaPage.jsx
├── components/map/
│   ├── MapCanvas.jsx
│   ├── MapStatus.jsx
│   └── PredioSearch.jsx
├── api/
│   ├── server.mjs
│   └── Dockerfile
├── config/
│   └── map.js
├── App.jsx
└── main.jsx
```

- `MapaPage.jsx` compone la página y administra su estado.
- `MapCanvas.jsx` contiene Leaflet, el selector de fondos, la capa WMS, coordenadas y centrado.
- `MapStatus.jsx` contiene los mensajes de conexión y cobertura.
- `config/map.js` centraliza el centro, zoom y variables WMS.
- `App.jsx` funciona como punto de integración. El equipo puede importar `MapaPage` desde su enrutador existente.

## Instalación

```bash
pnpm install
```

## Configuración

Copia el ejemplo:

```bash
cp .env.example .env
```

Completa las variables públicas:

```env
VITE_QGIS_WMS_URL=https://qgis.example.org/ows/
VITE_QGIS_MAP=/ruta/al/proyecto/durango.qgz
```

No coloques contraseñas ni secretos en variables `VITE_*`, porque se publican en el navegador.

## Ejecución

```bash
pnpm dev
```

Para detener Vite, presiona `Ctrl + C` en la terminal donde se ejecuta.

## Integración en otro proyecto

Instala las dependencias:

```bash
pnpm add leaflet react-leaflet lucide-react
```

Importa la página desde el enrutador del proyecto:

```jsx
import MapaPage from "./pages/MapaPage"

// Ejemplo:
<Route path="/mapa" element={<MapaPage />} />
```

El CSS de Leaflet ya se importa desde `MapaPage.jsx`. Los estilos visuales del módulo están en `src/index.css`; pueden trasladarse al sistema de estilos compartido del proyecto.

## Comprobar el WMS

1. Inicia la aplicación después de configurar `.env`.
2. El indicador debe pasar de **Conectando WMS…** a **WMS conectado**.
3. Verifica en la pestaña de red del navegador que las solicitudes `GetMap` respondan con HTTP 200.
4. QGIS Server debe permitir solicitudes CORS desde el dominio de la aplicación y publicar las capas `OpenStreetMap`, `Esri World Imagery` y `Esri World Topo Map` en WMS.

Si el WMS falla, el mapa queda vacío y muestra el aviso de conexión. No hay fondos de respaldo ni solicitudes directas del navegador a servicios cartográficos externos. Las fuentes XYZ subyacentes de satélite y topográfico aún deben estar disponibles desde el servidor QGIS.

## Búsqueda de predios

La página consulta `GET /api/predios?clave=...`; el servicio de `api/` hace una consulta parametrizada usando el usuario PostgreSQL de solo lectura `sigep_lector` y devuelve una entidad GeoJSON. La contraseña de PostgreSQL se configura solo en el servidor, nunca en una variable `VITE_*`.

En desarrollo, Vite reenvía `/api` a `http://127.0.0.1:8100`. En el servidor, la API debe estar en la red Docker `qgis-server_default`, conectarse a `sigep-postgis:5432` y publicar el puerto `8100` solo en `127.0.0.1`. Para abrirla desde la computadora local, usa un túnel SSH al puerto 8100.
