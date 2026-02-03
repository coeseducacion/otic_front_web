<script setup>
import PdfViewer from '@/components/dialogs/PdfViewer.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useAlerts } from '@/composables/alertIEs/useAlert'
import { nextTick, onMounted, ref } from 'vue'
import DetailAlert from './DetailAlert.vue'
import SingleSelect from '@/components/selects/SingleSelect.vue'
import SelectDreUgel from '@/components/accesDreUgel/SelectDreUgel.vue'




const { getAlerts, deleteAlert, patchAlert, loading } = useAlerts()


const { hasPermission } = useVerifyPermissions()


const alerts = ref()
const alert = ref({
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

const dresAccess = ref([]);
const deleteQuestion = ref(false)
const isDialogVisible = ref(false)
const isDialogDetailVisible = ref(false)
const showPdfDialog = ref(false)

const params = ref({
  search: { value: '' },
  includes: [
    { relation: 'typeEvent' },
    { relation: 'district.province.region' },
    { relation: 'evidences' },
    { relation: 'user.rol' },
    { relation: 'alertEducativeInstitutions.IE.educationLevel' }
  ],
  sort : [
        {field : 'id', direction : 'desc'}
  ]
})
const pdfUrl = ref('')
const options = ref({
  page: 1,
  itemsPerPage: 15,
  sortBy: [''],
  sortDesc: [false],
})

const headers = [
  { title: 'Fecha', key: 'date', filterColumnName:'date' ,sortable: false ,filterable: true},
  { title: 'Título', key: 'title', filterColumnName:'title' ,sortable: true, filterable: true },
  { title: 'Peligro', key: 'type_event.name', filterColumnName:'typeEvent.name', sortable: false ,filterable: true},
  { title: 'Región', key: 'district.province.region.name', filterColumnName:'district.province.region.name', sortable: false, filterable: true },
  { title: 'Provincia', key: 'district.province.name', filterColumnName:'district.province.name', sortable: false, filterable: true },
  { title: 'Distrito', key: 'district.name', filterColumnName:'district.name', sortable: false, filterable: true },
  { title: 'I.E.', key: 'i_e', filterColumnName:'alertEducativeInstitutions.IE.name_ie' ,sortable: false, filterable: true },
  { title: 'Resuelto', key: 'is_resolved', filterColumnName:'is_resolved', sortable: false, filterable: true },
  { title: 'Estado', key: 'is_active', filterColumnName:'is_active', sortable: false, filterable: true },
  { title: '', key: 'actions', sortable: false, filterable: false },
]

onMounted(async () => {
  
  if (hasPermission('List')) { // si tiene permiso de listado carga los datos de la api
    //await get()
  }
})

const get = async () => {
  try {
    alerts.value = await getAlerts(params.value, options.value.itemsPerPage, options.value.page)
    console.log('✅ Alertas cargadas:', alerts.value)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

const insertOrUpdateAlert = async (alrt) => {
  const index = alerts.value.data.findIndex((a) => a.id === alrt.id)
  if (index !== -1) {
    alerts.value.data[index] = alrt
  } else {
    if (alerts.value.data.length >= options.value.itemsPerPage) {
      if (index === -1) {
        alerts.value.data.pop()
      }
    }
    alerts.value.data.unshift(alrt.data)
  }
}

const editAlert = (alrt) => {
  isDialogVisible.value = true
  nextTick(() => {
    alert.value = alrt
  })
}

const addAlert = () => {
  alert.value = {
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
  isDialogVisible.value = true
}

const deleteAlertQuestion = (alrt) => {
  deleteQuestion.value = true
  nextTick(() => {
    alert.value = alrt
  })
}

const deletedAlert = async () => {
  try {
    await deleteAlert(alert.value.id)
    alerts.value.data = alerts.value.data.filter((a) => a.id !== alert.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('❌ Error al eliminar alerta:', error)
  }
}

const applyFilters = async (filters) => {
  params.value.filters = filters
  await get()
}
//funcion para abrir el pdf en otra pestaña
const getPdfAlert = (alrt) => {
  // obtenemos la base url de la api y le agregamos el endpoint para obtener el pdf
  const pdfUrlTemp = `${import.meta.env.VITE_API_BASE_URL}/alerts/${alrt.id}/pdf`
  // window.open(pdfUrlTemp, '_blank')

  alert.value = { ...alrt }
  pdfUrl.value = pdfUrlTemp
  // console.log('PDF URL:', pdfUrl.value) 
  showPdfDialog.value = true
}

//funcion para colocar en mayusculas la primera letra de cada palabra
const capitalizeWords = (str) => {
  //volver siempre a minusucolas todo
  str = str.toLowerCase();
  //capitalizar primera letra de cada palabra
  return str.replace(/\b\w/g, char => char.toUpperCase());
};





// url base de la api de priorizaciones
// const baseUrlPriorization=import.meta.env.VITE_API_SEMOVA_URL;
const baseUrlCoes=import.meta.env.VITE_API_COES_URL;
console.log('Base URL COES:', baseUrlCoes);

</script>

<template>
<AppCardActions
  title="Lista de Alertas"
  class="custom-app-card-actions"
  no-actions
>
  <template #before-actions>
    <div class="d-flex flex-wrap ga-2" >
        <SelectDreUgel/>
    <VTextField v-if="hasPermission('List')"
          style="float: inline-start;inline-size: 200px;"
          variant="solo"
          placeholder="Buscar..."
          density="compact"
          prepend-inner-icon="tabler-search"
          v-model="params.search.value"
          clearable
          @keyup.enter="get()"
          @click:clear="get()"
        />

    <FilterForm :columns="headers" @apply-filters="applyFilters($event)" />

    <VTooltip text="Imprimir" v-if="hasPermission('List')">
      <template #activator="{ props }">
        <VBtn
          v-bind="props"
          size="small"
          color="secondary"
          icon="tabler-printer"
          rounded
          @click="printTable({
            title: 'Lista de Alertas',
            columns: headers.filter(h => h.key !== 'actions'),
            data: alerts.data
          })"
        />
      </template>
    </VTooltip>
    <VTooltip text="Exportar">
      <template #activator="{ props }">
        <VBtn
          v-bind="props"
          size="small"
          color="info"
          icon="tabler-file-export"
          rounded
          @click="exportExcelTable({
            title: 'Lista de Alertas',
            columns: headers.filter(h => h.key !== 'actions'),
            data: alerts.data
          })"
        />
      </template>
    </VTooltip>
    </div>
  </template>
  <VSkeletonLoader
    v-if="loading && !alerts?.data"
    type="table"
  />
  <VDataTable
    v-else-if="alerts?.data  && hasPermission('List')"
    :headers="headers"
    :items="alerts.data"
    :items-per-page="options.itemsPerPage"
    height="calc(100vh - 300px)"
  >
   <template #item.date="{ item }">
    <div class="text-justify" >{{ item.date ? item.date.split('-').reverse().join('/') : 'N/A' }}
    {{ item.time ? (item.time.match(/\d{2}:\d{2}/)?.[0] ?? item.time) : 'N/A' }}</div>
  </template>
  <template #item.district.province.region.name="{ item }">
    {{ item.district.province.region.name ? capitalizeWords(item.district.province.region.name) : 'N/A' }}
  </template>
  <template #item.district.province.name="{ item }">
    {{ item.district.province.name ? capitalizeWords(item.district.province.name) : 'N/A' }}
  </template>
  <template #item.district.name="{ item }">
    {{ item.district.name ? capitalizeWords(item.district.name) : 'N/A' }}
  </template>

  <template #item.i_e="{ item }">
    {{ item.alert_educative_institutions.length > 0
      ? capitalizeWords(item.alert_educative_institutions[0].i_e.name_ie) : 'N/A' }}
  
  </template>
  
  <template #item.is_resolved="{ item }">
    <!-- <VChip
          class="mx-2"
          :color="item.is_resolved ? 'success' : 'error'"
          small
        >
          {{ item.is_resolved ? 'Sí' : 'No' }}
        </VChip> -->
        <VTooltip :text="item.is_resolved ? 'Resuelto' : 'No Resuelto'">
      <template #activator="{ props }">
        <VSwitch
          v-bind="props"
          :disabled="loading"
          v-model="item.is_resolved"
          :color="item.is_resolved ? 'success' : 'error'"
          @update:model-value="patchAlert(item.id, { is_resolved: item.is_resolved })"
        />
      </template>
    </VTooltip>
  </template>
  <template #item.is_active="{ item }">
    <VTooltip :text="item.is_active ? 'Activo' : 'Inactivo'">
      <template #activator="{ props }">
        <VSwitch
          v-bind="props"
          :disabled="loading"
          v-model="item.is_active"
          :color="item.is_active ? 'success' : 'error'"
          @update:model-value="patchAlert(item.id, { is_active: item.is_active })"
        />
      </template>
    </VTooltip>
  </template>
  <template #item.actions="{ item }">  
    
<!-- grouped flat buttons con tooltip -->
      <VBtnGroup variant="text" class="ms-3" rounded>
        
    <!-- <VMenu location="left">
      <template #activator="{ props }">
        <VBtn v-bind="props"
              size="x-small"
              color="info"
              variant="text" >
          <VIcon v-bind="props">tabler-circle-arrow-right</VIcon>
        </VBtn>
      </template>

      <VList >
        <VListItem
          v-if="hasPermission(['Edit'])"
          @click="isDialogDetailVisible = true; alert = item"
        >
          <VListItemTitle>
            <VIcon size="xs" >tabler-file-description</VIcon>
            Detalles
          </VListItemTitle>
        </VListItem>
        <VListItem
          v-if="hasPermission(['Edit'])"
          @click="editAlert(item)"
        >
          <VListItemTitle>
            <VIcon size="xs" >tabler-pdf</VIcon>
            Ver PDF
          </VListItemTitle>
        </VListItem>
        </VList>

    </VMenu>  -->
        <VTooltip text="Detalles">
          <template #activator="{ props }">
            <VBtn 
              v-bind="props"
              size="small"
              variant="text"
              icon="tabler-file-description"
              color="success"
              @click="isDialogDetailVisible = true; alert = item"
            />
          </template>
        </VTooltip>

        <VTooltip text="Obtener PDF" >
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              size="small"
              variant="text"
              icon="tabler-file-type-pdf"
              color="error"
              @click="getPdfAlert(item)"
            />
          </template>
        </VTooltip>
      </VBtnGroup>
    </template>
    <template #bottom>
      <VCardText class="pt-2">
        <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">
          <VSelect
            v-model="options.itemsPerPage"
            :items="[15, 25, 50, 100]"
            label="Filas:"
            variant="underlined"
            style="max-inline-size: 4rem;min-inline-size: 2rem;"
            @update:model-value="options.page=1; get()"
          />
          <VPagination
            v-model="options.page"
            :total-visible="$vuetify.display.smAndDown ? 3 : 4"
            :length="alerts?.meta.last_page"
            @update:model-value="get()"
          />
        </div>
      </VCardText>
    </template>
  </VDataTable>

</AppCardActions>
<!-- <FormAlert
  v-model:is-dialog-visible="isDialogVisible"
  v-model:data="alert"
  @onSaved:data="insertOrUpdateAlert($event)"
/> -->
<DetailAlert
  :alert="alert"
  v-model:is-dialog-visible="isDialogDetailVisible"
/>

<VSnackbar
  v-model="deleteQuestion"
  vertical
  location="center"
>
  Estás a punto de eliminar <strong>{{ alert.title }}</strong>. ¿Estás seguro de continuar?
  <template #actions>
    <VBtn
      color="error"
      @click="deletedAlert()"
    >
      Eliminar
    </VBtn>
    <VBtn
      color="success"
      @click="deleteQuestion = false"
    >
      Cancelar
    </VBtn>
  </template>
</VSnackbar>

<PdfViewer
  v-model:is-dialog-visible="showPdfDialog"
  :pdf-url="pdfUrl"
  :title="`Alerta MINEDU : ${ alert && alert.id ? String(alert.id).padStart(4, '0') : '' } - ${ alert && alert.date ? String(alert.date).split('T')[0].split('-')[0] : '' }`"
/>

</template>

