<script setup>
import { useAuthApp } from '@/composables/useAuthApp'
import { useModulesMainOfAccess } from '@/composables/useModulesMainOfAccess'
import { watch } from 'vue'

const { createMain, updateMain, loading } = useModulesMainOfAccess()
const { getCookies } = useAuthApp()
const props = defineProps({
  data: {
    type: Object,
    required: false,
    default: () => ({
      id: 0,
      module_id: null,
      parent_id: null,
      name: '',
      icon: '',
      route: '#',
      description: '',
    }),
  },
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  moduleId: {
    type: Number,
    required: true,
  },
  parentOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'update:data',
  'update:isDialogVisible',
  'onSaved:data',
])

const mainData = ref({
  id: 0,
  module_id: null,
  parent_id: null,
  name: '',
  icon: '',
  route: '#',
  description: '',
})

watch(
  () => props.data,
  (newData) => {
    mainData.value = { ...newData }
    // Si no viene module_id, usar el del prop moduleId
    if (!mainData.value.module_id) {
      mainData.value.module_id = props.moduleId
    }
    console.log('Main data updated:', mainData.value)
  },
  { immediate: true }
)

const onFormSubmit = async () => {
  // Asegurar que module_id esté presente
  mainData.value.module_id = props.moduleId
  mainData.value.user_id = getCookies().userData.id
  
  if (mainData.value.id > 0) {
    await updateMain(mainData.value.id, mainData.value, props.moduleId)
  } else {
    mainData.value = await createMain(mainData.value, props.moduleId)
  }
  emit('update:isDialogVisible', false)
  emit('onSaved:data', mainData.value)
}

const onFormReset = () => {
  mainData.value = {
    id: 0,
    module_id: props.moduleId,
    parent_id: null,
    name: '',
    icon: '',
    route: '#',
    description: '',
  }
  emit('update:isDialogVisible', false)
  emit('update:data', mainData.value)
}

const dialogModelValueUpdate = val => {
  mainData.value = {
    id: 0,
    module_id: props.moduleId,
    parent_id: null,
    name: '',
    icon: '',
    route: '#',
    description: '',
  }
  emit('update:isDialogVisible', val)
  emit('update:data', mainData.value)
}
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 600"
    :model-value="props.isDialogVisible"
    persistent=""
    @update:model-value="dialogModelValueUpdate"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="dialogModelValueUpdate(false)" />

    <VCard class="pa-sm-4 pa-2">
      <!-- 👉 Title -->
      <VCardTitle>{{ mainData.id > 0 ? 'Editar Menú' : 'Crear Menú' }}</VCardTitle>
      <VCardText class="pa-2">
        <!-- 👉 Form -->
        <VForm
          class="mt-6"
          @submit.prevent="onFormSubmit"
        >
          <VRow>
            <!-- 👉 Name -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="mainData.name"
                label="Nombre"
                maxlength="50"
                :rules="[requiredValidator('El Nombre')]"
              />
            </VCol>

            <!-- 👉 Parent -->
            <VCol cols="12" md="6">
              <AppAutocomplete
                v-model="mainData.parent_id"
                label="Menú Padre"
                :items="parentOptions"
                item-title="name"
                item-value="id"
                clearable
                placeholder="Seleccionar menú padre (opcional)"
              />
            </VCol>

            <!-- 👉 Icon -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="mainData.icon"
                label="Icono"
                maxlength="100"
                placeholder="tabler-home"
              />
            </VCol>

            <!-- 👉 Route -->
            <VCol cols="12" md="6">
              <AppTextField
                v-model="mainData.route"
                label="Ruta"
                maxlength="150"
                placeholder="/dashboard"
              />
            </VCol>

            <!-- 👉 Description -->
            <VCol cols="12">
              <AppTextarea
                v-model="mainData.description"
                label="Descripción"
                maxlength="150"
                rows="3"
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
