import { api } from '@/plugins/axios'
import { notify } from '@/plugins/notify'
import { ref } from 'vue'
import { useAuthApp } from './useAuthApp'

const {getCookies} = useAuthApp()


export const useUsers = () => {
  const loading = ref(false)

  const getUsers = async (params={},rowsPerPage=15,toPage=1) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`/users/search?page=${toPage}&limit=${rowsPerPage}`, params, {
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

  const createUser = async (data) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.post(`/users`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Usuario creado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al crear el usuario:', err)
      notify.error(err.response?.data?.message || 'Error al crear el usuario', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id, data) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.put(`/users/${id}`, data, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Usuario actualizado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al actualizar el usuario:', err)
      notify.error(err.response?.data?.message || 'Error al actualizar el usuario', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    try {
      loading.value = true
      const accessData=  getCookies()
      const response = await api.delete(`/users/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessData.accessToken}`,
        },
      })
      notify.success('¡Usuario eliminado exitosamente!', 2000)
      return response.data
    } catch (err) {
      console.error('Error al eliminar el usuario:', err)
      notify.error(err.response?.data?.message || 'Error al eliminar el usuario', 4000)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getUsers,
    loading,
    createUser,
    updateUser,
    deleteUser,
  }
}
