<script setup >

import ListTypeContracts from '@/views/coes/typeContracts/ListTypeContracts.vue';

definePage({
  meta: {
    layout: 'default',
    requiredPermissions: ['read', 'list'],
  },
})


</script>

<template>
  <ListTypeContracts />
</template>
