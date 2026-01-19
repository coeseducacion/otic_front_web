import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

// Configuración base de la API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://eproeh.ugelhuancavelica.gob.pe/back/public/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor de peticiones - Agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuestas - Manejar errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Token inválido o expirado
      const authStore = useAuthStore()
      authStore.logout()
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
