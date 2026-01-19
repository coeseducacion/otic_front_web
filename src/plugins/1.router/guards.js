import { useAuthApp } from "@/composables/useAuthApp"
import { useAuthStore } from "@/stores/useAuthStore"

function findIdByRoute(menus, targetRoute) {
  for (const menu of menus) {
    // Verificar si el route coincide en el nivel actual
    if (menu.route === targetRoute) {
      return menu.id
    }
    
    // Si tiene children, buscar recursivamente
    if (menu.children && menu.children.length > 0) {
      const foundId = findIdByRoute(menu.children, targetRoute)
      if (foundId !== null) {
        return foundId
      }
    }
  }
  
  // No encontrado
  return null
}

export const setupGuards = router => {
  // outer.beforeEach
  router.beforeEach(async to => {
    // ✅ Llamar a useAuthStore DENTRO del beforeEach para asegurar que Pinia esté inicializada
    const authStore = useAuthStore()
    const authApp = useAuthApp()

    // console.log('Navegando a:', to.name)
    // console.log('Meta:', JSON.stringify(to.meta, null, 2))
    
    /*
     * 1️Si es una ruta pública, permitir acceso
     * Ejemplos: landing page, 404, términos y condiciones
     */
    if (to.meta.public === true) {
      // console.log('Ruta pública, acceso permitido')
      return undefined
    }

    /**
     * 2️Verificar si el usuario está autenticado
     * Revisa si existen token y datos de usuario en cookies
     */
    const userData = useCookie('userData').value
    const accessToken = useCookie('accessToken').value
    let permissionsUser =  authStore.getPermissions || []

    console.log(' Permisos del usuario desde el store:', permissionsUser.length)

  

    const isLoggedIn = !!(userData && accessToken)
  
    //verificamos si hay datos en permisisonUser
    if (permissionsUser.length === 0 && isLoggedIn) {
      //asignar a permissionsCookie desde store
      //console.log(' Obteniendo permisos desde el store')
      permissionsUser = await authApp.getPermissions()

      //console.log(' Permisos obtenidos:', permissionsUser)
    }

    /*
     * 3️Rutas solo para NO autenticados (login, register, forgot-password)
     * Si ya está logueado, redirigir al home
     */
    if (to.meta.unauthenticatedOnly === true) {
      // console.log(' Ruta solo para NO autenticados')
      
      if (isLoggedIn) {
        // console.log('Usuario ya autenticado, redirigiendo a /')
        return '/'
      }
      
      // console.log('Usuario NO autenticado, permitiendo acceso')
      return undefined
    }

    /*
     * 4️Todas las demás rutas requieren autenticación
     * Si no está logueado, redirigir al login
     */
    if (!isLoggedIn) {
      console.log(' Ruta protegida - Usuario NO autenticado')
      console.log('Redirigiendo a login...')
      
      return {
        name: 'login',
        query: {
          ...to.query,

          // Guardar la ruta a la que intentaba acceder
          to: to.fullPath !== '/' ? to.fullPath : undefined,
        },
      }
    }

    /*
     * 5 Usuario autenticado, permitir acceso
     * TODO: Aquí se agregarán las validaciones de permisos por ruta
     */
    // console.log('Usuario autenticado, acceso permitido')

    // console.log('Permisos del usuario desde la cookie:', permissionsCookie)
    // buscar el path en los permisos
    const foundId = findIdByRoute(permissionsUser, to.name)

    // si no tiene acceso pero ingresa la ruta manualmente se le redirige not authorized

    if (!foundId && to.path!=='/') {
      console.log(' Usuario NO autorizado para acceder a esta ruta')
      
      return { name: 'not-authorized' }
    }

    return undefined
  })
}
