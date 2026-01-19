<script setup>
import ImageViewer from '@/components/images/ImageViewer.vue'
import LeafletMap from '@/components/leaflet/LeafletMap.vue'
import AlertPdf from '@/views/alerts/AlertPdf.vue'
import { computed, ref } from 'vue'

const emit = defineEmits([
  'update:isDialogVisible',
])
const props = defineProps({
  alert: {
    type: Object,
    required: true
  },
  isDialogVisible: {
    type: Boolean,
    required: true
  }
})
const currentTab = ref('Alerta')
const items = ['Alerta', 'Mapa', 'Niveles afectados', 'Evidencias']

/**
 * Prepara los markers para el mapa
 * - Marker rojo para la ubicación de la alerta
 * - Markers azules para las instituciones educativas afectadas
 */
const mapMarkers = computed(() => {
  const markers = []
  
  // Marker principal de la alerta (rojo)
  if (props.alert.latitude && props.alert.longitude) {
    markers.push({
      id: `alert-${props.alert.id}`,
      lat: parseFloat(props.alert.latitude),
      lng: parseFloat(props.alert.longitude),
      popup: `<strong>${props.alert.title}</strong><br>${props.alert.type_event?.name || 'Alerta'}`,
      icon: 'red'
    })
  }
  
  // Markers de instituciones educativas (azules)
  // if (props.alert.alert_educative_institutions) {
  //   props.alert.alert_educative_institutions.forEach(ie => {
  //     const lat = ie.i_e?.latitude_ie || ie.educative_institution?.latitude_ie
  //     const lng = ie.i_e?.longitude_ie || ie.educative_institution?.longitude_ie
  //     const name = ie.i_e?.name_ie || ie.educative_institution?.name_ie
      
  //     if (lat && lng) {
  //       markers.push({
  //         id: `ie-${ie.id}`,
  //         lat: parseFloat(lat),
  //         lng: parseFloat(lng),
  //         popup: `<strong>${name}</strong><br>${ie.i_e?.education_level?.name || ''}`,
  //         icon: 'blue'
  //       })
  //     }
  //   })
  // }
  
  return markers
})

/**
 * Centro del mapa - usa la ubicación de la alerta o default Lima
 */
const mapCenter = computed(() => {
  if (props.alert.latitude && props.alert.longitude) {
    return [parseFloat(props.alert.latitude), parseFloat(props.alert.longitude)]
  }
  return [-12.0464, -77.0428] // Default: Lima, Perú
})

/**
 * Círculo de radio alrededor de la alerta (ejemplo: 5km)
 */
const mapCircles = computed(() => {
  if (props.alert.latitude && props.alert.longitude) {
    return [{
      id: 'alert-radius',
      lat: parseFloat(props.alert.latitude),
      lng: parseFloat(props.alert.longitude),
      radius: 1000, // 1 km de radio
      color: '#ce0121',
      fillColor: '#ce0121',
      fillOpacity: 0.1,
      popup: 'Área de impacto (1km)'
    }]
  }
  return []
})

const handleMarkerClick = (marker) => {
  console.log('Marker clicked:', marker)
}

// ImageViewer estado
const imageViewerOpen = ref(false)
const currentEvidenceIndex = ref(0)

// Convertir evidencias a formato ImageViewer
const evidenceImages = computed(() => {
  return (props.alert.evidences || []).map(evidence => ({
    url: evidence.file_path,
    description: evidence.description || 'Evidencia de la alerta'
  }))
})

// Función para abrir el visor
const openImageViewer = (index = 0) => {
  currentEvidenceIndex.value = index
  imageViewerOpen.value = true
}

// PDF print helper
const pdfRef = ref(null)
function onPrintNewWindow() {
  pdfRef.value?.openInNewWindow()
}
function onPrintIframe() {
  pdfRef.value?.printInIframe()
}

</script>
<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 800"
    :model-value="props.isDialogVisible"
    persistent=""
    @update:model-value="emit('update:isDialogVisible', $event)"

  >
  <!-- Dialog close btn -->
<!-- <DialogCloseBtn class="bg-primary" @click="emit('update:isDialogVisible', false)" /> -->

  <VCard>
      <VCardTitle class="bg-primary">{{ props.alert.title }}
        <VBtn style="float: inline-end;"
          icon="tabler-x"
          flat=""
          @click="emit('update:isDialogVisible', false)"
        />
      </VCardTitle>
      
    <VTabs
      v-model="currentTab">
      <VTab
        v-for="item in items"
        :key="item"
        :value="item"
      >
        {{ item }}
      </VTab>
    </VTabs>

    <VCardText class="overflow  pa-4" >
      <VWindow v-model="currentTab"   style="min-block-size: 60vh;" >
        <VWindowItem
          value="Alerta"
        >
        <VRow>
          <VCol cols="12" md="6">
           <strong>Tipo de peligro:</strong>
            <div>{{ props.alert.type_event ? props.alert.type_event.name : '' }}</div>
         </VCol> 
        <VCol cols="12" md="6">
           <strong>Fecha y Hora:</strong>
            <div>{{ props.alert.date ? props.alert.date.split('-').reverse().join('/') : '' }} {{ props.alert.time }}</div>
         </VCol> 
         <VCol cols="12">
					 <strong>Localización:</strong>
						<div>
							<strong>Distrito:</strong> {{ props.alert.district?.name || '' }}
							<strong> Provincia:</strong> <span v-if="props.alert.district?.province">  {{ props.alert.district.province?.name || '' }}</span>
							<strong> Región: </strong> <span v-if="props.alert.district?.province?.region"> {{ props.alert.district.province.region?.name || '' }}</span>
						</div>
				 </VCol> 
         <VCol cols="12">
           <strong>Descripción de la Alerta:</strong>
           <div>{{ props.alert.message }}</div>
         </VCol>
         <VDivider class="my-2" />
         <VCol cols="12">
          <div>
              <strong>Estados de la alerta:</strong>
              <div class="mt-1">
                  <div class="ms-2">
                    <strong>Registrado en reporte preliminar:</strong> 
                    <VChip
                      class="mx-2"
                      :color="props.alert.is_sended ? 'success' : 'error'"
                      small>
                    {{ props.alert.is_sended ? 'Sí' : 'No' }}
                    </VChip>
                    <strong>Presenta daños en la IE:</strong>
                    <VChip
                      class="mx-2"
                      :color="props.alert.is_damage ? 'success' : 'error'"
                      small>
                    {{ props.alert.is_damage ? 'Sí' : 'No' }}
                    </VChip>
                    <div>
                      <strong>Estado:</strong>
                      <VChip
                        class="mx-2"
                        :color="props.alert.is_active ? 'success' : 'error'"
                        small>
                        {{ props.alert.is_active ? 'Activo' : 'Inactivo' }}
                      </VChip>
                      <strong>Estado de resolución:</strong>
                      <VChip
                        class="mx-2"
                        :color="props.alert.is_resolved ? 'success' : 'error'"
                        small>
                        {{ props.alert.is_resolved ? 'Resuelto' : 'No Resuelto' }}
                      </VChip>
                    </div>
                  </div>
              </div>
            </div>
         </VCol>
         <VDivider class="my-2" />
         <VCol cols="12">
          <div>
              <strong>Reporte realizado por:</strong>
              <div class="mt-1">
                <template v-if="props.alert.user_id !== null">
                  <strong>Usuario:</strong> {{ props.alert.user?.name || '—' }}
                </template>
                <template v-else>
                  <strong>Invitado:</strong> 
                  <div class="ms-2">
                    <div><strong>Nombre:</strong> {{ props.alert.guest_name || '—' }}</div>
                    <div><strong>Documento:</strong> {{ props.alert.guest_document || '—' }}</div>
                    <div><strong>Teléfono:</strong> {{ props.alert.guest_phone || '—' }}</div>
                  </div>
                </template>
              </div>
            </div>
         </VCol>
         
         
         </VRow>
        </VWindowItem>

        <!-- Pestaña Mapa -->
        <VWindowItem value="Mapa">
          <VRow>
            <VCol cols="12">
              <div class="mb-3">
                <strong>Ubicación de la Alerta y Zona de Impacto</strong>
                <p class="text-caption text-medium-emphasis">
                  Marcador rojo: Ubicación de la alerta.
                </p>
              </div>
              
              <!-- Componente LeafletMap -->
              <LeafletMap
                :center="mapCenter"
                :zoom="8"
                :markers="mapMarkers"
                :circles="mapCircles"
                :fit-bounds="true"
                :show-layer-control="true"
                height="calc(100vh - 350px)"
                @marker-click="handleMarkerClick"
              />
            </VCol>
          </VRow>
        </VWindowItem>

        <!-- Pestaña Niveles afectados -->
        <VWindowItem value="Niveles afectados">
          <VRow>
            <VCol cols="12">
              <strong>Niveles Educativos Afectados:</strong>
              <VList dense class="mt-2">
                <VListItem
                  v-for="ie in (props.alert.alert_educative_institutions || [])"
                  :key="ie.id"
                >
                  <VListItemTitle>
                    {{ ie.i_e?.modular_code || '—' }}
                    {{ ie.educative_institution?.name_ie || ie.i_e?.name_ie || '—' }}
                  </VListItemTitle>
                  <VListItemSubtitle>
                    {{ ie.i_e?.education_level?.name || '—' }}
                  </VListItemSubtitle>
                </VListItem>
                <VListItem v-if="!props.alert.alert_educative_institutions || props.alert.alert_educative_institutions.length === 0">
                  <VListItemTitle class="text-medium-emphasis">
                    No hay instituciones educativas registradas
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VCol>
          </VRow>
        </VWindowItem>

        <!-- Pestaña Evidencias -->
        <VWindowItem value="Evidencias">
          <VRow v-if="evidenceImages.length > 0">
            <!-- Header con botón para abrir galería -->
            <VCol cols="12" class="d-flex align-center justify-space-between">
              <strong>Evidencias Adjuntas ({{ evidenceImages.length }}):</strong>
              <VBtn
                variant="outlined"
                prepend-icon="mdi-view-gallery"
                size="small"
                @click="openImageViewer(0)"
              >
                Ver todas las evidencias
              </VBtn>
            </VCol>
            
            <!-- Grid de evidencias clickeables -->
            <VCol cols="12">
              <div class="evidences-grid">
                <VCard
                  v-for="(evidence, index) in evidenceImages"
                  :key="index"
                  class="evidence-card"
                  elevation="2"
                  @click="openImageViewer(index)"
                >
                  <VImg
                    :src="evidence.url"
                    :alt="evidence.description"
                    height="200"
                    cover
                    class="evidence-image"
                  >
                    <template #placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <VProgressCircular
                          color="primary"
                          indeterminate
                        />
                      </div>
                    </template>
                    <template #error>
                      <div class="d-flex align-center justify-center fill-height">
                        <VIcon
                          icon="mdi-image-broken"
                          size="48"
                          color="error"
                        />
                      </div>
                    </template>
                  </VImg>
                  
                  <!-- Overlay con información -->
                  <VCardText class="pa-2">
                    <p class="mb-0">
                      {{ evidence.description }}
                    </p>
                  </VCardText>
                  
                  <!-- Botón de vista completa -->
                  <VBtn
                    icon="mdi-fullscreen"
                    variant="outlined"
                    size="small"
                    class="view-full-btn"
                    @click.stop="openImageViewer(index)"
                  />
                </VCard>
              </div>
            </VCol>
          </VRow>
          
          <!-- Estado sin evidencias -->
          <VRow v-else>
            <VCol cols="12" class="text-center">
              <VIcon
                icon="mdi-image-off"
                size="64"
                color="grey"
                class="mb-4"
              />
              <p class="text-h6 text-medium-emphasis">
                No hay evidencias adjuntas
              </p>
              <p class="text-body-2 text-medium-emphasis">
                Las evidencias fotográficas aparecerán aquí cuando estén disponibles
              </p>
            </VCol>
          </VRow>
        </VWindowItem>
      </VWindow>
    </VCardText>
  
  <!-- Componente imprimible oculto (para generar el HTML de impresión) -->
  <AlertPdf ref="pdfRef" :alert="props.alert" class="d-none" />

  <!-- Componente ImageViewer -->
  <ImageViewer
    :images="evidenceImages"
    :is-visible="imageViewerOpen"
    :initial-index="currentEvidenceIndex"
    :show-thumbnails="true"
    @update:is-visible="imageViewerOpen = $event"
  />

  </VCard>
</VDialog>
</template>

<style scoped>
.evidences-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  margin-block-end: 16px;
}

.evidence-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.evidence-card:hover {
  box-shadow: 0 8px 25px rgb(0 0 0 / 15%) !important;
  transform: translateY(-4px);
}

.evidence-image {
  transition: transform 0.3s ease;
}

.evidence-card:hover .evidence-image {
  transform: scale(1.05);
}

.view-full-btn {
  position: absolute;
  backdrop-filter: blur(4px);
  background: rgb(255 255 255 / 90%) !important;
  inset-block-start: 8px;
  inset-inline-end: 8px;
}

/* Responsive */
@media (max-width: 600px) {
  .evidences-grid {
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
