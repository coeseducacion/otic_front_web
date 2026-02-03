<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useUgels } from '@/composables/catalogIEs/useUgels'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import { nextTick, onMounted, ref } from 'vue'
import FormUgel from './FormUgel.vue'

const { getUgels, deleteUgel, loading } = useUgels()
const { hasPermission } = useVerifyPermissions()

const ugels = ref({
  data: [],
  meta: { total: 0, last_page: 1 }
})
const ugel = ref({
  id: 0,
  province_id: null,
  dre_id: null,
  code: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  description: '',
})

const deleteQuestion = ref(false)
const isDialogVisible = ref(false)

const params = ref({
  search: { value: '' },
  sort: [{ field: 'id', direction: 'desc' }],
  includes: [{ relation: 'province' }, { relation: 'dre' }]
})

const options = ref({
  page: 1,
  itemsPerPage: 15,
  sortBy: [''],
  sortDesc: [false],
})

// Headers de la tabla
const headers = [
  { title: 'DRE', filterColumnName: 'dre.name', key: 'dre.name', sortable: false, filterable: true },
  { title: 'Provincia', filterColumnName: 'province.name', key: 'province.name', sortable: false, filterable: true },
  { title: 'Código', filterColumnName: 'code', key: 'code', sortable: true, filterable: true },
  { title: 'Nombre', filterColumnName: 'name', key: 'name', sortable: true, filterable: true },
  { title: 'Teléfono', filterColumnName: 'phone', key: 'phone', sortable: true, filterable: true },
  { title: '', key: 'actions', sortable: false, filterable: false },
]

onMounted(async () => {
  if (hasPermission('List')) {
    await get()
  } else {
    console.log('No tiene permiso para ver las UGELs.')
  }
})

// Función para obtener las UGELs
const get = async () => {
  try {
    const response = await getUgels(params.value, options.value.itemsPerPage, options.value.page)
    ugels.value = response
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdateUgel = async (ugelItem) => {
  // Recargar para obtener las relaciones actualizadas
    await get()
    
}

const editUgel = (ugelItem) => {
  isDialogVisible.value = true
  nextTick(() => {
    ugel.value = { ...ugelItem }
  })
}

const deleteUgelQuestion = (ugelItem) => {
  deleteQuestion.value = true
  nextTick(() => {
    ugel.value = { ...ugelItem }
  })
}

const deletedUgel = async () => {
  try {
    await deleteUgel(ugel.value.id)
    ugels.value.data = ugels.value.data.filter((e) => e.id !== ugel.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar UGEL:', error)
  }
}

const resetUgel = () => {
  ugel.value = {
    id: 0,
    province_id: null,
    dre_id: null,
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
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
  <AppCardActions class="custom-app-card-actions" title="Listado de UGELs" no-actions>
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
              @click="resetUgel()"
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
                  title: 'Listado de UGELs',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: ugels.data,
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
                  title: 'Listado de UGELs',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: ugels.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="ugels?.data && ugels.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="ugels.data"
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
                @click="editUgel(item)"
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
                @click="deleteUgelQuestion(item)"
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
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, ugels?.meta.total || 0) }} de {{ ugels?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="ugels?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay UGELs registradas.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormUgel
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="ugel"
    @onSaved:data="insertOrUpdateUgel($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar UGEL"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar la UGEL '${ugel.name}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedUgel()"
    @cancel="deleteQuestion = false"
  />
</template>
