<script setup >
import ListEducationLevels from '@/views/educativeInstitutions/catalogs/EducationLevels/ListEducationLevels.vue';

definePage({
  meta: {
    layout: 'default',
    requiredPermissions: ['read', 'list'],
  },
})

</script>

<template>
  <VRow>
    <VCol cols="12"
    >
      <ListEducationLevels />
    </VCol>
  </VRow>
    
</template>
