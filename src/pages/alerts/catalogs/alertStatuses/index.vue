<script setup>
import ListAlertStatuses from '@/views/alerts/catalogs/alertStatuses/ListAlertStatuses.vue';

definePage({ meta: { layout: 'default' } })
</script>

<template>
  <VRow>
    <VCol cols="12">
      <ListAlertStatuses />
    </VCol>
  </VRow>
</template>
