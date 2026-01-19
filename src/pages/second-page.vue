<script setup>
// ✅ definePage es un macro global de unplugin-vue-router
// No necesita importación, pero debe estar ANTES de cualquier otro código

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

// Si tienes otros imports o código, van después de definePage
</script>
<template>
  <div>
    <VCard title="Create Awesome 🙌">
      <VCardText>This is your second page.</VCardText>
      <VCardText>
        Chocolate sesame snaps pie carrot cake pastry pie lollipop muffin.
        Carrot cake dragée chupa chups jujubes. Macaroon liquorice cookie
        wafer tart marzipan bonbon. Gingerbread jelly-o dragée
        chocolate.
      </VCardText>
    </VCard>
  </div>
</template>
