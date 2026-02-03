<script setup>
import { useTypeContracts } from '@/composables/Coes/useTypeContracts'
import { ref, watch } from 'vue'

const { createTypeContract, updateTypeContract, loading } = useTypeContracts()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      name: '',
      code: '',
      description: null,
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

const typeContractData = ref({
  id: 0,
  name: '',
  code: '',
  description: null,
  active: true,
  order: 0,
})

const formTypeContractRef = ref(null)

// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    typeContractData.value = { ...newData }
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
    const isValid = await formTypeContractRef.value.validate()
    
    if (!isValid?.valid) {
      return
    }

    // Preparar datos para enviar
    const payload = {
      name: typeContractData.value.name,
      code: typeContractData.value.code,
      description: typeContractData.value.description || null,
      active: typeContractData.value.active ? 1 : 0,
      order: typeContractData.value.order || 0,
    }

    if (typeContractData.value.id > 0) {
      // Actualiza un tipo de contrato existente
      const updated = await updateTypeContract(typeContractData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea un nuevo tipo de contrato
      const created = await createTypeContract(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar tipo de contrato:', error)
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
  typeContractData.value = {
    id: 0,
    name: '',
    code: '',
    description: null,
    active: true,
    order: 0,
  }
  formTypeContractRef.value?.reset()
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
          {{ typeContractData.id > 0 ? 'Editar' : 'Crear' }} tipo de contrato
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
        <VForm ref="formTypeContractRef" @submit.prevent="onFormSubmit">
          <VRow class="mt-2">
            <VCol cols="12" md="6">
              <AppTextField
                v-model="typeContractData.name"
                label="Nombre *"
                placeholder="Ej: Contrato Indefinido"
                :rules="nameRules"
                :disabled="loading"
                counter="255"
                maxlength="255"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="typeContractData.code"
                label="Código *"
                placeholder="Ej: CI001"
                :rules="codeRules"
                :disabled="loading"
                counter="255"
                maxlength="255"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="typeContractData.description"
                label="Descripción"
                placeholder="Descripción del tipo de contrato"
                :disabled="loading"
                variant="outlined"
                rows="3"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VCheckbox
                v-model="typeContractData.active"
                label="Activo"
                :disabled="loading"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model.number="typeContractData.order"
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
          {{ typeContractData.id > 0 ? 'Actualizar' : 'Guardar' }}
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
