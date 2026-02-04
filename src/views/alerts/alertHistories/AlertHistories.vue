<script setup>

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  alertData: {
    type: Object,
    required: true,
    default: () => [],
  },
})

const dialogModelValueUpdate = (val) => {
  if (!val) {
    
  }
  emit('update:isDialogVisible', val)
}


const emit = defineEmits([
  'update:isDialogVisible',
  'update:alertStatusData',
  'onSaved:alertStatusData',
])

const baseUrlCoes=import.meta.env.VITE_API_COES_URL;
</script>
<template>
    <VDialog persistent=""
    :model-value="props.isDialogVisible"
    max-width="600"
    @update:model-value="dialogModelValueUpdate"
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center bg-primary text-white pa-4">
        <span class="text-h6 text-white">
          Estados de la Alerta
        </span>
        <VBtn
          icon="tabler-x"
          variant="text"
          size="small"
          color="white"
          @click="dialogModelValueUpdate(false)"
        />
      </VCardTitle>

      <VCardText>
        <VForm ref="formAlertStatusRef" >
          <VRow>
            <!-- Nombre -->
            <!-- <VCol cols="12">
              <div class="d-flex flex-wrap ga-2" >
                <SingleSelect
                get-default=""
                :url-api="`${baseUrlCoes}/alert-statuses`"
                :filters="[{field:'id',operator:'>',value:'2'}]"
                />
                <VBtn
                  
                  color="success"
                  variant="elevated">
                  Agregar
                </VBtn>
              </div>
            </VCol> -->
            <VCol cols="12">
              <table class="elevation-1" style="width: 100%;">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <VChip size="small" color="info" text-color="white">Recibido</VChip>
                    </td>
                    <td>2026-01-28 08:15</td>
                    <td>maria.gomez</td>
                    <td class="d-flex justify-center gap-2">
                      <VCheckbox
                        model-value="true"
                        disabled=""
                        />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <VChip size="small" color="grey" text-color="white">Leído</VChip>
                    </td>
                    <td>2026-01-29 09:40</td>
                    <td>carlos.ramirez</td>
                    <td class="d-flex justify-center gap-2">
                      <VCheckbox
                        model-value="true"
                        disabled=""
                        />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <VChip size="small" color="warning" text-color="white">Verificación</VChip>
                    </td>
                    <td>2026-01-30 11:05</td>
                    <td>laura.sanchez</td>
                    <td class="d-flex justify-center gap-2">
                     <VCheckbox
                        model-value="true"
                        
                        />
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <VChip size="small" color="success" text-color="white">Validado</VChip>
                    </td>
                    <td>2026-01-31 14:20</td>
                    <td>juan.perez</td>
                    <td class="d-flex justify-center gap-2">
                      <VCheckbox
                        model-value="true"
                        
                        />
                      <!-- <VBtn icon="tabler-eye" size="small" variant="text" title="Ver" />
                      <VBtn icon="tabler-check" size="small" variant="text" title="Revisar" />
                      <VBtn icon="tabler-trash" size="small" variant="text" title="Eliminar" /> -->
                    </td>
                  </tr>
                </tbody>
              </table>
            </VCol>
         </VRow>
        </VForm>
     </VCardText>
    </VCard>
</VDialog>
</template>