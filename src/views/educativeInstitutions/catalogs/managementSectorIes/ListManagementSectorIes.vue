<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useManagementSectorIes } from '@/composables/catalogIEs/useManagementSectorIes'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import FormManagementSectorIes from './FormManagementSectorIes.vue'

const { getManagementSectorIes, deleteManagementSectorIes, loading } = useManagementSectorIes()
const { hasPermission } = useVerifyPermissions()

const managementSectorIes = ref()
const managementSectorIe = ref({
  id: 0,
  code: '',
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
  { title: 'Código', filterColumnName: 'code', key: 'code', sortable: true, filterable: true },
  { title: 'Nombre', filterColumnName: 'name', key: 'name', sortable: true, filterable: true },
  { title: 'Descripción', filterColumnName: 'description', key: 'description', sortable: false, filterable: true },
  { title: '', key: 'actions', sortable: false, filterable: false },
]

onMounted(async () => {
  if (hasPermission('List')) {
    await get()
  } else {
    console.log('No tiene permiso para ver los sectores de gestión.')
  }
})

// Función para obtener los sectores de gestión
const get = async () => {
  try {
    managementSectorIes.value = await getManagementSectorIes(params.value, options.value.itemsPerPage, options.value.page)
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdateManagementSectorIe = async (managementSectorItem) => {
  const index = managementSectorIes.value.data.findIndex((e) => e.id === managementSectorItem.id)

  if (index !== -1) {
    managementSectorIes.value.data[index] = managementSectorItem
  } else {
    if (managementSectorIes.value.data.length >= options.value.itemsPerPage) {
      if (index === -1) {
        managementSectorIes.value.data.pop()
      }
    }
    managementSectorIes.value.data.unshift(managementSectorItem)
  }
}

const editManagementSectorIe = (managementSectorItem) => {
  isDialogVisible.value = true
  nextTick(() => {
    managementSectorIe.value = { ...managementSectorItem }
  })
}

const deleteManagementSectorIeQuestion = (managementSectorItem) => {
  deleteQuestion.value = true
  nextTick(() => {
    managementSectorIe.value = { ...managementSectorItem }
  })
}

const deletedManagementSectorIe = async () => {
  try {
    await deleteManagementSectorIes(managementSectorIe.value.id)
    managementSectorIes.value.data = managementSectorIes.value.data.filter((e) => e.id !== managementSectorIe.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar sector de gestión:', error)
  }
}

const resetManagementSectorIe = () => {
  managementSectorIe.value = {
    id: 0,
    code: '',
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
  <AppCardActions class="custom-app-card-actions" title="Sectores de Gestión" no-actions>
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
              @click="resetManagementSectorIe()"
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
                  title: 'Sectores de Gestión',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: managementSectorIes.data,
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
                  title: 'Sectores de Gestión',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: managementSectorIes.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="managementSectorIes?.data && managementSectorIes.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="managementSectorIes.data"
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
                @click="editManagementSectorIe(item)"
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
                @click="deleteManagementSectorIeQuestion(item)"
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
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, managementSectorIes?.meta.total || 0) }} de {{ managementSectorIes?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="managementSectorIes?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay sectores de gestión registrados.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormManagementSectorIes
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="managementSectorIe"
    @onSaved:data="insertOrUpdateManagementSectorIe($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar Sector de Gestión"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar el sector de gestión '${managementSectorIe.name}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedManagementSectorIe()"
    @cancel="deleteQuestion = false"
  />
</template>
