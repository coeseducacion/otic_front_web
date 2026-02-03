import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const {getCookies} = useAuthApp()


export const useEducationLevels = () => {
  const loading = ref(false)
  const baseurl=import.meta.env.VITE_API_COES_URL

  const getEducationLevels = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`${baseurl}/education-levels/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
    //   console.log('Response modules:', response)
      return response.data
    } catch (err) {
      console.error('Error al obtener niveles educativos:', err)
      // ✅ Notificación de error
      notify.error(err.response?.data?.message || 'Error al obtener niveles educativos', 4000)
      
      throw err
    } finally {
      loading.value = false
    }
  }
  

  const batchStore = async (params = {}) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/education-levels/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch education-levels:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createEducationLevel = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/education-levels`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Nivel educativo creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear nivel educativo:', err)
      notify.error(err.response?.data?.message || 'Error al crear nivel educativo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEducationLevel = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/education-levels/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Nivel educativo actualizado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar nivel educativo:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar nivel educativo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEducationLevel = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.delete(`${baseurl}/education-levels/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Nivel educativo eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar nivel educativo:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar nivel educativo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getEducationLevels,
    batchStore,
    createEducationLevel,
    updateEducationLevel,
    deleteEducationLevel,
    loading,
  }
}
