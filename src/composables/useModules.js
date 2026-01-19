import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from './useAuthApp'

const {getCookies} = useAuthApp()


export const useModules = () => {
  const loading = ref(false)

  const getModules = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`/modules/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
    //   console.log('Response modules:', response)
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
  
  const createModule = async (data) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`/modules`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Módulo creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear el módulo:', err)
      notify.error(err.response?.data?.message || 'Error al crear el módulo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateModule = async (id, data) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.put(`/modules/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Módulo actualizado exitosamente!', 2000)
      return response.data
    } catch (err) { 
      console.error('Error al actualizar el módulo:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar el módulo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteModule = async (id) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.delete(`/modules/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Módulo eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar el módulo:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar el módulo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getModules,
    loading,
    createModule,
    updateModule,
    deleteModule,
  }
}
