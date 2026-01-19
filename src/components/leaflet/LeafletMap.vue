<template>
  <div ref="mapContainer" :style="{ height: height, width: '100%' }" class="leaflet-map-container"></div>
</template>

<script setup>
/**
 * LeafletMap Component
 * 
 * Componente reutilizable de Vue 3 para integrar mapas interactivos con Leaflet.js
 * Incluye soporte completo para markers, polígonos, círculos, popups y múltiples capas.
 * 
 * @author COES Education
 * @version 1.0.0
 * 
 * FUNCIONALIDADES:
 * - Markers personalizados con popups
 * - Polígonos con estilos configurables
 * - Círculos/Radio alrededor de puntos
 * - Múltiples capas de tiles (OSM, Satellite, etc.)
 * - Control de capas (layer switcher)
 * - FitBounds automático
 * - Eventos de click en markers y polígonos
 * - Gestión de iconos personalizados
 * 
 * EJEMPLO DE USO:
 * 
 * <LeafletMap
 *   :center="[-12.0464, -77.0428]"
 *   :zoom="13"
 *   :markers="[
 *     { id: 1, lat: -12.0464, lng: -77.0428, popup: 'Lima, Perú', icon: 'red' }
 *   ]"
 *   :polygons="[
 *     { id: 1, latlngs: [[...]], color: '#ce0121', fillOpacity: 0.3 }
 *   ]"
 *   :circles="[
 *     { id: 1, lat: -12.0464, lng: -77.0428, radius: 1000, color: 'blue' }
 *   ]"
 *   :fitBounds="true"
 *   @marker-click="handleMarkerClick"
 * />
 */

import L from 'leaflet'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// Props del componente
const props = defineProps({
  /**
   * Centro inicial del mapa [lat, lng]
   * @type {Array<Number>}
   * @default [-12.0464, -77.0428] (Lima, Perú)
   */
  center: {
    type: Array,
    default: () => [-12.0464, -77.0428],
    validator: (val) => val.length === 2 && val.every(n => typeof n === 'number')
  },

  /**
   * Nivel de zoom inicial (1-18)
   * @type {Number}
   * @default 13
   */
  zoom: {
    type: Number,
    default: 13,
    validator: (val) => val >= 1 && val <= 18
  },

  /**
   * Altura del contenedor del mapa
   * @type {String}
   * @default '400px'
   */
  height: {
    type: String,
    default: '400px'
  },

  /**
   * Array de markers a mostrar
   * @type {Array<Object>}
   * Estructura: { id, lat, lng, popup, icon, draggable }
   * - id: identificador único
   * - lat: latitud
   * - lng: longitud
   * - popup: contenido HTML del popup (opcional)
   * - icon: 'red'|'blue'|'green'|'orange' o custom (opcional)
   * - draggable: permite arrastrar el marker (opcional)
   */
  markers: {
    type: Array,
    default: () => []
  },

  /**
   * Array de polígonos a dibujar
   * @type {Array<Object>}
   * Estructura: { id, latlngs, color, fillColor, fillOpacity, weight, popup }
   * - id: identificador único
   * - latlngs: array de coordenadas [[lat,lng], ...]
   * - color: color del borde (hex/nombre)
   * - fillColor: color de relleno
   * - fillOpacity: opacidad del relleno (0-1)
   * - weight: grosor del borde
   * - popup: contenido del popup (opcional)
   */
  polygons: {
    type: Array,
    default: () => []
  },

  /**
   * Array de círculos a dibujar
   * @type {Array<Object>}
   * Estructura: { id, lat, lng, radius, color, fillColor, fillOpacity, popup }
   * - id: identificador único
   * - lat, lng: centro del círculo
   * - radius: radio en metros
   * - color: color del borde
   * - fillColor: color de relleno
   * - fillOpacity: opacidad (0-1)
   * - popup: contenido del popup (opcional)
   */
  circles: {
    type: Array,
    default: () => []
  },

  /**
   * Capas de tiles disponibles
   * @type {Array<Object>}
   * Estructura: { name, url, attribution, maxZoom }
   */
  tileLayers: {
    type: Array,
    default: () => [
      {
        name: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      },
      {
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri',
        maxZoom: 18
      }
    ]
  },

  /**
   * Ajustar automáticamente el zoom para mostrar todos los elementos
   * @type {Boolean}
   * @default false
   */
  fitBounds: {
    type: Boolean,
    default: false
  },

  /**
   * Mostrar control de capas
   * @type {Boolean}
   * @default true
   */
  showLayerControl: {
    type: Boolean,
    default: true
  },

  /**
   * Permitir zoom con scroll del mouse
   * @type {Boolean}
   * @default true
   */
  scrollWheelZoom: {
    type: Boolean,
    default: true
  }
})

// Eventos emitidos
const emit = defineEmits([
  'map-ready',      // Emitido cuando el mapa está listo (map instance)
  'marker-click',   // Click en marker (marker data)
  'polygon-click',  // Click en polígono (polygon data)
  'circle-click',   // Click en círculo (circle data)
  'map-click',      // Click en el mapa (latlng)
  'marker-drag',    // Marker arrastrado (marker data, latlng)
])

// Referencias y estado
const mapContainer = ref(null)
let map = null
let markerLayers = new Map()
let polygonLayers = new Map()
let circleLayers = new Map()
let baseLayers = {}
let layerControl = null

/**
 * Crea iconos personalizados por color
 * @param {String} color - Color del icono
 * @returns {L.Icon} Instancia del icono
 */
const createCustomIcon = (color = 'blue') => {
  const iconColors = {
    red: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    blue: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    green: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    orange: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    yellow: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    violet: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    grey: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    black: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png'
  }

  return L.icon({
    iconUrl: iconColors[color] || iconColors.blue,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

/**
 * Renderiza todos los markers en el mapa
 */
const renderMarkers = () => {
  if (!map) return

  // Limpiar markers existentes
  markerLayers.forEach(marker => map.removeLayer(marker))
  markerLayers.clear()

  // Crear nuevos markers
  props.markers.forEach(markerData => {
    const { id, lat, lng, popup, icon, draggable = false } = markerData

    if (!lat || !lng) return

    const markerOptions = {
      draggable,
      icon: icon ? createCustomIcon(icon) : undefined
    }

    const marker = L.marker([lat, lng], markerOptions)

    // Añadir popup si existe
    if (popup) {
      marker.bindPopup(popup)
    }

    // Eventos
    marker.on('click', () => emit('marker-click', markerData))
    
    if (draggable) {
      marker.on('dragend', (e) => {
        const latlng = e.target.getLatLng()
        emit('marker-drag', markerData, { lat: latlng.lat, lng: latlng.lng })
      })
    }

    marker.addTo(map)
    markerLayers.set(id, marker)
  })
}

/**
 * Renderiza todos los polígonos en el mapa
 */
const renderPolygons = () => {
  if (!map) return

  // Limpiar polígonos existentes
  polygonLayers.forEach(polygon => map.removeLayer(polygon))
  polygonLayers.clear()

  // Crear nuevos polígonos
  props.polygons.forEach(polygonData => {
    const { 
      id, 
      latlngs, 
      color = '#ce0121', 
      fillColor = '#ce0121',
      fillOpacity = 0.2,
      weight = 3,
      popup 
    } = polygonData

    if (!latlngs || !latlngs.length) return

    const polygon = L.polygon(latlngs, {
      color,
      fillColor,
      fillOpacity,
      weight
    })

    // Añadir popup si existe
    if (popup) {
      polygon.bindPopup(popup)
    }

    // Evento click
    polygon.on('click', () => emit('polygon-click', polygonData))

    polygon.addTo(map)
    polygonLayers.set(id, polygon)
  })
}

/**
 * Renderiza todos los círculos en el mapa
 */
const renderCircles = () => {
  if (!map) return

  // Limpiar círculos existentes
  circleLayers.forEach(circle => map.removeLayer(circle))
  circleLayers.clear()

  // Crear nuevos círculos
  props.circles.forEach(circleData => {
    const { 
      id, 
      lat, 
      lng, 
      radius = 1000,
      color = '#3388ff',
      fillColor = '#3388ff',
      fillOpacity = 0.2,
      popup 
    } = circleData

    if (!lat || !lng) return

    const circle = L.circle([lat, lng], {
      radius,
      color,
      fillColor,
      fillOpacity
    })

    // Añadir popup si existe
    if (popup) {
      circle.bindPopup(popup)
    }

    // Evento click
    circle.on('click', () => emit('circle-click', circleData))

    circle.addTo(map)
    circleLayers.set(id, circle)
  })
}

/**
 * Ajusta el mapa para mostrar todos los elementos
 */
const fitMapBounds = () => {
  if (!map || !props.fitBounds) return

  const bounds = []

  // Agregar markers
  props.markers.forEach(m => {
    if (m.lat && m.lng) bounds.push([m.lat, m.lng])
  })

  // Agregar polígonos
  props.polygons.forEach(p => {
    if (p.latlngs) bounds.push(...p.latlngs)
  })

  // Agregar círculos
  props.circles.forEach(c => {
    if (c.lat && c.lng) bounds.push([c.lat, c.lng])
  })

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] })
  }
}

/**
 * Inicializa el mapa
 */
const initMap = () => {
  console.log('Inicializando mapa Leaflet...', props.center, props.zoom)
  if (!mapContainer.value) return

  // Crear instancia del mapa
  map = L.map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    scrollWheelZoom: props.scrollWheelZoom
  })

  // Añadir capas de tiles
  props.tileLayers.forEach((layer, index) => {
    const tileLayer = L.tileLayer(layer.url, {
      attribution: layer.attribution || '',
      maxZoom: layer.maxZoom || 18
    })

    baseLayers[layer.name] = tileLayer

    // Añadir la primera capa por defecto
    if (index === 0) {
      tileLayer.addTo(map)
    }
  })

  // Añadir control de capas si está habilitado y hay múltiples capas
  if (props.showLayerControl && Object.keys(baseLayers).length > 1) {
    layerControl = L.control.layers(baseLayers).addTo(map)
  }

  // Evento click en el mapa
  map.on('click', (e) => {
    emit('map-click', { lat: e.latlng.lat, lng: e.latlng.lng })
  })

  // Renderizar elementos
  renderMarkers()
  renderPolygons()
  renderCircles()
  fitMapBounds()

  // Emitir evento de mapa listo
  emit('map-ready', map)
}

// Lifecycle hooks
onMounted(async () => {
  await nextTick()
  initMap()
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
  markerLayers.clear()
  polygonLayers.clear()
  circleLayers.clear()
})

// Watchers para reactividad
watch(() => props.markers, () => {
  renderMarkers()
  if (props.fitBounds) fitMapBounds()
}, { deep: true })

watch(() => props.polygons, () => {
  renderPolygons()
  if (props.fitBounds) fitMapBounds()
}, { deep: true })

watch(() => props.circles, () => {
  renderCircles()
  if (props.fitBounds) fitMapBounds()
}, { deep: true })

watch(() => props.center, (newCenter) => {
  if (map && newCenter) {
    map.setView(newCenter, props.zoom)
  }
})

watch(() => props.zoom, (newZoom) => {
  if (map && newZoom) {
    map.setZoom(newZoom)
  }
})

/**
 * Métodos expuestos para uso externo
 */
defineExpose({
  /**
   * Obtiene la instancia del mapa Leaflet
   * @returns {L.Map} Instancia del mapa
   */
  getMap: () => map,

  /**
   * Centra el mapa en una ubicación específica
   * @param {Array} latlng - [lat, lng]
   * @param {Number} zoom - Nivel de zoom
   */
  panTo: (latlng, zoom) => {
    if (map) {
      map.setView(latlng, zoom || map.getZoom())
    }
  },

  /**
   * Ajusta el mapa para mostrar todos los elementos
   */
  fitBounds: () => fitMapBounds(),

  /**
   * Añade un marker programáticamente
   * @param {Object} markerData - Datos del marker
   */
  addMarker: (markerData) => {
    props.markers.push(markerData)
  },

  /**
   * Elimina un marker por ID
   * @param {String|Number} id - ID del marker
   */
  removeMarker: (id) => {
    const marker = markerLayers.get(id)
    if (marker && map) {
      map.removeLayer(marker)
      markerLayers.delete(id)
    }
  }
})
</script>

<style scoped>
.leaflet-map-container {
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}
</style>

<style>
/* Estilos globales para elementos internos de Leaflet (sin scoped) */
.leaflet-map-container .leaflet-container {
  font-family: inherit;
}

.leaflet-map-container .leaflet-popup-content-wrapper {
  border-radius: 8px;
}

.leaflet-map-container .leaflet-popup-content {
  margin: 12px;
  font-size: 14px;
}
</style>
