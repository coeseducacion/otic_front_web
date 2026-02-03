<script setup>
import SingleSelect from '@/components/selects/SingleSelect.vue'
import { usePersons } from '@/composables/Coes/usePersons'
import { ref, watch } from 'vue'

const { createPerson, updatePerson, loading } = usePersons()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      user_id: null,
      district_id: null,
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      documento: '',
      celular: '',
      celular_institucional: '',
      telefono: '',
      correo_personal: '',
      correo_institucional: '',
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

const personData = ref({
  id: 0,
  user_id: null,
  district_id: null,
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  documento: '',
  celular: '',
  celular_institucional: '',
  telefono: '',
  correo_personal: '',
  correo_institucional: '',
})

const formPersonRef = ref(null)
const usuarioSelectRef = ref(null)
const districtSelectRef = ref(null)

// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    personData.value = { ...newData }
    if (newData.district) {
      districtSelectRef.value?.setSelectedValue(newData.district)
    } else {
      districtSelectRef.value?.setSelectedValue(null)
    }
    if (newData.user_id) {
      usuarioSelectRef.value?.setSelectedValue(newData.user_id)
    } else {
      usuarioSelectRef.value?.setSelectedValue(null)
    }
  },
  { immediate: true }
)

// Reglas de validación
const nombresRules = [
  v => !!v || 'El nombre es requerido',
  v => (v && v.length <= 255) || 'El nombre debe tener máximo 255 caracteres',
]

const apellidoPaternoRules = [
  v => !!v || 'El apellido paterno es requerido',
  v => (v && v.length <= 255) || 'El apellido paterno debe tener máximo 255 caracteres',
]

const apellidoMaternoRules = [
  v => !!v || 'El apellido materno es requerido',
  v => (v && v.length <= 255) || 'El apellido materno debe tener máximo 255 caracteres',
]

const documentoRules = [
  v => !!v || 'El documento es requerido',
  v => (v && v.length === 8) || 'El documento debe tener 8 dígitos',
  v => (v && /^\d+$/.test(v)) || 'El documento solo puede contener dígitos',
]

const emailRules = [
  v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'El correo electrónico no es válido',
]

const telefonoRules = [
  v => !v || (v && v.length <= 15) || 'El teléfono debe tener máximo 15 caracteres',
]

/**
 * Maneja el envío del formulario.
 */
const onFormSubmit = async () => {
  try {
    // Verificar si el formulario es válido
    const isValid = await formPersonRef.value.validate()
    
    if (!isValid?.valid) {
      return
    }

    // Preparar datos para enviar
    const payload = {
      user_id: personData.value.user_id,
      district_id: personData.value.district_id || null,
      nombres: personData.value.nombres,
      apellido_paterno: personData.value.apellido_paterno,
      apellido_materno: personData.value.apellido_materno,
      documento: personData.value.documento,
      celular: personData.value.celular || null,
      celular_institucional: personData.value.celular_institucional || null,
      telefono: personData.value.telefono || null,
      correo_personal: personData.value.correo_personal || null,
      correo_institucional: personData.value.correo_institucional || null,
    }

    if (personData.value.id > 0) {
      // Actualiza una persona existente
      const updated = await updatePerson(personData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea una nueva persona
      const created = await createPerson(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar persona:', error)
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
  personData.value = {
    id: 0,
    user_id: null,
    district_id: null,
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    documento: '',
    celular: '',
    celular_institucional: '',
    telefono: '',
    correo_personal: '',
    correo_institucional: '',
  }
  districtSelectRef.value?.setSelectedValue(null)
  usuarioSelectRef.value?.setSelectedValue(null)
  formPersonRef.value?.reset()
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

const onDistrictSelected = (val) => {
  personData.value.district_id = val?.id || null
}
const onUsuarioSelected = (val) => {
  personData.value.user_id =  val || null
  personData.value.documento = val?.document || ''
  personData.value.nombres = val?.name || ''
  personData.value.correo_personal = val?.email || ''
  personData.value.celular = val?.phone || ''
}

//bases url para llamadas a api
const baseUrlCoes = import.meta.env.VITE_API_COES_URL
const baseAuthUrl = import.meta.env.VITE_API_AUTH_URL
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
          {{ personData.id > 0 ? 'Editar' : 'Crear' }} persona
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
        <VForm ref="formPersonRef" @submit.prevent="onFormSubmit">
          <VRow class="mt-2">
            
          <VCol cols="12" md="6">
              <SingleSelect
                ref="usuarioSelectRef"
                :url-api="`${baseAuthUrl}/users`"
                label="Usuario"
                :concat-values="['document', 'name']"
                :concat-character="' - '"
                @update:model-value="onUsuarioSelected"
                type-control="form-select"
              />
            </VCol>
          <VCol cols="12" md="6">
              <SingleSelect
                ref="districtSelectRef"
                :url-api="`${baseUrlCoes}/districts-with-region`"
                label="Distrito"
                :includes="[{relation:'province.region'}]"
                :concat-values="['name', 'province.name', 'province.region.name']"
                :concat-character="' / '"
                :items-sort-fields="[ {field: 'name', direction: 'asc'}]"
                :items-limit="100"
                @update:model-value="onDistrictSelected"
                type-control="form-select"
              />
            </VCol>
            <VCol cols="12" md="3">
              <AppTextField
                v-model="personData.documento"
                label="documento *"
                placeholder="Ej: 12345678"
                :rules="documentoRules"
                :disabled="loading"
                maxlength="8"
                variant="outlined"
              />
            </VCol>
            <VCol cols="12" md="3">
              <AppTextField
                v-model="personData.nombres"
                label="Nombres *"
                placeholder="Ej: Juan"
                :rules="nombresRules"
                :disabled="loading"
                counter="255"
                maxlength="255"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model="personData.apellido_paterno"
                label="Apellido paterno *"
                placeholder="Ej: García"
                :rules="apellidoPaternoRules"
                :disabled="loading"
                counter="255"
                maxlength="255"
                variant="outlined"
              />
            </VCol>
            <VCol cols="12" md="3">
              <AppTextField
                v-model="personData.apellido_materno"
                label="Apellido materno *"
                placeholder="Ej: López"
                :rules="apellidoMaternoRules"
                :disabled="loading"
                counter="255"
                maxlength="255"
                variant="outlined"
              />
            </VCol>
            
            

            <VCol cols="12" md="3">
              <AppTextField
                v-model="personData.celular"
                label="Celular"
                placeholder="Ej: 999999999"
                :rules="telefonoRules"
                :disabled="loading"
                maxlength="15"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model="personData.celular_institucional"
                label="Celular institucional"
                placeholder="Ej: 999999999"
                :rules="telefonoRules"
                :disabled="loading"
                maxlength="15"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model="personData.telefono"
                label="Teléfono"
                placeholder="Ej: 01-1234567"
                :rules="telefonoRules"
                :disabled="loading"
                maxlength="15"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model="personData.correo_personal"
                label="Correo personal"
                placeholder="Ej: personal@ejemplo.com"
                :rules="emailRules"
                :disabled="loading"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="3">
              <AppTextField
                v-model="personData.correo_institucional"
                label="Correo institucional"
                placeholder="Ej: institucional@ejemplo.com"
                :rules="emailRules"
                :disabled="loading"
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
          {{ personData.id > 0 ? 'Actualizar' : 'Guardar' }}
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
