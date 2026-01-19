<script setup>
  import { useModulesMainOfAccess } from '@/composables/useModulesMainOfAccess'
import { nextTick, ref, watch } from 'vue'

const { getMainsByModule,loading } = useModulesMainOfAccess()

  const props=defineProps({
    module: {
      type: Object,
      default: () => ({}),
    },
    userPermissions: {
      type: Array,
      default: () => [],
    },
  })

  const emit =defineEmits(['update:modelValue',])

  const mainsOfAccess = ref([])// array que contiene los menus principales del modulo
  const mainsTree = ref([]) // array que contiene los menus en formato arbol
  // model mantiene los ids seleccionados (usar ref normal para evitar enlaces directos al prop)
  const model = ref([])
  // key para forzar rerender del v-treeview cuando cambie el árbol
  const treeKey = ref(0)

  const items = [
    {
      id: '1',
      title: 'Dashboard',
      children: [
        {
          id: '1-1',
          title: 'Analytics',
        },
        {
          id: '1-2',
          title: 'Reports',
        },
        {
          id: '1-3',
          title: 'Financial',
          children: [
            {
              id: '1-3-1',
              title: 'Budget',
            },
            {
              id: '1-3-2',
              title: 'Operations',
            },
            {
              id: '1-3-3',
              title: 'Costs',
            },
          ],
        },
      ],
    },
  ]

  
  //funcion que obtiene los menus
  const getMains = async (moduleId) => {
    if (!moduleId) {//verifica si hay moduleId
      return
    }
    try {
      const response = await getMainsByModule({includes:[{relation:'mainOptions'}]}, 150, 1, moduleId)
      mainsOfAccess.value = response.data
      mainsTree.value = buildMenuTree(mainsOfAccess.value)
      console.log('mainsTree.value', mainsTree.value)
  // Forzar rerender del tree y esperar al siguiente tick para que Vuetify calcule estados
  treeKey.value++
  await nextTick()
  // sincronizar modelo con permisos entrantes (forzar strings)
  model.value = Array.isArray(props.userPermissions) ? props.userPermissions.map(String) : []
  // console.debug('mainsTree items:', mainsTree.value.length, 'model after sync:', model.value)
      // console.log('✅ Menús principales cargados:', mainsOfAccess.value)
      // console.log('✅ Menús en formato árbol cargados:', mainsTree.value)
    } catch (error) {
      console.error('❌ Error al cargar los menús principales:', error)
    }
  }

  // Mantener el model sincronizado si la prop userPermissions cambia desde el padre
  watch(
    () => props.userPermissions,
    (val) => {
      model.value = Array.isArray(val) ? val.map(String) : []
    },
    { immediate: true }
  )

  // Emitir cambios desde el componente (enviar array plano de strings)
  const onModelUpdate = () => {
    const payload = Array.isArray(model.value) ? model.value.map(String) : []
    emit('update:modelValue', payload)
    // console.log('permisos selects de event', payload)
  }
// ✅ Función para convertir array plano en árbol jerárquico
const buildMenuTree = (items) => {
  if (!items || items.length === 0) return [];

  const itemMap = {};
  const rootItems = [];

  // Convertir IDs a strings, name a title, y preparar nodos
  items.forEach(item => {
    itemMap[item.id] = {
      id: String(item.id), // ID como string
      title: item.name,    // title para mostrar en el árbol
      icon: item.icon,     // icono del nodo
      route: item.route,   // ruta del nodo
      children: [],        // inicializar children
    };

    // Si main_options tiene valores, agregarlos como children
    if (item.main_options && item.main_options.length > 0) {
      item.main_options.forEach(option => {
        itemMap[item.id].children.push({
          id: String(option.id),
          title: option.name,
          type: option.type,
        });
      });
    }
  });

  // Construir árbol
  items.forEach(item => {
    const node = itemMap[item.id];
    if (item.parent_id === null || item.parent_id === undefined) {
      rootItems.push(node);
    } else if (itemMap[item.parent_id]) {
      itemMap[item.parent_id].children.push(node);
    }
  });

  // Eliminar propiedad children si está vacía
  const cleanEmptyChildren = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        cleanEmptyChildren(node.children);
      } else {
        delete node.children;
      }
    });
  };

  cleanEmptyChildren(rootItems);

  return rootItems;
};

// watch para verificar los cambios de las props module y obtener los mains
  watch(
    () => props.module,
    (newVal) => {
      if (newVal && newVal.id) {
        try {
          getMains(newVal.id);
          
        } catch (error) {
          console.error('❌ Error en el watcher de module:', error);
        }
      }
    },
    { immediate: true }
  )

</script>
<template>
  <AppCardActions
  :title="'Accesos en ' + (module.nombre ? module.nombre : '')"
  no-actions
  :loading="loading"
  style="overflow: auto;block-size: 70vh;max-block-size: 70vh;"
>
  <v-treeview
  :key="treeKey"
  v-model:selected="model"
  :items="mainsTree"
  item-value="id"
  select-strategy="classic"
  density="compact"
  selectable
  @update:modelValue="onModelUpdate"
>
</v-treeview>
  
</AppCardActions>

</template>

