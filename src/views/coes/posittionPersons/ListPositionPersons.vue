<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { usePositionPersons } from '@/composables/Coes/usePositionPersons'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import { nextTick, onMounted, ref } from 'vue'
import FormPositionPerson from './FormPositionPerson.vue'

const { getPositionPersons, deletePositionPerson, loading, loadingPatch ,updatePositionPerson} = usePositionPersons()
const { hasPermission } = useVerifyPermissions()

const positionPersons = ref({
  data: [],
  meta: { total: 0, last_page: 1 }
})
const positionPerson = ref({
  id: 0,
  person_id: null,
  job_position_id: null,
  type_contract_id: null,
  dre_id: null,
  ugel_id: null,
  educative_institution_id: null,
  start_date: null,
  end_date: null,
  is_active: true,
  is_validated: false,
})

const deleteQuestion = ref(false)
const isDialogVisible = ref(false)

const params = ref({
  search: { value: '' },
  sort: [{ field: 'id', direction: 'desc' }],
  includes: [
    { relation: 'personal' },
    { relation: 'jobPosition' },
    { relation: 'typeContract' },
    { relation: 'dre' },
    { relation: 'ugel' },
    { relation: 'educativeInstitution' }
  ]
})

const options = ref({
  page: 1,
  itemsPerPage: 15,
  sortBy: [''],
  sortDesc: [false],
})

// Headers de la tabla
const headers = [
  { title: 'Persona', filterColumnName: 'personal', key: 'personal', sortable: false, filterable: true },
  { title: 'Puesto de Trabajo', filterColumnName: 'job_position.name', key: 'job_position.name', sortable: false, filterable: true },
  { title: 'Tipo de Contrato', filterColumnName: 'type_contract.name', key: 'type_contract.name', sortable: false, filterable: true },
  { title: 'DRE', filterColumnName: 'dre.name', key: 'dre.name', sortable: false, filterable: true },
  { title: 'UGEL', filterColumnName: 'ugel.name', key: 'ugel.name', sortable: false, filterable: true },
  { title: 'IE', filterColumnName: 'educative_institution', key: 'educative_institution', sortable: false, filterable: true },
  { title: 'F. inicio', filterColumnName: 'start_date', key: 'start_date', sortable: true, filterable: true },
  { title: 'F. fin', filterColumnName: 'end_date', key: 'end_date', sortable: true, filterable: true },
  { title: 'Activo', filterColumnName: 'is_active', key: 'is_active', sortable: true, filterable: true },
  { title: 'Validado', filterColumnName: 'is_validated', key: 'is_validated', sortable: true, filterable: true },
  { title: '', key: 'actions', sortable: false, filterable: false },
]

onMounted(async () => {
  if (hasPermission('List')) {
    await get()
  } else {
    console.log('No tiene permiso para ver las posiciones de personas.')
  }
})

// Función para obtener las posiciones de personas
const get = async () => {
  try {
    const response = await getPositionPersons(params.value, options.value.itemsPerPage, options.value.page)
    positionPersons.value = response
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdatePositionPerson = async (positionPersonItem) => {
  // Recargar para obtener las relaciones actualizadas
  await get()
}

const editPositionPerson = (positionPersonItem) => {
  isDialogVisible.value = true
  nextTick(() => {
    positionPerson.value = { ...positionPersonItem }
  })
}

const deletePositionPersonQuestion = (positionPersonItem) => {
  deleteQuestion.value = true
  nextTick(() => {
    positionPerson.value = { ...positionPersonItem }
  })
}

const deletedPositionPerson = async () => {
  try {
    await deletePositionPerson(positionPerson.value.id)
    positionPersons.value.data = positionPersons.value.data.filter((e) => e.id !== positionPerson.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar posición de persona:', error)
  }
}

const resetPositionPerson = () => {
  positionPerson.value = {
    id: 0,
    person_id: null,
    job_position_id: null,
    type_contract_id: null,
    dre_id: null,
    ugel_id: null,
    educative_institution_id: null,
    start_date: null,
    end_date: null,
    is_active: true,
    is_validated: false,
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
  <AppCardActions class="custom-app-card-actions" title="Listado del directorio" no-actions>
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
              @click="resetPositionPerson()"
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
                  title: 'Listado del directorio',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: positionPersons.data,
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
                  title: 'Listado del directorio',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: positionPersons.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="positionPersons?.data && positionPersons.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="positionPersons.data"
      :items-per-page="options.itemsPerPage"
      height="calc(100vh - 300px)"
    >
      <template #item.personal="{ item }">
        <div>
          {{ item.personal ? (item.personal.dni+' - '+item.personal.nombres+' '+item.personal.apellido_paterno+' '+item.personal.apellido_materno) : 'N/A' }}
        </div>
      </template>
      <template #item.educative_institution="{ item }">
          <div>
            {{ item.educative_institution ? (item.educative_institution.modular_code+' - '+item.educative_institution.name_ie) : 'N/A' }}
          </div>
      </template>
      <template #item.is_active="{ item }">
        <div class="text-center" >
          <VSwitch
            v-model="item.is_active"
            color="success"
            :true-value="true"
            :false-value="false"
            :loading="loadingPatch"
            :disabled="loadingPatch"
            @update:modelValue="updatePositionPerson(item.id, { is_active: $event })"
            :label="item.is_active ? 'Sí' : 'No'"
          />
        </div>
      </template>
      <template #item.is_validated="{ item }">
        <div class="text-center" >
          <VSwitch
            v-model="item.is_validated"
            color="success"
            :true-value="true"
            :false-value="false"
            :loading="loadingPatch"
            :disabled="loadingPatch"
            @update:modelValue="updatePositionPerson(item.id, { is_validated: $event })"
            :label="item.is_validated ? 'Sí' : 'No'"
          />
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
                @click="editPositionPerson(item)"
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
                @click="deletePositionPersonQuestion(item)"
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
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, positionPersons?.meta.total || 0) }} de {{ positionPersons?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="positionPersons?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay posiciones de personas registradas.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormPositionPerson
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="positionPerson"
    @onSaved:data="insertOrUpdatePositionPerson($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar del directorio"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar este registro del directorio?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedPositionPerson()"
    @cancel="deleteQuestion = false"
  />
</template>
