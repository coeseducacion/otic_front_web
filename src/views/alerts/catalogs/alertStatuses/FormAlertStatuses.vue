<script setup>
import SingleSelect from '@/components/selects/SingleSelect.vue'
import { useAlertStatuses } from '@/composables/catalogAlerts/useAlertStatuses'

const { createAlertStatuses, updateAlertStatuses, loading } = useAlertStatuses()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      name: '',
      description: '',
      parent_requireds: [],
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

const alertStatusData = ref({
  id: 0,
  name: '',
  description: '',
  parent_requireds: [],
})

const formAlertStatusRef = ref(null)
const parentRequiredsRef = ref(null)

// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    alertStatusData.value = { 
      ...newData,
      parent_requireds: Array.isArray(newData.parent_requireds) ? newData.parent_requireds : [],
    }
  },
  { immediate: true }
)

// Reglas de validación
const nameRules = [
  v => !!v || 'El nombre es requerido',
  v => (v && v.length <= 50) || 'El nombre debe tener máximo 50 caracteres',
]

const descriptionRules = [
  v => !v || (v && v.length <= 200) || 'La descripción debe tener máximo 200 caracteres',
]

/**
 * Maneja el envío del formulario.
 */
const onFormSubmit = async () => {
  try {
    // Verificar si el formulario es válido
    const isValid = await formAlertStatusRef.value.validate()
    
    if (!isValid?.valid) {
      return
    }

    // Preparar datos para enviar (solo campos necesarios)
    const payload = {
      name: alertStatusData.value.name,
      description: alertStatusData.value.description || null,
      parent_requireds: Array.isArray(alertStatusData.value.parent_requireds)
        ? alertStatusData.value.parent_requireds.map(item => typeof item === 'object' ? item.id : item)
        : [],
    }

    console.log('📤 Datos a enviar:', payload)

    if (alertStatusData.value.id > 0) {
      // Actualiza un estado de alerta existente
      const updated = await updateAlertStatuses(alertStatusData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea un nuevo estado de alerta
      const created = await createAlertStatuses(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar estado de alerta:', error)
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
  alertStatusData.value = {
    id: 0,
    name: '',
    description: '',
    parent_requireds: [],
  }
  formAlertStatusRef.value?.reset()
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

/**
 * Maneja la selección de estados padres requeridos
 */
const onParentRequiredsSelected = (parentRequiredsList) => {
  alertStatusData.value.parent_requireds = Array.isArray(parentRequiredsList) ? parentRequiredsList : []
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
          {{ alertStatusData.id > 0 ? 'Editar' : 'Crear' }} Estado de Alerta
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
        <VForm ref="formAlertStatusRef" @submit.prevent="onFormSubmit">
          <VRow>
            <!-- Nombre -->
            <VCol cols="12">
              <AppTextField
                v-model="alertStatusData.name"
                label="Nombre *"
                placeholder="Ej: Activo, Pendiente, Resuelto"
                :rules="nameRules"
                :disabled="loading"
                counter="50"
                maxlength="50"
                variant="outlined"
              />
            </VCol>

            <!-- Descripción -->
            <VCol cols="12">
              <AppTextarea
                v-model="alertStatusData.description"
                label="Descripción"
                placeholder="Descripción detallada del estado de alerta"
                :rules="descriptionRules"
                :disabled="loading"
                variant="outlined"
                rows="3"
              />
            </VCol>

            <!-- Estados Padres Requeridos (MultiSelect) -->
            <VCol cols="12">
              <SingleSelect
                ref="parentRequiredsRef"
                v-model="alertStatusData.parent_requireds"
                url-api="alert-statuses"
                label="Estados Padres Requeridos"
                item-value="id"
                item-title="name"
                :multiple="true"
                :chips="true"
                :closable-chips="true"
                :get-default="false"
                @update:model-value="onParentRequiredsSelected"
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
          {{ alertStatusData.id > 0 ? 'Actualizar' : 'Guardar' }}
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
