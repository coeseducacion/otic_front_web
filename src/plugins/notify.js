import { useSnackbar } from '@/composables/useSnackBar'

// Obtener la instancia del composable (singleton)
const snackbar = useSnackbar()

// Exportar las funciones para uso global
export const notify = {
  success: (text, duration = 4000) => {
    snackbar.success(text, duration)
  },
  
  error: (text, duration = 4000) => {
    snackbar.error(text, duration)
  },
  
  warning: (text, duration = 4000) => {
    snackbar.warning(text, duration)
  },
  
  info: (text, duration = 4000) => {
    snackbar.info(text, duration)
  },
  
  show: ({ text, type = 'success', duration = 4000 }) => {
    snackbar.showNotification({ text, type, duration })
  },
  
  close: () => {
    snackbar.close()
  },
}

// Exportar también el composable por si se necesita acceso directo al estado
export { useSnackbar }

