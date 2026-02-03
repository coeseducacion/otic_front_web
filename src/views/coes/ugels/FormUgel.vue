<script setup>
import SingleSelect from '@/components/selects/SingleSelect.vue'
import { useUgels } from '@/composables/catalogIEs/useUgels'
import { ref, watch } from 'vue'

const { createUgel, updateUgel, loading } = useUgels()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      province_id: null,
      dre_id: null,
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

const ugelData = ref({
  id: 0,
  province_id: null,
  dre_id: null,
  code: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  description: '',
})

const dreSelected=ref(null)
const formUgelRef = ref(null)
const provinceSelectRef = ref(null)
const dreSelectRef = ref(null)


// Observa los cambios en las propiedades y actualiza los datos
watch(
  () => props.data,
  (newData) => {
    ugelData.value = { ...newData }
    if (newData.province) {
      provinceSelectRef.value?.setSelectedValue(newData.province)
    } else {
      provinceSelectRef.value?.setSelectedValue(null)
    }
    if (newData.dre) {
      dreSelectRef.value?.setSelectedValue(newData.dre)
    } else {
      dreSelectRef.value?.setSelectedValue(null)
    }
  },
  { immediate: true }
)

// Reglas de validación
const provinceRules = [
  v => !!ugelData.value.province_id || 'La provincia es requerida',
]

const dreRules = [
  v => !!ugelData.value.dre_id || 'La DRE es requerida',
]

const codeRules = [
  v => !!v || 'El código es requerido',
  v => (v && v.length <= 10) || 'El código debe tener máximo 10 caracteres',
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
    const isValid = await formUgelRef.value.validate()
    
    if (!isValid?.valid || !ugelData.value.province_id || !ugelData.value.dre_id) {
      return
    }

    // Preparar datos para enviar
    const payload = {
      province_id: ugelData.value.province_id,
      dre_id: ugelData.value.dre_id,
      code: ugelData.value.code,
      name: ugelData.value.name,
      phone: ugelData.value.phone || null,
      email: ugelData.value.email || null,
      address: ugelData.value.address || null,
      description: ugelData.value.description || null,
    }

    if (ugelData.value.id > 0) {
      // Actualiza una UGEL existente
      const updated = await updateUgel(ugelData.value.id, payload)
      emit('onSaved:data', updated.data || updated)
    } else {
      // Crea una nueva UGEL
      const created = await createUgel(payload)
      emit('onSaved:data', created.data || created)
    }
    
    emit('update:isDialogVisible', false)
    resetForm()
  } catch (error) {
    console.error('❌ Error al guardar UGEL:', error)
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
  ugelData.value = {
    id: 0,
    province_id: null,
    dre_id: null,
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    description: '',
  }
  provinceSelectRef.value?.setSelectedValue(null)
  dreSelectRef.value?.setSelectedValue(null)
  formUgelRef.value?.reset()
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

const onProvinceSelected = (val) => {
  ugelData.value.province_id = val?.id || null
}

const onDreSelected = async (val) => {
  dreSelected.value=val
  ugelData.value.dre_id = val?.id || null
  //verificando si se ha seleccionado una DRE para limpiar provincias
  if(!val){
    provinceSelectRef.value.setSelectedValue(null)
    provinceSelectRef.value.clearAllItems()
  }else{
    //nextsctick para que se actualice el parámetro antes de hacer la consulta
    await nextTick()
    provinceSelectRef.value.getDataFromApi()
  }
}

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
          {{ ugelData.id > 0 ? 'Editar' : 'Crear' }} UGEL
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
        <VForm ref="formUgelRef" @submit.prevent="onFormSubmit">
          <VRow class="mt-2">
            <VCol cols="12" md="6">
              <SingleSelect
                ref="dreSelectRef"
                :url-api="`${baseUrlCoes}/api-dres`"
                label="DRE *"
                @update:model-value="onDreSelected"
                :rules="dreRules"
                getDefault=""
                type-control="form-select"
              />
            </VCol>

            <VCol cols="12" md="6">
              <SingleSelect
                ref="provinceSelectRef"
                :url-api="`${baseUrlCoes}/api-provinces`"
                label="Provincia *"
                @update:model-value="onProvinceSelected"
                :filters="[{field:'region_id',operator:'=',value:dreSelected?.region_id || 0}]"
                :no-data-text="ugelData.dre_id ? 'No se encontraron provincias' : 'Seleccione una DRE para buscar'"
                :rules="provinceRules"
                type-control="form-select"
              />
            </VCol>

            <VCol cols="12" md="4">
              <AppTextField
                v-model="ugelData.code"
                label="Código *"
                placeholder="Ej: 010101"
                :rules="codeRules"
                :disabled="loading"
                counter="10"
                maxlength="10"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="8">
              <AppTextField
                v-model="ugelData.name"
                label="Nombre *"
                placeholder="Ej: UGEL LIMA SUR"
                :rules="nameRules"
                :disabled="loading"
                counter="255"
                maxlength="255"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="ugelData.phone"
                label="Teléfono"
                placeholder="Ej: 01-1234567"
                :disabled="loading"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12" md="6">
              <AppTextField
                v-model="ugelData.email"
                label="Correo Electrónico"
                placeholder="Ej: ugel@ejemplo.com"
                :rules="emailRules"
                :disabled="loading"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-model="ugelData.address"
                label="Dirección"
                placeholder="Ej: Av. Principal 123"
                :disabled="loading"
                variant="outlined"
              />
            </VCol>

            <VCol cols="12">
              <AppTextarea
                v-model="ugelData.description"
                label="Descripción"
                placeholder="Descripción detallada de la UGEL"
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
          {{ ugelData.id > 0 ? 'Actualizar' : 'Guardar' }}
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
