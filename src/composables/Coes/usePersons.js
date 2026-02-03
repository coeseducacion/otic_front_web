import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const { getCookies } = useAuthApp()

export const usePersons = () => {
  const loading = ref(false)
  const baseurl = import.meta.env.VITE_API_COES_URL

  const getPersons = async (params = {}, rowsPerPage = 15, toPage = 1) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/persons/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al obtener los datos de personas:', err)
      notify.error(err.response?.data?.message || 'Error al obtener personas', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPerson = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/persons`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Persona creada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear la persona:', err)
      notify.error(err.response?.data?.message || 'Error al crear la persona', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePerson = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/persons/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Persona actualizada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar la persona:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar la persona', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePerson = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.delete(`${baseurl}/persons/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Persona eliminada exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar la persona:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar la persona', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchStore = async (params = {}) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/persons/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch job-positions:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getPersons,
    createPerson,
    updatePerson,
    deletePerson,
    batchStore,
    loading,
  }
}
