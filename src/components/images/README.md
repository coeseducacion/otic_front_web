# ImageViewer Component

Componente Vue 3 para visualizar imágenes con funcionalidades completas de zoom, navegación y controles avanzados.

## 📦 Instalación y Uso Básico

El componente está listo para usar en el proyecto. Solo necesitas importarlo donde lo necesites.

```vue
<template>
  <div>
    <VBtn @click="showViewer = true">Abrir Galería</VBtn>
    
    <ImageViewer
      :images="imageList"
      :is-visible="showViewer"
      :initial-index="0"
      @update:is-visible="showViewer = $event"
      @image-change="onImageChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageViewer from '@/components/images/ImageViewer.vue'

const showViewer = ref(false)

const imageList = [
  {
    url: 'https://picsum.photos/800/600?random=1',
    description: 'Imagen de ejemplo 1 - Paisaje hermoso'
  },
  {
    url: 'https://picsum.photos/800/600?random=2',
    description: 'Imagen de ejemplo 2 - Arquitectura moderna'
  },
  {
    url: 'https://picsum.photos/800/600?random=3',
    description: 'Imagen de ejemplo 3 - Naturaleza'
  }
]

const onImageChange = ({ index, image }) => {
  console.log(`Cambiado a imagen ${index + 1}: ${image.description}`)
}
</script>
```

## 📝 Props

### `images` (requerido)
- **Tipo:** `Array<Object>`
- **Descripción:** Array de objetos con las imágenes a mostrar
- **Estructura:**
  ```javascript
  [
    {
      url: 'string',           // URL de la imagen (requerido)
      description: 'string'    // Descripción opcional
    }
  ]
  ```

### `isVisible` (requerido)
- **Tipo:** `Boolean`
- **Descripción:** Controla la visibilidad del dialog

### `initialIndex`
- **Tipo:** `Number`
- **Default:** `0`
- **Descripción:** Índice de la imagen inicial a mostrar

### `showThumbnails`
- **Tipo:** `Boolean` 
- **Default:** `true`
- **Descripción:** Mostrar/ocultar thumbnails en la parte inferior

### `minZoom`
- **Tipo:** `Number`
- **Default:** `0.1`
- **Descripción:** Zoom mínimo permitido (10%)

### `maxZoom`
- **Tipo:** `Number`
- **Default:** `5`
- **Descripción:** Zoom máximo permitido (500%)

## 📤 Eventos

### `@update:is-visible`
- **Payload:** `Boolean`
- **Descripción:** Se emite para cerrar el dialog

### `@image-change`
- **Payload:** `{ index: Number, image: Object }`
- **Descripción:** Se emite cuando cambia la imagen actual

### `@zoom-change`
- **Payload:** `Number`
- **Descripción:** Se emite cuando cambia el nivel de zoom

## 🎮 Controles Disponibles

### Navegación
- **Flechas izquierda/derecha:** Navegar entre imágenes
- **Thumbnails:** Click para ir directamente a una imagen
- **Botones ←/→:** Navegación con botones

### Zoom
- **Rueda del mouse:** Zoom in/out sobre la imagen
- **Botones +/-:** Controles de zoom
- **Botón reset:** Volver al zoom original (100%)
- **Teclado +/-/0:** Zoom con teclado

### Pan (Arrastrar)
- **Click y arrastrar:** Mover la imagen cuando está en zoom
- **Cursor:** Cambia a "grab/grabbing" cuando se puede arrastrar

### Otros
- **Escape:** Cerrar el viewer
- **Fullscreen:** Botón para modo pantalla completa

## 📱 Responsive

El componente es completamente responsive:
- **Desktop:** Controles distribuidos horizontalmente
- **Mobile:** Controles apilados verticalmente
- **Touch:** Soporte para gestos táctiles

## 🔧 Métodos Expuestos

Puedes acceder a estos métodos usando `ref`:

```vue
<template>
  <ImageViewer ref="viewerRef" :images="images" :is-visible="show" />
</template>

<script setup>
const viewerRef = ref(null)

// Navegar programáticamente
viewerRef.value?.nextImage()
viewerRef.value?.previousImage()
viewerRef.value?.goToImage(2)

// Controlar zoom
viewerRef.value?.zoomIn()
viewerRef.value?.zoomOut()
viewerRef.value?.resetZoom()

// Fullscreen
viewerRef.value?.toggleFullscreen()
</script>
```

## 📋 Ejemplos Prácticos

### 1. Galería Simple

```vue
<template>
  <div class="gallery">
    <VBtn
      v-for="(img, index) in images"
      :key="index"
      @click="openViewer(index)"
    >
      <img :src="img.url" class="thumbnail" />
    </VBtn>
    
    <ImageViewer
      :images="images"
      :is-visible="viewerOpen"
      :initial-index="currentIndex"
      @update:is-visible="viewerOpen = $event"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageViewer from '@/components/images/ImageViewer.vue'

const viewerOpen = ref(false)
const currentIndex = ref(0)

const images = [
  { url: '/path/image1.jpg', description: 'Primera imagen' },
  { url: '/path/image2.jpg', description: 'Segunda imagen' }
]

const openViewer = (index) => {
  currentIndex.value = index
  viewerOpen.value = true
}
</script>

<style scoped>
.thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
</style>
```

### 2. Integración con Evidencias de Alerta

```vue
<template>
  <div>
    <h3>Evidencias de la Alerta</h3>
    
    <div v-if="alert.evidences?.length" class="evidences-grid">
      <VCard
        v-for="(evidence, index) in alert.evidences"
        :key="evidence.id"
        class="evidence-card"
        @click="openEvidences(index)"
      >
        <VImg
          :src="evidence.file_path"
          :alt="evidence.description"
          height="150"
          cover
        />
        <VCardText>
          <p class="text-caption">{{ evidence.description }}</p>
        </VCardText>
      </VCard>
    </div>
    
    <ImageViewer
      :images="evidenceImages"
      :is-visible="evidenceViewerOpen"
      :initial-index="currentEvidenceIndex"
      @update:is-visible="evidenceViewerOpen = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ImageViewer from '@/components/images/ImageViewer.vue'

const props = defineProps({
  alert: { type: Object, required: true }
})

const evidenceViewerOpen = ref(false)
const currentEvidenceIndex = ref(0)

const evidenceImages = computed(() => {
  return (props.alert.evidences || []).map(evidence => ({
    url: evidence.file_path,
    description: evidence.description || 'Evidencia'
  }))
})

const openEvidences = (index) => {
  currentEvidenceIndex.value = index
  evidenceViewerOpen.value = true
}
</script>

<style scoped>
.evidences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.evidence-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.evidence-card:hover {
  transform: scale(1.02);
}
</style>
```

### 3. Con Datos de API

```vue
<template>
  <div>
    <VBtn @click="loadImages" :loading="loading">Cargar Imágenes</VBtn>
    
    <div v-if="images.length" class="images-grid">
      <VImg
        v-for="(img, index) in images"
        :key="img.id"
        :src="img.thumbnail"
        class="grid-image"
        @click="openFullSize(index)"
      />
    </div>
    
    <ImageViewer
      :images="fullSizeImages"
      :is-visible="viewerOpen"
      :initial-index="currentIndex"
      @update:is-visible="viewerOpen = $event"
      @image-change="onImageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ImageViewer from '@/components/images/ImageViewer.vue'

const loading = ref(false)
const images = ref([])
const viewerOpen = ref(false)
const currentIndex = ref(0)

const fullSizeImages = computed(() => {
  return images.value.map(img => ({
    url: img.fullSize,
    description: img.title
  }))
})

const loadImages = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/images')
    images.value = await response.json()
  } catch (error) {
    console.error('Error cargando imágenes:', error)
  } finally {
    loading.value = false
  }
}

const openFullSize = (index) => {
  currentIndex.value = index
  viewerOpen.value = true
}

const onImageChange = ({ index, image }) => {
  console.log(`Viendo: ${image.description}`)
}
</script>
```

### 4. Con Controles Personalizados

```vue
<template>
  <div>
    <ImageViewer
      ref="viewer"
      :images="images"
      :is-visible="show"
      :show-thumbnails="false"
      @update:is-visible="show = $event"
    />
    
    <!-- Controles externos -->
    <div v-if="show" class="external-controls">
      <VBtn @click="viewer?.previousImage()">Anterior</VBtn>
      <VBtn @click="viewer?.nextImage()">Siguiente</VBtn>
      <VBtn @click="viewer?.zoomIn()">Zoom +</VBtn>
      <VBtn @click="viewer?.zoomOut()">Zoom -</VBtn>
      <VBtn @click="viewer?.resetZoom()">Reset</VBtn>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageViewer from '@/components/images/ImageViewer.vue'

const viewer = ref(null)
const show = ref(true)

const images = [
  { url: '/path/image1.jpg', description: 'Imagen 1' }
]
</script>
```

## 🎨 Personalización de Estilos

Puedes personalizar los estilos usando CSS:

```scss
// En tu componente o en styles.scss global
.image-viewer-dialog {
  // Personalizar z-index si es necesario
  z-index: 9999 !important;
}

.image-viewer-header {
  // Personalizar header
  background: linear-gradient(45deg, #ce0121, #ff6b6b) !important;
}

.image-container {
  // Personalizar fondo del área de imagen
  background: linear-gradient(45deg, #1a1a1a, #000) !important;
}

.thumbnail-btn.thumbnail-active {
  // Personalizar thumbnail activo
  border-color: #ce0121 !important;
  box-shadow: 0 0 10px rgba(206, 1, 33, 0.5) !important;
}
```

## 🐛 Troubleshooting

### Las imágenes no cargan
- Verifica que las URLs sean accesibles
- Revisa CORS si las imágenes están en otro dominio
- El componente muestra un overlay de error automáticamente

### Performance con muchas imágenes
- El componente carga imágenes bajo demanda
- Los thumbnails se optimizan automáticamente
- Considera lazy loading para las imágenes principales

### Problemas de zoom en mobile
- El componente detecta automáticamente touch
- Usa `touch-action: none` en el container si es necesario

### Conflictos con otros componentes
- Ajusta z-index con la prop custom CSS
- El componente usa z-index: 9999 por defecto

## 📚 Referencias y Recursos

- [Vuetify Dialog Documentation](https://vuetifyjs.com/components/dialogs/)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [Touch Events API](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)

## 📄 Licencia

Componente desarrollado por COES Education - 2025
