import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userData: null,
    tokenApp: null,
    isAuthenticated: false,
    expirationIn: 0,
    startTokenTime: null,
    permissions: [], // Nuevo campo para permisos (array vacío por defecto)
  }),
  
  getters: {
    hasRole: state => role => {
      return state.user?.role === role
    },

    // Getter opcional para acceder fácilmente a permisos
    getPermissions: state => state.permissions,

    // Getter para acceder al token (alias de tokenApp)
    accessToken: state => state.tokenApp,

    //getter para obtener el tiempo de expiracion
    getExpirationToken: state => state.expirationIn,

    //getter para obtener la hora de inicio del token
    getStartTokenTime: state => state.startTokenTime,
  },
  
  actions: {
    setLoginData(userData, token, expIn) {
      this.userData = userData
      this.tokenApp = token
      this.expirationIn = expIn || 0
      this.isAuthenticated = true
      this.startTokenTime = Date.now()
    },
    
    setLogoutData() {
      this.userData = null
      this.tokenApp = null
      this.isAuthenticated = false
      this.expirationIn = 0
      this.startTokenTime = null
      this.$router.push('/login')
    },

    // Método para limpiar autenticación (sin redirección)
    clearAuth() {
      this.userData = null
      this.tokenApp = null
      this.isAuthenticated = false
      this.expirationIn = 0
      this.permissions = []
      this.startTokenTime = null
      
    },
        
    // Nueva acción para setear permisos
    setPermissions(permissions) {
      this.permissions = Array.isArray(permissions) ? permissions : []
    },

    //setear el token
    setToken(token) {
      this.tokenApp = token
    },

    // setear el expirationIn
    setExpirationIn(expIn) {
      this.expirationIn = expIn
    },

    //setear la hora de inicio del token
    setStartTokenTime(time) {
      this.startTokenTime = time
    },
    //settear user data
    setUserData(userData) {
      this.userData = userData
    }
  },
})
