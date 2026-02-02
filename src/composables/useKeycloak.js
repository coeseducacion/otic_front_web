import Keycloak from 'keycloak-js'

let keycloakInstance = null

/**
 * Configuración Keycloak para Sidenagerd (backoffice).
 * En Keycloak Admin: crear cliente con:
 * - Client ID: sidenagerd-web
 * - Client authentication: OFF (public)
 * - Valid redirect URIs: http://localhost:5173/callback, http://localhost:5173/*
 * - Web origins: http://localhost:5173, +
 */
function getKeycloakConfig() {
  const url = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8081'
  const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'master'
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'sidenagerd-web'
  return { url, realm, clientId }
}

export function useKeycloak() {
  const initKeycloak = (options = {}) => {
    if (keycloakInstance) {
      return Promise.resolve(keycloakInstance)
    }
    const { url, realm, clientId } = getKeycloakConfig()
    const keycloak = new Keycloak({ url, realm, clientId })
    keycloakInstance = keycloak
    return keycloak.init({
      checkLoginIframe: false,
      onLoad: options.onLoad || 'check-sso', // 'login-required' para forzar login
      ...options,
    }).then(authenticated => {
      keycloakInstance = keycloak
      return { keycloak, authenticated }
    })
  }

  /** Redirige al login de Keycloak. redirectUri debe coincidir con lo configurado en el cliente. */
  const loginWithKeycloak = async (redirectUri) => {
    const { url, realm, clientId } = getKeycloakConfig()
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
    const callback = redirectUri || `${baseUrl}/callback`

    const keycloak = keycloakInstance || new Keycloak({ url, realm, clientId })
    if (!keycloakInstance) {
      keycloakInstance = keycloak
    }

    // keycloak.login() usa this.#adapter.login; #adapter solo se asigna en init()
    if (!keycloak.didInitialize) {
      await keycloak.init({ checkLoginIframe: false })
    }

    if (typeof keycloak.login !== 'function') {
      throw new Error('Keycloak login no disponible')
    }
    return keycloak.login({ redirectUri: callback })
  }

  const logoutKeycloak = (redirectUri) => {
    const keycloak = keycloakInstance
    if (!keycloak) return Promise.resolve()
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
    const postLogout = redirectUri || baseUrl
    return keycloak.logout({ postLogoutRedirectUri: postLogout })
  }

  const getToken = () => {
    return keycloakInstance?.token ?? null
  }

  const getTokenParsed = () => {
    return keycloakInstance?.tokenParsed ?? null
  }

  const getUserInfo = () => {
    return keycloakInstance?.loadUserInfo?.() ?? Promise.resolve(null)
  }

  const isAuthenticated = () => {
    return !!keycloakInstance?.authenticated
  }

  const updateToken = (minValidity = 5) => {
    return keycloakInstance?.updateToken(minValidity) ?? Promise.resolve(false)
  }

  return {
    initKeycloak,
    loginWithKeycloak,
    logoutKeycloak,
    getToken,
    getTokenParsed,
    getUserInfo,
    isAuthenticated,
    updateToken,
    getKeycloakConfig,
  }
}
