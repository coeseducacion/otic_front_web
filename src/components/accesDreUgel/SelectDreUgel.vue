<script setup>
import SingleSelect from '../selects/SingleSelect.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePersons } from '@/composables/Coes/usePersons'
import { onMounted } from 'vue'

const emit = defineEmits(['update:dre','update:ugel','accessDataLoaded'])

const authStore = useAuthStore()
const {getPersons:getAccessData,loading:loadingAccesData} = usePersons()

const singleSelectDresRef = ref(null)
const singleSelectUgelsRef = ref(null)

const dresAccess = ref([])
const ugelsAccess=ref([])
const ugelSData=ref(null)
const dreSelected = ref(null)
const ugelSelected = ref(null)
const disableDreSelect=ref(false)
const disableUgelSelect=ref(false)
const dateNow=new Date().toISOString().split('T')[0]

onMounted(async()=>{
  const accessData=await getAccessDataUser();
  
  dresAccess.value = getUniqueDresFromPerson(accessData.data[0])
  console.log('Datos de acceso del usuario:', accessData)
    console.log('DREs con acceso del usuario:', dresAccess.value)
    if(dresAccess.value.length >0){//si cuenta con dres asignadas
      setAvailableDres(dresAccess.value)//insertamos las dres al select
        if(dresAccess.value.length===1){//si solo tiene una dre asignada
      disableDreSelect.value = true //deshabilitamos el select de dres
      //asignamos la dre al select
      singleSelectDresRef.value.setSelectedValue(dresAccess.value[0])
      //asignamos al dre selected
      dreSelected.value=dresAccess.value[0]
      //obtenemos las ugels de la dre asignada
      ugelsAccess.value = getUgelsByDreId(accessData.data[0],dresAccess.value[0].id)
      setAvailableUgels(ugelsAccess.value)//insertamos las ugels al select
      //ferificamos si solo tiene una ugel para deshabilitar el select
      if(ugelsAccess.value.length>=1){//si tiene ugels asignadas
        //si solo tiene una ugel
        if(ugelsAccess.value.length===1){//si solo tiene una ugel asignada
          disableUgelSelect.value = true//deshabilitamos el select de ugels
        }
        singleSelectUgelsRef.value.setSelectedValue(ugelsAccess.value[0])
        ugelSelected.value=ugelsAccess.value[0]
        emit('update:dre',dreSelected.value)
        emit('update:ugel',ugelSelected.value)
      }
    }else if(dresAccess.value.length===0){
      //si es administrador de sistema
      disableDreSelect.value = false
      disableUgelSelect.value = false
      singleSelectDresRef.value.getDataFromApi()
    }
    
  }else{// si no tiene dres asignadas
    //si es administrador de sistema
      disableDreSelect.value = false
      disableUgelSelect.value = false
      singleSelectDresRef.value.getDataFromApi()
}
    emit('accessDataLoaded',true)
})

//funcion para obtener si tiene accesos asignados
const getAccessDataUser=async()=>{
  if(authStore.userData || authStore.userData===undefined){
    //obtener desde la coockie
    const userDataCookie = useCookie('userData').value
    // console.log('Cargando datos de usuario desde cookie:', userDataCookie);
    if(userDataCookie){
      authStore.userData=userDataCookie
    }
  }
  // console.log('Obteniendo accesos del usuario:', authStore.userData);
  const paramsAccessData={
    includes: [
                {
                  relation: 'positionPersons',
                  filters: [
                    {field: 'positionPersons.is_validated', operator: '=', value: true},
                    {field: 'positionPersons.is_active', operator: '=', value: true},
                    {field: 'positionPersons.start_date', operator: '<=', value: dateNow},
                    {field: 'positionPersons.start_date', operator: '>=', value: dateNow}
                  ]
                },
                {relation:'positionPersons.ugel'},
                {relation:'positionPersons.dre'}
              ],
              filters: [
                {field: 'user_id->id', operator: '=', value: authStore.userData.id}
              ]
            }

  return await getAccessData(paramsAccessData,1,1);
  
}
//funcion que inserta las dres al select
const setAvailableDres=(dres)=>{
  if (singleSelectDresRef.value) {
    singleSelectDresRef.value.setItems(dres);
  }
}
//obtener la dres unicas
const getUniqueDresFromPerson = (personData) => {
  if (!personData?.position_persons) return []
  
  const dreMap = new Map()
  
  personData.position_persons.forEach(pp => {
    if (pp.dre?.id) {
      dreMap.set(pp.dre.id, pp.dre)
    }
  })
  
  return Array.from(dreMap.values())
}
//obtener las ugels que pertenecen a las dres
const getUgelsByDreId = (accessData = {}, dreId = 1) => {
  const ugels = new Map()
  
  if (accessData?.position_persons) {
    accessData.position_persons.forEach(pp => {
      if (pp.dre_id === dreId && pp.ugel?.id) {
        ugels.set(pp.ugel.id, pp.ugel)
      }
    })
  }
  
  return Array.from(ugels.values())
}

//funcion que inserta las ugels al select
const setAvailableUgels=(ugels)=>{
  if (singleSelectUgelsRef.value) {
    // limpiamos el objeto
    singleSelectUgelsRef.value.clearAllItems();
    singleSelectUgelsRef.value.setSelectedValue(null);
    singleSelectUgelsRef.value.setItems(ugels);
  }
}
const onDreSelected=async (val)=>{
  if(val){
    dreSelected.value=val;
    ugelSelected.value=null;
    singleSelectUgelsRef.value.clearAllItems();
    singleSelectUgelsRef.value.setSelectedValue(null);
    ugelSData.value=null;
    // console.log('DRE seleccionada:', val);
    //verificamos si es administrador de sistema dresAccess===0
    if(ugelsAccess.value.length===0){
      //obtenemos todas las ugels de la dre seleccionada
      await nextTick()
      await singleSelectUgelsRef.value.getDataFromApi()
      ugelSData.value=singleSelectUgelsRef.value.getAllItems()
    //   console.log('UGELs obtenidas de la API:', ugelSData.value)
      return
    }
    //obtenemos las ugels de la dre seleccionada
    ugelsAccess.value = getUgelsByDreId(accessDataUser.value.data[0],val.id);
    setAvailableUgels(ugelsAccess.value);
    
    emit('update:dre',dreSelected.value)
    
  }else{
    // console.log('DRE deseleccionada y limpiar ugel');
    dreSelected.value=null;
    ugelSelected.value=null;
    ugelSData.value=null;
    singleSelectUgelsRef.value.clearAllItems();
    singleSelectUgelsRef.value.setSelectedValue(null);
    emit('update:dre',null)
    emit('update:ugel',null)
  }
}

const onUgelSelected= async (val)=>{
  if(val){
    ugelSelected.value=val
    emit('update:ugel',ugelSelected.value)
  }else{
    ugelSelected.value=null
    emit('update:ugel',null)
  }
}
const baseUrlCoes=import.meta.env.VITE_API_COES_URL;
</script>

<template>
    <SingleSelect
          ref="singleSelectDresRef"
          style="inline-size: 200px;"
          :urlApi="dresAccess ? `${baseUrlCoes}/api-dres` : ''"
          label="DRE"
          :items-limit="50"
          :disabled="disableDreSelect"
          @update:model-value="onDreSelected"
          />
        <SingleSelect
          ref="singleSelectUgelsRef"
          style="inline-size: 250px;"
          :urlApi="dreSelected ? `${baseUrlCoes}/api-dre/${dreSelected.id}/ugels` : ''"
          label="UGEL"
          :items-limit="50"
          :disabled="disableUgelSelect"
          @update:model-value="onUgelSelected"
          />
          
</template>