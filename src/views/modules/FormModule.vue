<script setup>
import { useModules } from '@/composables/useModules'
import { watch } from 'vue'


const {createModule,updateModule,loading} =useModules()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      nombre: '',
      descripcion:'',
    }),
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:data',
  'update:isDialogVisible',
  'onSaved:data',
])

const moduleData = ref({
  id: 0,
  nombre: '',
  descripcion:'',
})

watch(
  () => props.data,
  (newData) => {
    moduleData.value = {...newData}
    console.log('Module data updated:', moduleData.value)
  },
  { immediate: true }
)


const onFormSubmit = async() => {
  if (moduleData.value.id>0) {
    await updateModule(moduleData.value.id, moduleData.value)
  }else{
    moduleData.value = await createModule(moduleData.value)
  }
  emit('update:isDialogVisible', false)
  emit('onSaved:data', moduleData.value)
}

const onFormReset = () => {
  moduleData.value = {
  id: 0,
  nombre: '',
  descripcion:'',
}
  emit('update:isDialogVisible', false)
  emit('update:data', moduleData.value)
}

const dialogModelValueUpdate = val => {
   moduleData.value = {
  id: 0,
  nombre: '',
  descripcion:'',
}
  emit('update:isDialogVisible', val)
  emit('update:data', moduleData.value)
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 400"
    :model-value="props.isDialogVisible"
    persistent=""
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-4 pa-2">
      <!-- 👉 Title -->
      <VCardTitle class="bg-red-500" >{{ moduleData.id > 0 ? 'Editar Módulo' : 'Crear Módulo' }}</VCardTitle>
      <VCardText class="pa-2">
        <!-- 👉 Form -->
        <VForm
          class="mt-6"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- 👉  Name -->
            <VCol
              cols="12"
            >
              <AppTextField
                v-model="moduleData.nombre"
                label="Nombre"
                maxlength="150"
                :rules="[requiredValidator('El Nombre')]"
              />
            </VCol>

            <!-- 👉 Descripción -->
            <VCol
              cols="12"
            >
              <AppTextField
                v-model="moduleData.descripcion"
                label="Descripción"
                maxlength="250"
              />
            </VCol>


            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
                <VBtn type="submit" :loading="loading" >
                <VIcon
                  start
                  icon="tabler-device-floppy"
                />
                Guardar
                </VBtn>

              <VBtn
                color="secondary"
                variant="tonal"
                @click="onFormReset"
              >
              <VIcon
                  start
                  icon="tabler-x"
                />
                Cancelar
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
