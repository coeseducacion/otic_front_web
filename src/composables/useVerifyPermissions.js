import { useAuthStore } from '@/stores/useAuthStore'
import { useRoute } from 'vue-router'

export const useVerifyPermissions = () => {
  const authStore = useAuthStore()
  const route = useRoute()

  // Busca recursivamente un nodo por su propiedad `route` en el árbol de menús
  const findMenuByRoute = (menus, targetRoute) => {
    if (!Array.isArray(menus)) return null
    for (const menu of menus) {
      if (!menu || typeof menu !== 'object') continue
      if (menu.route === targetRoute) return menu
      if (Array.isArray(menu.children) && menu.children.length > 0) {
        const found = findMenuByRoute(menu.children, targetRoute)
        if (found) return found
      }
    }
    return null
  }

  // Obtiene todas las main_options para la ruta actual
  const getPermissions = () => {
    try {
      const permissions = authStore.getPermissions
      if (!permissions) return []
      
      // Si getPermissions retorna un array de menús directamente
      if (Array.isArray(permissions)) {
        const targetRoute = route.name
        if (!targetRoute) return []
        const menu = findMenuByRoute(permissions, targetRoute)
        return menu?.main_options || []
      }
      
      return []
    } catch (error) {
      console.error('Error en useVerifyPermissions.getPermissions:', error)
      return []
    }
  }

  /**
   * Verifica si el usuario tiene un permiso específico en la ruta actual
   * @param {string} requiredName - Nombre del permiso a verificar (ej. "List", "Create", "Edit", "Delete")
   * @returns {boolean} true si el usuario tiene el permiso
   * 
   * Uso:
   * - hasPermission('List') - verifica si tiene permiso List
   * - hasPermission('Create') - verifica si tiene permiso Create
   * - hasPermission('Edit') - verifica si tiene permiso Edit
   * - hasPermission('Delete') - verifica si tiene permiso Delete
   */
  const hasPermission = (requiredName = '') => {
    try {
      if (!requiredName || typeof requiredName !== 'string') return false
      const options = getPermissions()
      // console.log('Verificando permiso:', requiredName, 'en opciones:', options)
      if (!options || options.length === 0) return false
      return options.some(opt => opt && opt.name === requiredName)
    } catch (error) {
      console.error('Error en useVerifyPermissions.hasPermission:', error)
      return false
    }
  }

  return {
    getPermissions,
    hasPermission,
  }
}
