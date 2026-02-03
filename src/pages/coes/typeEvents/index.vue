<script setup >

import ListTypeEvents from '@/views/coes/typeEvents/ListTypeEvents.vue';

definePage({
  meta: {
    layout: 'default',
    requiredPermissions: ['read', 'list'],
  },
})


</script>

<template>
  <ListTypeEvents />
</template>
