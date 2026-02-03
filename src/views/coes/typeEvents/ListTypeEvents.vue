<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useTypeEvents } from '@/composables/Coes/useTypeEvents'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import { nextTick, onMounted, ref } from 'vue'
import FormTypeEvent from './FormTypeEvent.vue'

const { getTypeEvents, deleteTypeEvent, loading } = useTypeEvents()
const { hasPermission } = useVerifyPermissions()

const typeEvents = ref({
  data: [],
  meta: { total: 0, last_page: 1 }
})
const typeEvent = ref({
  id: 0,
  name: '',
  code: '',
  status: true,
  connector_redaction: null,
  abbreviation: null,
  flg_dee: 0,
  flg_lluvias: 1,
})

const deleteQuestion = ref(false)
const isDialogVisible = ref(false)

const params = ref({
  search: { value: '' },
  sort: [{ field: 'id', direction: 'desc' }],
})

const options = ref({
  page: 1,
  itemsPerPage: 15,
  sortBy: [''],
  sortDesc: [false],
})

// Headers de la tabla
const headers = [
  { title: 'Código', filterColumnName: 'code', key: 'code', sortable: true, filterable: true },
  { title: 'Nombre', filterColumnName: 'name', key: 'name', sortable: true, filterable: true },
  { title: 'Abreviatura', filterColumnName: 'abbreviation', key: 'abbreviation', sortable: true, filterable: true },
  { title: 'Estado', filterColumnName: 'status', key: 'status', sortable: true, filterable: true },
  { title: 'Lluvias', filterColumnName: 'flg_lluvias', key: 'flg_lluvias', sortable: true, filterable: true },
  { title: 'DEE', filterColumnName: 'flg_dee', key: 'flg_dee', sortable: true, filterable: true },
  { title: '', key: 'actions', sortable: false, filterable: false },
]

onMounted(async () => {
  if (hasPermission('List')) {
    await get()
  } else {
    console.log('No tiene permiso para ver los tipos de eventos.')
  }
})

// Función para obtener los tipos de eventos
const get = async () => {
  try {
    const response = await getTypeEvents(params.value, options.value.itemsPerPage, options.value.page)
    typeEvents.value = response
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdateTypeEvent = async (typeEventItem) => {
  // buscar en el array de type events si el tipo de evento ya existe
  const index = typeEvents.value.data.findIndex((m) => m.id === typeEventItem.id)
  
  if (index !== -1) {
    // si existe, actualizarlo
    typeEvents.value.data[index] = typeEventItem
  } else {
    // verificar si existe la cantidad del paginado
    if(typeEvents.value.data.length >= options.value.itemsPerPage){
      // eliminar el último elemento si se va a agregar uno nuevo
      if(index === -1){
        typeEvents.value.data.pop()
      }
    }
    // si no existe, agregarlo al inicio
    typeEvents.value.data.unshift(typeEventItem)
  }
}

const editTypeEvent = (typeEventItem) => {
  isDialogVisible.value = true
  nextTick(() => {
    typeEvent.value = { ...typeEventItem }
  })
}

const deleteTypeEventQuestion = (typeEventItem) => {
  deleteQuestion.value = true
  nextTick(() => {
    typeEvent.value = { ...typeEventItem }
  })
}

const deletedTypeEvent = async () => {
  try {
    await deleteTypeEvent(typeEvent.value.id)
    typeEvents.value.data = typeEvents.value.data.filter((e) => e.id !== typeEvent.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar tipo de evento:', error)
  }
}

const resetTypeEvent = () => {
  typeEvent.value = {
    id: 0,
    name: '',
    code: '',
    status: true,
    connector_redaction: null,
    abbreviation: null,
    flg_dee: 0,
    flg_lluvias: 1,
  }
  isDialogVisible.value = true
}

// Aplicar filtros
const applyFilters = async (filters) => {
  params.value.filters = filters
  await get()
}
</script>

<template>
  <AppCardActions class="custom-app-card-actions" title="Listado de tipos de peligros" no-actions>
    <template #before-actions>
      <div class="d-flex flex-wrap ga-2">
        <VTextField
          v-if="hasPermission('List')"
          style="float: inline-start; inline-size: 200px;"
          placeholder="Buscar..."
          prepend-inner-icon="tabler-search"
          v-model="params.search.value"
          variant="solo"
          density="compact"
          clearable
          @keyup.enter="get()"
          @click:clear="get()"
        />
        <FilterForm :columns="headers" @apply-filters="applyFilters($event)" />
        <VTooltip text="Agregar" v-if="hasPermission('Create')">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              size="small"
              color="success"
              icon="tabler-square-plus"
              rounded
              @click="resetTypeEvent()"
            />
          </template>
        </VTooltip>
        <VTooltip text="Imprimir" v-if="hasPermission('List')">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              size="small"
              color="secondary"
              icon="tabler-printer"
              rounded
              @click="
                printTable({
                  title: 'Listado de Tipos de Eventos',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: typeEvents.data,
                })
              "
            />
          </template>
        </VTooltip>
        <VTooltip text="Exportar" v-if="hasPermission('List')">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              size="small"
              color="info"
              icon="tabler-file-export"
              rounded
              @click="
                exportExcelTable({
                  title: 'Listado de Tipos de Eventos',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: typeEvents.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="typeEvents?.data && typeEvents.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="typeEvents.data"
      :items-per-page="options.itemsPerPage"
      height="calc(100vh - 300px)"
    >
    <template #item.status="{ item }">
      <div class="text-center" >
        {{ item.status ? 'Activo' : 'Inactivo' }}
      </div>
    </template>
    <template #item.flg_lluvias="{ item }">
      <div class="text-center" >
        {{ item.flg_lluvias === 1 ? 'Lluvias' : 'Otros Peligros' }}
      </div>
    </template>
    <template #item.flg_dee="{ item }">
      <div class="text-center" >
        {{ item.flg_dee ? 'Sí' : 'No' }}
      </div>
    </template>
      <!-- Acciones -->
      <template #item.actions="{ item }">
        <div class="d-flex justify-end">
          <VTooltip text="Editar" v-if="hasPermission('Edit')">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                size="small"
                color="success"
                icon="tabler-edit"
                variant="text"
                @click="editTypeEvent(item)"
              />
            </template>
          </VTooltip>

          <VTooltip text="Eliminar" v-if="hasPermission('Delete')">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                size="small"
                color="error"
                icon="tabler-trash"
                variant="text"
                @click="deleteTypeEventQuestion(item)"
              />
            </template>
          </VTooltip>
        </div>
      </template>

      <template #bottom>
        <VCardText class="pt-2">
          <div class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2">
            <VSelect
              v-model="options.itemsPerPage"
              :items="[15, 25, 50, 100]"
              label="Filas:"
              variant="underlined"
              style="max-inline-size: 4rem; min-inline-size: 2rem;"
              @update:model-value="(options.page = 1), get()"
            />
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, typeEvents?.meta.total || 0) }} de {{ typeEvents?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="typeEvents?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay tipos de eventos registrados.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormTypeEvent
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="typeEvent"
    @onSaved:data="insertOrUpdateTypeEvent($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar Tipo de Evento"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar el tipo de evento '${typeEvent.name}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedTypeEvent()"
    @cancel="deleteQuestion = false"
  />
</template>
