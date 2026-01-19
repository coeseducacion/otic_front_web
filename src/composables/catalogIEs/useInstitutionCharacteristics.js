import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const {getCookies} = useAuthApp()


export const useInstitutionCharacteristics = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getInstitutionCharacteristics = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/institution-characteristics/search?page=${toPage}&limit=${rowsPerPage}`, params, {
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
      const response = await api.post(`${baseurl}/institution-characteristics/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch institution-characteristics:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createInstitutionCharacteristic = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/institution-characteristics`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Característica de institución creada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear característica de institución:', err)
      notify.error(err.response?.data?.message || 'Error al crear característica de institución', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateInstitutionCharacteristic = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/institution-characteristics/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Característica de institución actualizada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar característica de institución:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar característica de institución', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteInstitutionCharacteristic = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.delete(`${baseurl}/institution-characteristics/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Característica de institución eliminada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar característica de institución:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar característica de institución', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getInstitutionCharacteristics,
    batchStore,
    createInstitutionCharacteristic,
    updateInstitutionCharacteristic,
    deleteInstitutionCharacteristic,
    loading,
  }
}
