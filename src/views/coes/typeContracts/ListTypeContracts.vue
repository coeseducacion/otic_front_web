<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useTypeContracts } from '@/composables/Coes/useTypeContracts'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import { nextTick, onMounted, ref } from 'vue'
import FormTypeContract from './FormTypeContract.vue'

const { getTypeContracts, deleteTypeContract, loading } = useTypeContracts()
const { hasPermission } = useVerifyPermissions()

const typeContracts = ref({
  data: [],
  meta: { total: 0, last_page: 1 }
})
const typeContract = ref({
  id: 0,
  name: '',
  code: '',
  description: null,
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
  { title: 'Código', filterColumnName: 'code', key: 'code', sortable: false, filterable: true },
  { title: 'Nombre', filterColumnName: 'name', key: 'name', sortable: false, filterable: true },
  { title: 'Activo', filterColumnName: 'active', key: 'active', sortable: false, filterable: true },
  { title: '', key: 'actions', sortable: false, filterable: false },
]

onMounted(async () => {
  if (hasPermission('List')) {
    await get()
  } else {
    console.log('No tiene permiso para ver los tipos de contrato.')
  }
})

// Función para obtener los tipos de contrato
const get = async () => {
  try {
    const response = await getTypeContracts(params.value, options.value.itemsPerPage, options.value.page)
    typeContracts.value = response
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdateTypeContract = async (typeContractItem) => {
  // buscar en el array de modules si el módulo ya existe
  const index = typeContracts.value.data.findIndex((m) => m.id === typeContractItem.id)
  
  if (index !== -1) {
    // si existe, actualizarlo
    typeContracts.value.data[index] = typeContractItem
  } else {
    // verificar si existe la cantidad del paginado
    if(typeContracts.value.data.length >= options.value.itemsPerPage){
      // eliminar el último elemento si se va a agregar uno nuevo
      if(index === -1){
        typeContracts.value.data.pop()
      }
    }
    // si no existe, agregarlo al inicio
    typeContracts.value.data.unshift(typeContractItem)
  }
}

const editTypeContract = (typeContractItem) => {
  isDialogVisible.value = true
  nextTick(() => {
    typeContract.value = { ...typeContractItem }
  })
}

const deleteTypeContractQuestion = (typeContractItem) => {
  deleteQuestion.value = true
  nextTick(() => {
    typeContract.value = { ...typeContractItem }
  })
}

const deletedTypeContract = async () => {
  try {
    await deleteTypeContract(typeContract.value.id)
    typeContracts.value.data = typeContracts.value.data.filter((e) => e.id !== typeContract.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar tipo de contrato:', error)
  }
}

const resetTypeContract = () => {
  typeContract.value = {
    id: 0,
    name: '',
    code: '',
    description: null,
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
  <AppCardActions class="custom-app-card-actions" title="Listado de tipos de contrato" no-actions>
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
              @click="resetTypeContract()"
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
                  title: 'Listado de Tipos de Contrato',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: typeContracts.data,
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
                  title: 'Listado de Tipos de Contrato',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: typeContracts.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="typeContracts?.data && typeContracts.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="typeContracts.data"
      :items-per-page="options.itemsPerPage"
      height="calc(100vh - 300px)"
    >
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
                @click="editTypeContract(item)"
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
                @click="deleteTypeContractQuestion(item)"
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
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, typeContracts?.meta.total || 0) }} de {{ typeContracts?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="typeContracts?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay tipos de contrato registrados.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormTypeContract
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="typeContract"
    @onSaved:data="insertOrUpdateTypeContract($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar Tipo de contrato"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar el tipo '${typeContract.name}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedTypeContract()"
    @cancel="deleteQuestion = false"
  />
</template>
