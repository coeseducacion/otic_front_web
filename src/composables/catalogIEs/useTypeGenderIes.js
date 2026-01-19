import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const {getCookies} = useAuthApp()


export const useTypeGenderIes = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getTypeGenderIes = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/type-gender-ies/search?page=${toPage}&limit=${rowsPerPage}`, params, {
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
      const response = await api.post(`${baseurl}/type-gender-ies/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch type-gender-ies:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTypeGenderIes = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/type-gender-ies`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de género creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear tipo de género:', err)
      notify.error(err.response?.data?.message || 'Error al crear tipo de género', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTypeGenderIes = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/type-gender-ies/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de género actualizado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar tipo de género:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar tipo de género', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTypeGenderIes = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.delete(`${baseurl}/type-gender-ies/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de género eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar tipo de género:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar tipo de género', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getTypeGenderIes,
    batchStore,
    createTypeGenderIes,
    updateTypeGenderIes,
    deleteTypeGenderIes,
    loading,
  }
}
