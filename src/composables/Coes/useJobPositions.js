import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const { getCookies } = useAuthApp()

export const useJobPositions = () => {
  const loading = ref(false)
  const baseurl = import.meta.env.VITE_API_COES_URL

  const getJobPositions = async (params = {}, rowsPerPage = 15, toPage = 1) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/job-positions/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al obtener los datos de puestos de trabajo:', err)
      notify.error(err.response?.data?.message || 'Error al obtener puestos de trabajo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createJobPosition = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/job-positions`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Puesto de trabajo creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear el puesto de trabajo:', err)
      notify.error(err.response?.data?.message || 'Error al crear el puesto de trabajo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateJobPosition = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/job-positions/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Puesto de trabajo actualizado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar el puesto de trabajo:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar el puesto de trabajo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteJobPosition = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.delete(`${baseurl}/job-positions/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Puesto de trabajo eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar el puesto de trabajo:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar el puesto de trabajo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchStore = async (params = {}) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/job-positions/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch api-persons:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getJobPositions,
    createJobPosition,
    updateJobPosition,
    deleteJobPosition,
    batchStore,
    loading,
  }
}
