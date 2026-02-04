import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const { getCookies } = useAuthApp()

export const useAlertHistories = () => {
  const loading = ref(false)
  const baseurl = import.meta.env.VITE_API_COES_URL

  const getAlertHistories = async (params = {}, rowsPerPage = 15, toPage = 1) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/alert-status-histories/search?page=${toPage}&limit=${rowsPerPage}`, params, {
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
      const response = await api.post(`${baseurl}/alert-status-histories/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch historial de alertas:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAlertHistory = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/alert-status-histories`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Historial de alerta creado exitosamente', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear historial de alerta:', err)
      notify.error(err.response?.data?.message || 'Error al crear historial de alerta', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAlertHistory = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/alert-status-histories/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Historial de alerta actualizado exitosamente', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar historial de alerta:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar historial de alerta', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAlertHistories = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      await api.delete(`${baseurl}/alert-status-histories/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('Historial de alerta eliminado exitosamente', 2000)
    } catch (err) {
      console.error('Error al eliminar historial de alerta:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar historial de alerta', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getAlertHistories,
    batchStore,
    createAlertHistory,
    updateAlertHistory,
    deleteAlertHistories,
    loading,
  }
}
