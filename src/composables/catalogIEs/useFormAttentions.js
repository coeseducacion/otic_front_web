import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const {getCookies} = useAuthApp()


export const useFormAttentions = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getFormAttentions = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/form-attentions/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
    //   console.log('Response modules:', response)
      return response.data
    } catch (err) {
      console.error('Error al obtener formas de atención:', err)
      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al obtener formas de atención', 4000)
      
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const batchStore = async (params = {}) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/form-attentions/batch`, params, {
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

  const createFormAttention = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/form-attentions`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Forma de atención creada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear forma de atención:', err)
      notify.error(err.response?.data?.message || 'Error al crear forma de atención', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFormAttention = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/form-attentions/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Forma de atención actualizada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar forma de atención:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar forma de atención', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteFormAttention = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.delete(`${baseurl}/form-attentions/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Forma de atención eliminada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar forma de atención:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar forma de atención', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getFormAttentions,
    batchStore,
    createFormAttention,
    updateFormAttention,
    deleteFormAttention,
    loading,
  }
}
