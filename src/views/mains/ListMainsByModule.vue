<script setup>
import { useMainOptions } from '@/composables/useMainOptions'
import { useModulesMainOfAccess } from '@/composables/useModulesMainOfAccess'
import { notify } from '@/plugins/notify'
import { computed, defineComponent, h, ref } from 'vue'
import { VListGroup, VListItem } from 'vuetify/components'
import FormOption from '../mainOption/FormOption.vue'
import FormMain from './FormMain.vue'

const { getMainsByModule, loading,deleteMain } = useModulesMainOfAccess()
const { deleteMainOption }= useMainOptions()
const { hasPermission } = useVerifyPermissions()

const module = ref({})//variable para el modulo
const mains = ref([]) // lista de todos los mains del módulo seleccionado
const main = ref({ // main actual para el formulario
  id: 0,
  module_id: null,
  parent_id: null,
  name: '',
  icon: '',
  route: '#',
  description: '',
})
const optionH = ref({ // opción actual para el formulario
  id: 0,
  main_of_access_id: null,
  name: '',
  type: '',
})
const menuTree = ref([]) // árbol jerárquico de menús
const isFormDialogVisible = ref(false) // estado del diálogo del formulario
const isFormOptionDialogVisible = ref(false) // estado del diálogo del formulario
const deleteQuestion = ref(false) // estado del diálogo de confirmación de eliminación del menu
const deleteQuestionOption = ref(false) // estado del diálogo de confirmación de eliminación de opción

const params = ref({ // parámetros para la consulta
  search: { value: '' },
})

const open = ref([]) // para controlar los grupos abiertos en el VList

// ✅ Función para convertir array plano en árbol jerárquico
const buildMenuTree = (items) => {
  if (!items || items.length === 0) return []

  const itemMap = {}    // Mapa para acceso rápido por ID
  const rootItems = []  // Items raíz (parent_id = null)

  // ✅ Primera pasada: Crear mapa de items con array de children vacío
  items.forEach(item => {
    itemMap[item.id] = { ...item, children: [] }
  })

  // ✅ Segunda pasada: Construir relaciones padre-hijo
  items.forEach(item => {
    const node = itemMap[item.id]
    
    if (item.parent_id === null) {
      // Es un item raíz (nivel 0)
      rootItems.push(node)
    } else if (itemMap[item.parent_id]) {
      // Tiene padre, agregarlo como hijo del padre
      itemMap[item.parent_id].children.push(node)
    }
  })

  return rootItems  // Retornar solo los items raíz (el resto están anidados)
}

// Componente recursivo para renderizar el menú
const MenuItem = defineComponent({
  name: 'MenuItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    // ✅ Computed: verifica si el item tiene hijos
    const hasChildren = computed(() => {
      return props.item.children && props.item.children.length > 0
    })

    return {
      hasChildren,
    }
  },
  components: {
    VListGroup,
    VListItem,
  },
  render() {
    const { item, hasChildren } = this

    // ✅ Función helper para renderizar las opciones (main_options)
    const renderOptions = () => {
      if (!item.main_options || item.main_options.length === 0) return null

      return h('div', {
        style: 'padding: 8px 16px 8px 56px; display: flex; flex-wrap: wrap; gap: 6px; background-color: rgba(var(--v-theme-surface-variant), 0.08);',
        onClick: (e) => e.stopPropagation()
      }, [
        h('span', { 
          style: 'font-size: 12px; color: rgb(var(--v-theme-info)); align-self: center; margin-right: 4px;' 
        }, 'Opciones:'),
        ...item.main_options.map(option => 
          h('div', {
            key: option.id,
            style: 'display: flex; align-items: center; gap: 2px; padding: 2px 6px; background-color: rgba(var(--v-theme-primary), 0.12); border-radius: 12px;'
          }, [
            h('span', { 
              style: 'font-size: 13px; color: rgb(var(--v-theme-info)); font-weight: 500;' 
            }, option.name),
            h('button', {
              class: 'v-btn v-btn--icon v-btn--size-x-small',
              style: 'width: 16px; height: 16px; min-width: 16px; color: rgb(var(--v-theme-primary));',
              onClick: (e) => {
                e.stopPropagation()
                optionH.value = { ...option }
                isFormOptionDialogVisible.value = true
                // console.log('✏️ Editar opcióndddddd:', option)
                // // TODO: Abrir modal de edición de opción
              }
            }, [
              h('i', { class: 'tabler-edit', style: 'font-size: 12px;' })
            ]),
            h('button', {
              class: 'v-btn v-btn--icon v-btn--size-x-small',
              style: 'width: 16px; height: 16px; min-width: 16px; color: rgb(var(--v-theme-error));',
              onClick: (e) => {
                e.stopPropagation()
                optionH.value = { ...option }
                deleteQuestionOption.value = true// TODO: Confirmar y eliminar opción
              }
            }, [
              h('i', { class: 'tabler-trash', style: 'font-size: 12px;' })
            ])
          ])
        ),
        h('button', {
          class: 'v-btn v-btn--icon v-btn--size-x-small',
          style: 'width: 20px; height: 20px; min-width: 20px; color: rgb(var(--v-theme-success));',
          onClick: (e) => {
            e.stopPropagation()
            optionH.value = { // reset option form data
              id: 0,
              main_of_access_id: item.id,
              name: '',
              type: '',
            }
            isFormOptionDialogVisible.value = true
            console.log('➕ Agregar opción a:', item)
            // TODO: Abrir modal para agregar opción
          }
        }, [
          h('i', { class: 'tabler-plus', style: 'font-size: 14px;' })
        ])
      ])
    }

    // ✅ Si tiene hijos → Renderizar VListGroup (item desplegable)
    if (hasChildren) {
      return h('div', {}, [
        h(VListGroup, { value: item.id }, {
          // ✅ Slot "activator": El botón/título que se ve siempre
          activator: ({ props }) => h(VListItem, {
            ...props,
            prependIcon: item.icon,
            title: item.name,
          }, {
            // ✅ Slot "append": Botones de acción (editar/eliminar)
            append: () => h('div', { 
              style: 'display: flex; gap: 4px;',
              onClick: (e) => e.stopPropagation()
            }, [
              h('button', {
                class: 'v-btn v-btn--icon v-btn--size-x-small',
                style: 'color: rgb(var(--v-theme-primary));',
                onClick: (e) => {
                  e.stopPropagation()
                  main.value = { ...item }
                  isFormDialogVisible.value = true
                }
              }, [
                h('span', { class: 'v-btn__content' }, [
                  h('i', { class: 'tabler-edit text-base' })
                ])
              ]),
              h('button', {
                class: 'v-btn v-btn--icon v-btn--size-x-small',
                style: 'color: rgb(var(--v-theme-error));',
                onClick: (e) => {
                  e.stopPropagation()
                  deleteMainQuestion(item)
                  console.log('🗑️ Eliminar:', item) 
                }
              }, [
                h('span', { class: 'v-btn__content' }, [
                  h('i', { class: 'tabler-trash text-base' })
                ])
              ])
            ])
          }),
          // ✅ Slot "default": Los hijos
          default: () => item.children.map(child => 
            h(MenuItem, { key: child.id, item: child })
          ),
        }),
        renderOptions() // ✅ Mostrar opciones después del VListGroup
      ])
    }

    // ✅ Si NO tiene hijos → Renderizar VListItem simple
    return h('div', {}, [
      h(VListItem, {
        value: item.id,
        title: item.name,
        prependIcon: item.icon,
      }, {
        // ✅ Slot "append": Botones de acción
        append: () => h('div', { 
          style: 'display: flex; gap: 4px;',
        }, [
          h('button', {
            class: 'v-btn v-btn--icon v-btn--size-x-small',
            style: 'color: rgb(var(--v-theme-primary));',
            onClick: (e) => {
              e.stopPropagation()
              main.value = { ...item }
              isFormDialogVisible.value = true
              console.log('✏️ Editar:', item)
            }
          }, [
            h('span', { class: 'v-btn__content' }, [
              h('i', { class: 'tabler-edit text-base' })
            ])
          ]),
          h('button', {
            class: 'v-btn v-btn--icon v-btn--size-x-small',
            style: 'color: rgb(var(--v-theme-error));',
            onClick: (e) => {
              e.stopPropagation()
              deleteMainQuestion(item)
              // console.log('🗑️ Eliminar:', item) --- IGNORE ---
            }
          }, [
            h('span', { class: 'v-btn__content' }, [
              h('i', { class: 'tabler-trash text-base' })
            ])
          ])
        ])
      }),
      renderOptions() // ✅ Mostrar opciones después del VListItem
    ])
  },
})

// Función para obtener la lista de menus por módulo
const getMainsWithOptions = async (mod) => {
  params.value.includes=[
        {
          "relation": "mainOptions"
        }
    ]
  try {
    module.value = mod
    // console.log('🔍 Selected module:', module.value.id)
    const response = await getMainsByModule(
      params.value,
      150,
      1,
      module.value.id
    )
    
    // console.log('📦 Response:', response)
    // console.log('📦 Type:', typeof response, Array.isArray(response))
    
    // ✅ Si la respuesta tiene .data, usar eso; si no, usar la respuesta directamente
    const itemsArray = response?.data || response
    
    mains.value = itemsArray
    menuTree.value = buildMenuTree(itemsArray)
    
    console.log('📦 Mains loaded:', mains.value)
    console.log('🌲 Menu tree:', menuTree.value)
  } catch (error) {
    console.error('❌ Error fetching mains by module:', error)
  }
}

// funcion para abrir la modal
const openFormDialog = () => {
  console.log('➕ Agregar main al módulo:', module.value)
  if (module.value.id > 0) {
    isFormDialogVisible.value = true
  } else {
    notify.error('Por favor, seleccione un módulo primero.', 4000)
  }
}

// funcion para consultar eliminado
const deleteMainQuestion = (mn) => {
  deleteQuestion.value = true
  nextTick(() => {
    main.value = mn
  })
}

const deletedMain=async()=>{
  try {
    await deleteMain(main.value.id, module.value.id)
    main.value = {
      id: 0,
      module_id: null,
      parent_id: null,
      name: '',
      icon: '',
      route: '#',
      description: '',
    }
    // eliminar el main del array de mains
    mains.value = mains.value.filter((m) => m.id !== main.value.id)
    deleteQuestion.value = false
    getMainsWithOptions(module.value)
  } catch (error) {
    console.error('❌ Error al eliminar main:', error)
  }
}

defineExpose({
  getMainsWithOptions,
})
</script>

<template>
  <AppCardActions
        :title="`Accesos: ${module?.nombre || ''}`"
        no-actions
      >
      <template #before-actions>
        <!-- <VIcon icon="tabler-" ></VIcon> -->
          <!-- <VTextField 
            style="float: inline-start;inline-size: 200px;"
            placeholder="Buscar"
            v-model="params.search.value"
            class="mx-4"
            clearable
            prepend-icon="tabler-search"
          /> -->
          <VTooltip text="Agregar" v-if="hasPermission('Create-Main')">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                size="small"
                color="primary"
                icon="tabler-square-plus"
                rounded
                @click="openFormDialog"
              />
            </template>
          </VTooltip>
        </template>
  <VSkeletonLoader
      v-if="loading"
      type="list-item-avatar-two-line@5"
    />

  <VList 
    v-else-if="menuTree.length > 0"
    v-model:opened="open" 
    height="65vh"
  >
    <!-- ✅ Iterar sobre menuTree (solo items raíz) -->
    <!-- El componente MenuItem se encarga de renderizar los hijos recursivamente -->
    <component
      :is="MenuItem"
      v-for="item in menuTree"
      :key="item.id"
      :item="item"
    />
  </VList>

  <VAlert
    v-else
    type="info"
    class="my-4"
  >
    No hay menús disponibles para este módulo
  </VAlert>
  </AppCardActions>

  <!-- modal para el formulario menu -->
  <FormMain
    v-model:is-dialog-visible="isFormDialogVisible"
    v-model:data="main"
    :module-id="module?.id || 0"
    :parentOptions="mains"
    @onSaved:data="getMainsWithOptions(module)"
  />
  <!-- modal para el formulario opción -->

  <FormOption
    v-model:is-dialog-visible="isFormOptionDialogVisible"
    v-model:data="optionH"
    @onSaved:data="getMainsWithOptions(module)"
      
  />
  <!-- snackbar para consultar el elminado menu -->
<VSnackbar
    v-model="deleteQuestion"
    vertical
    location="center"
  >
    Estás a punto de eliminar <strong>{{ main.name }}</strong>. ¿Estás seguro de continuar?
    <template #actions>
      <VBtn
        color="error"
        @click="deletedMain()"
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
  <!-- snackbar para consultar el elminado opcion -->
<VSnackbar
    v-model="deleteQuestionOption"
    vertical
    location="center"
  >
    Estás a punto de eliminar <strong>{{ optionH.name }}</strong>. ¿Estás seguro de continuar?
    <template #actions>
      <VBtn
        color="error"
        @click="deleteMainOption(optionH.id);deleteQuestionOption=false;getMainsWithOptions(module);"
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
