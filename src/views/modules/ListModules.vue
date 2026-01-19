<script setup>
import { useModules } from '@/composables/useModules'
import { useVerifyPermissions } from '@/composables/useVerifyPermissions'
import { useAuthStore } from '@/stores/useAuthStore'
import { exportExcelTable } from '@/utils/exportExcelTable'
import { printTable } from '@/utils/printTable'
import FormModule from './FormModule.vue'

const { getModules,deleteModule,loading } = useModules()
const { hasPermission } = useVerifyPermissions()
const authStore = useAuthStore()


const emit = defineEmits(['onSelectedModule'])
const modules = ref()
const module = ref({
    'id': 0,
    'nombre': '',
    'descripcion': null,
})


const deleteQuestion = ref(false)

const isDialogVisible = ref(false)

const params=ref({
  search: {value:''},
})

const options = ref({
  page: 1,
  itemsPerPage: 15,
  sortBy: [''],
  sortDesc: [false],
})

// headers
const headers = [
  { title: 'Nombre', key: 'nombre', sortable: true },
  { title: 'Descripción', key: 'descripcion', sortable: false },
  { title: '', key: 'actions', sortable: false },
]

//watch para verificar cambios en authStore y recargar la lista




onMounted( async() => {
  
  console.log('permisos de hasmidules:', hasPermission('List-Modules'))

  if (hasPermission('List-Modules')){// si tiene permiso de listado carga lo datos de la api
    await get()
  }else{
    console.log('No tiene permiso para ver los módulos=====.')
  }
})

// funcion para obtener los modulos
const get=async ()=>{
  try {
    // console.log(params.value,options.value.itemsPerPage,options.value.page)
    modules.value = await getModules(params.value,options.value.itemsPerPage,options.value.page)
    // console.log('Módulos cargados:', modules.value)  
  } catch (error) {
    console.error('Error:', error)
  } 
}

const insertOrUpdateModule=async (mod)=>{
  // buscar en el array de modules si el módulo ya existe
  const index = modules.value.data.findIndex((m) => m.id === mod.id)
  
  if (index !== -1) {
    // si existe, actualizarlo
    modules.value.data[index] = mod
  } else {
    // verificar si existe la cantidad del paginado
    if(modules.value.data.length >= options.value.itemsPerPage){
      // eliminar el último elemento si se va a agregar uno nuevo
      if(index === -1){
        modules.value.data.pop()
      }
    }
    // si no existe, agregarlo al inicio
    modules.value.data.unshift(mod.data)
  }
}

const editModule=(mod)=>{
  isDialogVisible.value = true
  nextTick(() => {
    module.value=mod
  })
}

const deleteModuleQuestion=(mod)=>{
  deleteQuestion.value = true
  nextTick(() => {
    module.value=mod
  })
}

const deletedModule=async()=>{
  try {
    await deleteModule(module.value.id)
    // eliminar el módulo del array de módulos
    modules.value.data = modules.value.data.filter((m) => m.id !== module.value.id)
    deleteQuestion.value = false
    // console.log('Módulo eliminado')
  } catch (error) {
    console.error('Error al eliminar módulo:', error)
  }
}

</script>

<template>
 <AppCardActions
        title="Lista de módulos"
        no-actions
        class="custom-app-card-actions"
      >
      <template #before-actions>
          <VTextField  v-if="hasPermission('List-Modules')"
            style="float: inline-start;inline-size: 200px;"
            placeholder="Buscar..."
            prepend-inner-icon="tabler-search"
            v-model="params.search.value"
            class="mx-4"
            clearable
            variant="solo"
            density="compact"
            @keyup.enter="get()"
            @click:clear="get()"
          />
          <VTooltip text="Agregar" v-if="hasPermission('Create-Modules')">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                size="small"
                color="success"
                icon="tabler-square-plus"
                rounded
                @click="module={};  isDialogVisible = true;"
              />
            </template>
          </VTooltip>
          <VTooltip text="Imprimir" v-if="hasPermission('List-Modules')">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                size="small"
                color="secondary"
                icon="tabler-printer"
                rounded
                class="mx-1"
                @click="printTable({
                        title: 'Lista de módulos',
                        columns: headers.filter(h => h.key !== 'actions'),
                        data: modules.data
                      })"
              />
            </template>
          </VTooltip>
          <VTooltip text="Exportar" v-if="hasPermission('List-Modules')">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                size="small"
                color="info"
                icon="tabler-file-export"
                rounded
                @click="exportExcelTable({
                        title: 'Lista de módulos',
                        columns: headers.filter(h => h.key !== 'actions'),
                        data: modules.data
                      })"
              />
            </template>
          </VTooltip>
        </template>
  <VSkeletonLoader
      v-if="loading"
      type="table"
    />

    <VDataTable
      v-else-if="modules?.data && modules.data.length > 0 && hasPermission('List-Modules')"
      :headers="headers"
      :items="modules.data"
      :items-per-page="options.itemsPerPage"
      height="53vh"
      
    >
    <!-- para selects :show-select="true"
      v-model:selected="selectedItems" -->
    <!-- full name -->
    <!-- <template #item.fullName="{ item }">
      <div class="d-flex align-center">
        <VAvatar
          size="32"
          :color="item.avatar ? '' : 'primary'"
          :class="item.avatar ? '' : 'v-avatar-light-bg primary--text'"
          :variant="!item.avatar ? 'tonal' : undefined"
        >
          <VImg
            v-if="item.avatar"
            :src="item.avatar"
          />
          <span v-else>{{ avatarText(item.fullName) }}</span>
        </VAvatar>
        <div class="d-flex flex-column ms-3">
          <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{ item.fullName }}</span>
          <small>{{ item.post }}</small>
        </div>
      </div>
    </template> -->

    <!-- Aciones -->
    <template #item.actions="{ item }">
      <div class="d-flex ">
        <VTooltip text="Editar" v-if="hasPermission('Edit-Modules')">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              size="small"
              color="success"
              icon="tabler-edit"
              variant="text"
              @click="editModule(item)"
            />
          </template>
        </VTooltip>
        
        <VTooltip text="Eliminar" v-if="hasPermission('Delete-Modules')">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              size="small"
              color="error"
              icon="tabler-trash"
              variant="text"
              @click="deleteModuleQuestion(item)"
            />
          </template>
        </VTooltip>

        <VTooltip text="Ver Menús" v-if="hasPermission('View-Mains')">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              size="small"
              color="secondary"
              icon="tabler-menu-2"
              variant="text"
              @click="emit('onSelectedModule', item)"
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
            :length="modules?.meta.last_page"
            @update:model-value="get()"
          />
        </div>
      </VCardText>
    </template>
  </VDataTable>
  </AppCardActions>
  <!-- modal para formulario -->
   <FormModule
          v-model:is-dialog-visible="isDialogVisible"
          v-model:data="module"
          @onSaved:data="insertOrUpdateModule($event);"
        />
    <!-- snackbar para consultar el elminado -->
     <VSnackbar
    v-model="deleteQuestion"
    vertical
    location="center"
  >
    Estás a punto de eliminar <strong>{{ module.nombre }}</strong>. ¿Estás seguro de continuar?
    <template #actions>
      <VBtn
        color="error"
        @click="deletedModule()"
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

