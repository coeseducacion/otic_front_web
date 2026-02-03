import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const { getCookies } = useAuthApp()

export const useEventClassifications = () => {
  const loading = ref(false)
  const baseurl = import.meta.env.VITE_API_COES_URL

  const getEventClassifications = async (params = {}, rowsPerPage = 15, toPage = 1) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/event-classifications/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al obtener clasificaciones de eventos:', err)
      notify.error(err.response?.data?.message || 'Error al obtener clasificaciones de eventos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchStore = async (params = {}) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/event-classifications/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch event-classifications:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createEventClassifications = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/event-classifications`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Clasificación de evento creada exitosamente', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear clasificación de evento:', err)
      notify.error(err.response?.data?.message || 'Error al crear clasificación de evento', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEventClassifications = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/event-classifications/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Clasificación de evento actualizada exitosamente', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar clasificación de evento:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar clasificación de evento', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEventClassifications = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      await api.delete(`${baseurl}/event-classifications/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Clasificación de evento eliminada exitosamente', 2000)
    } catch (err) {
      console.error('Error al eliminar clasificación de evento:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar clasificación de evento', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getEventClassifications,
    batchStore,
    createEventClassifications,
    updateEventClassifications,
    deleteEventClassifications,
    loading,
  }
}
