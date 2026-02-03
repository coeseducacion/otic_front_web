<script setup >

import ListPositionPersons from '@/views/coes/posittionPersons/ListPositionPersons.vue';

definePage({
  meta: {
    layout: 'default',
    requiredPermissions: ['read', 'list'],
  },
})


</script>

<template>
  <ListPositionPersons />
</template>
