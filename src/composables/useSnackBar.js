import { ref } from 'vue'

const notifications = ref([])
let nextId = 0

export const useSnackbar = () => {
  const remove = id => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const showNotification = ({ 
    text, 
    type = 'success', 
    duration = 3000, 
  }) => {
    const id = nextId++
    const notification = { id, text, type, duration }

    notifications.value.push(notification)

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
  }

  const success = (text, duration = 3000) => {
    showNotification({ text, type: 'success', duration })
  }

  const error = (text, duration = 4000) => {
    showNotification({ text, type: 'error', duration })
  }

  const warning = (text, duration = 3500) => {
    showNotification({ text, type: 'warning', duration })
  }

  const info = (text, duration = 3000) => {
    showNotification({ text, type: 'info', duration })
  }

  const close = id => {
    if (id !== undefined) {
      remove(id)
    } else {
      // Close all or last? Let's clear all for backward compatibility of "close()"
      notifications.value = []
    }
  }

  return {
    // Estado
    notifications,

    // Métodos
    showNotification,
    success,
    error,
    warning,
    info,
    close,
    remove,
  }
}
