<script setup >
import { useAuthApp } from '@/composables/useAuthApp'
import { useUserPermissions } from '@/composables/useUserPermissions'
import ListCheckMains from '../mains/ListCheckMains.vue'
import ListOptionModules from '../modules/ListOptionModules.vue'

const { getCookies } = useAuthApp()
const { getPermissions, syncPermissions,loading:loadingSyncPermisssions } = useUserPermissions()
  
const emit = defineEmits([
  'update:data',
  'update:isDialogVisible',
  'onSaved:data',
])

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
})
const moduleData = ref({})
const userPermissions = ref([])
const userPermissionIds = ref([])
const dialogModelValueUpdate = val => {
  // moduleData.value = {}
  emit('update:isDialogVisible', val)
  // emit('update:data', moduleData.value)
}

// funcion que obtiene los permisos del usuario para el modulo seleccionado
const getUsersPermissions = async (modules) => {
  moduleData.value = modules
  
  if(props.user.id){
    userPermissions.value = await getPermissions(props.user.id)
    userPermissionIds.value = userPermissions.value.data.map(permission => permission.id)
    // console.log('User permissions:', userPermissions.value)
    // console.log('User permission IDs:', userPermissionIds.value)
  }
}


</script>
<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 800"
    :model-value="props.isDialogVisible"
    persistent=""
    @update:model-value="dialogModelValueUpdate"
    @afterLeave="moduleData = {}"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-4 pa-2">
      <!-- 👉 Title -->
      <VCardTitle class="bg-red-500" >Accesos de {{ props.user.name }}</VCardTitle>
      <VCardText class="pa-2">
        
          <VRow>
            
            <VCol
              cols="12"
              md="6"
            >
              <ListOptionModules @onSelectedModule="getUsersPermissions($event)"/>
            </VCol>

            
            <VCol
              cols="12"
              md="6"
            >
              <ListCheckMains 
              :module="moduleData"
              :userPermissions="userPermissionIds"
              @update:model-value="userPermissionIds = $event"
              />
            </VCol>


            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
                <VBtn type="button" 
                @click="syncPermissions(userPermissionIds,user.id)"
                :loading="loadingSyncPermisssions"
                >
                <VIcon
                  start
                  icon="tabler-device-floppy"
                />
                Guardar
                </VBtn>

              <VBtn
                color="secondary"
                variant="tonal"
                @click="emit('update:isDialogVisible', false)"
                
              >
              <VIcon
                  start
                  icon="tabler-x"
                />
                Cancelar
              </VBtn>
            </VCol>
          </VRow>
        
      </VCardText>
    </VCard>
  </VDialog>
</template>
