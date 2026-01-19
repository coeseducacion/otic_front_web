<template>
  <VDialog :model-value="props.isDialogVisible" persistent="" max-width="1200" @update:model-value="dialogModelValueUpdate">
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between" :class="props.statusColor">
        <span>{{ props.title }}</span>
        <IconBtn @click="dialogModelValueUpdate(false)">
          <VIcon icon="tabler-x" />
        </IconBtn>
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-4">
        

        <!-- Contenedor del PDF -->
        <div v-if="loading && !error" class="d-flex align-center justify-center" style="min-block-size: 400px;">
          <VProgressCircular indeterminate color="primary" size="64" />
        </div>

        <VAlert v-else-if="error" type="error" class="mb-4">
          {{ error }}
        </VAlert>
        <iframe
          v-else-if="pdfBlob"
          :key="pdfBlob"
          :src="pdfBlob"
          width="100%"
          height="600"
          frameborder="0"
        />
        <div v-else class="text-center text-body-2 text-medium-emphasis" style="min-block-size: 400px;">
          No se pudo mostrar el PDF.
        </div>
      </VCardText>

      <VDivider />

      <VCardActions>
        <VSpacer />
        
        <VBtn color="primary" :href="pdfBlob ?? props.pdfUrl" target="_blank">
          <VIcon start icon="tabler-external-link" />
          Abrir en nueva pestaña
        </VBtn>
        <VBtn variant="elevated" @click="dialogModelValueUpdate(false)">Cerrar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  pdfUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: 'Visor de PDF',
  },
  statusColor: {
    type: String,
    default: 'bg-primary',
  },
})

const emit = defineEmits(['update:isDialogVisible'])


const loading = ref(false)
const error = ref(null)
const pdfBlob = ref(null)

const dialogModelValueUpdate = val => {
  emit('update:isDialogVisible', val)
}

const cleanupBlob = () => {
  if (pdfBlob.value) {
    URL.revokeObjectURL(pdfBlob.value)
    pdfBlob.value = null
  }
}

const loadPdf = async () => {
  if (!props.pdfUrl || loading.value)
    return

  loading.value = true
  error.value = null
  cleanupBlob()

  try {
    const response = await fetch(props.pdfUrl)
    if (!response.ok)
      throw new Error(`Estado ${response.status}`)

    const blob = await response.blob()
    pdfBlob.value = URL.createObjectURL(blob)
  } catch (err) {
    console.error('Error al cargar PDF:', err)
    error.value = 'No se pudo cargar el PDF. Intenta abrirlo en una nueva pestaña.'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.isDialogVisible,
  visible => {
    if (visible)
      loadPdf()
    else
      cleanupBlob()
  },
)

watch(
  () => props.pdfUrl,
  url => {
    if (props.isDialogVisible && url)
      loadPdf()
  },
)

onMounted(() => {
  if (props.isDialogVisible && props.pdfUrl)
    loadPdf()
})

onBeforeUnmount(() => {
  cleanupBlob()
})
</script>

<style scoped>
.pdf-canvas-container {
  padding: 16px;
  background-color: #525659;
}

.pdf-canvas-container canvas {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 30%);
}
</style>
