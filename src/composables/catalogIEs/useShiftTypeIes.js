import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const {getCookies} = useAuthApp()


export const useShiftTypeIes = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getShiftTypeIes = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/shift-type-ies/search?page=${toPage}&limit=${rowsPerPage}`, params, {
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
      const response = await api.post(`${baseurl}/shift-type-ies/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch shift-type-ies:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createShiftTypeIes = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/shift-type-ies`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de turno creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear tipo de turno:', err)
      notify.error(err.response?.data?.message || 'Error al crear tipo de turno', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateShiftTypeIes = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/shift-type-ies/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de turno actualizado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar tipo de turno:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar tipo de turno', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteShiftTypeIes = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.delete(`${baseurl}/shift-type-ies/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de turno eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar tipo de turno:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar tipo de turno', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getShiftTypeIes,
    batchStore,
    createShiftTypeIes,
    updateShiftTypeIes,
    deleteShiftTypeIes,
    loading,
  }
}
