import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from './useAuthApp'

const {getCookies} = useAuthApp()


export const useRoleUsers = () => {
  const loading = ref(false)

  const getRoleUsers = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`/roles/search?page=${toPage}&limit=${rowsPerPage}`, params, {
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

  const createRoleUser = async (data) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`/roles`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Módulo creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear el módulo:', err)
      notify.error(err.response?.data?.message || 'Error al crear el módulo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRoleUser = async (id, data) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.put(`/roles/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Módulo actualizado exitosamente!', 2000)
      return response.data
    } catch (err) { 
      console.error('Error al actualizar el módulo:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar el módulo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRoleUser = async (id) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.delete(`/roles/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Módulo eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar el módulo:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar el módulo', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getRoleUsers,
    loading,
    createRoleUser,
    updateRoleUser,
    deleteRoleUser,
  }
}
