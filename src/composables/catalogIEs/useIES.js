import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const { getCookies } = useAuthApp()


export const useIES = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getAllIES = async () => {
    try {
      loading.value = true

      const accessData=  getCookies()

      const response = await api.get(`${baseurl}/educative-institutions/all/optimized`,  {
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

      const response = await api.post(`${baseurl}/educative-institutions/batch-store`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })

      
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch de las IES:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchUpdate = async (params = {}) => {
    try {
      loading.value = true

      const accessData = getCookies()

      const response = await api.post(`${baseurl}/educative-institutions/batch-update`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })

      
      return response.data
    } catch (err) {
      console.error('Error al actualizar batch de las IES:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getAllIES,
    batchStore,
    batchUpdate,
    loading,
  }
}
