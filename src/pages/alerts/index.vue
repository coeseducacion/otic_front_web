<script setup >
import ListAlerts from '@/views/alerts/ListAlerts.vue';

definePage({
  meta: {
    layout: 'default',
    requiredPermissions: ['read', 'list'],
  },
})


</script>

<template>
  <ListAlerts />
</template>
