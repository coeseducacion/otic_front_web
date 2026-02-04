<template>
  
  <AppAutocomplete v-if="props.typeControl=='form-select'"
                v-model="vModel"
                v-model:search="searchValue"
                @update:search="debouncedSearch()"
                :label="props.label"
                :items="items"
                :item-value="props.itemValue"
                :item-title="props.concatValues.length ? getConcatValues : props.itemTitle" 
                :loading="loading"
                :rules="props.rules"
                no-filter
                variant="solo"
                :no-data-text="props.noDataText"
                return-object
                @update:model-value="setItemSelected($event)"
                :clearable="props.clearable"
                :multiple="props.multiple"
                :chips="props.chips"
                :closable-chips="props.closableChips"
                :disabled="props.disabled || (loading && !searchValue)"
                
              />
  <VAutocomplete v-else
                v-model="vModel"
                v-model:search="searchValue"
                @update:search="debouncedSearch()"
                :label="props.label"
                :items="items"
                :item-value="props.itemValue"
                :item-title="props.concatValues.length ? getConcatValues : props.itemTitle"
                :loading="loading"
                :rules="props.rules"
                no-filter
                variant="solo"
                :no-data-text="props.noDataText"
                return-object
                @update:model-value="setItemSelected($event)"
                :clearable="props.clearable"
                :disabled="props.disabled || (loading && !searchValue)"
                
              />
  
</template>
<script setup>
import AppAutocomplete from '@/@core/components/app-form-elements/AppAutocomplete.vue'
import { useAuthApp } from '@/composables/useAuthApp'
import { api } from '@/plugins/axios'
import { useDebounce } from '@/utils/debounce'
import { computed, onMounted, ref } from 'vue'

// eventos a emitir: update:model-value
const emit = defineEmits(['update:model-value'])

const {getCookies} = useAuthApp()

const props = defineProps({
  urlApi: {//url para realziar la busqueda
    type: String,
    required: true
  },
  includes: {//arrayq que ralizará includes en la busqueda
    type: Array,
    required: false,
    default: () => []
  },
  filters: {//array para realizar filtros en la busqueda
    type: Array,
    required: false,
    default: () => []
  },
  itemValue: {//campo que se usará como value
    type: String,
    required: false,
    default: 'id'
  },
  itemTitle: {//campo que se usará como title
    type: String,
    required: false,
    default: 'name'
  },
  disabled: {//si es true, el select estará deshabilitado
    type: Boolean,
    required: false,
    default: false
  },
  label: {//etiqueta del select
    type: String,
    required: false,
    default: 'Seleccionar'
  },
  itemsLimit: {//límite de items a obtener
    type: Number,
    required: false,
    default: 15
  },
  itemsSortFields:{//campos por el que se ordenarán los items
    type: Array,
    required: false,
    default: () => []
  },
  getDefault:{//si es true, obtiene los datos al montar el componente
    type:Boolean,
    required:false,
    default:false
  },
  rules: {//reglas de validación
    type: Array,
    required: false,
    default: () => []
  },
  typeControl:{//tipo de control
    type: String,
    required: false,
    default: 'v-autocomplete'
  },
  concatValues:{//si es true, concatena los valores de itemTitle para mostrarlos
    type: Array,
    required: false,
    default: () => []
  },
  concatCharacter:{//caracter que se usará para concatenar los valores
    type: String,
    required: false,
    default: ' '
  },
  clearable: {//si es true, el select será limpiable
    type: Boolean,
    required: false,
    default: true
  },
multiple: {//si es true, el select será multiple
    type: Boolean,
    required: false,
    default: false
  },
chips: {//si es true, el select será multiple y mostrará chips
    type: Boolean,
    required: false,
    default: false
  },
  closableChips: {//si es true, los chips serán cerrables
    type: Boolean,
    required: false,
    default: false
  },
  noDataText: {//texto a mostrar cuando no hay datos
    type: String,
    required: false,
    default: 'No se encontraron resultados'
  },
})

const searchValue=ref('')
const loading=ref(false)
const item=ref()
const items = ref([])
const vModel=ref(null)


// Crear función debounced para getDataFromApi
const debouncedSearch = useDebounce(async () => {
  if(searchValue.value===''){
    //verificamos si tiene el getDefault activado
    if(props.getDefault){
      await getDataFromApi()
    }
    return
  }
  await getDataFromApi()
}, 500)

onMounted(async()=>{
  // searchValue.value='%'
  if(props.getDefault){
    await getDataFromApi()
  }
})

  const getDataFromApi = async () => {
    // console.log('Fetching data with search:', searchValue.value)
    try {
      //construyendo params
      const params = {
        search: { value: searchValue.value },

      }
      //verificamos si ha seleccionado algo para evitar peticiones innecesarias
      if(item.value){
        // Obtenemos el título usando la misma lógica que getConcatValues
        const currentTitle = props.concatValues && props.concatValues.length > 0 
          ? getConcatValues.value(item.value)
          : item.value[props.itemTitle]
        
        if(currentTitle === searchValue.value || searchValue.value === ''){
          // console.log('Evitando petición: el valor buscado coincide con el item seleccionado o está vacío')
          return
        }
      }
      
      //veriricamos si tiene includes
      if (props.includes) {
        params.includes = props.includes
      }
      //verificamos si tiene filters
      if (props.filters) {
        params.filters = props.filters
      }
      // verificamos si tiene sortFields
      if (props.itemsSortFields && props.itemsSortFields.length > 0) {
        params.sort = props.itemsSortFields
      }

      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${props.urlApi}/search?&limit=${props.itemsLimit}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      items.value = response.data.data
      // console.log('Response selectes:', response)
      return response.data
    } catch (err) {
      console.error('Error al obtener los datos de sesión:', err)
      // ✅ Notificación de error
      // notify.error(err.response?.data?.message || 'Error al iniciar sesión', 4000)
      
      throw err
    } finally {
      loading.value = false
    }
  }
  
//funcion para limpiar el item actual
  //funcion para limpiar todos los resultados
  const clearAllItems = () => {
    items.value = []
  }


  const setItemSelected = (newItem) => {
    // console.log('Setting item from outside:', newItem)
    item.value = newItem
    emit('update:model-value',  item.value)
    // console.log('Item set from outside:', item.value)
  }
  // Función que devuelve el valor concatenado del item para mostrar en el control autocomplete
const getConcatValues = computed(() => {
  return (item) => {
    if (!item || !props.concatValues || props.concatValues.length === 0) {
      return item?.[props.itemTitle] || ''
    }

    return props.concatValues
      .map(field => {
        // Resolve nested properties (e.g., 'province.name')
        return field.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : undefined, item)
      })
      .filter(value => value !== null && value !== undefined && value !== '')
      .join(props.concatCharacter)
  }
})

//funcion para setear valores desde afuera
const setSelectedValue = (newValue) => {
  item.value = newValue
  vModel.value = newValue
  emit('update:model-value', item.value)
}

//funcion para insertar items al select
const setItems = (newItems) => {
  items.value = newItems
}
//funcion para obtener todos los items actuales
const getAllItems = () => {
  return items.value
}

defineExpose({
  getDataFromApi,
  getAllItems,
  setSelectedValue,
  clearAllItems,
  setItems
})

</script>
