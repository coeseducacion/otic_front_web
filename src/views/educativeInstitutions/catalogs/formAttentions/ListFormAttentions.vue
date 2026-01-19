<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useFormAttentions } from '@/composables/catalogIEs/useFormAttentions'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import FormFormAttentions from './FormFormAttentions.vue'

const { getFormAttentions, deleteFormAttention, loading } = useFormAttentions()
const { hasPermission } = useVerifyPermissions()

const formAttentions = ref()
const formAttention = ref({
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
    console.log('No tiene permiso para ver las formas de atención.')
  }
})

// Función para obtener las formas de atención
const get = async () => {
  try {
    formAttentions.value = await getFormAttentions(params.value, options.value.itemsPerPage, options.value.page)
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdateFormAttention = async (formAtt) => {
  const index = formAttentions.value.data.findIndex((e) => e.id === formAtt.id)

  if (index !== -1) {
    formAttentions.value.data[index] = formAtt
  } else {
    if (formAttentions.value.data.length >= options.value.itemsPerPage) {
      if (index === -1) {
        formAttentions.value.data.pop()
      }
    }
    formAttentions.value.data.unshift(formAtt)
  }
}

const editFormAttention = (formAtt) => {
  isDialogVisible.value = true
  nextTick(() => {
    formAttention.value = { ...formAtt }
  })
}

const deleteFormAttentionQuestion = (formAtt) => {
  deleteQuestion.value = true
  nextTick(() => {
    formAttention.value = { ...formAtt }
  })
}

const deletedFormAttention = async () => {
  try {
    await deleteFormAttention(formAttention.value.id)
    formAttentions.value.data = formAttentions.value.data.filter((e) => e.id !== formAttention.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar forma de atención:', error)
  }
}

const resetFormAttention = () => {
  formAttention.value = {
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
  <AppCardActions class="custom-app-card-actions" title="Formas de Atención" no-actions>
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
              @click="resetFormAttention()"
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
                  title: 'Formas de Atención',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: formAttentions.data,
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
                  title: 'Formas de Atención',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: formAttentions.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="formAttentions?.data && formAttentions.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="formAttentions.data"
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
                @click="editFormAttention(item)"
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
                @click="deleteFormAttentionQuestion(item)"
              />
            </template>
          </VTooltip>
        </div>
      </template>

      <template #bottom>
        <VCardText class="pt-2">
          <div class="d-flex flex-wrap align-center justify-center justify-sm-space-between gap-y-2 mt-2">
            <VSelect
              v-model="options.itemsPerPage"
              :items="[15, 25, 50, 100]"
              label="Filas:"
              variant="underlined"
              style="max-inline-size: 4rem; min-inline-size: 2rem;"
              @update:model-value="(options.page = 1), get()"
            />
            <p>Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, formAttentions?.meta.total || 0) }} de {{ formAttentions?.meta.total || 0 }}</p>
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="formAttentions?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay formas de atención registradas.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormFormAttentions
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="formAttention"
    @onSaved:data="insertOrUpdateFormAttention($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar Forma de Atención"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar la forma de atención '${formAttention.name}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedFormAttention()"
    @cancel="deleteQuestion = false"
  />
</template>
