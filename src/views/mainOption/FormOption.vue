<script setup>
import { useMainOptions } from '@/composables/useMainOptions'
import { watch } from 'vue'

const { createMainOption, updateMainOption, loading } = useMainOptions()

const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      main_of_access_id: null,
      name: '',
      type: '',
    }),
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  }
})

const emit = defineEmits([
  'update:data',
  'update:isDialogVisible',
  'onSaved:data',
])

const optionData = ref({
  id: 0,
  main_of_access_id: null,
  name: '',
  type: '',
})

watch(
  () => props.data,
  (newData) => {
    optionData.value = { ...newData }
    console.log('Option data updated:', optionData.value)
  },
  { immediate: true }
)

const onFormSubmit = async () => {
  
  if (optionData.value.id > 0) {
    await updateMainOption(optionData.value.id, optionData.value)
  } else {
    optionData.value = await createMainOption(optionData.value)
  }
  emit('update:isDialogVisible', false)
  emit('onSaved:data', optionData.value)
}

const onFormReset = () => {
  optionData.value = {
    id: 0,
    main_of_access_id: props.mainOfAccessId,
    name: '',
    type: '',
  }
  emit('update:isDialogVisible', false)
  emit('update:data', optionData.value)
}

const dialogModelValueUpdate = val => {
  optionData.value = {
    id: 0,
    main_of_access_id: props.mainOfAccessId,
    name: '',
    type: '',
  }
  emit('update:isDialogVisible', val)
  emit('update:data', optionData.value)
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 450"
    :model-value="props.isDialogVisible"
    persistent=""
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-4 pa-2">
      <!-- 👉 Title -->
      <VCardTitle>{{ optionData.id > 0 ? 'Editar Opción' : 'Crear Opción' }}</VCardTitle>
      <VCardText class="pa-2">
        <!-- 👉 Form -->
        <VForm
          class="mt-6"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- 👉 Name -->
            <VCol cols="12">
              <AppTextField
                v-model="optionData.name"
                label="Nombre"
                maxlength="50"
                :rules="[requiredValidator('El Nombre')]"
                placeholder="read, create, edit, delete"
              />
            </VCol>

            <!-- 👉 Type -->
            <VCol cols="12">
              <AppTextField
                v-model="optionData.type"
                label="Tipo"
                maxlength="50"
                placeholder="Tipo de opción (opcional)"
              />
            </VCol>

            <!-- 👉 Submit and Cancel -->
            <VCol
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <VBtn type="submit" :loading="loading">
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
