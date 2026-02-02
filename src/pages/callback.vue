<script setup>
import { useKeycloak } from '@/composables/useKeycloak'
import { useAuthStore } from '@/stores/useAuthStore'
import { notify } from '@/plugins/notify'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const router = useRouter()
const { initKeycloak, getToken, getTokenParsed, getUserInfo } = useKeycloak()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const { keycloak, authenticated } = await initKeycloak({ onLoad: 'check-sso' })

    if (!authenticated || !keycloak.token) {
      notify.error('No se pudo completar el inicio de sesión con Keycloak')
      router.replace('/login')
      return
    }

    const token = getToken()
    const parsed = getTokenParsed()
    let userInfo = parsed

    try {
      const kcUser = await getUserInfo()
      if (kcUser) {
        userInfo = { ...parsed, ...kcUser }
      }
    } catch (_) {
      // usar solo tokenParsed si loadUserInfo falla
    }

    // Formato compatible con el resto de la app (cookies + store)
    const userData = {
      id: userInfo.sub,
      sub: userInfo.sub,
      email: userInfo.email ?? userInfo.preferred_username,
      preferred_username: userInfo.preferred_username,
      name: userInfo.name ?? userInfo.preferred_username,
    }

    useCookie('accessToken').value = token
    useCookie('userData').value = userData
    useCookie('userPermissions').value = ''
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token)
    }
    useCookie('getTimeToken').value = Date.now()
    useCookie('expires_in').value = 1200 // 20 min por defecto; Keycloak exp está en el token

    authStore.setLoginData(userData, token, 1200)
    authStore.setPermissions([])

    notify.success('Inicio de sesión con Keycloak exitoso', 2000)
    await nextTick()
    router.replace('/')
  } catch (err) {
    console.error('Error en callback Keycloak:', err)
    notify.error('Error al completar el inicio de sesión')
    router.replace('/login')
  }
})
</script>

<template>
  <div class="d-flex align-center justify-center min-vh-100">
    <VProgressCircular
      indeterminate
      color="primary"
      size="64"
    />
    <span class="ms-4 text-h6">Completando inicio de sesión...</span>
  </div>
</template>
