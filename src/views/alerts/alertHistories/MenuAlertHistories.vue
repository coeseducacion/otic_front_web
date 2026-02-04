<script setup>
  import { notify } from '@/plugins/notify';
import { useAlertHistories } from '@/composables/catalogAlerts/useAlertHistories';

const emit = defineEmits([
    'onAdded:alertStatusHistory',
  ])

const { createAlertHistory, loading:loadingAlertHistory } = useAlertHistories()
const props = defineProps({
    listStatuses: {
      type: Array,
      required: true,
      default: () => [],
    },
    alertStatusHistories: {
      type: Array,
      required: true,
      default: () => [],
    },
})

  const menu = ref(false)
 
 //funcion para buscar y saber que estados tiene la alerta
 const hasStatus = (statusId) => {
    let statusAlert=  props.alertStatusHistories.some(history => history.alert_status_id === statusId);
    if (statusAlert){
        return true
    } else {
        return false
    }
  }
  // funcion que busca el disabled for en alertStatusHistories para ver si debemos deshabilitar
  const isDisabledStatus = (statusId)=>{
    //identificamos los id por los cuales son deshabilitados el status
    let statuses=props.listStatuses.filter(status => status.id === statusId)//obtiene array de disabled_for [4,5] que son lo ids de los estados que le pueden deshabilitar
    if (statuses.length===0) return false //si no encuentra el estado retorna false
    let disabledForIds=transformArrayToIds(statuses[0].disabled_for)

    //buscamos en el historial de estados si alguno de esos ids esta presente
    for (let i = 0; i < disabledForIds.length; i++) {
      let idToCheck = disabledForIds[i]
        let found = props.alertStatusHistories.some(history => history.alert_status_id === idToCheck)
        if (found){
            // console.log('✅ Estado deshabilitador encontrado:', idToCheck)
            return true //si encuentra alguno retorna true
        }
    }
    return false //si no encuentra ninguno retorna false
  }

  const transformArrayToIds = (array) => {
    // Normalizar el campo `disabled_for` a un array de IDs numéricos.
    const raw = array
    let disabledForIds = []

    if (Array.isArray(raw)) {
      // Puede venir como [1,2] o [{id:1},{id:2}]
      disabledForIds = raw.map(v => (v && typeof v === 'object' ? v.id : v))
        .map(n => Number(n))
        .filter(n => !Number.isNaN(n))
    } else if (typeof raw === 'string') {
      // string válido JSON -> "[5,4]"
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          disabledForIds = parsed.map(n => Number(n)).filter(n => !Number.isNaN(n))
        } else {
          // fallback a extracción por regex
          disabledForIds = raw.replace(/[^0-9,]/g, '').split(',').filter(Boolean).map(n => Number(n))
        }
      } catch (e) {
        // Manejar casos como "[3,4,]" o "3,4"
        disabledForIds = raw.replace(/[^0-9,]/g, '').split(',').filter(Boolean).map(n => Number(n))
      }
    } else {
      disabledForIds = []
    }
    return disabledForIds
  }

  const validateChangeStatus = (statusId) => {
    let found = false
    //buscamos si ya existe status id en el historial
    let existsStatus= props.alertStatusHistories.some(history => history.alert_status_id === statusId);
    if (existsStatus){
        notify.warning('El estado seleccionado ya fue asignado a la alerta',4000)
        return false
    }
    switch (statusId) {
      case 3:
        //buscamos en el historial de estados si alguno de esos ids esta presente
        found = props.alertStatusHistories.some(history => history.alert_status_id === 2)
        if (!found){
            notify.error('La alerta debe ser leída para cambiar el estado a "Verificación"',4000)
            return false //si encuentra alguno retorna true
        }
        return true
      case 4:
        //buscamos en el historial de estados si alguno de esos ids esta presente
         found = props.alertStatusHistories.some(history => history.alert_status_id === 3)
        if (!found){
            notify.error('La alerta debe ser verificada para cambiar el estado a "Validada"',4000)
            return false //si encuentra alguno retorna true
        }
        return true
      case 5:
        //buscamos en el historial de estados si alguno de esos ids esta presente
         found = props.alertStatusHistories.some(history => history.alert_status_id === 2)
        if (!found){
            notify.error('La alerta debe ser leída para cambiar el estado a "Rechazado"',4000)
            return false //si encuentra alguno retorna true
        }
        return true
      default:
        return true
    }
  }
  // funcino para actualizar el estado de la alerta
  const addAlertStatusHistory = async(statusId,alertId) => {
    //validar si puede cambiar al estado
    if (!validateChangeStatus(statusId)){
        return
    }
    let payload={
        alert_id: alertId,
        alert_status_id: statusId,
    }
    const alertStatusHistory=await createAlertHistory(payload)
    emit('onAdded:alertStatusHistory', alertStatusHistory.data || alertStatusHistory)
  }
</script>
<template>
    <VMenu
      v-model="menu"
      :close-on-content-click="false"
      location="end"
    >
      <template v-slot:activator="{ props }">
        <VBtn
          color="secondary"
          size="small"
          v-bind="props"
          icon="tabler-circle-check"
          :v-tooltip="'Estados '"
        >
        </VBtn>
      </template>
      <VCard min-width="200" class="border-solid" >
        <VCardTitle class="d-flex justify-space-between align-center bg-secondary text-white pa-2">
        <span class="text-h6 text-white">
          Estados de la alerta
        </span>
      </VCardTitle>
    <VCardText class="bg-primary" style="padding: 1px;" >
        <v-list density="compact" style="border-radius: 2px !important;">
            <v-list-item
                v-for="(item, i) in listStatuses"
                :key="i"
                :value="item"
                color="primary"
                :disabled="item.is_write_system || isDisabledStatus(item.id)"
                @click="addAlertStatusHistory(item.id,props.alertStatusHistories[0]?.alert_id)"
                >
                <template v-slot:prepend>
                    <v-icon :icon="item.st_icon" color="primary"></v-icon>
                </template>
                    <v-list-item-title v-text="item.name"></v-list-item-title>
                <template v-slot:append>
                    <VTooltip text="Limpiar filtros">
                        <template #activator="{ props }">
                            <v-icon v-if="hasStatus(item.id)" v-bind="props" icon="mdi-check-circle"  color="success"></v-icon>
                        </template>
                    </VTooltip>
                </template>
            </v-list-item>
        </v-list>
    </VCardText>
    </VCard>
    </VMenu>
</template>