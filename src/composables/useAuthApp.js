import { useCookie } from '@/@core/composable/useCookie'
import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { useAuthStore } from '@/stores/useAuthStore'
import { ref } from 'vue'

export const useAuthApp = () => {
  const loading = ref(false)
  const authStore = useAuthStore()

  const login = async (params) => {
    try {
      loading.value = true

      const response = await api.post(`/login`, params, {
        headers: {
          Accept: 'application/json',
        },
      })
      
      // ✅ Notificación de éxito
      notify.success('¡Inicio de sesión exitoso!', 2000)
      authStore.setLoginData(response.data.user, response.data.token)
      
      return response.data
    } catch (err) {
      console.error('Error al obtener los datos de sesión:', err)

      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al iniciar sesión', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshToken = async (params) => {
    try {
      loading.value = true

      const accessData = getCookies()

      const response = await api.post(`/refresh`, {}, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      
      //  Notificación de éxito
      //notify.success('¡Inicio de sesión exitoso!', 2000)
      authStore.setLoginData(response.data.user, response.data.token)
      
      return response.data
    } catch (err) {
      console.error('Error al obtener los datos de sesión:', err)

      // Notificación de error
      notify.error(err.response?.data?.message || 'Error al iniciar sesión', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const register = async (params) => {
    try {
      loading.value = true

      const response = await api.post(`/register`, params, {
        headers: {
          Accept: 'application/json',
        },
      })
      
      // ✅ Notificación de éxito
      notify.success('¡Registro exitoso! Por favor inicia sesión.', 3000)
      
      return response.data
    } catch (err) {
      console.error('Error en el registro:', err)
      
      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al registrarse', 4000)
      
      return err
    } finally {
      loading.value = false
    }
  }

  const writeCookies = (accessToken, userData, userPermissions) => {
    useCookie('accessToken').value = accessToken
    useCookie('userData').value = userData
    useCookie('userPermissions').value = userPermissions
  }

  const getUserBySub = async (sub) => {
    try {
      const accessData = getCookies()
      loading.value = true
      let params = { filters:[
        { field: 'sub', operator: '=', value: sub }
      ] }
      const response = await api.post(`/users/search`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
            
      return response.data.data[0] || null
    } catch (err) {
      console.error('Error en el registro:', err)
            
      return err
    } finally {
      loading.value = false
    }
  }

  const clearCookies = () => {
    useCookie('accessToken').value = null
    useCookie('userData').value = null
    useCookie('userPermissions').value = null
    useCookie ('expires_in').value = null
    useCookie ('getTimeToken').value = null
  }

  const getCookies = () => {
    const userDataCookie = useCookie('userData').value

    //const userPermissionsCookie = useCookie('userPermissions').value
    
    return {
      accessToken: useCookie('accessToken').value,
      userData: userDataCookie && typeof userDataCookie === 'string' ? JSON.parse(userDataCookie) : (userDataCookie || {}),

      //userPermissions: userPermissionsCookie && typeof userPermissionsCookie === 'string' ? JSON.parse(userPermissionsCookie) : (userPermissionsCookie || []),
    }
  }

  const logout = async () => {
    try {
      const accessData = getCookies()

      loading.value = true

      const response = await api.post(`/logout`, {}, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })

      notify.success('¡Cierre de sesión exitoso!', 2000)

      return response.data
    } catch (err) {
      console.error('Error al obtener los datos de sesión:', err)

      notify.error(err.response?.data?.message || 'Error al cerrar la sesión', 4000)
      throw err
    } finally {
      clearCookies()
      authStore.clearAuth()      
      loading.value = false
    }
  }

  const getPermissions = async () => {
    try {
      const accessData = getCookies()

      // console.log('Access Data in getPermissions:', accessData)
      // eslint-disable-next-line camelcase
      const params = { user_id: accessData.userData.id, module_id: 1,sub: accessData.userData.sub }
      const token = accessData.accessToken

      loading.value = true
      
      const response = await api.post(`/user-permissions`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      //asignar a auth store
      authStore.setPermissions(response.data || [])
      
      return response.data
    } catch (err) {
      console.error('Error al obtener los permisos del usuario:', err)

      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al obtener los permisos del usuario', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    login,
    register,
    writeCookies,
    clearCookies,
    getCookies,
    loading,
    logout,
    getPermissions,
    refreshToken,
    getUserBySub,
  }
}
