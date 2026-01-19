<script setup>
const themes = [
  {
    name: 'light',
    label: 'Claro',
    icon: 'tabler-sun-high',
  },
  {
    name: 'dark',
    label: 'Oscuro',
    icon: 'tabler-moon-stars',
  },
  {
    name: 'system',
    label: 'Sistema',
    icon: 'tabler-device-desktop-analytics',
  },
]
</script>

<template>
  <ThemeSwitcher :themes="themes" />
</template>
