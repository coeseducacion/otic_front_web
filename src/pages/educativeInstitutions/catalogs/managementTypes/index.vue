<script setup>
import ListManagementTypes from '@/views/educativeInstitutions/catalogs/managementTypes/ListManagementTypes.vue';

definePage({
  meta: {
    layout: 'default',
  },
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <ListManagementTypes />
    </VCol>
  </VRow>
</template>
