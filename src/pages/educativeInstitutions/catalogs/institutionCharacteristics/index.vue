<script setup >
import ListInstitutionCharacteristics from '@/views/educativeInstitutions/catalogs/institutionCharacteristics/ListInstitutionCharacteristics.vue';

definePage({
  meta: {
    layout: 'default',
  },
})

</script>

<template>
  <VRow>
    <VCol cols="12"
    >
      <ListInstitutionCharacteristics />
    </VCol>
  </VRow>
    
</template>
