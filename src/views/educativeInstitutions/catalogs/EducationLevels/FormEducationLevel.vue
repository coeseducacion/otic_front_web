<script setup>
import { useEducationLevels } from '@/composables/catalogIEs/useEducationLevels'

const { createEducationLevel, updateEducationLevel, loading } = useEducationLevels()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      code: '',
      name: '',
      abbreviation: '',
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

const educationLevelData = ref({
  id: 0,
  code: '',
  name: '',
  abbreviation: '',
  description: '',
})

const formEducationLevelRef = ref(null)

// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    educationLevelData.value = { ...newData }
  },
  { immediate: true }
)

// Reglas de validación
const codeRules = [
  v => !!v || 'El código es requerido',
  v => (v && v.length <= 10) || 'El código debe tener máximo 10 caracteres',
]

const nameRules = [
  v => !!v || 'El nombre es requerido',
  v => (v && v.length <= 100) || 'El nombre debe tener máximo 100 caracteres',
]

const abbreviationRules = [
  v => !v || v.length <= 20 || 'La abreviatura debe tener máximo 20 caracteres',
]

const descriptionRules = [
  v => !v || v.length <= 255 || 'La descripción debe tener máximo 255 caracteres',
]

/**
 * Maneja el envío del formulario.
 */
const onFormSubmit = async () => {
  try {
    // Verificar si el formulario es válido
    const isValid = await formEducationLevelRef.value.validate()
    
    if (!isValid?.valid) {
      return
    }

    // Preparar datos para enviar (solo campos necesarios)
    const payload = {
      code: educationLevelData.value.code,
      name: educationLevelData.value.name,
      abbreviation: educationLevelData.value.abbreviation || null,
      description: educationLevelData.value.description || null,
    }

    console.log('📤 Datos a enviar:', payload)

    if (educationLevelData.value.id > 0) {
      // Actualiza un nivel educativo existente
      const updated = await updateEducationLevel(educationLevelData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea un nuevo nivel educativo
      const created = await createEducationLevel(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar nivel educativo:', error)
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
  educationLevelData.value = {
    id: 0,
    code: '',
    name: '',
    abbreviation: '',
    description: '',
  }
  formEducationLevelRef.value?.reset()
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
  <VDialog
  persistent=""
    :model-value="props.isDialogVisible"
    max-width="600"
    @update:model-value="dialogModelValueUpdate"
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center bg-primary text-white pa-4">
        <span class="text-h6 text-white">
          {{ educationLevelData.id > 0 ? 'Editar' : 'Crear' }} Nivel Educativo
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
        <VForm ref="formEducationLevelRef" @submit.prevent="onFormSubmit">
          <VRow>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="educationLevelData.code"
                label="Código *"
                placeholder="Ej: NIV001"
                :rules="codeRules"
                :disabled="loading"
                counter="10"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="educationLevelData.abbreviation"
                label="Abreviatura"
                placeholder="Ej: INI"
                :rules="abbreviationRules"
                :disabled="loading"
                counter="20"
                maxlength="20"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="educationLevelData.name"
                label="Nombre *"
                placeholder="Ej: Inicial"
                :rules="nameRules"
                :disabled="loading"
                counter="100"
                maxlength="100"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="educationLevelData.description"
                label="Descripción"
                placeholder="Descripción del nivel educativo"
                :rules="descriptionRules"
                :disabled="loading"
                counter="255"
                variant="outlined"
                rows="3"
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
          {{ educationLevelData.id > 0 ? 'Actualizar' : 'Guardar' }}
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
