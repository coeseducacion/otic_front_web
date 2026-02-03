<script setup>
import { useEventClassifications } from '@/composables/catalogAlerts/useEventClassifications'

const { createEventClassifications, updateEventClassifications, loading } = useEventClassifications()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      name: '',
      description: '',
    }),
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:data',
  'update:isDialogVisible',
  'onSaved:data',
])

const eventClassificationData = ref({
  id: 0,
  name: '',
  description: '',
})

const formEventClassificationRef = ref(null)

// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    eventClassificationData.value = { ...newData }
  },
  { immediate: true }
)

// Reglas de validación
const nameRules = [
  v => !!v || 'El nombre es requerido',
  v => (v && v.length <= 100) || 'El nombre debe tener máximo 100 caracteres',
]

const descriptionRules = [
  v => !!v || 'La descripción es requerida',
  v => (v && v.toString().length <= 65535) || 'La descripción es muy larga',
]

/**
 * Maneja el envío del formulario.
 */
const onFormSubmit = async () => {
  try {
    // Verificar si el formulario es válido
    const isValid = await formEventClassificationRef.value.validate()
    
    if (!isValid?.valid) {
      return
    }

    // Preparar datos para enviar (solo campos necesarios)
    const payload = {
      name: eventClassificationData.value.name,
      description: eventClassificationData.value.description,
    }

    console.log('📤 Datos a enviar:', payload)

    if (eventClassificationData.value.id > 0) {
      // Actualiza una clasificación de evento existente
      const updated = await updateEventClassifications(eventClassificationData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea una nueva clasificación de evento
      const created = await createEventClassifications(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar clasificación de evento:', error)
    console.error('❌ Detalles del error:', error.response?.data)
  }
}

/**
 * Reinicia el formulario y cierra el diálogo.
 */
const onFormReset = () => {
  resetForm()
  emit('update:isDialogVisible', false)
}

/**
 * Reinicia los datos del formulario
 */
const resetForm = () => {
  eventClassificationData.value = {
    id: 0,
    name: '',
    description: '',
  }
  formEventClassificationRef.value?.reset()
}

/**
 * Maneja el cierre del diálogo
 */
const dialogModelValueUpdate = (val) => {
  if (!val) {
    resetForm()
  }
  emit('update:isDialogVisible', val)
}
</script>

<template>
  <VDialog persistent=""
    :model-value="props.isDialogVisible"
    max-width="600"
    @update:model-value="dialogModelValueUpdate"
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center bg-primary text-white pa-4">
        <span class="text-h6 text-white">
          {{ eventClassificationData.id > 0 ? 'Editar' : 'Crear' }} Clasificación de Evento
        </span>
        <VBtn
          icon="tabler-x"
          variant="text"
          size="small"
          color="white"
          @click="dialogModelValueUpdate(false)"
        />
      </VCardTitle>

      <VCardText>
        <VForm ref="formEventClassificationRef" @submit.prevent="onFormSubmit">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="eventClassificationData.name"
                label="Nombre *"
                placeholder="Ej: Evento Académico"
                :rules="nameRules"
                :disabled="loading"
                counter="100"
                maxlength="100"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="eventClassificationData.description"
                label="Descripción *"
                placeholder="Descripción detallada de la clasificación del evento"
                :rules="descriptionRules"
                :disabled="loading"
                variant="outlined"
                rows="4"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardActions class="d-flex justify-end gap-2 pa-4">
        
        <VBtn
          color="primary"
          variant="elevated"
          @click="onFormSubmit"
          :loading="loading"
        >
        <VIcon start icon="tabler-device-floppy" />
          {{ eventClassificationData.id > 0 ? 'Actualizar' : 'Guardar' }}
        </VBtn>
        <VBtn
          color="secondary"
          variant="tonal"
          @click="onFormReset"
          :disabled="loading"
        >
        <VIcon start icon="tabler-x"  />
          Cancelar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
