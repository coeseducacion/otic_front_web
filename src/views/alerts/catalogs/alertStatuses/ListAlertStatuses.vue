<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useAlertStatuses } from '@/composables/catalogAlerts/useAlertStatuses'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import FormAlertStatuses from './FormAlertStatuses.vue'

const { getAlertStatuses, deleteAlertStatuses, loading } = useAlertStatuses()
const { hasPermission } = useVerifyPermissions()

const alertStatuses = ref()
const alertStatus = ref({
  id: 0,
  name: '',
  description: '',
  parent_requireds: [],
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
  { title: 'Estados Padres', filterColumnName: 'parent_requireds', key: 'parent_requireds', sortable: false, filterable: false },
  { title: '', key: 'actions', sortable: false, filterable: false },
]

onMounted(async () => {
  if (hasPermission('List')) {
    await get()
  } else {
    console.log('No tiene permiso para ver los estados de alerta.')
  }
})

// Función para obtener los estados de alerta
const get = async () => {
  try {
    alertStatuses.value = await getAlertStatuses(params.value, options.value.itemsPerPage, options.value.page)
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdateAlertStatus = async (alertStatusItem) => {
  const index = alertStatuses.value.data.findIndex((e) => e.id === alertStatusItem.id)

  if (index !== -1) {
    alertStatuses.value.data[index] = alertStatusItem
  } else {
    if (alertStatuses.value.data.length >= options.value.itemsPerPage) {
      if (index === -1) {
        alertStatuses.value.data.pop()
      }
    }
    alertStatuses.value.data.unshift(alertStatusItem)
  }
}

const editAlertStatus = (alertStatusItem) => {
  isDialogVisible.value = true
  nextTick(() => {
    alertStatus.value = { ...alertStatusItem }
  })
}

const deleteAlertStatusQuestion = (alertStatusItem) => {
  deleteQuestion.value = true
  nextTick(() => {
    alertStatus.value = { ...alertStatusItem }
  })
}

const deletedAlertStatus = async () => {
  try {
    await deleteAlertStatuses(alertStatus.value.id)
    alertStatuses.value.data = alertStatuses.value.data.filter((e) => e.id !== alertStatus.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar estado de alerta:', error)
  }
}

const resetAlertStatus = () => {
  alertStatus.value = {
    id: 0,
    name: '',
    description: '',
    parent_requireds: [],
  }
  isDialogVisible.value = true
}

// Aplicar filtros
const applyFilters = async (filters) => {
  params.value.filters = filters
  await get()
}

// Función para obtener los nombres de los estados padres
const getParentRequiredsNames = (item) => {
  if (!item.parent_requireds || item.parent_requireds.length === 0) {
    return 'N/A'
  }
  
  // Si parent_requireds es un array de objetos
  if (Array.isArray(item.parent_requireds) && item.parent_requireds.length > 0 && typeof item.parent_requireds[0] === 'object') {
    return item.parent_requireds.map(p => p.name).join(', ')
  }
  
  // Si parent_requireds es JSON string
  if (typeof item.parent_requireds === 'string') {
    try {
      const parsed = JSON.parse(item.parent_requireds)
      if (Array.isArray(parsed)) {
        return parsed.map(p => typeof p === 'object' ? p.name : p).join(', ')
      }
    } catch (e) {
      return item.parent_requireds
    }
  }
  
  return JSON.stringify(item.parent_requireds)
}
</script>

<template>
  <AppCardActions class="custom-app-card-actions" title="Estados de Alerta" no-actions>
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
              @click="resetAlertStatus()"
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
                  title: 'Estados de Alerta',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: alertStatuses.data,
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
                  title: 'Estados de Alerta',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: alertStatuses.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="alertStatuses?.data && alertStatuses.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="alertStatuses.data"
      :items-per-page="options.itemsPerPage"
      height="calc(100vh - 300px)"
    >
      <!-- Estados Padres Requeridos -->
      <template #item.parent_requireds="{ item }">
        <VChip
          v-if="getParentRequiredsNames(item) !== 'N/A'"
          label
          size="small"
          color="info"
        >
          {{ getParentRequiredsNames(item) }}
        </VChip>
        <span v-else class="text-grey">N/A</span>
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
                @click="editAlertStatus(item)"
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
                @click="deleteAlertStatusQuestion(item)"
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
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, alertStatuses?.meta.total || 0) }} de {{ alertStatuses?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="alertStatuses?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay estados de alerta registrados.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormAlertStatuses
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="alertStatus"
    @onSaved:data="insertOrUpdateAlertStatus($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar Estado de Alerta"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar el estado de alerta '${alertStatus.name}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedAlertStatus()"
    @cancel="deleteQuestion = false"
  />
</template>
