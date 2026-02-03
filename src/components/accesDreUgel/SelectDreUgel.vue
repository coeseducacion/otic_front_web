<script setup>
import SingleSelect from '../selects/SingleSelect.vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePersons } from '@/composables/Coes/usePersons'
import { onMounted } from 'vue'

const authStore = useAuthStore()
const {getPersons:getAccessData,loading:loadingAccesData} = usePersons()


const dresAccess = ref([])
const dreSelected = ref(null)
const ugelSelected = ref(null)
const dateNow=new Date().toISOString().split('T')[0]

onMounted(async()=>{
  const accessData=await getAccessDataUser();
  console.log('Datos de acceso del usuario:', accessData);
  dresAccess.value = getUniqueDresFromPerson(accessData.data[0]);
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


const baseUrlCoes=import.meta.env.VITE_API_COES_URL;
</script>

<template>
    <SingleSelect
          ref="singleSelectDresRef"
          
          style="inline-size: 200px;"
          :urlApi="dresAccess ? `${baseUrlCoes}/api-dres` : ''"
          label="DRE"
          :items-limit="50"
          />
        <SingleSelect
          ref="singleSelectUgelsRef"
          style="inline-size: 250px;"
          :urlApi="dreSelected ? `${baseUrlCoes}/api-dre/${dreSelected.id}/ugels` : ''"
          label="UGEL"
          :items-limit="50"
          />
          
</template>