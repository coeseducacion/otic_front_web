<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useShiftTypeIes } from '@/composables/catalogIEs/useShiftTypeIes'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import FormShiftTypeIes from './FormShiftTypeIes.vue'

const { getShiftTypeIes, deleteShiftTypeIes, loading } = useShiftTypeIes()
const { hasPermission } = useVerifyPermissions()

const shiftTypeIes = ref()
const shiftTypeIe = ref({
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
    console.log('No tiene permiso para ver los tipos de turno.')
  }
})

// Función para obtener los tipos de turno
const get = async () => {
  try {
    shiftTypeIes.value = await getShiftTypeIes(params.value, options.value.itemsPerPage, options.value.page)
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdateShiftTypeIe = async (shiftTypeIeItem) => {
  const index = shiftTypeIes.value.data.findIndex((e) => e.id === shiftTypeIeItem.id)

  if (index !== -1) {
    shiftTypeIes.value.data[index] = shiftTypeIeItem
  } else {
    if (shiftTypeIes.value.data.length >= options.value.itemsPerPage) {
      if (index === -1) {
        shiftTypeIes.value.data.pop()
      }
    }
    shiftTypeIes.value.data.unshift(shiftTypeIeItem)
  }
}

const editShiftTypeIe = (shiftTypeIeItem) => {
  isDialogVisible.value = true
  nextTick(() => {
    shiftTypeIe.value = { ...shiftTypeIeItem }
  })
}

const deleteShiftTypeIeQuestion = (shiftTypeIeItem) => {
  deleteQuestion.value = true
  nextTick(() => {
    shiftTypeIe.value = { ...shiftTypeIeItem }
  })
}

const deletedShiftTypeIe = async () => {
  try {
    await deleteShiftTypeIes(shiftTypeIe.value.id)
    shiftTypeIes.value.data = shiftTypeIes.value.data.filter((e) => e.id !== shiftTypeIe.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar tipo de turno:', error)
  }
}

const resetShiftTypeIe = () => {
  shiftTypeIe.value = {
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
  <AppCardActions class="custom-app-card-actions" title="Tipos de Turno" no-actions>
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
              @click="resetShiftTypeIe()"
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
                  title: 'Tipos de Turno',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: shiftTypeIes.data,
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
                  title: 'Tipos de Turno',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: shiftTypeIes.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="shiftTypeIes?.data && shiftTypeIes.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="shiftTypeIes.data"
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
                @click="editShiftTypeIe(item)"
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
                @click="deleteShiftTypeIeQuestion(item)"
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
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, shiftTypeIes?.meta.total || 0) }} de {{ shiftTypeIes?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="shiftTypeIes?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay tipos de turno registrados.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormShiftTypeIes
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="shiftTypeIe"
    @onSaved:data="insertOrUpdateShiftTypeIe($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar Tipo de Turno"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar el tipo de turno '${shiftTypeIe.name}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedShiftTypeIe()"
    @cancel="deleteQuestion = false"
  />
</template>
