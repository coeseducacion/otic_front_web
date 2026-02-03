<script setup>
import { useJobPositions } from '@/composables/Coes/useJobPositions'
import { ref, watch } from 'vue'

const { createJobPosition, updateJobPosition, loading } = useJobPositions()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      name: '',
      code: '',
      description: null,
      is_dre: false,
      is_ugel: false,
      active: true,
      order: 0,
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

const jobPositionData = ref({
  id: 0,
  name: '',
  code: '',
  description: null,
  is_dre: false,
  is_ugel: false,
  active: true,
  order: 0,
})

const formJobPositionRef = ref(null)

// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    jobPositionData.value = { ...newData }
  },
  { immediate: true }
)

// Reglas de validación
const nameRules = [
  v => !!v || 'El nombre es requerido',
  v => (v && v.length <= 255) || 'El nombre debe tener máximo 255 caracteres',
]

const codeRules = [
  v => !!v || 'El código es requerido',
  v => (v && v.length <= 255) || 'El código debe tener máximo 255 caracteres',
]

/**
 * Maneja el envío del formulario.
 */
const onFormSubmit = async () => {
  try {
    // Verificar si el formulario es válido
    const isValid = await formJobPositionRef.value.validate()
    
    if (!isValid?.valid) {
      return
    }

    // Preparar datos para enviar
    const payload = {
      name: jobPositionData.value.name,
      code: jobPositionData.value.code,
      description: jobPositionData.value.description || null,
      is_dre: jobPositionData.value.is_dre ? 1 : 0,
      is_ugel: jobPositionData.value.is_ugel ? 1 : 0,
      active: jobPositionData.value.active ? 1 : 0,
      order: jobPositionData.value.order || 0,
    }

    if (jobPositionData.value.id > 0) {
      // Actualiza un puesto de trabajo existente
      const updated = await updateJobPosition(jobPositionData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea un nuevo puesto de trabajo
      const created = await createJobPosition(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar puesto de trabajo:', error)
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
  jobPositionData.value = {
    id: 0,
    name: '',
    code: '',
    description: null,
    is_dre: false,
    is_ugel: false,
    active: true,
    order: 0,
  }
  formJobPositionRef.value?.reset()
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
    max-width="800"
    @update:model-value="dialogModelValueUpdate"
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center bg-primary text-white pa-4">
        <span class="text-h6 text-white">
          {{ jobPositionData.id > 0 ? 'Editar' : 'Crear' }} puesto de trabajo
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
        <VForm ref="formJobPositionRef" @submit.prevent="onFormSubmit">
          <VRow class="mt-2">
            <VCol cols="12" md="6">
              <AppTextField
                v-model="jobPositionData.name"
                label="Nombre *"
                placeholder="Ej: Director"
                :rules="nameRules"
                :disabled="loading"
                counter="255"
                maxlength="255"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="jobPositionData.code"
                label="Código *"
                placeholder="Ej: DIR001"
                :rules="codeRules"
                :disabled="loading"
                counter="255"
                maxlength="255"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="jobPositionData.description"
                label="Descripción"
                placeholder="Descripción del puesto de trabajo"
                :disabled="loading"
                variant="outlined"
                rows="3"
              />
            </VCol>

            <VCol cols="12" md="3">
              <VCheckbox
                v-model="jobPositionData.is_dre"
                label="Es DRE"
                :disabled="loading"
              />
            </VCol>

            <VCol cols="12" md="3">
              <VCheckbox
                v-model="jobPositionData.is_ugel"
                label="Es UGEL"
                :disabled="loading"
              />
            </VCol>

            <VCol cols="12" md="3">
              <VCheckbox
                v-model="jobPositionData.active"
                label="Activo"
                :disabled="loading"
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model.number="jobPositionData.order"
                label="Orden"
                placeholder="0"
                :disabled="loading"
                type="number"
                variant="outlined"
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
          {{ jobPositionData.id > 0 ? 'Actualizar' : 'Guardar' }}
        </VBtn>
        <VBtn
          color="secondary"
          variant="elevated"
          @click="onFormReset"
          :disabled="loading"
        >
          <VIcon start icon="tabler-x" />
          Cancelar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
