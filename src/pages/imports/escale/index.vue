<script setup >

import EscaleImport from '@/views/educativeInstitutions/EscaleImport.vue';

definePage({
  meta: {
    layout: 'default',
    requiredPermissions: ['read', 'list'],
  },
})


</script>

<template>
  <EscaleImport />
</template>
