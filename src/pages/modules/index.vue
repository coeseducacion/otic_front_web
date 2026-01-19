<script setup >
import ListMainsByModule from '@/views/mains/ListMainsByModule.vue';
import ListModules from '@/views/modules/ListModules.vue';

definePage({
  meta: {
    layout: 'default',
    requiredPermissions: ['read', 'list'],
  },
})

const ListMains = ref(null);
</script>

<template>
  <VRow>
    <VCol cols="12"
    md="7"
    >
      <ListModules @onSelectedModule="ListMains.getMainsWithOptions($event)"/>
    </VCol>
    <VCol cols="12"
    md="5"
    >
      <ListMainsByModule ref="ListMains" />
    </VCol>
  </VRow>
    
</template>
