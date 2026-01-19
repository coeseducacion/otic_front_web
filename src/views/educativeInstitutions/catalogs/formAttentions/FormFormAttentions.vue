<script setup>
import { useFormAttentions } from '@/composables/catalogIEs/useFormAttentions'

const { createFormAttention, updateFormAttention, loading } = useFormAttentions()

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

const formAttentionData = ref({
  id: 0,
  code: '',
  name: '',
  description: '',
})

const formFormAttentionRef = ref(null)

// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    formAttentionData.value = { ...newData }
  },
  { immediate: true }
)

// Reglas de validación
const codeRules = [
  v => !v || v.length <= 10 || 'El código debe tener máximo 10 caracteres',
]

const nameRules = [
  v => !!v || 'El nombre es requerido',
  v => (v && v.length <= 100) || 'El nombre debe tener máximo 100 caracteres',
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
    const isValid = await formFormAttentionRef.value.validate()
    
    if (!isValid?.valid) {
      return
    }

    // Preparar datos para enviar (solo campos necesarios)
    const payload = {
      code: formAttentionData.value.code || null,
      name: formAttentionData.value.name,
      description: formAttentionData.value.description || null,
    }

    console.log('📤 Datos a enviar:', payload)

    if (formAttentionData.value.id > 0) {
      // Actualiza una forma de atención existente
      const updated = await updateFormAttention(formAttentionData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea una nueva forma de atención
      const created = await createFormAttention(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar forma de atención:', error)
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
  formAttentionData.value = {
    id: 0,
    code: '',
    name: '',
    description: '',
  }
  formFormAttentionRef.value?.reset()
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
          {{ formAttentionData.id > 0 ? 'Editar' : 'Crear' }} Forma de Atención
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
        <VForm ref="formFormAttentionRef" @submit.prevent="onFormSubmit">
          <VRow>
            <VCol cols="12" md="6">
              <AppTextField
                v-model="formAttentionData.code"
                label="Código"
                placeholder="Ej: FA001"
                :rules="codeRules"
                :disabled="loading"
                counter="10"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="formAttentionData.name"
                label="Nombre *"
                placeholder="Ej: Presencial"
                :rules="nameRules"
                :disabled="loading"
                counter="100"
                maxlength="100"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="formAttentionData.description"
                label="Descripción"
                placeholder="Descripción de la forma de atención"
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
          {{ formAttentionData.id > 0 ? 'Actualizar' : 'Guardar' }}
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
