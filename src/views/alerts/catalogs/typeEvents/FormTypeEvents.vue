<script setup>
import SingleSelect from '@/components/selects/SingleSelect.vue'
import { useTypeEvents } from '@/composables/catalogAlerts/useTypeEvents'

const { createTypeEvents, updateTypeEvents, loading } = useTypeEvents()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      event_classification_id: null,
      name: '',
      code: '',
      status: 1,
      connector_redaction: '',
      abbreviation: '',
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
  event_classification_id: null,
  name: '',
  code: '',
  status: 1,
  connector_redaction: '',
  abbreviation: '',
  flg_dee: 0,
  flg_lluvias: 1,
})

const formTypeEventRef = ref(null)
const eventClassificationRef = ref(null)

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
  v => !v || (v && v.length <= 6) || 'El código debe tener máximo 6 caracteres',
]

const connectorRedactionRules = [
  v => !v || (v && v.length <= 100) || 'El conector de redacción debe tener máximo 100 caracteres',
]

const abbreviationRules = [
  v => !v || (v && v.length <= 50) || 'La abreviación debe tener máximo 50 caracteres',
]

const eventClassificationRules = [
  v => !!v || 'La clasificación de evento es requerida',
]

const flgLluviasOptions = [
  { title: 'Lluvias', value: 1 },
  { title: 'Otros peligros', value: 2 },
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

    // Verificar si se seleccionó clasificación de evento
    if (!typeEventData.value.event_classification_id) {
      console.error('❌ Clasificación de evento no seleccionada')
      return
    }

    // Preparar datos para enviar (solo campos necesarios)
    const payload = {
      event_classification_id: typeEventData.value.event_classification_id.id || typeEventData.value.event_classification_id,
      name: typeEventData.value.name,
      code: typeEventData.value.code || null,
      status: typeEventData.value.status ? 1 : 0,
      connector_redaction: typeEventData.value.connector_redaction || null,
      abbreviation: typeEventData.value.abbreviation || null,
      flg_dee: typeEventData.value.flg_dee ? 1 : 0,
      flg_lluvias: typeEventData.value.flg_lluvias,
    }

    console.log('📤 Datos a enviar:', payload)

    if (typeEventData.value.id > 0) {
      // Actualiza un tipo de evento existente
      const updated = await updateTypeEvents(typeEventData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea un nuevo tipo de evento
      const created = await createTypeEvents(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar tipo de evento:', error)
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
  typeEventData.value = {
    id: 0,
    event_classification_id: null,
    name: '',
    code: '',
    status: 1,
    connector_redaction: '',
    abbreviation: '',
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

/**
 * Maneja la selección de clasificación de evento
 */
const onEventClassificationSelected = (eventClassification) => {
  typeEventData.value.event_classification_id = eventClassification
}
</script>

<template>
  <VDialog persistent=""
    :model-value="props.isDialogVisible"
    max-width="700"
    @update:model-value="dialogModelValueUpdate"
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center bg-primary text-white pa-4">
        <span class="text-h6 text-white">
          {{ typeEventData.id > 0 ? 'Editar' : 'Crear' }} Tipo de Evento
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
          <VRow>
            <!-- Clasificación de Evento (SingleSelect) -->
            <VCol cols="12" md="6">
              <SingleSelect
                ref="eventClassificationRef"
                v-model="typeEventData.event_classification_id"
                url-api="event-classifications"
                label="Clasificación de Evento *"
                item-value="id"
                item-title="name"
                :rules="eventClassificationRules"
                :get-default="false"
                @update:model-value="onEventClassificationSelected"
              />
            </VCol>

            <!-- Nombre -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="typeEventData.name"
                label="Nombre *"
                placeholder="Ej: Evento Importante"
                :rules="nameRules"
                :disabled="loading"
                counter="100"
                maxlength="100"
                variant="outlined"
              />
            </VCol>

            <!-- Código -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="typeEventData.code"
                label="Código"
                placeholder="Ej: EV001"
                :rules="codeRules"
                :disabled="loading"
                counter="6"
                maxlength="6"
                variant="outlined"
              />
            </VCol>

            <!-- Estado (Status) -->
            <VCol cols="12" md="6">
              <VCheckbox
                v-model="typeEventData.status"
                label="Activo"
                :true-value="1"
                :false-value="0"
                :disabled="loading"
              />
            </VCol>

            <!-- Conector de Redacción -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="typeEventData.connector_redaction"
                label="Conector de Redacción"
                placeholder="Ej: por"
                :rules="connectorRedactionRules"
                :disabled="loading"
                counter="100"
                maxlength="100"
                variant="outlined"
              />
            </VCol>

            <!-- Abreviación -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="typeEventData.abbreviation"
                label="Abreviación"
                placeholder="Ej: EV"
                :rules="abbreviationRules"
                :disabled="loading"
                counter="50"
                maxlength="50"
                variant="outlined"
              />
            </VCol>

            <!-- Bandera DEE -->
            <VCol cols="12" md="6">
              <VCheckbox
                v-model="typeEventData.flg_dee"
                label="Bandera DEE"
                :true-value="1"
                :false-value="0"
                :disabled="loading"
              />
            </VCol>

            <!-- Tipo de Lluvia/Peligro -->
            <VCol cols="12" md="6">
              <VSelect
                v-model="typeEventData.flg_lluvias"
                :items="flgLluviasOptions"
                label="Tipo de Lluvia/Peligro"
                item-value="value"
                item-title="title"
                variant="outlined"
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
