# Ejemplo de Integración - ImageViewer en DetailAlert

Este ejemplo muestra cómo integrar el componente ImageViewer en DetailAlert.vue para mostrar las evidencias de una alerta.

## 📝 Implementación

### 1. Importar el componente en DetailAlert.vue

```vue
<script setup>
import LeafletMap from '@/components/leaflet/LeafletMap.vue'
import AlertPdf from '@/views/alerts/AlertPdf.vue'
import ImageViewer from '@/components/images/ImageViewer.vue'
import { computed, ref } from 'vue'

// ... código existente ...

// Estado para el visor de imágenes
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

// ... resto del código ...
</script>
```

### 2. Modificar la pestaña "Evidencias" en el template

```vue
<template>
  <!-- ... código existente ... -->
  
  <!-- Pestaña Evidencias -->
  <VWindowItem value="Evidencias">
    <VRow v-if="evidenceImages.length > 0">
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
              <p class="text-caption text-truncate mb-0">
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
      
      <!-- Botón para abrir galería completa -->
      <VCol cols="12" class="text-center">
        <VBtn
          variant="outlined"
          prepend-icon="mdi-view-gallery"
          @click="openImageViewer(0)"
        >
          Ver todas las evidencias ({{ evidenceImages.length }})
        </VBtn>
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
  
  <!-- ... resto del código existente ... -->
  
  <!-- Componente ImageViewer -->
  <ImageViewer
    :images="evidenceImages"
    :is-visible="imageViewerOpen"
    :initial-index="currentEvidenceIndex"
    :show-thumbnails="true"
    @update:is-visible="imageViewerOpen = $event"
    @image-change="onEvidenceChange"
  />
</template>
```

### 3. Agregar estilos CSS

```vue
<style scoped>
.evidences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.evidence-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.evidence-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.evidence-image {
  transition: transform 0.3s ease;
}

.evidence-card:hover .evidence-image {
  transform: scale(1.05);
}

.view-full-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(4px);
}

/* Responsive */
@media (max-width: 600px) {
  .evidences-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
</style>
```

### 4. Función para manejar cambios de imagen

```vue
<script setup>
// ... imports y código existente ...

const onEvidenceChange = ({ index, image }) => {
  console.log(`Viendo evidencia ${index + 1}: ${image.description}`)
  // Aquí puedes agregar lógica adicional si es necesario
}
</script>
```

## 🎯 Resultado Final

Con esta implementación obtienes:

### ✅ Grid de Evidencias
- **Thumbnails clickeables** organizados en grid responsive
- **Hover effects** para mejor UX
- **Estados de carga y error** para cada imagen
- **Información** de cada evidencia visible

### ✅ Visor Completo
- **Pantalla completa** para ver evidencias en detalle
- **Navegación** entre evidencias con flechas y thumbnails
- **Zoom** para examinar detalles
- **Información** de posición ("Imagen X de Y")

### ✅ UX Mejorada
- **Transiciones suaves** entre estados
- **Feedback visual** en hover
- **Responsive design** para mobile y desktop
- **Accesibilidad** con alt text y ARIA labels

## 🔄 Flujo de Usuario

1. **Usuario abre DetailAlert** → Ve la pestaña "Evidencias"
2. **Ve grid de thumbnails** → Puede hacer hover para preview
3. **Click en thumbnail** → Abre ImageViewer en pantalla completa
4. **Navega entre evidencias** → Usando controles o teclado
5. **Examina detalles** → Con zoom y pan
6. **Cierra visor** → Vuelve al grid de evidencias

## 📱 Mobile Experience

En dispositivos móviles:
- **Grid más compacto** (2-3 columnas)
- **Touch gestures** para zoom y pan
- **Controles adaptados** para pantallas pequeñas
- **Navegación por swipe** (si se implementa)

## 🛠️ Personalización Adicional

### Agregar contador visual
```vue
<VChip
  v-if="evidenceImages.length > 0"
  color="primary"
  size="small"
  class="ma-2"
>
  {{ evidenceImages.length }} evidencia{{ evidenceImages.length > 1 ? 's' : '' }}
</VChip>
```

### Filtros por tipo de evidencia
```vue
<VChipGroup v-model="evidenceFilter" class="mb-4">
  <VChip value="all">Todas</VChip>
  <VChip value="photos">Fotos</VChip>
  <VChip value="documents">Documentos</VChip>
</VChipGroup>
```

### Descarga de evidencias
```vue
<VBtn
  icon="mdi-download"
  variant="outlined"
  size="small"
  @click="downloadEvidence(evidence.url)"
/>
```

## 🧪 Testing

Para probar la integración:

```javascript
// Mock data para testing
const mockAlert = {
  id: 1,
  title: 'Alerta de Prueba',
  evidences: [
    {
      id: 1,
      file_path: 'https://picsum.photos/800/600?random=1',
      description: 'Daños en la fachada principal'
    },
    {
      id: 2,
      file_path: 'https://picsum.photos/800/600?random=2',
      description: 'Agrietamiento en paredes internas'
    },
    {
      id: 3,
      file_path: 'https://picsum.photos/800/600?random=3',
      description: 'Estado del techo después del evento'
    }
  ]
}
```

Esta implementación completa proporciona una experiencia de usuario profesional para ver evidencias fotográficas en el sistema de alertas.
