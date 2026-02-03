import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from '../useAuthApp'

const { getCookies } = useAuthApp()

export const useTypeContracts = () => {
  const loading = ref(false)
  const baseurl = import.meta.env.VITE_API_COES_URL

  const getTypeContracts = async (params = {}, rowsPerPage = 15, toPage = 1) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/type-contracts/search?page=${toPage}&limit=${rowsPerPage}`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al obtener los datos de tipos de contrato:', err)
      notify.error(err.response?.data?.message || 'Error al obtener tipos de contrato', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTypeContract = async (data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/type-contracts`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de contrato creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear el tipo de contrato:', err)
      notify.error(err.response?.data?.message || 'Error al crear el tipo de contrato', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTypeContract = async (id, data) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.put(`${baseurl}/type-contracts/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de contrato actualizado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar el tipo de contrato:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar el tipo de contrato', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTypeContract = async (id) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.delete(`${baseurl}/type-contracts/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Tipo de contrato eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar el tipo de contrato:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar el tipo de contrato', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchStore = async (params = {}) => {
    try {
      loading.value = true
      const accessData = getCookies()
      const response = await api.post(`${baseurl}/type-contracts/batch`, params, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      return response.data
    } catch (err) {
      console.error('Error al almacenar batch type-contracts:', err)
      notify.error(err.response?.data?.message || 'Error al guardar datos', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getTypeContracts,
    createTypeContract,
    updateTypeContract,
    deleteTypeContract,
    batchStore,
    loading,
  }
}
