<template>
  <VDialog
    :model-value="isVisible"
    fullscreen
    persistent
    class="image-viewer-dialog"
    @update:model-value="$emit('update:isVisible', $event)"
  >
    <VCard class="image-viewer-card">
      <!-- Header -->
      <VCardTitle class="image-viewer-header d-flex justify-space-between align-center">
        <div class="image-info">
          <span class="text-h6">
            Imagen {{ currentIndex + 1 }} de {{ images.length }}
          </span>
          <span v-if="currentImage?.description" class="text-caption ml-2">
            - {{ currentImage.description }}
          </span>
        </div>
        
        <VBtn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="closeViewer"
        />
      </VCardTitle>

      <!-- Main Image Container -->
      <VCardText class="image-viewer-content pa-0">
        <div 
          ref="imageContainer"
          class="image-container"
          @wheel="handleWheel"
          @mousedown="startPan"
          @mousemove="handlePan"
          @mouseup="stopPan"
          @mouseleave="stopPan"
        >
          <img
            ref="mainImage"
            :src="currentImage?.url"
            :alt="currentImage?.description || `Imagen ${currentIndex + 1}`"
            class="main-image"
            :style="imageStyle"
            @load="onImageLoad"
            @error="onImageError"
            @dragstart.prevent
          />
          
          <!-- Loading overlay -->
          <VOverlay
            :model-value="imageLoading"
            contained
            class="align-center justify-center"
          >
            <VProgressCircular
              color="primary"
              indeterminate
              size="64"
            />
          </VOverlay>

          <!-- Error overlay -->
          <VOverlay
            :model-value="imageError"
            contained
            class="align-center justify-center"
          >
            <div class="text-center">
              <VIcon
                icon="mdi-image-broken"
                size="64"
                color="error"
                class="mb-2"
              />
              <div class="text-body-1">Error al cargar la imagen</div>
            </div>
          </VOverlay>
        </div>
      </VCardText>

      <!-- Controls -->
      <VCardActions class="image-viewer-controls pa-4">
        <div class="d-flex justify-space-between align-center w-100">
          <!-- Navigation Controls -->
          <div class="navigation-controls">
            <VBtn
              icon="mdi-chevron-left"
              variant="outlined"
              :disabled="currentIndex === 0"
              @click="previousImage"
            />
            <span class="mx-3 text-body-2">
              {{ currentIndex + 1 }} / {{ images.length }}
            </span>
            <VBtn
              icon="mdi-chevron-right"
              variant="outlined"
              :disabled="currentIndex === images.length - 1"
              @click="nextImage"
            />
          </div>

          <!-- Zoom Controls -->
          <div class="zoom-controls">
            <VBtn
              icon="mdi-minus"
              variant="outlined"
              size="small"
              :disabled="zoomLevel <= minZoom"
              @click="zoomOut"
            />
            <span class="mx-2 text-caption">
              {{ Math.round(zoomLevel * 100) }}%
            </span>
            <VBtn
              icon="mdi-plus"
              variant="outlined"
              size="small"
              :disabled="zoomLevel >= maxZoom"
              @click="zoomIn"
            />
            <VBtn
              icon="mdi-fit-to-screen"
              variant="outlined"
              size="small"
              class="ml-2"
              @click="resetZoom"
            />
          </div>

          <!-- Additional Controls -->
          <div class="additional-controls">
            <VBtn
              icon="mdi-fullscreen"
              variant="outlined"
              size="small"
              @click="toggleFullscreen"
            />
          </div>
        </div>
      </VCardActions>

      <!-- Description -->
      <VCardText v-if="currentImage?.description" class="image-description py-2">
        <div class="text-body-2 text-center">
          {{ currentImage.description }}
        </div>
      </VCardText>

      <!-- Thumbnails -->
      <VCardActions v-if="showThumbnails && images.length > 1" class="thumbnails-container pa-2">
        <div class="d-flex justify-center w-100">
          <div class="thumbnails-scroll">
            <VBtn
              v-for="(image, index) in images"
              :key="index"
              class="thumbnail-btn ma-1"
              :class="{ 'thumbnail-active': index === currentIndex }"
              variant="outlined"
              size="small"
              @click="goToImage(index)"
            >
              <img
                :src="image.url"
                style=" block-size: 50px;inline-size: 50px; max-block-size: 50px; max-inline-size: 50px; object-fit: cover;"
                :alt="image.description || `Thumbnail ${index + 1}`"
                class="thumbnail-image"
              />
            </VBtn>
          </div>
        </div>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
/**
 * ImageViewer Component
 * 
 * Componente Vue 3 para visualizar imágenes con zoom, navegación y controles completos.
 * Diseñado para mostrar una galería de imágenes en un dialog fullscreen.
 * 
 * @author COES Education
 * @version 1.0.0
 * 
 * FUNCIONALIDADES:
 * - Dialog fullscreen responsive
 * - Zoom in/out con controles y wheel del mouse
 * - Navegación entre imágenes (anterior/siguiente)
 * - Pan/arrastrar imagen cuando está en zoom
 * - Thumbnails opcionales
 * - Información de posición (X de Y)
 * - Descripción de imagen
 * - Estados de carga y error
 * - Soporte para fullscreen
 * - Controles de teclado (flechas, escape, +/-)
 */

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// Props
const props = defineProps({
  /**
   * Array de imágenes a mostrar
   * @type {Array<Object>}
   * Estructura: { url: string, description?: string }
   */
  images: {
    type: Array,
    required: true,
    validator: (images) => {
      return images.every(img => img.url && typeof img.url === 'string')
    }
  },

  /**
   * Controla la visibilidad del dialog
   * @type {Boolean}
   */
  isVisible: {
    type: Boolean,
    required: true
  },

  /**
   * Índice inicial de la imagen a mostrar
   * @type {Number}
   * @default 0
   */
  initialIndex: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0
  },

  /**
   * Mostrar thumbnails
   * @type {Boolean}
   * @default true
   */
  showThumbnails: {
    type: Boolean,
    default: true
  },

  /**
   * Zoom mínimo permitido
   * @type {Number}
   * @default 0.1
   */
  minZoom: {
    type: Number,
    default: 0.1
  },

  /**
   * Zoom máximo permitido
   * @type {Number}
   * @default 5
   */
  maxZoom: {
    type: Number,
    default: 5
  }
})

// Eventos
const emit = defineEmits([
  'update:isVisible',  // Para cerrar el dialog
  'image-change',      // Cuando cambia la imagen actual
  'zoom-change'        // Cuando cambia el zoom
])

// Estado reactivo
const currentIndex = ref(props.initialIndex)
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const imageLoading = ref(false)
const imageError = ref(false)
const isPanning = ref(false)
const lastPanPoint = ref({ x: 0, y: 0 })

// Referencias
const imageContainer = ref(null)
const mainImage = ref(null)

// Computadas
const currentImage = computed(() => {
  return props.images[currentIndex.value] || null
})

const imageStyle = computed(() => {
  return {
    transform: `scale(${zoomLevel.value}) translate(${panX.value}px, ${panY.value}px)`,
    cursor: zoomLevel.value > 1 ? (isPanning.value ? 'grabbing' : 'grab') : 'default',
    transition: isPanning.value ? 'none' : 'transform 0.2s ease'
  }
})

// Métodos de navegación
const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    goToImage(currentIndex.value + 1)
  }
}

const previousImage = () => {
  if (currentIndex.value > 0) {
    goToImage(currentIndex.value - 1)
  }
}

const goToImage = (index) => {
  if (index >= 0 && index < props.images.length) {
    currentIndex.value = index
    resetZoom()
    emit('image-change', { index, image: props.images[index] })
  }
}

// Métodos de zoom
const zoomIn = () => {
  const newZoom = Math.min(zoomLevel.value * 1.2, props.maxZoom)
  setZoom(newZoom)
}

const zoomOut = () => {
  const newZoom = Math.max(zoomLevel.value / 1.2, props.minZoom)
  setZoom(newZoom)
}

const setZoom = (newZoom) => {
  zoomLevel.value = newZoom
  
  // Resetear pan si el zoom es 1 o menor
  if (newZoom <= 1) {
    panX.value = 0
    panY.value = 0
  }
  
  emit('zoom-change', newZoom)
}

const resetZoom = () => {
  setZoom(1)
}

// Métodos de pan (arrastrar)
const startPan = (event) => {
  if (zoomLevel.value > 1) {
    isPanning.value = true
    lastPanPoint.value = { x: event.clientX, y: event.clientY }
    event.preventDefault()
  }
}

const handlePan = (event) => {
  if (isPanning.value && zoomLevel.value > 1) {
    const deltaX = event.clientX - lastPanPoint.value.x
    const deltaY = event.clientY - lastPanPoint.value.y
    
    panX.value += deltaX / zoomLevel.value
    panY.value += deltaY / zoomLevel.value
    
    lastPanPoint.value = { x: event.clientX, y: event.clientY }
  }
}

const stopPan = () => {
  isPanning.value = false
}

// Zoom con wheel del mouse
const handleWheel = (event) => {
  event.preventDefault()
  
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.max(props.minZoom, Math.min(props.maxZoom, zoomLevel.value + delta))
  
  setZoom(newZoom)
}

// Eventos de imagen
const onImageLoad = () => {
  imageLoading.value = false
  imageError.value = false
}

const onImageError = () => {
  imageLoading.value = false
  imageError.value = true
}

// Fullscreen
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    imageContainer.value?.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

// Cerrar viewer
const closeViewer = () => {
  emit('update:isVisible', false)
}

// Eventos de teclado
const handleKeydown = (event) => {
  if (!props.isVisible) return
  
  switch (event.key) {
    case 'Escape':
      closeViewer()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case '0':
      resetZoom()
      break
  }
}

// Watchers
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    // Reset cuando se abre el viewer
    currentIndex.value = Math.max(0, Math.min(props.initialIndex, props.images.length - 1))
    resetZoom()
  }
})

watch(currentImage, () => {
  if (currentImage.value) {
    imageLoading.value = true
    imageError.value = false
    resetZoom()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Exponer métodos
defineExpose({
  nextImage,
  previousImage,
  goToImage,
  zoomIn,
  zoomOut,
  resetZoom,
  toggleFullscreen
})
</script>

<style scoped>
.image-viewer-dialog {
  z-index: 9999;
}

.image-viewer-card {
  display: flex;
  flex-direction: column;
  block-size: 100vh;
}

.image-viewer-header {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
  border-block-end: 1px solid rgb(var(--v-theme-outline));
}

.image-info {
  overflow: hidden;
  flex-grow: 1;
}

.image-viewer-content {
  position: relative;
  overflow: hidden;
  flex-grow: 1;
}

.image-container {
  position: relative;
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  background: #000;
  block-size: 100%;
  inline-size: 100%;
}

.main-image {
  max-block-size: 100%;
  max-inline-size: 100%;
  object-fit: contain;
  transform-origin: center center;
  user-select: none;
}

.image-viewer-controls {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
  border-block-start: 1px solid rgb(var(--v-theme-outline));
}

.navigation-controls {
  display: flex;
  align-items: center;
}

.zoom-controls {
  display: flex;
  align-items: center;
}

.additional-controls {
  display: flex;
  align-items: center;
}

.image-description {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
  border-block-start: 1px solid rgb(var(--v-theme-outline));
}

.thumbnails-container {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
  border-block-start: 1px solid rgb(var(--v-theme-outline));
  max-block-size: 80px;
  overflow-x: auto;
}

.thumbnails-scroll {
  display: flex;
  gap: 4px;
}

.thumbnail-btn {
  padding: 2px !important;
  block-size: 60px !important;
  min-inline-size: 60px !important;
}

.thumbnail-btn.thumbnail-active {
  border-width: 2px !important;
  border-color: rgb(var(--v-theme-primary)) !important;
}

.thumbnail-image {
  border-radius: 4px;
  block-size: 100%;
  inline-size: 100%;
  object-fit: cover;
}

/* Responsive */
@media (max-width: 600px) {
  .image-viewer-controls {
    flex-direction: column;
    gap: 8px;
  }

  .zoom-controls,
  .navigation-controls,
  .additional-controls {
    justify-content: center;
  }

  .image-info .text-caption {
    display: none;
  }
}
</style>
