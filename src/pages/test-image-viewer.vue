<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <h1 class="text-h4 mb-6">Test ImageViewer Component</h1>
        
        <!-- Botones de prueba -->
        <VCard class="mb-6">
          <VCardTitle>Opciones de Prueba</VCardTitle>
          <VCardText>
            <VRow>
              <VCol cols="12" md="6">
                <VBtn
                  color="primary"
                  block
                  @click="openViewer(0)"
                >
                  Abrir Galería Completa
                </VBtn>
              </VCol>
              <VCol cols="12" md="6">
                <VBtn
                  color="secondary"
                  block
                  @click="openViewer(2)"
                >
                  Abrir desde Imagen 3
                </VBtn>
              </VCol>
            </VRow>
            
            <VRow class="mt-4">
              <VCol cols="12" md="4">
                <VSwitch
                  v-model="showThumbnails"
                  label="Mostrar Thumbnails"
                  color="primary"
                />
              </VCol>
              <VCol cols="12" md="4">
                <VSwitch
                  v-model="showFullscreen"
                  label="Pantalla Completa"
                  color="primary"
                />
              </VCol>
              <VCol cols="12" md="4">
                <VSwitch
                  v-model="enableZoom"
                  label="Habilitar Zoom"
                  color="primary"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Grid de imágenes preview -->
        <VCard>
          <VCardTitle>Imágenes de Prueba</VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                v-for="(image, index) in testImages"
                :key="index"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <VCard
                  class="image-preview-card"
                  elevation="2"
                  @click="openViewer(index)"
                >
                  <VImg
                    :src="image.url"
                    :alt="image.description"
                    height="200"
                    cover
                  >
                    <template #placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <VProgressCircular
                          color="primary"
                          indeterminate
                        />
                      </div>
                    </template>
                  </VImg>
                  
                  <VCardText class="pa-2">
                    <p class="text-caption text-truncate mb-0">
                      {{ image.description }}
                    </p>
                  </VCardText>
                  
                  <!-- Botón de vista completa -->
                  <VBtn
                    icon="mdi-fullscreen"
                    variant="outlined"
                    size="small"
                    class="view-btn"
                    @click.stop="openViewer(index)"
                  />
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Estadísticas -->
        <VCard class="mt-6">
          <VCardTitle>Estado Actual</VCardTitle>
          <VCardText>
            <VRow>
              <VCol cols="12" md="3">
                <VStatistic
                  title="Total Imágenes"
                  :value="testImages.length"
                  color="primary"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VStatistic
                  title="Imagen Actual"
                  :value="currentImageIndex + 1"
                  color="secondary"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VStatistic
                  title="Zoom Actual"
                  :value="`${Math.round(currentZoom * 100)}%`"
                  color="success"
                />
              </VCol>
              <VCol cols="12" md="3">
                <VStatistic
                  title="Visor Abierto"
                  :value="isViewerOpen ? 'Sí' : 'No'"
                  :color="isViewerOpen ? 'success' : 'error'"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ImageViewer Component -->
    <ImageViewer
      :images="testImages"
      :is-visible="isViewerOpen"
      :initial-index="currentImageIndex"
      :show-thumbnails="showThumbnails"
      :enable-fullscreen="showFullscreen"
      :enable-zoom="enableZoom"
      @update:is-visible="onViewerClose"
      @image-change="onImageChange"
      @zoom-change="onZoomChange"
    />
  </VContainer>
</template>

<script setup>
import ImageViewer from '@/components/images/ImageViewer.vue'
import { reactive, ref } from 'vue'

// Estado del visor
const isViewerOpen = ref(false)
const currentImageIndex = ref(0)
const currentZoom = ref(1)

// Configuración del visor
const showThumbnails = ref(true)
const showFullscreen = ref(true)
const enableZoom = ref(true)

// Imágenes de prueba
const testImages = reactive([
  {
    url: 'https://picsum.photos/800/600?random=1',
    description: 'Paisaje montañoso al atardecer'
  },
  {
    url: 'https://picsum.photos/800/600?random=2',
    description: 'Ciudad moderna con rascacielos'
  },
  {
    url: 'https://picsum.photos/800/600?random=3',
    description: 'Bosque frondoso en primavera'
  },
  {
    url: 'https://picsum.photos/800/600?random=4',
    description: 'Playa tropical con aguas cristalinas'
  },
  {
    url: 'https://picsum.photos/800/600?random=5',
    description: 'Desierto con dunas de arena'
  },
  {
    url: 'https://picsum.photos/800/600?random=6',
    description: 'Lago tranquilo rodeado de montañas'
  },
  {
    url: 'https://picsum.photos/800/600?random=7',
    description: 'Campo de flores silvestres'
  },
  {
    url: 'https://picsum.photos/800/600?random=8',
    description: 'Arquitectura antigua europea'
  }
])

// Métodos
const openViewer = (index = 0) => {
  currentImageIndex.value = index
  isViewerOpen.value = true
}

const onViewerClose = (visible) => {
  isViewerOpen.value = visible
}

const onImageChange = ({ index, image }) => {
  currentImageIndex.value = index
  console.log(`Imagen cambiada: ${index + 1}/${testImages.length} - ${image.description}`)
}

const onZoomChange = (zoom) => {
  currentZoom.value = zoom
  console.log(`Zoom cambiado: ${Math.round(zoom * 100)}%`)
}

// Componente VStatistic personalizado
const VStatistic = {
  props: {
    title: String,
    value: [String, Number],
    color: {
      type: String,
      default: 'primary'
    }
  },
  template: `
    <div class="text-center">
      <h3 class="text-h3 mb-1" :class="'text-' + color">{{ value }}</h3>
      <p class="text-body-2 text-medium-emphasis mb-0">{{ title }}</p>
    </div>
  `
}
</script>

<style scoped>
.image-preview-card {
  position: relative;
  box-shadow: initial;
  cursor: pointer;
  transform: initial;
  transition: all 0.3s ease;
}

.image-preview-card:hover {
  box-shadow: 0 8px 25px rgb(0 0 0 / 15%) !important;
  transform: translateY(-4px);
}

.view-btn {
  position: absolute;
  backdrop-filter: blur(4px);
  background: rgb(255 255 255 / 90%) !important;
  inset-block-start: 8px;
  inset-inline-end: 8px;
}

/* Responsive */
@media (max-width: 600px) {
  .view-btn {
    inset-block-start: 4px;
    inset-inline-end: 4px;
  }
}
</style>
