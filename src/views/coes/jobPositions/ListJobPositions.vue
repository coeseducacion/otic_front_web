<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useJobPositions } from '@/composables/Coes/useJobPositions'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import { nextTick, onMounted, ref } from 'vue'
import FormJobPosition from './FormJobPosition.vue'

const { getJobPositions, deleteJobPosition, loading } = useJobPositions()
const { hasPermission } = useVerifyPermissions()

const jobPositions = ref({
  data: [],
  meta: { total: 0, last_page: 1 }
})
const jobPosition = ref({
  id: 0,
  name: '',
  code: '',
  description: null,
  is_dre: false,
  is_ugel: false,
  active: true,
  order: 0,
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
  { title: 'Es DRE', filterColumnName: 'is_dre', key: 'is_dre', sortable: true, filterable: true },
  { title: 'Es UGEL', filterColumnName: 'is_ugel', key: 'is_ugel', sortable: true, filterable: true },
  { title: 'Activo', filterColumnName: 'active', key: 'active', sortable: true, filterable: true },
  //{ title: 'Orden', filterColumnName: 'order', key: 'order', sortable: true, filterable: false },
  { title: '', key: 'actions', sortable: false, filterable: false },
]

onMounted(async () => {
  if (hasPermission('List')) {
    await get()
  } else {
    console.log('No tiene permiso para ver los puestos de trabajo.')
  }
})

// Función para obtener los puestos de trabajo
const get = async () => {
  try {
    const response = await getJobPositions(params.value, options.value.itemsPerPage, options.value.page)
    jobPositions.value = response
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdateJobPosition = async (jobPositionItem) => {
  // buscar en el array de modules si el módulo ya existe
  const index = jobPositions.value.data.findIndex((m) => m.id === jobPositionItem.id)
  
  if (index !== -1) {
    // si existe, actualizarlo
    jobPositions.value.data[index] = jobPositionItem
  } else {
    // verificar si existe la cantidad del paginado
    if(jobPositions.value.data.length >= options.value.itemsPerPage){
      // eliminar el último elemento si se va a agregar uno nuevo
      if(index === -1){
        jobPositions.value.data.pop()
      }
    }
    // si no existe, agregarlo al inicio
    jobPositions.value.data.unshift(jobPositionItem)
  }
}

const editJobPosition = (jobPositionItem) => {
  isDialogVisible.value = true
  nextTick(() => {
    jobPosition.value = { ...jobPositionItem }
  })
}

const deleteJobPositionQuestion = (jobPositionItem) => {
  deleteQuestion.value = true
  nextTick(() => {
    jobPosition.value = { ...jobPositionItem }
  })
}

const deletedJobPosition = async () => {
  try {
    await deleteJobPosition(jobPosition.value.id)
    jobPositions.value.data = jobPositions.value.data.filter((e) => e.id !== jobPosition.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar puesto de trabajo:', error)
  }
}

const resetJobPosition = () => {
  jobPosition.value = {
    id: 0,
    name: '',
    code: '',
    description: null,
    is_dre: false,
    is_ugel: false,
    active: true,
    order: 0,
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
  <AppCardActions class="custom-app-card-actions" title="Listado de puestos de trabajo" no-actions>
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
              @click="resetJobPosition()"
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
                  title: 'Listado de Puestos de Trabajo',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: jobPositions.data,
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
                  title: 'Listado de Puestos de Trabajo',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: jobPositions.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="jobPositions?.data && jobPositions.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="jobPositions.data"
      :items-per-page="options.itemsPerPage"
      height="calc(100vh - 300px)"
    >
    <template #item.is_dre="{ item }">
      <div class="text-center" >
        {{ item.is_dre ? 'Sí' : 'No' }}
      </div>
    </template>
    <template #item.is_ugel="{ item }">
      <div class="text-center" >
        {{ item.is_ugel ? 'Sí' : 'No' }}
      </div>
    </template>
    <template #item.active="{ item }">
      <div class="text-center" >
        {{ item.active ? 'Sí' : 'No' }}
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
                @click="editJobPosition(item)"
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
                @click="deleteJobPositionQuestion(item)"
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
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, jobPositions?.meta.total || 0) }} de {{ jobPositions?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="jobPositions?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay puestos de trabajo registrados.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormJobPosition
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="jobPosition"
    @onSaved:data="insertOrUpdateJobPosition($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar Puesto de Trabajo"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar el puesto '${jobPosition.name}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedJobPosition()"
    @cancel="deleteQuestion = false"
  />
</template>
