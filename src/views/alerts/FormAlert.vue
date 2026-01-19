<script setup>
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import SingleSelect from '@/components/selects/SingleSelect.vue'
import { useAlerts } from '@/composables/alertIEs/useAlert'
import { useTypeEvents } from '@/composables/Catalogs/useTypeEvents'
import { useUbigeo } from '@/composables/useUbigeo'
import { useDebounce } from '@/utils/debounce'

const { createAlert, updateAlert, loading } = useAlerts()
const { getTypeEvents, loading: loadingTypeEvents } = useTypeEvents()
const { getDistrictWithRegion, loading: loadingUbigeo } = useUbigeo()


const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      type_event_id: null,
      region_id: null,
      province_id: null,
      district_id: null,
      title: '',
      message: '',
      date: '',
      time: '',
      latitude: null,
      longitude: null,
      is_sended: false,
      is_damage: true,
      is_active: true,
      is_resolved: false,
      user_id: null,
      is_guest: false,
      guest_name: '',
      guest_document: '',
      guest_phone: '',
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

const alertData = ref({
  id: 0,
  type_event_id: null,
  region_id: null,
  province_id: null,
  district_id: null,
  title: '',
  message: '',
  date: '',
  time: '',
  latitude: null,
  longitude: null,
  is_sended: false,
  is_damage: true,
  is_active: true,
  is_resolved: false,
  user_id: null,
  is_guest: false,
  guest_name: '',
  guest_document: '',
  guest_phone: '',
})
const typeEvents = ref([])
const districts = ref([])
const searchText = ref('')// para el autocompletado de distritos
const isSelecting = ref(false)// para controlar si se está seleccionando una opción

const formAlertRef = ref(null)



// Observa los cambios en las propiedades y actualiza los datos de la alerta
watch(
  () => props.data,
  (newData) => {
    alertData.value = { ...newData }
  },
  { immediate: true }
)

// Función que se lanza al ser montado
onMounted(async () => {
  try {
    const [typeEventsList,districtsList] = await Promise.all([
      getTypeEvents(),
      getDistrictWithRegion({
    search: { value: '' },
    includes: [{ relation: 'province.region' }]}),
    ])
    typeEvents.value = typeEventsList
    districts.value = districtsList
  } catch (error) {
    console.error('❌ Error al cargar datos:', error)
  }
})

/**
 * Maneja el envío del formulario.
 * Verifica si el formulario es válido antes de crear o actualizar una alerta.
 */
const onFormSubmit = async () => {
  try {
    // Verificar si el formulario es válido
    const isValid = await formAlertRef.value.validate()
    
    if (!isValid?.valid) {
      return
    }
    if (alertData.value.id > 0) {
      // Actualiza una alerta existente
      await updateAlert(alertData.value.id, alertData.value)
    } else {
      // Crea una nueva alerta
      const createdAlert = await createAlert(alertData.value)
      alertData.value = createdAlert
    }
    emit('update:isDialogVisible', false)
    emit('onSaved:data', alertData.value)
  } catch (error) {
    console.error('❌ Error al guardar alerta:', error)
  }
}

/**
 * Reinicia el formulario y cierra el diálogo.
 */
const onFormReset = () => {
  alertData.value = {
    id: 0,
    type_event_id: null,
    region_id: null,
    province_id: null,
    district_id: null,
    title: '',
    message: '',
    date: '',
    time: '',
    latitude: null,
    longitude: null,
    is_sended: false,
    is_damage: true,
    is_active: true,
    is_resolved: false,
    user_id: null,
    is_guest: false,
    guest_name: '',
    guest_document: '',
    guest_phone: '',
  }
  emit('update:isDialogVisible', false)
  emit('update:data', alertData.value)
}

/**
 * Maneja el cierre del diálogo y reinicia los datos de la alerta.
 * @param {boolean} val - Indica si el diálogo debe estar visible o no.
 */
const dialogModelValueUpdate = (val) => {
  alertData.value = {
    id: 0,
    type_event_id: null,
    region_id: null,
    province_id: null,
    district_id: null,
    title: '',
    message: '',
    date: '',
    time: '',
    latitude: null,
    longitude: null,
    is_sended: false,
    is_damage: true,
    is_active: true,
    is_resolved: false,
    user_id: null,
    is_guest: false,
    guest_name: '',
    guest_document: '',
    guest_phone: '',
  }
  emit('update:isDialogVisible', val)
  emit('update:data', alertData.value)
}

//funcion para obtener el ubigeo de la alerta
// Modifica getDistricts:
const getDistricts = useDebounce(async (searchText) => {
  console.log('disparando buscador:', searchText)
  
  const params = {
    search: { value: searchText },
    includes: [{ relation: 'province.region' }]
  }
  const response = await getDistrictWithRegion(params)
  districts.value = response
  console.log('Buscando distritos:', districts.value)
}, 500)
// Agrega función para detectar selección:
const onDistrictSelect = () => {
  console.log('Distrito seleccionado:', alertData.value.district_id)
  isSelecting.value = true
  //buscamos el distrito seleccionado para obtener su provincia y region
  const selectedDistrict = districts.value.data.find(d => d.id === alertData.value.district_id)
  if (selectedDistrict) {
    alertData.value.province_id = selectedDistrict.province.id
    alertData.value.region_id = selectedDistrict.province.region.id
  }
}

// funcion computata para obtener el nombre de la region a partir del distrito
const getDistrictFullName = (district) => {
  if (!district) return ''
  
  if (district.province && district.province.region) {
    return `${district.name} / ${district.province.name} / ${district.province.region.name}`
  }
  if (district.province) {
    return `${district.name} / ${district.province.name}`
  }
  return district.name
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 800"
    :model-value="props.isDialogVisible"
    persistent=""
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <!-- <DialogCloseBtn @click="dialogModelValueUpdate(false)" /> -->

    <VCard>
      <!-- 👉 Title -->
      <VCardTitle class="bg-primary" >{{ alertData.id > 0 ? 'Editar Alerta' : 'Crear Alerta' }}
        
        <VBtn style="float: inline-end;"
          icon="tabler-x"
          flat=""
          @click="dialogModelValueUpdate(false)"
        />
      </VCardTitle>
      <VCardText class="pa-6">
        <!-- 👉 Form -->
        <VForm ref="formAlertRef"
          class="mt-6"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- 👉 Type Event -->
            <VCol cols="12" md="6">
              <AppSelect
                v-model="alertData.type_event_id"
                label="Tipo de Evento"
                :items="typeEvents.data"
                item-title="name"
                item-value="id"
                clearable
                placeholder="Seleccionar tipo de evento"
                :rules="[requiredValidator('El Tipo de Evento')]"
              />
            </VCol>

            <!-- 👉 Region -->
            <!-- <VCol cols="12" md="6">
              <AppSelect
                v-model="alertData.region_id"
                label="Región"
                :items="regions.data"
                item-title="name"
                item-value="id"
                clearable
                placeholder="Seleccionar región"
              />
            </VCol> -->

            <!-- 👉 Province -->
            <!-- <VCol cols="12" md="6">
              <AppSelect
                v-model="alertData.province_id"
                label="Provincia"
                :items="provinces.data"
                item-title="name"
                item-value="id"
                clearable
                placeholder="Seleccionar provincia"
              />
            </VCol> -->

            <!-- 👉 District -->
            <VCol cols="12" md="6">
              <!-- <AppAutocomplete
                v-model="alertData.district_id"
                v-model:search="searchText"
                @update:search="getDistricts"
                label="Ubicación"
                :items="districts.data"
                item-value="id"
                @update:model-value="onDistrictSelect"
                @click="console.log('append clicked')"
                item-title="name"
                clearable
                placeholder="Seleccionar ubicación"
              /> -->
              <SingleSelect url-api="/districts-with-region"/>
            </VCol>

            <!-- 👉 Title -->
            <VCol cols="12">
              <AppTextField
                v-model="alertData.title"
                label="Título"
                maxlength="100"
                :rules="[requiredValidator('El Título')]"
              />
            </VCol>

            <!-- 👉 Message -->
            <VCol cols="12">
              <VTextarea
                v-model="alertData.message"
                label="Mensaje"
                :rows="2"
                :rules="[requiredValidator('El Mensaje')]"
              />
            </VCol>

            <!-- 👉 Date -->
            <VCol cols="12" md="3">
              <AppTextField
                v-model="alertData.date"
                label="Fecha"
                type="date"
                :rules="[requiredValidator('La Fecha')]"
              />
            </VCol>

            <!-- 👉 Time -->
            <VCol cols="12" md="3">
              <AppTextField
                v-model="alertData.time"
                label="Hora"
                type="time"
                step="1"
                :rules="[requiredValidator('La Hora')]"
              />
            </VCol>

            <!-- 👉 Latitude -->
            <VCol cols="12" md="3">
              <AppTextField
                v-model="alertData.latitude"
                label="Latitud"
                type="number"
                step="0.0000001"
              />
            </VCol>

            <!-- 👉 Longitude -->
            <VCol cols="12" md="3">
              <AppTextField
                v-model="alertData.longitude"
                label="Longitud"
                type="number"
                step="0.0000001"
              />
            </VCol>

            <!-- 👉 Is Sended -->
            <VCol cols="12" md="3">
              <VSwitch
                v-model="alertData.is_sended"
                label="Enviado"
              />
            </VCol>

            <!-- 👉 Is Damage -->
            <VCol cols="12" md="3">
              <VSwitch
                v-model="alertData.is_damage"
                label="Daño"
              />
            </VCol>

            <!-- 👉 Is Active -->
            <VCol cols="12" md="3">
              <VSwitch
                v-model="alertData.is_active"
                label="Activo"
              />
            </VCol>

            <!-- 👉 Is Resolved -->
            <VCol cols="12" md="3">
              <VSwitch
                v-model="alertData.is_resolved"
                label="Resuelto"
              />
            </VCol>

            <!-- 👉 Is Guest -->
            <VCol cols="12">
              <VSwitch
                v-model="alertData.is_guest"
                label="Es Invitado"
              />
            </VCol>

            <!-- 👉 Guest Name -->
            <VCol v-if="alertData.is_guest" cols="12" md="6">
              <AppTextField
                v-model="alertData.guest_name"
                label="Nombre del Invitado"
                maxlength="120"
              />
            </VCol>

            <!-- 👉 Guest Document -->
            <VCol v-if="alertData.is_guest" cols="12" md="6">
              <AppTextField
                v-model="alertData.guest_document"
                label="Documento del Invitado"
                maxlength="20"
              />
            </VCol>

            <!-- 👉 Guest Phone -->
            <VCol v-if="alertData.is_guest" cols="12" md="6">
              <AppTextField
                v-model="alertData.guest_phone"
                label="Teléfono del Invitado"
                maxlength="20"
              />
            </VCol>

            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <VBtn type="submit" :loading="loading">
                <VIcon
                  start
                  icon="tabler-device-floppy"
                />
                Guardar
              </VBtn>

              <VBtn
                color="secondary"
                variant="tonal"
                @click="onFormReset"
              >
                <VIcon
                  start
                  icon="tabler-x"
                />
                Cancelar
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
