import { useAuthApp } from '@/composables/useAuthApp'
import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'

const {getCookies} = useAuthApp()


export const useAlerts = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getAlerts = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/alerts/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
    //   console.log('Response modules:', response)
      return response.data
    } catch (err) {
      console.error('Error al obtener los datos de alertas:', err)
      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al obtener los datos de alertas', 4000)

      throw err
    } finally {
      loading.value = false
    }
  }

  const createAlert = async (data) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/alerts`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Alerta creada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear la alerta:', err)
      notify.error(err.response?.data?.message || 'Error al crear la alerta', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAlert = async (id, data) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.put(`${baseurl}/alerts/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Alerta actualizada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar la alerta:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar la alerta', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAlert = async (id) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.delete(`${baseurl}/alerts/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Alerta eliminada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar la alerta:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar la alerta', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const patchAlert = async (id, data) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.patch(`${baseurl}/alerts/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Alerta actualizada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar la alerta:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar la alerta', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getAlerts,
    loading,
    createAlert,
    updateAlert,
    deleteAlert,
    patchAlert,
  }
}
