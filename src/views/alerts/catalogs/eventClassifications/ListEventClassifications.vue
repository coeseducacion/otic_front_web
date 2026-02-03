<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useEventClassifications } from '@/composables/catalogAlerts/useEventClassifications'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import FormEventClassifications from './FormEventClassifications.vue'

const { getEventClassifications, deleteEventClassifications, loading } = useEventClassifications()
const { hasPermission } = useVerifyPermissions()

const eventClassifications = ref()
const eventClassification = ref({
  id: 0,
  name: '',
  description: '',
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
  { title: 'Nombre', filterColumnName: 'name', key: 'name', sortable: true, filterable: true },
  { title: 'Descripción', filterColumnName: 'description', key: 'description', sortable: false, filterable: true },
  { title: '', key: 'actions', sortable: false, filterable: false },
]

onMounted(async () => {
  if (hasPermission('List')) {
    await get()
  } else {
    console.log('No tiene permiso para ver las clasificaciones de eventos.')
  }
})

// Función para obtener las clasificaciones de eventos
const get = async () => {
  try {
    eventClassifications.value = await getEventClassifications(params.value, options.value.itemsPerPage, options.value.page)
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdateEventClassification = async (eventClassificationItem) => {
  const index = eventClassifications.value.data.findIndex((e) => e.id === eventClassificationItem.id)

  if (index !== -1) {
    eventClassifications.value.data[index] = eventClassificationItem
  } else {
    if (eventClassifications.value.data.length >= options.value.itemsPerPage) {
      if (index === -1) {
        eventClassifications.value.data.pop()
      }
    }
    eventClassifications.value.data.unshift(eventClassificationItem)
  }
}

const editEventClassification = (eventClassificationItem) => {
  isDialogVisible.value = true
  nextTick(() => {
    eventClassification.value = { ...eventClassificationItem }
  })
}

const deleteEventClassificationQuestion = (eventClassificationItem) => {
  deleteQuestion.value = true
  nextTick(() => {
    eventClassification.value = { ...eventClassificationItem }
  })
}

const deletedEventClassification = async () => {
  try {
    await deleteEventClassifications(eventClassification.value.id)
    eventClassifications.value.data = eventClassifications.value.data.filter((e) => e.id !== eventClassification.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar clasificación de evento:', error)
  }
}

const resetEventClassification = () => {
  eventClassification.value = {
    id: 0,
    name: '',
    description: '',
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
  <AppCardActions class="custom-app-card-actions" title="Clasificaciones de Eventos" no-actions>
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
              @click="resetEventClassification()"
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
                  title: 'Clasificaciones de Eventos',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: eventClassifications.data,
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
                  title: 'Clasificaciones de Eventos',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: eventClassifications.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="eventClassifications?.data && eventClassifications.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="eventClassifications.data"
      :items-per-page="options.itemsPerPage"
      height="calc(100vh - 300px)"
    >
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
                @click="editEventClassification(item)"
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
                @click="deleteEventClassificationQuestion(item)"
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
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, eventClassifications?.meta.total || 0) }} de {{ eventClassifications?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="eventClassifications?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay clasificaciones de eventos registradas.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormEventClassifications
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="eventClassification"
    @onSaved:data="insertOrUpdateEventClassification($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar Clasificación de Evento"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar la clasificación de evento '${eventClassification.name}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedEventClassification()"
    @cancel="deleteQuestion = false"
  />
</template>
