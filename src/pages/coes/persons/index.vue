<script setup >
import ListPersons from '@/views/coes/persons/ListPersons.vue';

definePage({
  meta: {
    layout: 'default',
    requiredPermissions: ['read', 'list'],
  },
})


</script>

<template>
  <ListPersons />
</template>
