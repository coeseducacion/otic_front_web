import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const { getCookies } = useAuthApp()

export const useAlertStatuses = () => {
  const loading = ref(false)
  const baseurl = import.meta.env.VITE_API_COES_URL

  const getAlertStatuses = async (params = {}, rowsPerPage = 15, toPage = 1) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/alert-statuses/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al obtener estados de alerta:', err)
      notify.error(err.response?.data?.message || 'Error al obtener estados de alerta', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchStore = async (params = {}) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/alert-statuses/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch alert-statuses:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAlertStatuses = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/alert-statuses`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Estado de alerta creado exitosamente', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear estado de alerta:', err)
      notify.error(err.response?.data?.message || 'Error al crear estado de alerta', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAlertStatuses = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/alert-statuses/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Estado de alerta actualizado exitosamente', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar estado de alerta:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar estado de alerta', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAlertStatuses = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      await api.delete(`${baseurl}/alert-statuses/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Estado de alerta eliminado exitosamente', 2000)
    } catch (err) {
      console.error('Error al eliminar estado de alerta:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar estado de alerta', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getAlertStatuses,
    batchStore,
    createAlertStatuses,
    updateAlertStatuses,
    deleteAlertStatuses,
    loading,
  }
}
