import axios from 'axios'
// Note: avoid importing composables at module initialization to prevent
// circular dependency issues (composables may import `api` from this file).
// We'll import composables lazily inside interceptors when needed.

// Configuración base de la API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_URL || 'https://127.0.0.1:9020/api',

  // baseURL: import.meta.env.VITE_API_BASE_URL || 'https://testgrd.coeseducacion.pe/api',
  
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Interceptor de peticiones - Agregar token automáticamente
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// Interceptor de respuestas - Manejar errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Token inválido o expirado
      try {
        const { useAuthApp } = await import('@/composables/useAuthApp')
        const { useKeycloak } = await import('@/composables/useKeycloak')

        const { clearCookies } = useAuthApp()
        const { logoutKeycloak } = useKeycloak()

        clearCookies()
        logoutKeycloak()
      } catch (e) {
        // If lazy import fails (should be rare), fallback to clearing local token
        localStorage.removeItem('token')
      }

      window.location.href = '/login'
    }

    // Manejar errores de permisos
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized'
    }

    return Promise.reject(error)
  }
)

// Plugin para Vue
export default function (app) {
  // Hacer axios disponible globalmente
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
}

export { api, axios }
