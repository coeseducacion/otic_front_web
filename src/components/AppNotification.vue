<script setup>
import { useSnackbar } from '@/composables/useSnackBar'

const { notifications, remove } = useSnackbar()
</script>

<template>
  <div class="notification-stack">
    <TransitionGroup name="notification-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
      >
        <VAlert
          :color="notification.type"
          variant="elevated"
          closable
          density="compact"
          class="mb-2 notification-alert"
          @click:close="remove(notification.id)"
        >
          {{ notification.text }}
        </VAlert>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-stack {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  inline-size: 350px;
  inset-block-start: 20px;
  inset-inline-end: 20px;
  pointer-events: none; /* Allow clicks to pass through container */
}

.notification-item {
  pointer-events: auto; /* Re-enable clicks for alerts */
  transition: all 0.3s ease;
}

.notification-alert {
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%) !important;
  color: white !important;
}

/* Transitions */
.notification-list-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.notification-list-leave-active {
  position: absolute;
}
</style>
