<script setup>
import { useModules } from '@/composables/useModules';
import { onMounted } from 'vue';

const { getModules, loading } = useModules();

const emit = defineEmits(['onSelectedModule']);

const moduleId = ref()
const modules = ref([])
// funcion que se ejcuta al montar el componente y obtiene los modulos
onMounted( async() => {
  modules.value = await getModules()
})

const findModuleById = (id) => {
  return modules.value.data.find(module => module.id === id);
};

</script>

<template>
  <AppCardActions
  title="Módulos"
  no-actions
  :loading="loading"
  style="overflow: auto;block-size: 70vh;max-block-size: 70vh;"
>
<VRadioGroup v-model="moduleId" @update:modelValue="emit('onSelectedModule', findModuleById($event))">
    <VRadio v-for="module in modules.data" :key="module.id"
      :label="module.nombre"
      :value="module.id"
    />
  </VRadioGroup>
  
</AppCardActions>
  
</template>
