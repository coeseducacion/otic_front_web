<script setup >
import ListUsers from '@/views/users/ListUsers.vue';

definePage({
  meta: {
    layout: 'default',
    requiredPermissions: ['read', 'list'],
  },
})


</script>

<template>
  <ListUsers />
</template>
