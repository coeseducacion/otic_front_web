import { useAuthApp } from '@/composables/useAuthApp'
import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'

const {getCookies} = useAuthApp()


export const useTypeEvents = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getTypeEvents = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/type-events/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
    //   console.log('Response modules:', response)
      return response.data
    } catch (err) {
      console.error('Error al obtener los tipos de evento:', err)
      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al obtener los tipos de evento', 4000)
      
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTypeEvent = async (data) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/type-events`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de Evento creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear el tipo de evento:', err)
      notify.error(err.response?.data?.message || 'Error al crear el tipo de evento', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTypeEvent = async (id, data) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.put(`${baseurl}/type-events/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de Evento actualizado exitosamente!', 2000)
      return response.data
    } catch (err) { 
      console.error('Error al actualizar el tipo de evento:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar el tipo de evento', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTypeEvent = async (id) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.delete(`${baseurl}/type-events/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de Evento eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar el tipo de evento:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar el tipo de evento', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getTypeEvents,
    loading,
    createTypeEvent,
    updateTypeEvent,
    deleteTypeEvent,
  }
}
