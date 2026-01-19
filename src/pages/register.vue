<script setup>
import RegisterSteps from '@/views/users/RegisterSteps.vue';
definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

</script>
<template>
  <RegisterSteps/>
  
</template>
