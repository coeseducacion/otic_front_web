import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from './useAuthApp'

const {getCookies} = useAuthApp()


export const useModulesMainOfAccess = () => {
  const loading = ref(false)

  const getMainsByModule = async ( params={},rowsPerPage=15,toPage=1,moduleId) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`/module/${moduleId}/mains-of-accesses/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
    //   console.log('Response modules:', response)
      return response.data
    } catch (err) {
      console.error('Error al obtener los datos de Menús:', err)
      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al Obtener los datos de Menús', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const createMain = async (data,moduleId) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`/module/${moduleId}/mains-of-accesses`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Módulo creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear el menú:', err)
      notify.error(err.response?.data?.message || 'Error al crear el menú', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMain = async (id, data,moduleId) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.put(`/module/${moduleId}/mains-of-accesses/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Menú actualizado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar el menú:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar el menú', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMain = async (id,moduleId) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.delete(`/module/${moduleId}/mains-of-accesses/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Menú eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar el menú:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar el menú', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getMainsByModule,
    loading,
    createMain,
    updateMain,
    deleteMain,
  }
}
