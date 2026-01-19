# Ejemplos de Uso - LeafletMap Component

## 1. Ejemplo Básico - Un Marker Simple

```vue
<template>
  <LeafletMap
    :center="[-12.0464, -77.0428]"
    :zoom="13"
    :markers="[
      {
        id: 1,
        lat: -12.0464,
        lng: -77.0428,
        popup: 'Lima, Perú',
        icon: 'red'
      }
    ]"
    height="300px"
  />
</template>

<script setup>
import LeafletMap from '@/components/leaflet/LeafletMap.vue'
</script>
```

## 2. Ejemplo con Múltiples Markers y Colores

```vue
<template>
  <LeafletMap
    :center="[-12.0464, -77.0428]"
    :zoom="12"
    :markers="schools"
    :fit-bounds="true"
    height="400px"
  />
</template>

<script setup>
import LeafletMap from '@/components/leaflet/LeafletMap.vue'

const schools = [
  { id: 1, lat: -12.0464, lng: -77.0428, popup: 'Escuela A', icon: 'blue' },
  { id: 2, lat: -12.0500, lng: -77.0500, popup: 'Escuela B', icon: 'green' },
  { id: 3, lat: -12.0400, lng: -77.0350, popup: 'Escuela C', icon: 'orange' }
]
</script>
```

## 3. Ejemplo con Círculo de Radio

```vue
<template>
  <LeafletMap
    :center="[-12.0464, -77.0428]"
    :zoom="12"
    :markers="[alertMarker]"
    :circles="[impactCircle]"
    height="450px"
  />
</template>

<script setup>
import LeafletMap from '@/components/leaflet/LeafletMap.vue'

const alertMarker = {
  id: 'alert',
  lat: -12.0464,
  lng: -77.0428,
  popup: '<strong>Alerta Sísmica</strong>',
  icon: 'red'
}

const impactCircle = {
  id: 'impact',
  lat: -12.0464,
  lng: -77.0428,
  radius: 3000, // 3km
  color: '#ce0121',
  fillColor: '#ce0121',
  fillOpacity: 0.15,
  popup: 'Zona de impacto (3km)'
}
</script>
```

## 4. Ejemplo con Polígono (Zona de Riesgo)

```vue
<template>
  <LeafletMap
    :center="[-12.0464, -77.0428]"
    :zoom="14"
    :polygons="[riskZone]"
    height="400px"
  />
</template>

<script setup>
import LeafletMap from '@/components/leaflet/LeafletMap.vue'

const riskZone = {
  id: 'zone-1',
  latlngs: [
    [-12.050, -77.050],
    [-12.045, -77.050],
    [-12.045, -77.045],
    [-12.048, -77.042],
    [-12.050, -77.045]
  ],
  color: '#ff0000',
  fillColor: '#ff0000',
  fillOpacity: 0.25,
  weight: 3,
  popup: '<strong>Zona de Alto Riesgo</strong><br>Evacuación recomendada'
}
</script>
```

## 5. Ejemplo Completo: Alerta con IE Afectadas

```vue
<template>
  <div>
    <h3>Mapa de Alerta y Zonas Afectadas</h3>
    <LeafletMap
      ref="mapRef"
      :center="mapCenter"
      :zoom="13"
      :markers="allMarkers"
      :circles="impactArea"
      :polygons="affectedZones"
      :fit-bounds="true"
      :show-layer-control="true"
      height="500px"
      @marker-click="onMarkerClick"
      @map-ready="onMapReady"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import LeafletMap from '@/components/leaflet/LeafletMap.vue'

const props = defineProps({
  alert: { type: Object, required: true }
})

const mapRef = ref(null)

// Centro del mapa
const mapCenter = computed(() => {
  const lat = props.alert.latitude
  const lng = props.alert.longitude
  return lat && lng ? [parseFloat(lat), parseFloat(lng)] : [-12.0464, -77.0428]
})

// Todos los markers (alerta + IE)
const allMarkers = computed(() => {
  const markers = []
  
  // Marker principal de alerta (rojo)
  if (props.alert.latitude && props.alert.longitude) {
    markers.push({
      id: `alert-${props.alert.id}`,
      lat: parseFloat(props.alert.latitude),
      lng: parseFloat(props.alert.longitude),
      popup: `
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0;">${props.alert.title}</h4>
          <p style="margin: 4px 0;"><strong>Tipo:</strong> ${props.alert.type_event?.name || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Fecha:</strong> ${props.alert.date}</p>
        </div>
      `,
      icon: 'red',
      draggable: false
    })
  }
  
  // Markers de instituciones educativas (azules)
  const institutions = props.alert.alert_educative_institutions || []
  institutions.forEach(ie => {
    const lat = ie.i_e?.latitude_ie || ie.educative_institution?.latitude_ie
    const lng = ie.i_e?.longitude_ie || ie.educative_institution?.longitude_ie
    const name = ie.i_e?.name_ie || ie.educative_institution?.name_ie
    
    if (lat && lng) {
      markers.push({
        id: `ie-${ie.id}`,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        popup: `
          <div style="min-width: 180px;">
            <h5 style="margin: 0 0 8px 0;">${name}</h5>
            <p style="margin: 4px 0;"><strong>Nivel:</strong> ${ie.i_e?.education_level?.name || 'N/A'}</p>
            <p style="margin: 4px 0;">${ie.description || ''}</p>
          </div>
        `,
        icon: 'blue'
      })
    }
  })
  
  return markers
})

// Área de impacto (círculo)
const impactArea = computed(() => {
  if (props.alert.latitude && props.alert.longitude) {
    return [{
      id: 'impact-radius',
      lat: parseFloat(props.alert.latitude),
      lng: parseFloat(props.alert.longitude),
      radius: 5000, // 5km
      color: '#ce0121',
      fillColor: '#ce0121',
      fillOpacity: 0.1,
      popup: '<strong>Área de Impacto</strong><br>Radio: 5km'
    }]
  }
  return []
})

// Zonas afectadas (polígonos) - ejemplo
const affectedZones = computed(() => {
  // Aquí podrías cargar polígonos desde tu API
  // Por ahora, un ejemplo estático
  if (props.alert.affected_zones) {
    return props.alert.affected_zones.map((zone, idx) => ({
      id: `zone-${idx}`,
      latlngs: zone.coordinates,
      color: zone.severity === 'high' ? '#ff0000' : '#ffaa00',
      fillColor: zone.severity === 'high' ? '#ff0000' : '#ffaa00',
      fillOpacity: 0.2,
      weight: 2,
      popup: `<strong>${zone.name}</strong><br>Severidad: ${zone.severity}`
    }))
  }
  return []
})

// Event handlers
const onMarkerClick = (marker) => {
  console.log('Clicked marker:', marker)
  // Aquí puedes abrir un dialog, mostrar info, etc.
}

const onMapReady = (map) => {
  console.log('Map ready:', map)
  // Puedes hacer operaciones adicionales con la instancia de Leaflet
}

// Métodos para controlar el mapa programáticamente
const centerOnAlert = () => {
  if (mapRef.value && props.alert.latitude && props.alert.longitude) {
    mapRef.value.panTo([parseFloat(props.alert.latitude), parseFloat(props.alert.longitude)], 15)
  }
}

const fitAllElements = () => {
  if (mapRef.value) {
    mapRef.value.fitBounds()
  }
}
</script>
```

## 6. Ejemplo con Markers Arrastrables

```vue
<template>
  <div>
    <LeafletMap
      :center="[-12.0464, -77.0428]"
      :zoom="13"
      :markers="markers"
      height="400px"
      @marker-drag="onMarkerDrag"
    />
    <p v-if="draggedPosition">
      Nueva posición: {{ draggedPosition.lat }}, {{ draggedPosition.lng }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LeafletMap from '@/components/leaflet/LeafletMap.vue'

const draggedPosition = ref(null)

const markers = ref([
  {
    id: 1,
    lat: -12.0464,
    lng: -77.0428,
    popup: 'Arrastra este marker',
    icon: 'green',
    draggable: true
  }
])

const onMarkerDrag = (markerData, newPosition) => {
  console.log('Marker arrastrado:', markerData, newPosition)
  draggedPosition.value = newPosition
  
  // Actualizar la posición del marker
  const marker = markers.value.find(m => m.id === markerData.id)
  if (marker) {
    marker.lat = newPosition.lat
    marker.lng = newPosition.lng
  }
}
</script>
```

## 7. Ejemplo con Múltiples Capas de Tiles

```vue
<template>
  <LeafletMap
    :center="[-12.0464, -77.0428]"
    :zoom="13"
    :tile-layers="customTiles"
    :show-layer-control="true"
    height="400px"
  />
</template>

<script setup>
import LeafletMap from '@/components/leaflet/LeafletMap.vue'

const customTiles = [
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  },
  {
    name: 'Vista Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    maxZoom: 18
  },
  {
    name: 'Terreno',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors',
    maxZoom: 17
  },
  {
    name: 'Calles (CartoDB)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB',
    maxZoom: 19
  }
]
</script>
```

## 8. Ejemplo Reactivo con Datos de API

```vue
<template>
  <div>
    <VBtn @click="loadAlerts">Cargar Alertas</VBtn>
    <LeafletMap
      v-if="alerts.length > 0"
      :center="[-12.0464, -77.0428]"
      :zoom="11"
      :markers="alertMarkers"
      :fit-bounds="true"
      height="500px"
      @marker-click="showAlertDetail"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import LeafletMap from '@/components/leaflet/LeafletMap.vue'

const alerts = ref([])

// Convertir alertas a markers
const alertMarkers = computed(() => {
  return alerts.value
    .filter(alert => alert.latitude && alert.longitude)
    .map(alert => ({
      id: alert.id,
      lat: parseFloat(alert.latitude),
      lng: parseFloat(alert.longitude),
      popup: `<strong>${alert.title}</strong><br>${alert.type_event?.name}`,
      icon: alert.is_resolved ? 'green' : 'red'
    }))
})

const loadAlerts = async () => {
  try {
    const response = await fetch('/api/alerts')
    alerts.value = await response.json()
  } catch (error) {
    console.error('Error cargando alertas:', error)
  }
}

const showAlertDetail = (marker) => {
  const alert = alerts.value.find(a => a.id === marker.id)
  console.log('Detalle de alerta:', alert)
  // Abrir dialog, navegar a detalle, etc.
}
</script>
```

## 9. Ejemplo con Integración en DetailAlert (Implementado)

Ver archivo: `src/views/alerts/DetailAlert.vue`

El componente está integrado en la pestaña "Mapa" del diálogo de detalles de alerta, mostrando:
- Marker rojo para la ubicación de la alerta
- Markers azules para instituciones educativas afectadas
- Círculo de 5km de radio mostrando el área de impacto
- Múltiples capas de tiles (OSM y Satélite)
- FitBounds automático para mostrar todos los elementos

## 10. Tips de Personalización

### Popup HTML Personalizado

```javascript
const marker = {
  id: 1,
  lat: -12.0464,
  lng: -77.0428,
  popup: `
    <div style="padding: 8px; min-width: 200px;">
      <img src="url-imagen.jpg" style="width: 100%; border-radius: 4px;" />
      <h4 style="margin: 8px 0 4px 0; color: #ce0121;">Título</h4>
      <p style="margin: 4px 0; font-size: 12px;">Descripción detallada</p>
      <button onclick="alert('Acción')">Ver Más</button>
    </div>
  `,
  icon: 'red'
}
```

### Estilos CSS Globales Adicionales

Si necesitas personalizar más, añade en `src/assets/styles/styles.scss`:

```scss
// Personalizar popups
.leaflet-popup-content-wrapper {
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

// Personalizar controles
.leaflet-control-layers {
  border-radius: 8px !important;
}

// Personalizar zoom controls
.leaflet-bar {
  border-radius: 8px !important;
}
```

---

**Documentación completa en:** `src/components/leaflet/README.md`
