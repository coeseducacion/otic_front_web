import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'


export const useReniec = () => {
  const loading = ref(false)

  const getDNI = async (params) => {
    try {
      loading.value = true
      const response = await api.post(`/consult-public/search/document`, params, {
        headers: {
          Accept: 'application/json',
        },
      })
      // console.log('Response DNI:', response)
      return response.data
    } catch (err) {
      console.error('Error al obtener datos del DNI:', err)
      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al obtener datos del DNI', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  

  return {
    getDNI,
    loading,
  }
}
