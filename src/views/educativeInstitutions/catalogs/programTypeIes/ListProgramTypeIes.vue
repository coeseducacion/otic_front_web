<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useProgramTypeIes } from '@/composables/catalogIEs/useProgramTypeIes'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import FormProgramTypeIes from './FormProgramTypeIes.vue'

const { getProgramTypeIes, deleteProgramTypeIes, loading } = useProgramTypeIes()
const { hasPermission } = useVerifyPermissions()

const programTypeIes = ref()
const programTypeIe = ref({
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
    console.log('No tiene permiso para ver los tipos de programa.')
  }
})

// Función para obtener los tipos de programa
const get = async () => {
  try {
    programTypeIes.value = await getProgramTypeIes(params.value, options.value.itemsPerPage, options.value.page)
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdateProgramTypeIe = async (programType) => {
  const index = programTypeIes.value.data.findIndex((e) => e.id === programType.id)

  if (index !== -1) {
    programTypeIes.value.data[index] = programType
  } else {
    if (programTypeIes.value.data.length >= options.value.itemsPerPage) {
      if (index === -1) {
        programTypeIes.value.data.pop()
      }
    }
    programTypeIes.value.data.unshift(programType)
  }
}

const editProgramTypeIe = (programType) => {
  isDialogVisible.value = true
  nextTick(() => {
    programTypeIe.value = { ...programType }
  })
}

const deleteProgramTypeIeQuestion = (programType) => {
  deleteQuestion.value = true
  nextTick(() => {
    programTypeIe.value = { ...programType }
  })
}

const deletedProgramTypeIe = async () => {
  try {
    await deleteProgramTypeIes(programTypeIe.value.id)
    programTypeIes.value.data = programTypeIes.value.data.filter((e) => e.id !== programTypeIe.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar tipo de programa:', error)
  }
}

const resetProgramTypeIe = () => {
  programTypeIe.value = {
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
  <AppCardActions class="custom-app-card-actions" title="Tipos de Programa" no-actions>
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
              @click="resetProgramTypeIe()"
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
                  title: 'Tipos de Programa',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: programTypeIes.data,
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
                  title: 'Tipos de Programa',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: programTypeIes.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="programTypeIes?.data && programTypeIes.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="programTypeIes.data"
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
                @click="editProgramTypeIe(item)"
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
                @click="deleteProgramTypeIeQuestion(item)"
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
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, programTypeIes?.meta.total || 0) }} de {{ programTypeIes?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="programTypeIes?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay tipos de programa registrados.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormProgramTypeIes
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="programTypeIe"
    @onSaved:data="insertOrUpdateProgramTypeIe($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar Tipo de Programa"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar el tipo de programa '${programTypeIe.name}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedProgramTypeIe()"
    @cancel="deleteQuestion = false"
  />
</template>
