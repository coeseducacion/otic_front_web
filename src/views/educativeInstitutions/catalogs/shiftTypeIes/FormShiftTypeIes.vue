<script setup>
import { useShiftTypeIes } from '@/composables/catalogIEs/useShiftTypeIes'

const { createShiftTypeIes, updateShiftTypeIes, loading } = useShiftTypeIes()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      code: '',
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

const shiftTypeIesData = ref({
  id: 0,
  code: '',
  name: '',
  description: '',
})

const formShiftTypeIesRef = ref(null)

// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    shiftTypeIesData.value = { ...newData }
  },
  { immediate: true }
)

// Reglas de validación
const codeRules = [
  v => !!v || 'El código es requerido',
  v => (v && v.length <= 3) || 'El código debe tener máximo 3 caracteres',
]

const nameRules = [
  v => !!v || 'El nombre es requerido',
  v => (v && v.length <= 255) || 'El nombre debe tener máximo 255 caracteres',
]

const descriptionRules = [
  v => !v || v.toString().length <= 255 || 'La descripción debe tener máximo 255 caracteres',
]

/**
 * Maneja el envío del formulario.
 */
const onFormSubmit = async () => {
  try {
    // Verificar si el formulario es válido
    const isValid = await formShiftTypeIesRef.value.validate()
    
    if (!isValid?.valid) {
      return
    }

    // Preparar datos para enviar (solo campos necesarios)
    const payload = {
      code: shiftTypeIesData.value.code,
      name: shiftTypeIesData.value.name,
      description: shiftTypeIesData.value.description || null,
    }

    console.log('📤 Datos a enviar:', payload)

    if (shiftTypeIesData.value.id > 0) {
      // Actualiza un tipo de turno existente
      const updated = await updateShiftTypeIes(shiftTypeIesData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea un nuevo tipo de turno
      const created = await createShiftTypeIes(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar tipo de turno:', error)
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
  shiftTypeIesData.value = {
    id: 0,
    code: '',
    name: '',
    description: '',
  }
  formShiftTypeIesRef.value?.reset()
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
          {{ shiftTypeIesData.id > 0 ? 'Editar' : 'Crear' }} Tipo de Turno
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
        <VForm ref="formShiftTypeIesRef" @submit.prevent="onFormSubmit">
          <VRow>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="shiftTypeIesData.code"
                label="Código *"
                placeholder="Ej: MAT"
                :rules="codeRules"
                :disabled="loading"
                counter="3"
                maxlength="3"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="shiftTypeIesData.name"
                label="Nombre *"
                placeholder="Ej: Turno Matutino"
                :rules="nameRules"
                :disabled="loading"
                counter="255"
                maxlength="255"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="shiftTypeIesData.description"
                label="Descripción"
                placeholder="Descripción detallada del tipo de turno"
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
          {{ shiftTypeIesData.id > 0 ? 'Actualizar' : 'Guardar' }}
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
