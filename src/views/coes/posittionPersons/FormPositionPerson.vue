<script setup>
import SingleSelect from '@/components/selects/SingleSelect.vue'
import { usePositionPersons } from '@/composables/Coes/usePositionPersons'
import { nextTick, ref, watch } from 'vue'

const { createPositionPerson, updatePositionPerson, loading } = usePositionPersons()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      person_id: null,
      job_position_id: null,
      type_contract_id: null,
      dre_id: null,
      ugel_id: null,
      educative_institution_id: null,
      start_date: null,
      end_date: null,
      is_active: true,
      is_validated: false,
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

const positionPersonData = ref({
  id: 0,
  person_id: null,
  job_position_id: null,
  type_contract_id: null,
  dre_id: null,
  ugel_id: null,
  educative_institution_id: null,
  start_date: null,
  end_date: null,
  is_active: true,
  is_validated: false,
})

const formPositionPersonRef = ref(null)
const personSelectRef = ref(null)
const jobPositionSelectRef = ref(null)
const typeContractSelectRef = ref(null)
const dreSelectRef = ref(null)
const ugelSelectRef = ref(null)
const educativeInstitutionSelectRef = ref(null)

// Función para formatear fechas ISO a yyyy-MM-dd
const formatDateForInput = (dateString) => {
  if (!dateString) return null
  // Si ya está en formato yyyy-MM-dd, retorna como está
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString
  }
  // Si es formato d/m/Y, convierte a yyyy-MM-dd
  if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    const [day, month, year] = dateString.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  // Si es ISO format, extrae la parte de la fecha
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  return date.toISOString().split('T')[0]
}

// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    positionPersonData.value = {
      ...newData,
      start_date: formatDateForInput(newData.start_date),
      end_date: formatDateForInput(newData.end_date),
    }
    if (newData.personal) {
      personSelectRef.value?.setSelectedValue(newData.personal)
    } else {
      personSelectRef.value?.setSelectedValue(null)
    }
    if (newData.job_position) {
      jobPositionSelectRef.value?.setSelectedValue(newData.job_position)
    } else {
      jobPositionSelectRef.value?.setSelectedValue(null)
    }
    if (newData.type_contract) {
      typeContractSelectRef.value?.setSelectedValue(newData.type_contract)
    } else {
      typeContractSelectRef.value?.setSelectedValue(null)
    }
    if (newData.dre) {
      dreSelectRef.value?.setSelectedValue(newData.dre)
    } else {
      dreSelectRef.value?.setSelectedValue(null)
    }
    if (newData.ugel) {
      ugelSelectRef.value?.setSelectedValue(newData.ugel)
    } else {
      ugelSelectRef.value?.setSelectedValue(null)
    }
    if (newData.educative_institution) {
      educativeInstitutionSelectRef.value?.setSelectedValue(newData.educative_institution)
    } else {
      educativeInstitutionSelectRef.value?.setSelectedValue(null)
    }
  },
  { immediate: true }
)

// Reglas de validación
const personRules = [
  v => !!positionPersonData.value.person_id || 'La persona es requerida',
]

const jobPositionRules = [
  v => !!positionPersonData.value.job_position_id || 'El puesto de trabajo es requerido',
]

const typeContractRules = [
  v => !!positionPersonData.value.type_contract_id || 'El tipo de contrato es requerido',
]

const startDateRules = [
  v => !!v || 'La fecha de inicio es requerida',
]

/**
 * Maneja el envío del formulario.
 */
const onFormSubmit = async () => {
  try {
    // Verificar si el formulario es válido
    const isValid = await formPositionPersonRef.value.validate()
    
    if (!isValid?.valid || !positionPersonData.value.person_id || !positionPersonData.value.job_position_id || !positionPersonData.value.type_contract_id) {
      return
    }

    // Preparar datos para enviar
    const payload = {
      person_id: positionPersonData.value.person_id,
      job_position_id: positionPersonData.value.job_position_id,
      type_contract_id: positionPersonData.value.type_contract_id,
      dre_id: positionPersonData.value.dre_id || null,
      ugel_id: positionPersonData.value.ugel_id || null,
      educative_institution_id: positionPersonData.value.educative_institution_id || null,
      start_date: positionPersonData.value.start_date || null,
      end_date: positionPersonData.value.end_date || null,
      is_active: positionPersonData.value.is_active ? 1 : 0,
      is_validated: positionPersonData.value.is_validated ? 1 : 0,
    }

    if (positionPersonData.value.id > 0) {
      // Actualiza una posición de persona existente
      const updated = await updatePositionPerson(positionPersonData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea una nueva posición de persona
      const created = await createPositionPerson(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar posición de persona:', error)
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
  positionPersonData.value = {
    id: 0,
    person_id: null,
    job_position_id: null,
    type_contract_id: null,
    dre_id: null,
    ugel_id: null,
    educative_institution_id: null,
    start_date: null,
    end_date: null,
    is_active: true,
    is_validated: false,
  }
  personSelectRef.value?.setSelectedValue(null)
  jobPositionSelectRef.value?.setSelectedValue(null)
  typeContractSelectRef.value?.setSelectedValue(null)
  dreSelectRef.value?.setSelectedValue(null)
  ugelSelectRef.value?.setSelectedValue(null)
  educativeInstitutionSelectRef.value?.setSelectedValue(null)
  formPositionPersonRef.value?.reset()
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

const onPersonSelected = (val) => {
  positionPersonData.value.person_id = val?.id || null
}

const onJobPositionSelected = (val) => {
  positionPersonData.value.job_position_id = val?.id || null
}

const onTypeContractSelected = (val) => {
  positionPersonData.value.type_contract_id = val?.id || null
}

const onDreSelected = async (val) => {
  positionPersonData.value.dre_id = val?.id || null
  await nextTick()
  ugelSelectRef.value?.getDataFromApi()
}

const onUgelSelected = async (val) => {
  positionPersonData.value.ugel_id = val?.id || null
  await nextTick()
  educativeInstitutionSelectRef.value?.getDataFromApi()
}

const onEducativeInstitutionSelected = (val) => {
  positionPersonData.value.educative_institution_id = val?.id || null
}

//bases url para llamadas a api
const baseUrlCoes = import.meta.env.VITE_API_COES_URL
</script>

<template>
  <VDialog persistent=""
    :model-value="props.isDialogVisible"
    max-width="900"
    @update:model-value="dialogModelValueUpdate"
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center bg-primary text-white pa-4">
        <span class="text-h6 text-white">
          {{ positionPersonData.id > 0 ? 'Editar' : 'Crear' }} posición de persona
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
        <VForm ref="formPositionPersonRef" @submit.prevent="onFormSubmit">
          <VRow class="mt-2">
            <VCol cols="12" md="6">
              <SingleSelect
                ref="personSelectRef"
                :url-api="`${baseUrlCoes}/persons`"
                label="Persona *"
                :concat-values="['apellido_paterno', 'apellido_materno', 'nombres']"
                :concat-character="' '"
                @update:model-value="onPersonSelected"
                :rules="personRules"
                get-default=""
                type-control="form-select"
              />
            </VCol>

            <VCol cols="12" md="6">
              <SingleSelect
                ref="jobPositionSelectRef"
                :url-api="`${baseUrlCoes}/job-positions`"
                label="Puesto de Trabajo *"
                item-title="name"
                @update:model-value="onJobPositionSelected"
                :rules="jobPositionRules"
                get-default=""
                type-control="form-select"
              />
            </VCol>

            <VCol cols="12" md="6">
              <SingleSelect
                ref="typeContractSelectRef"
                :url-api="`${baseUrlCoes}/type-contracts`"
                label="Tipo de Contrato *"
                item-title="name"
                @update:model-value="onTypeContractSelected"
                :rules="typeContractRules"
                get-default=""
                type-control="form-select"
              />
            </VCol>

            <VCol cols="12" md="6">
              <SingleSelect
                ref="dreSelectRef"
                :url-api="`${baseUrlCoes}/api-dres`"
                label="DRE"
                item-title="name"
                get-default=""
                :items-limit="50"
                @update:model-value="onDreSelected"
                type-control="form-select"
              />
            </VCol>
            <VCol cols="12" md="6">
              <SingleSelect
                ref="ugelSelectRef"
                :url-api="`${baseUrlCoes}/api-ugels`"
                label="UGEL"
                item-title="name"
                :filters="[{field:'dre_id',operator:'=',value:positionPersonData.dre_id || 0}]"
                :no-data-text="positionPersonData.dre_id ? 'No se encontraron UGELs' : 'Seleccione una DRE para buscar'"
                @update:model-value="onUgelSelected"
                type-control="form-select"
              />
            </VCol>

            <VCol cols="12" md="6">
              <SingleSelect
                ref="educativeInstitutionSelectRef"
                :url-api="`${baseUrlCoes}/educative-institutions`"
                label="Institución Educativa"
                item-title="name_ie"
                :concat-values="['modular_code', 'name_ie']"
                concat-character=" - "
                :filters="[{field:'ugel_id',operator:'=',value:positionPersonData.ugel_id || 0}]"
                :no-data-text="positionPersonData.ugel_id ? 'No se encontraron Instituciones Educativas' : 'Seleccione una UGEL para buscar'"
                @update:model-value="onEducativeInstitutionSelected"
                type-control="form-select"
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model="positionPersonData.start_date"
                label="Fecha de Inicio *"
                type="date"
                :rules="startDateRules"
                :disabled="loading"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model="positionPersonData.end_date"
                label="Fecha de Fin"
                type="date"
                :disabled="loading"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="3">
              <div style="block-size: 25px;"></div>
              <VCheckbox
                v-model="positionPersonData.is_active"
                label="Activo"
                :disabled="loading"
              />
            </VCol>

            <VCol cols="12" md="3">
              <div style="block-size: 25px;"></div>
              <VCheckbox
                v-model="positionPersonData.is_validated"
                label="Validado"
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
          {{ positionPersonData.id > 0 ? 'Actualizar' : 'Guardar' }}
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
