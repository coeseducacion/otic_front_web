import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const {getCookies} = useAuthApp()


export const useManagementSectorIes = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getManagementSectorIes = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/management-sector-ies/search?page=${toPage}&limit=${rowsPerPage}`, params, {
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
      const response = await api.post(`${baseurl}/management-sector-ies/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch management-sector-ies:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createManagementSectorIes = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/management-sector-ies`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Sector de gestión creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear sector de gestión:', err)
      notify.error(err.response?.data?.message || 'Error al crear sector de gestión', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateManagementSectorIes = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/management-sector-ies/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Sector de gestión actualizado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar sector de gestión:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar sector de gestión', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteManagementSectorIes = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.delete(`${baseurl}/management-sector-ies/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Sector de gestión eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar sector de gestión:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar sector de gestión', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getManagementSectorIes,
    batchStore,
    createManagementSectorIes,
    updateManagementSectorIes,
    deleteManagementSectorIes,
    loading,
  }
}
