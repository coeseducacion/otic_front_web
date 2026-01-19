import { api } from '@/plugins/axios'

/**
 * Composable para usar axios en lugar de fetch
 * Útil si prefieres la API de axios
 */
export function useAxios() {
  /**
   * GET request
   */
  const get = async (url, config = {}) => {
    try {
      const response = await api.get(url, config)
      return { data: response.data, error: null, response }
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data || error.message,
        response: error.response 
      }
    }
  }

  /**
   * POST request
   */
  const post = async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config)
      return { data: response.data, error: null, response }
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data || error.message,
        response: error.response 
      }
    }
  }

  /**
   * PUT request
   */
  const put = async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config)
      return { data: response.data, error: null, response }
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data || error.message,
        response: error.response 
      }
    }
  }

  /**
   * DELETE request
   */
  const del = async (url, config = {}) => {
    try {
      const response = await api.delete(url, config)
      return { data: response.data, error: null, response }
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data || error.message,
        response: error.response 
      }
    }
  }

  return {
    get,
    post,
    put,
    delete: del,
    api // Acceso directo a la instancia de axios
  }
}
