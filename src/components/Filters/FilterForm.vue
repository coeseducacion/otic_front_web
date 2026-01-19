<template>
  <div class="text-center">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="end"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          color="success"
          size="small"
          v-bind="props"
          rounded=""
          icon="tabler-filter"
        >
        </v-btn>
      </template>

      <v-card min-width="600">
        <v-list>
          <v-list-item
            prepend-icon="tabler-filter"
            subtitle="Personaliza tus filtros"
            title="Aplicar filtros"
          >
            <template v-slot:append>
              <VTooltip text="Limpiar filtros">
              <template #activator="{ props }">
              <VBtn
                icon="tabler-filter-cancel"
                v-bind="props"
                
                variant="text"
                @click="filterCleared()"
              ></VBtn>
              </template>
              </VTooltip>
            </template>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list>
          <v-list-item>
            <VForm @submit.prevent="validateAddApplyFilter()"> 
              <div class="d-flex flex-row flex-nowrap py-1" style=" align-items: center;gap: 12px; inline-size: 100%; overflow-x: auto;">
                <VSelect
                v-if="filtersApply.length>=1"
                v-model="filterSelected.type"
                :items="typeConditions"
                item-title="title"
                item-value="value"
                label="Tipo"
                max-width="80"
                
                 variant="outlined"
                 @update:model-value="console.log(filterSelected)"
              />
              <VSelect
                v-model="filterSelected.field"
                :items="filterableFields"
                item-title="title"
                item-value="filterColumnName"
                label="Columna"
                max-width="130"
                return-object=""
                 variant="outlined"
                 @update:model-value="console.log(filterSelected)"
              />
              <VSelect
                v-model="filterSelected.operator"
                :items="operators"
                item-title="title"
                item-value="value"
                label="Operador"
                max-width="130"
                return-object=""
                 variant="outlined"
                 @update:model-value="console.log(filterSelected)"
              />
              <VTextField
              label="Valor"
               variant="outlined"
                v-model="filterSelected.value"
              />
               <VTooltip text="Agregar filtro">
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    color="info"
                    icon="tabler-filter-plus"
                    type="submit"
                    />
                </template>
              </VTooltip>
            </div>
            </VForm>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item>
            <div class="d-flex flex-row flex-wrap" style=" align-items: center;gap: 8px;">
              <VChip
                v-for="(filter, index) in filtersApply"
                :key="filter.field"
                @click:close="filtersApply.splice(index, 1)"
                color="primary" text-color="white" class="ma-1" closable="">
                {{ index>=1? filter.type==='and' ? 'Tipo: Y :: ' : 'Tipo: O :: ' : '' }} {{ filter.column }} {{ filter.operator }}  {{ filter.value }}
              </VChip>
            </div>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            variant="text"
            color="secondary"
            @click="menu = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="success"
            variant="text"
            @click="menu = false;applyFilters()"
          >
            Aplicar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>
<script setup>
  import { notify } from '@/plugins/notify'
import { ref } from 'vue'


  const emit = defineEmits(['apply-filters'])
  const props=defineProps({
    columns: {
      type: Array,
      default: () => [],
      required: true
    }
  })

  const filterableFields = props.columns.filter(c => c.filterable !== false)

  const menu = ref(false)
  const appliedFilters = ref(false)
  const operators = ref([
    { title: 'Igual', value: '=' },
    { title: 'Menor', value: '<' },
    { title: 'Mayor', value: '>' },
    { title: 'Menor o igual', value: '<=' },
    { title: 'Mayor o igual', value: '>=' },
    { title: 'Distinto', value: '!=' },
    { title: 'Contiene', value: 'like' },
    { title: 'No contiene', value: 'not like' },
    { title: 'Dentro de', value: 'in' },
    { title: 'No dentro de', value: 'not in' },
    { title: 'Todos dentro de', value: 'all in' },
    { title: 'Alguno dentro de', value: 'any in' }
  ])

  const filterSelected = ref({
    field: null,
    value: null,
    operator: null,
    column: null,
    type: 'and'
  })

  const typeConditions = ref([
    { title: 'Y', value: 'and' },
    { title: 'O', value: 'or' }
  ])
const filtersApply = ref([])

const validateAddApplyFilter = () => {
  if(filterSelected.value.field && filterSelected.value.operator && filterSelected.value.value){
    //Agregar a la lista de filtros aplicados
    filtersApply.value.push({
      field: filterSelected.value.field.filterColumnName,
      column: filterSelected.value.field.title,
      operator: filterSelected.value.operator.value,
      value: filterSelected.value.value,
      type: filterSelected.value.type
    })
    //Limpiar selección
    filterSelected.value.field = null
    filterSelected.value.operator = null    
    filterSelected.value.value = null
  }
  else{
    notify.error('Seleccione todos los campos para agregar el filtro', 2000)
  }
}


//funcion que cambiara el params para realizar la consulta en la tabla
const applyFilters = () => {
  /*
  creamos el array del filters:[
  {field:'name', operator:'=', value:'John'}, type solo va si es la segunda condicion en adelante
  {field:'status', operator:'like', value:'active', type:'and'},
  {field:'age', operator:'>', value:'30', type:'or'}
  ]
  */


  const filters = filtersApply.value.map((f, index) => {
    const base = {
      field: f.field,
      operator: f.operator,
      value: f.value
    }
    return index > 0 && f.type==='or' ? { ...base, type: f.type } : base
  })
  emit('apply-filters', filters)

}

// funcion para limpiar todos los filtros aplicados
const filterCleared = () => {
  if(filtersApply.value.length > 0){
    filtersApply.value = []
    emit('apply-filters', [])
  }
}

</script>
