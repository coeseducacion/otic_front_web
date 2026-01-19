import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from './useAuthApp'

const {getCookies} = useAuthApp()


export const useMainOptions = () => {
  const loading = ref(false)

  const getMainOptions = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`/main-options/search?page=${toPage}&limit=${rowsPerPage}`, params, {
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
      notify.error(err.response?.data?.message || 'Error al obtener las opciones del menú', 4000)
      
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMainOption = async (data) => {
    try {
      loading.value = true
      // agregar user id al data
      data.user_id = getCookies().userData.id
      const accessData=  getCookies()
      const response = await api.post(`/main-options`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('opción creada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear la opción:', err)
      notify.error(err.response?.data?.message || 'Error al crear la opción', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMainOption = async (id, data) => {
    try {
      loading.value = true
      // agregar user id al data
      data.user_id = getCookies().userData.id
      const accessData=  getCookies()
      const response = await api.put(`/main-options/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Opción actualizada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar la opción:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar la opción', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMainOption = async (id) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.delete(`/main-options/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Opción eliminada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar la opción:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar la opción', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getMainOptions,
    loading,
    createMainOption,
    updateMainOption,
    deleteMainOption,
  }
}
