<script setup>
import SingleSelect from '@/components/selects/SingleSelect.vue'
import { useDREs } from '@/composables/catalogIEs/useDREs'
import { ref, watch } from 'vue'

const { createDRE, updateDRE, loading } = useDREs()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      region_id: null,
      code: '',
      name: '',
      phone: '',
      email: '',
      address: '',
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

const dreData = ref({
  id: 0,
  region_id: null,
  code: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  description: '',
})

const formDreRef = ref(null)
const regionSelectRef = ref(null)

// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    dreData.value = { ...newData }
    if (newData.region) {
      regionSelectRef.value?.setSelectedValue(newData.region)
    } else {
      regionSelectRef.value?.setSelectedValue(null)
    }
  },
  { immediate: true }
)

// Reglas de validación
const regionRules = [
  v => !!dreData.value.region_id || 'La región es requerida',
]

const codeRules = [
  v => !!v || 'El código es requerido',
  v => (v && v.length <= 4) || 'El código debe tener máximo 4 caracteres',
]

const nameRules = [
  v => !!v || 'El nombre es requerido',
  v => (v && v.length <= 255) || 'El nombre debe tener máximo 255 caracteres',
]

const emailRules = [
  v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'El correo electrónico no es válido',
]

/**
 * Maneja el envío del formulario.
 */
const onFormSubmit = async () => {
  try {
    // Verificar si el formulario es válido
    const isValid = await formDreRef.value.validate()
    
    if (!isValid?.valid || !dreData.value.region_id) {
      return
    }

    // Preparar datos para enviar
    const payload = {
      region_id: dreData.value.region_id,
      code: dreData.value.code,
      name: dreData.value.name,
      phone: dreData.value.phone || null,
      email: dreData.value.email || null,
      address: dreData.value.address || null,
      description: dreData.value.description || null,
    }

    if (dreData.value.id > 0) {
      // Actualiza una DRE existente
      const updated = await updateDRE(dreData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea una nueva DRE
      const created = await createDRE(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar DRE:', error)
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
  dreData.value = {
    id: 0,
    region_id: null,
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    description: '',
  }
  regionSelectRef.value?.setSelectedValue(null)
  formDreRef.value?.reset()
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

const onRegionSelected = (val) => {
  dreData.value.region_id = val?.id || null
}

//bases url para llamadas a api
const baseUrlPriorization = import.meta.env.VITE_API_SEMOVA_URL
const baseUrlCoes = import.meta.env.VITE_API_COES_URL
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
          {{ dreData.id > 0 ? 'Editar' : 'Crear' }} DRE
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
        <VForm ref="formDreRef" @submit.prevent="onFormSubmit">
          <VRow class="mt-2">
            <VCol cols="12" md="4">
              <SingleSelect
                ref="regionSelectRef"
                :url-api="`${baseUrlCoes}/api-regions`"
                label="Región *"
                @update:model-value="onRegionSelected"
                :rules="regionRules"
                getDefault=""
                type-control="form-select"
              />
            </VCol>

            <VCol cols="12" md="4">
              <AppTextField
                v-model="dreData.code"
                label="Código *"
                placeholder="Ej: 0101"
                :rules="codeRules"
                :disabled="loading"
                counter="4"
                maxlength="4"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="4">
              <AppTextField
                v-model="dreData.name"
                label="Nombre *"
                placeholder="Ej: DRE LIMA METROPOLITANA"
                :rules="nameRules"
                :disabled="loading"
                counter="255"
                maxlength="255"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="dreData.phone"
                label="Teléfono"
                placeholder="Ej: 01-1234567"
                :disabled="loading"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="dreData.email"
                label="Correo Electrónico"
                placeholder="Ej: dre@ejemplo.com"
                :rules="emailRules"
                :disabled="loading"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="dreData.address"
                label="Dirección"
                placeholder="Ej: Av. Principal 123"
                :disabled="loading"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="dreData.description"
                label="Descripción"
                placeholder="Descripción detallada de la DRE"
                :disabled="loading"
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
          {{ dreData.id > 0 ? 'Actualizar' : 'Guardar' }}
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

