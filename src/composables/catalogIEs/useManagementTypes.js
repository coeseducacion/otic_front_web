import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const {getCookies} = useAuthApp()


export const useManagementTypes = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getManagementTypes = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/management-types/search?page=${toPage}&limit=${rowsPerPage}`, params, {
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
  

  const batchStore = async (params = {}) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/management-types/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch management-types:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createManagementType = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/management-types`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de gestión creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear tipo de gestión:', err)
      notify.error(err.response?.data?.message || 'Error al crear tipo de gestión', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateManagementType = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/management-types/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de gestión actualizado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar tipo de gestión:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar tipo de gestión', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteManagementType = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.delete(`${baseurl}/management-types/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de gestión eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar tipo de gestión:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar tipo de gestión', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getManagementTypes,
    batchStore,
    createManagementType,
    updateManagementType,
    deleteManagementType,
    loading,
  }
}
