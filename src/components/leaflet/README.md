# LeafletMap Component

Componente Vue 3 reutilizable para integrar mapas interactivos con Leaflet.js y OpenStreetMap.

## 📦 Instalación

La dependencia de Leaflet ya está instalada en el proyecto. El CSS se importa automáticamente en `src/main.js`.

```bash
npm install leaflet  # Ya instalado
```

## 🚀 Uso Básico

```vue
<template>
  <LeafletMap
    :center="[-12.0464, -77.0428]"
    :zoom="13"
    :markers="markers"
    :circles="circles"
    :polygons="polygons"
    :fit-bounds="true"
    height="400px"
    @marker-click="handleMarkerClick"
  />
</template>

<script setup>
import LeafletMap from '@/components/leaflet/LeafletMap.vue'

const markers = [
  {
    id: 1,
    lat: -12.0464,
    lng: -77.0428,
    popup: '<strong>Lima</strong><br>Capital del Perú',
    icon: 'red'
  }
]

const handleMarkerClick = (marker) => {
  console.log('Clicked:', marker)
}
</script>
```

## 📝 Props

### `center`
- **Tipo:** `Array<Number>`
- **Default:** `[-12.0464, -77.0428]` (Lima, Perú)
- **Descripción:** Coordenadas del centro inicial del mapa `[latitud, longitud]`

### `zoom`
- **Tipo:** `Number`
- **Default:** `13`
- **Rango:** `1-18`
- **Descripción:** Nivel de zoom inicial del mapa

### `height`
- **Tipo:** `String`
- **Default:** `'400px'`
- **Descripción:** Altura del contenedor del mapa (CSS válido)

### `markers`
- **Tipo:** `Array<Object>`
- **Default:** `[]`
- **Estructura:**
  ```javascript
  {
    id: 1,                    // Identificador único (requerido)
    lat: -12.0464,            // Latitud (requerido)
    lng: -77.0428,            // Longitud (requerido)
    popup: '<strong>Título</strong>', // Contenido HTML del popup (opcional)
    icon: 'red',              // Color del icono: 'red'|'blue'|'green'|'orange'|'yellow'|'violet'|'grey'|'black' (opcional)
    draggable: false          // Permitir arrastrar el marker (opcional)
  }
  ```

### `polygons`
- **Tipo:** `Array<Object>`
- **Default:** `[]`
- **Estructura:**
  ```javascript
  {
    id: 1,                    // Identificador único
    latlngs: [                // Array de coordenadas del polígono
      [-12.05, -77.05],
      [-12.04, -77.05],
      [-12.04, -77.04]
    ],
    color: '#ce0121',         // Color del borde (opcional)
    fillColor: '#ce0121',     // Color de relleno (opcional)
    fillOpacity: 0.2,         // Opacidad del relleno 0-1 (opcional)
    weight: 3,                // Grosor del borde en px (opcional)
    popup: 'Descripción'      // Popup (opcional)
  }
  ```

### `circles`
- **Tipo:** `Array<Object>`
- **Default:** `[]`
- **Estructura:**
  ```javascript
  {
    id: 1,                    // Identificador único
    lat: -12.0464,            // Latitud del centro
    lng: -77.0428,            // Longitud del centro
    radius: 1000,             // Radio en metros (opcional, default: 1000)
    color: '#3388ff',         // Color del borde (opcional)
    fillColor: '#3388ff',     // Color de relleno (opcional)
    fillOpacity: 0.2,         // Opacidad 0-1 (opcional)
    popup: 'Radio de 1km'     // Popup (opcional)
  }
  ```

### `tileLayers`
- **Tipo:** `Array<Object>`
- **Default:** OpenStreetMap + Satellite
- **Descripción:** Capas de tiles (mapas base) disponibles
- **Estructura:**
  ```javascript
  [
    {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }
  ]
  ```

### `fitBounds`
- **Tipo:** `Boolean`
- **Default:** `false`
- **Descripción:** Ajusta automáticamente el zoom para mostrar todos los elementos (markers, polígonos, círculos)

### `showLayerControl`
- **Tipo:** `Boolean`
- **Default:** `true`
- **Descripción:** Muestra el control para cambiar entre capas de tiles

### `scrollWheelZoom`
- **Tipo:** `Boolean`
- **Default:** `true`
- **Descripción:** Permite zoom con la rueda del mouse

## 📤 Eventos

### `@map-ready`
- **Payload:** `map` (instancia de L.Map)
- **Descripción:** Se emite cuando el mapa está completamente inicializado

### `@marker-click`
- **Payload:** `markerData` (objeto del marker clickeado)
- **Descripción:** Se emite al hacer click en un marker

### `@polygon-click`
- **Payload:** `polygonData` (objeto del polígono clickeado)
- **Descripción:** Se emite al hacer click en un polígono

### `@circle-click`
- **Payload:** `circleData` (objeto del círculo clickeado)
- **Descripción:** Se emite al hacer click en un círculo

### `@map-click`
- **Payload:** `{ lat, lng }` (coordenadas clickeadas)
- **Descripción:** Se emite al hacer click directamente en el mapa

### `@marker-drag`
- **Payload:** `markerData, { lat, lng }` (marker arrastrado y nueva posición)
- **Descripción:** Se emite cuando se arrastra un marker (si `draggable: true`)

## 🔧 Métodos Expuestos

Puedes acceder a estos métodos usando `ref`:

```vue
<template>
  <LeafletMap ref="mapRef" />
</template>

<script setup>
const mapRef = ref(null)

// Centrar el mapa
mapRef.value.panTo([-12.05, -77.05], 15)

// Ajustar bounds
mapRef.value.fitBounds()

// Obtener instancia de Leaflet
const leafletMap = mapRef.value.getMap()

// Añadir marker programáticamente
mapRef.value.addMarker({
  id: 'new-marker',
  lat: -12.05,
  lng: -77.05,
  popup: 'Nuevo marker',
  icon: 'green'
})

// Eliminar marker
mapRef.value.removeMarker('new-marker')
</script>
```

## 🎨 Iconos Disponibles

El componente incluye markers de colores:
- `red` - Rojo (por defecto para alertas)
- `blue` - Azul
- `green` - Verde
- `orange` - Naranja
- `yellow` - Amarillo
- `violet` - Violeta
- `grey` - Gris
- `black` - Negro

## 📍 Ejemplo Completo: Vista de Alerta

```vue
<template>
  <LeafletMap
    :center="alertCenter"
    :zoom="13"
    :markers="alertMarkers"
    :circles="impactRadius"
    :fit-bounds="true"
    height="500px"
    @marker-click="handleMarkerClick"
  />
</template>

<script setup>
import { computed } from 'vue'
import LeafletMap from '@/components/leaflet/LeafletMap.vue'

const props = defineProps({
  alert: { type: Object, required: true }
})

// Centro del mapa (ubicación de la alerta)
const alertCenter = computed(() => {
  if (props.alert.latitude && props.alert.longitude) {
    return [parseFloat(props.alert.latitude), parseFloat(props.alert.longitude)]
  }
  return [-12.0464, -77.0428] // Default
})

// Markers: alerta + instituciones educativas
const alertMarkers = computed(() => {
  const markers = []
  
  // Marker de la alerta (rojo)
  if (props.alert.latitude && props.alert.longitude) {
    markers.push({
      id: `alert-${props.alert.id}`,
      lat: parseFloat(props.alert.latitude),
      lng: parseFloat(props.alert.longitude),
      popup: `<strong>${props.alert.title}</strong><br>${props.alert.type_event?.name}`,
      icon: 'red'
    })
  }
  
  // Markers de instituciones educativas (azules)
  props.alert.alert_educative_institutions?.forEach(ie => {
    const lat = ie.i_e?.latitude_ie
    const lng = ie.i_e?.longitude_ie
    if (lat && lng) {
      markers.push({
        id: `ie-${ie.id}`,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        popup: `<strong>${ie.i_e.name_ie}</strong><br>${ie.i_e.education_level?.name}`,
        icon: 'blue'
      })
    }
  })
  
  return markers
})

// Círculo de impacto (5km de radio)
const impactRadius = computed(() => {
  if (props.alert.latitude && props.alert.longitude) {
    return [{
      id: 'impact-area',
      lat: parseFloat(props.alert.latitude),
      lng: parseFloat(props.alert.longitude),
      radius: 5000,
      color: '#ce0121',
      fillColor: '#ce0121',
      fillOpacity: 0.1,
      popup: 'Área de impacto (5km)'
    }]
  }
  return []
})

const handleMarkerClick = (marker) => {
  console.log('Marker clicked:', marker)
}
</script>
```

## 🗺️ Polígonos Ejemplo

```vue
<script setup>
const zones = [
  {
    id: 'zone-1',
    latlngs: [
      [-12.05, -77.05],
      [-12.04, -77.05],
      [-12.04, -77.04],
      [-12.05, -77.04]
    ],
    color: '#ce0121',
    fillColor: '#ce0121',
    fillOpacity: 0.3,
    weight: 2,
    popup: 'Zona de Alto Riesgo'
  }
]
</script>

<template>
  <LeafletMap :polygons="zones" />
</template>
```

## 🌍 Capas de Tiles Personalizadas

```vue
<script setup>
const customTiles = [
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap'
  },
  {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri'
  },
  {
    name: 'Terreno',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap'
  }
]
</script>

<template>
  <LeafletMap :tile-layers="customTiles" />
</template>
```

## 🐛 Troubleshooting

### Los iconos no se muestran
- Verifica que `leaflet/dist/leaflet.css` esté importado en `src/main.js`
- El componente usa iconos remotos (CDN), requiere conexión a internet

### El mapa no tiene altura
- Asegúrate de pasar una prop `height` válida (ej: `height="400px"`)
- El contenedor padre debe tener dimensiones definidas

### Los markers no aparecen
- Verifica que `lat` y `lng` sean números válidos
- Revisa la consola por errores de coordenadas

### El mapa no se actualiza
- El componente usa watchers reactivos, asegúrate de que los datos sean reactivos (ref/computed)
- Usa `fitBounds` para recalcular bounds automáticamente

## 📚 Referencias

- [Leaflet.js Documentation](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Leaflet Color Markers](https://github.com/pointhi/leaflet-color-markers)

## 📄 Licencia

Componente desarrollado por COES Education - 2025
