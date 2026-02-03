<script setup>
import { useTypeEvents } from '@/composables/Coes/useTypeEvents'
import { ref, watch } from 'vue'

const { createTypeEvent, updateTypeEvent, loading } = useTypeEvents()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      name: '',
      code: '',
      status: true,
      connector_redaction: null,
      abbreviation: null,
      flg_dee: 0,
      flg_lluvias: 1,
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

const typeEventData = ref({
  id: 0,
  name: '',
  code: '',
  status: true,
  connector_redaction: null,
  abbreviation: null,
  flg_dee: 0,
  flg_lluvias: 1,
})

const formTypeEventRef = ref(null)

// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    typeEventData.value = { ...newData }
  },
  { immediate: true }
)

// Reglas de validación
const nameRules = [
  v => !!v || 'El nombre es requerido',
  v => (v && v.length <= 100) || 'El nombre debe tener máximo 100 caracteres',
]

const codeRules = [
  v => (v && v.length <= 6) || 'El código debe tener máximo 6 caracteres',
]

const abbreviationRules = [
  v => (v && v.length <= 50) || 'La abreviatura debe tener máximo 50 caracteres',
]

const connectorRedactionRules = [
  v => (v && v.length <= 100) || 'El conector de redacción debe tener máximo 100 caracteres',
]

/**
 * Maneja el envío del formulario.
 */
const onFormSubmit = async () => {
  try {
    // Verificar si el formulario es válido
    const isValid = await formTypeEventRef.value.validate()
    
    if (!isValid?.valid) {
      return
    }

    // Preparar datos para enviar
    const payload = {
      name: typeEventData.value.name,
      code: typeEventData.value.code || null,
      status: typeEventData.value.status ? 1 : 0,
      connector_redaction: typeEventData.value.connector_redaction || null,
      abbreviation: typeEventData.value.abbreviation || null,
      flg_dee: typeEventData.value.flg_dee ? 1 : 0,
      flg_lluvias: typeEventData.value.flg_lluvias || 1,
    }

    if (typeEventData.value.id > 0) {
      // Actualiza un tipo de evento existente
      const updated = await updateTypeEvent(typeEventData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea un nuevo tipo de evento
      const created = await createTypeEvent(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar tipo de evento:', error)
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
  typeEventData.value = {
    id: 0,
    name: '',
    code: '',
    status: true,
    connector_redaction: null,
    abbreviation: null,
    flg_dee: 0,
    flg_lluvias: 1,
  }
  formTypeEventRef.value?.reset()
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
          {{ typeEventData.id > 0 ? 'Editar' : 'Crear' }} tipo de peligro
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
        <VForm ref="formTypeEventRef" @submit.prevent="onFormSubmit">
          <VRow class="mt-2">
            <VCol cols="12" md="6">
              <AppTextField
                v-model="typeEventData.name"
                label="Nombre *"
                placeholder="Ej: Deslizamiento"
                :rules="nameRules"
                :disabled="loading"
                counter="100"
                maxlength="100"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="typeEventData.code"
                label="Código"
                placeholder="Ej: DES01"
                :rules="codeRules"
                :disabled="loading"
                counter="6"
                maxlength="6"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="typeEventData.abbreviation"
                label="Abreviatura"
                placeholder="Ej: DSL"
                :rules="abbreviationRules"
                :disabled="loading"
                counter="50"
                maxlength="50"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="typeEventData.connector_redaction"
                label="Conector de redacción"
                placeholder="Ej: causado por"
                :rules="connectorRedactionRules"
                :disabled="loading"
                counter="100"
                maxlength="100"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <VSelect
                v-model="typeEventData.flg_lluvias"
                :items="[
                  { title: 'Lluvias', value: 1 },
                  { title: 'Otros Peligros', value: 2 }
                ]"
                label="Tipo de peligro"
                :disabled="loading"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VCheckbox
                v-model="typeEventData.status"
                label="Activo"
                :disabled="loading"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VCheckbox
                v-model="typeEventData.flg_dee"
                label="Es DEE"
                :disabled="loading"
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
          {{ typeEventData.id > 0 ? 'Actualizar' : 'Guardar' }}
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
