<script setup>
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import FilterForm from '@/components/Filters/FilterForm.vue'
import { usePersons } from '@/composables/Coes/usePersons'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import { nextTick, onMounted, ref } from 'vue'
import FormPerson from './FormPerson.vue'

const { getPersons, deletePerson, loading } = usePersons()
const { hasPermission } = useVerifyPermissions()

const persons = ref({
  data: [],
  meta: { total: 0, last_page: 1 }
})
const person = ref({
  id: 0,
  user_id: null,
  district_id: null,
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  documento: '',
  celular: '',
  celular_institucional: '',
  telefono: '',
  correo_personal: '',
  correo_institucional: '',
})

const deleteQuestion = ref(false)
const isDialogVisible = ref(false)

const params = ref({
  search: { value: '' },
  sort: [{ field: 'id', direction: 'desc' }],
  includes: [{ relation: 'district' }]
})

const options = ref({
  page: 1,
  itemsPerPage: 15,
  sortBy: [''],
  sortDesc: [false],
})

// Headers de la tabla
const headers = [
  { title: 'N° Doc.', filterColumnName: 'documento', key: 'documento', sortable: true, filterable: true },
  { title: 'Nombres', filterColumnName: 'nombres', key: 'nombres', sortable: true, filterable: true },
  { title: 'Apellido Paterno', filterColumnName: 'apellido_paterno', key: 'apellido_paterno', sortable: true, filterable: true },
  { title: 'Apellido Materno', filterColumnName: 'apellido_materno', key: 'apellido_materno', sortable: true, filterable: true },
  { title: 'Celular', filterColumnName: 'celular', key: 'celular', sortable: false, filterable: true },
  { title: 'Correo Personal', filterColumnName: 'correo_personal', key: 'correo_personal', sortable: false, filterable: true },
  { title: '', key: 'actions', sortable: false, filterable: false },
]

onMounted(async () => {
  if (hasPermission('List')) {
    await get()
  } else {
    console.log('No tiene permiso para ver las personas.')
  }
})

// Función para obtener las personas
const get = async () => {
  try {
    const response = await getPersons(params.value, options.value.itemsPerPage, options.value.page)
    persons.value = response
  } catch (error) {
    console.error('Error:', error)
  }
}

const insertOrUpdatePerson = async (personItem) => {
  // buscar en el array de modules si el módulo ya existe
  const index = persons.value.data.findIndex((m) => m.id === personItem.id)
  
  if (index !== -1) {
    // si existe, actualizarlo
    persons.value.data[index] = personItem
  } else {
    // verificar si existe la cantidad del paginado
    if(persons.value.data.length >= options.value.itemsPerPage){
      // eliminar el último elemento si se va a agregar uno nuevo
      if(index === -1){
        persons.value.data.pop()
      }
    }
    // si no existe, agregarlo al inicio
    persons.value.data.unshift(personItem)
  }
}

const editPerson = (personItem) => {
  isDialogVisible.value = true
  nextTick(() => {
    person.value = { ...personItem }
  })
}

const deletePersonQuestion = (personItem) => {
  deleteQuestion.value = true
  nextTick(() => {
    person.value = { ...personItem }
  })
}

const deletedPerson = async () => {
  try {
    await deletePerson(person.value.id)
    persons.value.data = persons.value.data.filter((e) => e.id !== person.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('Error al eliminar persona:', error)
  }
}

const resetPerson = () => {
  person.value = {
    id: 0,
    user_id: null,
    district_id: null,
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    documento: '',
    celular: '',
    celular_institucional: '',
    telefono: '',
    correo_personal: '',
    correo_institucional: '',
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
  <AppCardActions class="custom-app-card-actions" title="Listado de personas" no-actions>
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
              @click="resetPerson()"
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
                  title: 'Listado de Personas',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: persons.data,
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
                  title: 'Listado de Personas',
                  columns: headers.filter((h) => h.key !== 'actions'),
                  data: persons.data,
                })
              "
            />
          </template>
        </VTooltip>
      </div>
    </template>

    <VSkeletonLoader v-if="loading" type="table" />

    <VDataTable
      v-else-if="persons?.data && persons.data.length > 0 && hasPermission('List')"
      :headers="headers"
      fixed-header
      hover
      striped="odd"
      :items="persons.data"
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
                @click="editPerson(item)"
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
                @click="deletePersonQuestion(item)"
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
            Mostrando: {{ (options.page - 1) * options.itemsPerPage + 1 }} al {{ Math.min(options.page * options.itemsPerPage, persons?.meta.total || 0) }} de {{ persons?.meta.total || 0 }}
            <VPagination
              v-model="options.page"
              :total-visible="$vuetify.display.smAndDown ? 3 : 4"
              :length="persons?.meta.last_page"
              @update:model-value="get()"
            />
          </div>
        </VCardText>
      </template>
    </VDataTable>

    <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No hay personas registradas.</VCardText>
    </VCard>
  </AppCardActions>

  <!-- Modal para formulario -->
  <FormPerson
    v-model:is-dialog-visible="isDialogVisible"
    v-model:data="person"
    @onSaved:data="insertOrUpdatePerson($event)"
  />

  <!-- Diálogo de confirmación para eliminar -->
  <ConfirmDialog
    confirmTitle="Eliminar Persona"
    confirmMsg="Eliminado Correctamente"
    cancelTitle="Cancelar Eliminación"
    cancelMsg="Eliminación Cancelada"
    :confirmationQuestion="`¿Estás seguro de eliminar a '${person.nombres} ${person.apellido_paterno}'?`"
    @update:is-dialog-visible="deleteQuestion"
    :is-dialog-visible="deleteQuestion"
    @confirm="deletedPerson()"
    @cancel="deleteQuestion = false"
  />
</template>
