<script setup>
import FilterForm from '@/components/Filters/FilterForm.vue'
import { useUsers } from '@/composables/useUsers'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import { nextTick, onMounted, ref } from 'vue'
import FormAccessUser from '../accessUsers/FormAccessUser.vue'
import FormUser from './FormUser.vue'

const { getUsers, deleteUser, loading } = useUsers()
const { hasPermission } = useVerifyPermissions()

const users = ref()
const user = ref({
  id: 0,
  role_id: null,
  type_document_id: null,
  document: '',
  name: '',
  email: '',
  email_verified_at: null,
  password: '',
  phone: '',
  remember_token: '',
})

const deleteQuestion = ref(false)
const isDialogVisible = ref(false)
const isDialogAccessVisible = ref(false)

const params = ref({
  search: { value: '' },
  includes:[
    {relation:'role'},
  ]
})

const options = ref({
  page: 1,
  itemsPerPage: 15,
  sortBy: [''],
  sortDesc: [false],
})

const headers = [
  { title: 'Rol', key: 'role.name', sortable: false,  filterColumnName:'role.name'},
  { title: 'Documento', key: 'document', sortable: true,  filterColumnName:'document'},
  { title: 'Nombre', key: 'name', sortable: true,  filterColumnName:'name'},
  { title: 'Email', key: 'email', sortable: true,  filterColumnName:'email'},
  { title: 'Teléfono', key: 'phone', sortable: false,  filterColumnName:'phone'},
  { title: '', key: 'actions', sortable: false,filterable: false  },
]

onMounted(async () => {
  if (hasPermission('List')){// si tiene permiso de listado carga lo datos de la api
    await get()
  }
})

const get = async () => {
  try {
    users.value = await getUsers(params.value, options.value.itemsPerPage, options.value.page)
    // console.log('✅ Usuarios cargados:', users.value)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

const insertOrUpdateUser = async (usr) => {
  const index = users.value.data.findIndex((u) => u.id === usr.id)
  if (index !== -1) {
    users.value.data[index] = usr
  } else {
    if (users.value.data.length >= options.value.itemsPerPage) {
      if (index === -1) {
        users.value.data.pop()
      }
    }
    users.value.data.unshift(usr.data)
  }
}

const editUser = (usr) => {
  isDialogVisible.value = true
  nextTick(() => {
    user.value = usr
  })
}

const addUser = () => {
  user.value = {
    id: 0,
    role_id: null,
    type_document_id: null,
    document: '',
    name: '',
    email: '',
    password: '',
    phone: '',
  }
  isDialogVisible.value = true
}

const deleteUserQuestion = (usr) => {
  deleteQuestion.value = true
  nextTick(() => {
    user.value = usr
  })
}

const deletedUser = async () => {
  try {
    await deleteUser(user.value.id)
    users.value.data = users.value.data.filter((u) => u.id !== user.value.id)
    deleteQuestion.value = false
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error)
  }
}

const applyFilters = async (filters) => {
  params.value.filters = filters
  await get()
}
</script>

<template>
<AppCardActions
  title="Lista de usuarios"
  no-actions
>
  <template #before-actions>
     <div class="d-flex flex-wrap ga-2" >
    <VTextField v-if="hasPermission('List')"
      style="float: inline-start;inline-size: 200px;"
      placeholder="Buscar..."
      prepend-inner-icon="tabler-search"
      v-model="params.search.value"
      class="mx-4"
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
          @click="addUser"
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
          class="mx-1"
          @click="printTable({
            title: 'Lista de usuarios',
            columns: headers.filter(h => h.key !== 'actions'),
            data: users.data
          })"
        />
      </template>
    </VTooltip>
    <VTooltip text="Exportar">
      <template #activator="{ props }">
        <VBtn
          v-bind="props"
          size="small"
          color="info"
          icon="tabler-file-export"
          rounded
          @click="exportExcelTable({
            title: 'Lista de usuarios',
            columns: headers.filter(h => h.key !== 'actions'),
            data: users.data
          })"
        />
      </template>
    </VTooltip>
    </div>
  </template>
  <VSkeletonLoader
    v-if="loading"
    type="table"
  />
  <VDataTable
    v-else-if="users?.data && users.data.length > 0  && hasPermission('List')"
    :headers="headers"
    :items="users.data"
    :items-per-page="options.itemsPerPage"
    height="53vh"
  >
  
  <template #item.actions="{ item }">
    <div class="d-flex ">
      <VTooltip text="Accesos" v-if="hasPermission('List-Access')">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              size="small"
              color="info"
              icon="tabler-list-check"
              variant="text"
              @click="user = item; isDialogAccessVisible = true"
            />
          </template>
        </VTooltip>
      <VTooltip text="Editar" v-if="hasPermission('Edit')">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              size="small"
              color="success"
              icon="tabler-edit"
              variant="text"
              @click="editUser(item)"
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
              @click="deleteUserQuestion(item)"
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
            style="max-inline-size: 4rem;min-inline-size: 2rem;"
            @update:model-value="options.page=1; get()"
          />
          <VPagination
            v-model="options.page"
            :total-visible="$vuetify.display.smAndDown ? 3 : 4"
            :length="users?.meta.last_page"
            @update:model-value="get()"
          />
        </div>
      </VCardText>
    </template>
  </VDataTable>
   <VCard v-else-if="!loading && hasPermission('List')" class="text-center pa-6">
      <VCardText>No se encontraron usuarios registrados.</VCardText>
    </VCard>
</AppCardActions>
<FormUser
  v-model:is-dialog-visible="isDialogVisible"
  v-model:data="user"
  @onSaved:data="insertOrUpdateUser($event)"
/>

<FormAccessUser
  v-model:is-dialog-visible="isDialogAccessVisible"   :user="user"
/>

<VSnackbar
  v-model="deleteQuestion"
  vertical
  location="center"
>
  Estás a punto de eliminar <strong>{{ user.name }}</strong>. ¿Estás seguro de continuar?
  <template #actions>
    <VBtn
      color="error"
      @click="deletedUser()"
    >
      Eliminar
    </VBtn>
    <VBtn
      color="success"
      @click="deleteQuestion = false"
    >
      Cancelar
    </VBtn>
  </template>
</VSnackbar>
</template>

