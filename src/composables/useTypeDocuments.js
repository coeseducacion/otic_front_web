import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'


export const useTypeDocuments = () => {
  const loading = ref(false)

  const getTypeDocuments = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
        const response = await api.post(`/type-documents/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
        },
      })
    //   console.log('Response modules:', response)
      return response.data
    } catch (err) {
      console.error('Error al obtener datos del tipo de documento:', err)
      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al obtener datos del tipo de documento', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  

  return {
    getTypeDocuments,
    loading,
  }
}
