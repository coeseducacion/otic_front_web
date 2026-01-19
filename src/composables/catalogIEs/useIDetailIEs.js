import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const { getCookies } = useAuthApp()


export const useDetailIEs = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getDetails = async idIE => {
    try {
      loading.value = true

      const accessData=  getCookies()

      const response = await api.post(`${baseurl}/detail-ies`, { id: idIE }, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })


      //   console.log('Response modules:', response)
      return response.data
    } catch (err) {
      console.error('Error al obtener los datos de sesión:', err)

      // Notificación de error
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

      const response = await api.post(`${baseurl}/detail-ies/batch-store`, params, {
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


  return {
    getDetails,
    batchStore,
    loading,
  }
}
