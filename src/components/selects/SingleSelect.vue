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
                :no-data-text="searchValue ? 'No se encontraron resultados' : 'Escribe para buscar...'"
                return-object
                @update:model-value="setItemSelected($event)"
                :clearable="props.clearable"
                :multiple="props.multiple"
                :chips="props.chips"
                :closable-chips="props.closableChips"
                :disabled="loading && !searchValue"
              />
  <VAutocomplete v-else
                v-model="vModel"
                v-model:search="searchValue"
                @update:search="debouncedSearch()"
                :label="props.label"
                :items="items"
                :item-value="props.itemValue"
                :item-title="props.itemTitle"
                :loading="loading"
                :rules="props.rules"
                no-filter
                variant="solo"
                :no-data-text="searchValue ? 'No se encontraron resultados' : 'Escribe para buscar...'"
                return-object
                @update:model-value="setItemSelected($event)"
                clearable
                :disabled="loading && !searchValue"
              />
  
</template>
<script setup>
import AppAutocomplete from '@/@core/components/app-form-elements/AppAutocomplete.vue'
import { useAuthApp } from '@/composables/useAuthApp'
import { api } from '@/plugins/axios'
import { useDebounce } from '@/utils/debounce'
import { onMounted, ref } from 'vue'

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
  label: {//etiqueta del select
    type: String,
    required: false,
    default: 'Seleccionar'
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
})

const searchValue=ref('')
const loading=ref(false)
const item=ref()
const items = ref([])
const vModel=ref(null)

// Crear función debounced para getDataFromApi
const debouncedSearch = useDebounce(async () => {
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
      
      const params = {
        search: { value: searchValue.value }
      }
      //verificamos si ha seleccionado algo
      if(item.value){
        //verificamos si existe concatValues
        if(props.concatValues && props.concatValues.length > 0){
          //obtenemos el valor concatenado del item seleccionado
          const concatenatedValue = props.concatValues
            .map(field => item.value[field])
            .filter(value => value !== null && value !== undefined && value !== '')
            .join(props.concatCharacter)
          //comparamos si el valor concatenado es igual al searchValue
          if( concatenatedValue === searchValue.value){
            // console.log('identificamos que el el losefocus por concat ')
            return
          }
        }
        //existe algun item seleccionado
        if( searchValue.value===''){
          //este search cambia por el lose focus pero si ya tienes un item seleccionado detiene la petición
          return
        }
        // verificamos si el items eleccionado es igual al searchValue
        if(item.value[props.itemTitle] === searchValue.value){
          // console.log('identificamos que el el losefocus ')
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

      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${props.urlApi}/search?&limit=30`, params, {
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
      .map(field => item[field])
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

defineExpose({
  getDataFromApi,
  setSelectedValue
})

</script>
