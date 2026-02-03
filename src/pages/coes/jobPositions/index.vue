<script setup >
import ListJobPositions from '@/views/coes/jobPositions/ListJobPositions.vue';

definePage({
  meta: {
    layout: 'default',
    requiredPermissions: ['read', 'list'],
  },
})


</script>

<template>
  <ListJobPositions />
</template>
