<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useEducationLevels } from '@/composables/catalogIEs/useEducationLevels'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import FormEducationLevel from './FormEducationLevel.vue'

const { getEducationLevels, deleteEducationLevel, loading } = useEducationLevels()
const { hasPermission } = useVerifyPermissions()

const educationLevels = ref()
const educationLevel = ref({
  id: 0,
  code: '',
  name: '',
  abbreviation: '',
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
  { title: 'Abreviatura', filterColumnName: 'abbreviation', key: 'abbreviation', sortable: false, filterable: true },
  { title: 'Descripción', filterColumnName: 'description', key: 'description', sortable: false, filterable: true },
  { title: '', key: 'actions', sortable: false, filterable: false },
]

onMounted(async () => {
  if (hasPermission('List')) {
    await get()
  } else {
    console.log('No tiene permiso para ver los niveles educativos.')
  }
})

// Función para obtener los niveles educativos
const get = async () => {
  try {
    educationLevels.value = await getEducationLevels(params.value, options.value.itemsPerPage, options.value.page)
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdateEducationLevel = async (level) => {
  const index = educationLevels.value.data.findIndex((e) => e.id === level.id)

  if (index !== -1) {
    educationLevels.value.data[index] = level
  } else {
    if (educationLevels.value.data.length >= options.value.itemsPerPage) {
      if (index === -1) {
        educationLevels.value.data.pop()
      }
    }
    educationLevels.value.data.unshift(level)
  }
}

const editEducationLevel = (level) => {
  isDialogVisible.value = true
  nextTick(() => {
    educationLevel.value = { ...level }
  })
}

const deleteEducationLevelQuestion = (level) => {
  deleteQuestion.value = true
  nextTick(() => {
    educationLevel.value = { ...level }
  })
}

const deletedEducationLevel = async () => {
  try {
    await deleteEducationLevel(educationLevel.value.id)
    educationLevels.value.data = educationLevels.value.data.filter((e) => e.id !== educationLevel.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar nivel educativo:', error)
  }
}

const resetEducationLevel = () => {
  educationLevel.value = {
    id: 0,
    code: '',
    name: '',
    abbreviation: '',
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
  <AppCardActions class="custom-app-card-actions" title="Niveles Educativos" no-actions>
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
              @click="resetEducationLevel()"
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
                  title: 'Niveles Educativos',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: educationLevels.data,
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
                  title: 'Niveles Educativos',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: educationLevels.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="educationLevels?.data && educationLevels.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="educationLevels.data"
      :items-per-page="options.itemsPerPage"
      height="calc(100vh - 300px)"
    >
      <!-- Acciones -->
      <template #item.actions="{ item }">
        <div class="d-flex">
          <VTooltip text="Editar" v-if="hasPermission('Edit')">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                size="small"
                color="success"
                icon="tabler-edit"
                variant="text"
                @click="editEducationLevel(item)"
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
                @click="deleteEducationLevelQuestion(item)"
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
            <!-- aqui va en el formato siguiente filas 1 a 15 de total de filas -->
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, educationLevels?.meta.total || 0) }} de {{ educationLevels?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="educationLevels?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay niveles educativos registrados.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormEducationLevel
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="educationLevel"
    @onSaved:data="insertOrUpdateEducationLevel($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar Nivel Educativo"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar el nivel educativo '${educationLevel.name}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedEducationLevel()"
    @cancel="deleteQuestion = false"
  />
</template>

