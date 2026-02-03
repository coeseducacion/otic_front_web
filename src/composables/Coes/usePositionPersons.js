import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const {getCookies} = useAuthApp()


export const usePositionPersons = () => {
  const loading = ref(false)
  const loadingPatch = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getPositionPersons = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/position-persons/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al obtener los datos de directorio:', err)
      notify.error(err.response?.data?.message || 'Error al obtener directorio', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }
  

  const createPositionPerson = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/position-persons`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Directorio creada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear directorio:', err)
      notify.error(err.response?.data?.message || 'Error al crear directorio', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePositionPerson = async (id, data) => {
    try {
      loadingPatch.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/position-persons/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Directorio actualizada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar directorio:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar la posición de persona', 4000)
      throw err
    } finally {
      loadingPatch.value = false
    }
  }

  const deletePositionPerson = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.delete(`${baseurl}/position-persons/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Directorio eliminada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar directorio:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar directorio', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchStore = async (params = {}) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/position-persons/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch directorio:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getPositionPersons,
    createPositionPerson,
    updatePositionPerson,
    deletePositionPerson,
    batchStore,
    loading,
    loadingPatch
  }
}
