import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from './useAuthApp'

const {getCookies} = useAuthApp()


export const useUserPermissions = () => {
  const loading = ref(false)

  const getPermissions =async (userId) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.get(`/user/${userId}/permissions?limit=2000`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al obtener los permisos:', err)
      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al obtener los permisos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }
  
 const syncPermissions = async (rsc,userId) => {

    try {
      const accessData=  getCookies()
      loading.value = true
      const response = await api.patch(`/user/${userId}/permissions/sync`, { resources: rsc }, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Permisos sincronizados exitosamente!', 2000)
      // console.log('Sincronización de permisos:', response)
      return response.data
    } catch (err) {
      console.error('Error al sincronizar permisos:', err)
      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al sincronizar permisos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getPermissions,
    syncPermissions,
    loading,
  }
}

