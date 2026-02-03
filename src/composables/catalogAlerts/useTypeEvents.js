import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const { getCookies } = useAuthApp()

export const useTypeEvents = () => {
  const loading = ref(false)
  const baseurl = import.meta.env.VITE_API_COES_URL

  const getTypeEvents = async (params = {}, rowsPerPage = 15, toPage = 1) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/type-events/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al obtener tipos de eventos:', err)
      notify.error(err.response?.data?.message || 'Error al obtener tipos de eventos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchStore = async (params = {}) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/type-events/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch type-events:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTypeEvents = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/type-events`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Tipo de evento creado exitosamente', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear tipo de evento:', err)
      notify.error(err.response?.data?.message || 'Error al crear tipo de evento', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTypeEvents = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/type-events/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Tipo de evento actualizado exitosamente', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar tipo de evento:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar tipo de evento', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTypeEvents = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      await api.delete(`${baseurl}/type-events/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Tipo de evento eliminado exitosamente', 2000)
    } catch (err) {
      console.error('Error al eliminar tipo de evento:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar tipo de evento', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getTypeEvents,
    batchStore,
    createTypeEvents,
    updateTypeEvents,
    deleteTypeEvents,
    loading,
  }
}
