<script setup>
import { useAuthApp } from '@/composables/useAuthApp'
import { useAuthStore } from '@/stores/useAuthStore'
import { useKeycloak } from '@/composables/useKeycloak'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { default as authV2LoginIllustrationDark, default as authV2LoginIllustrationLight } from '@images/coes/auth-login-illustration-light.png'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'


definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const { login, writeCookies, getCookies, loading, getPermissions } = useAuthApp()
const { loginWithKeycloak } = useKeycloak()
const route = useRoute()
const router = useRouter()
const loadingKeycloak = ref(false)

const refForm = ref()

const form = ref({
  document: '',
  password: '',
  remember: false,
})

const isPasswordVisible = ref(false)
const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)



const loginApp =  async () => {
  const validateForm=await refForm.value.validate()

  // VERIFICAR SI EL FORMULARIO ES VÁLIDO
  if (!validateForm.valid) {
    return
  }
  try {
    const response=await login({
      document: form.value.document,
      password: form.value.password,
    })

    await writeCookies(response.token, response.user, '')
    
    //escribir tambien el tiempo la hora de obtenecion del token
    useCookie('getTimeToken').value = Date.now()
    useCookie('expires_in').value = response.expires_in
    

    const authStore = useAuthStore()
    const permissions=await getPermissions()

    //console.log('Permissions after login:', permissions)
    //writeCookies(response.token, response.user, permissions)

    // escribir en el authStore el user y token

    console.log('Storing login data in authStore:', response.expires_in)
    authStore.setLoginData(response.user, response.token, response.expires_in)
    authStore.setPermissions(permissions)
    
    // ❗ nextTick is required to wait for DOM updates and later redirect
    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/')
    })
  } catch (error) {
    console.error('Login failed:', error)
  }
}

const loginWithKeycloakApp = async () => {
  loadingKeycloak.value = true
  try {
    await loginWithKeycloak()
    // Si no hay error, keycloak.login() redirige la página
  } catch (e) {
    console.error('Keycloak login redirect failed:', e)
  } finally {
    loadingKeycloak.value = false
  }
}
</script>

<template>
  <a href="javascript:void(0)">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </a>

  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem;"
        >
          <VImg
            max-width="613"
            max-height="80vh"

            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <img
          class="auth-footer-mask flip-in-rtl"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        >
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6"
      >
      <VCardTitle>
        <span class="text-h4 text-capitalize">{{ themeConfig.app.title }}</span>
      </VCardTitle>
        <VCardText>
          <h4 class=" mb-1">
            Bienvenido  nuevamente!
          </h4>
          <p class="mb-0">
            Por favor, inicie sesión en su cuenta...
          </p>
        </VCardText>
        <VCardText>
           <VBtn
                    block
                    height="100"
                    variant="tonal"
                    color="primary"
                    :loading="loadingKeycloak"
                    @click="loginWithKeycloakApp"
                  >
                  
                    Iniciar sesión
                    <VIcon
                      size="30"
                      class="me-2"
                      icon="tabler-door-enter"></VIcon>
                  </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
