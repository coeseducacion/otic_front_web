import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const {getCookies} = useAuthApp()


export const useAreaTypeIes = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getAreaTypeIes = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/area-type-ies/search?page=${toPage}&limit=${rowsPerPage}`, params, {
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
      const response = await api.post(`${baseurl}/area-type-ies/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch area-type-ies:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAreaTypeIes = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/area-type-ies`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Tipo de área creado exitosamente', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear tipo de área:', err)
      notify.error(err.response?.data?.message || 'Error al crear tipo de área', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAreaTypeIes = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/area-type-ies/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Tipo de área actualizado exitosamente', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar tipo de área:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar tipo de área', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAreaTypeIes = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      await api.delete(`${baseurl}/area-type-ies/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Tipo de área eliminado exitosamente', 2000)
    } catch (err) {
      console.error('Error al eliminar tipo de área:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar tipo de área', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getAreaTypeIes,
    batchStore,
    createAreaTypeIes,
    updateAreaTypeIes,
    deleteAreaTypeIes,
    loading,
  }
}

