<script setup>
import { useAuthApp } from '@/composables/useAuthApp'
import { useAuthStore } from '@/stores/useAuthStore'
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
const route = useRoute()
const router = useRouter()

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
        <VCardText>
          <h4 class="text-h4 mb-1">
            Bienvenido <span class="text-capitalize">{{ themeConfig.app.title }}</span>! 👋🏻
          </h4>
          <p class="mb-0">
            Por favor, inicie sesión en su cuenta...
          </p>
        </VCardText>
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="loginApp"
          >
            <VRow>
              <!-- document -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.document"
                  autofocus
                  label="Documento"
                  type="text"
                  persistent-placeholder
                  placeholder="Ingrese su documento"
                  :rules="[requiredValidator('El documento')]"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  label="Contraseña"
                  placeholder="Ingrese su contraseña"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  :rules="[requiredValidator('La contraseña')]"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6">
                  <VCheckbox
                    v-model="form.remember"
                    label="Recuérdame"
                  />
                  <a
                    class="text-primary"
                    href="javascript:void(0)"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <VBtn
                  block
                  type="submit"
                  :loading="loading"
                >
                  Iniciar sesión
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-body-1 text-center"
              >
                <span class="d-inline-block">
                  ¿Eres nuevo?
                </span>
                <RouterLink
                  class="text-primary font-weight-bold ms-1 d-inline-block"
                  :to="{ name: 'register' }"
                >
                  Crear una cuenta
                </RouterLink>
              </VCol>

              <!--
                <VCol
                cols="12"
                class="d-flex align-center"
                >
                <VDivider />
                <span class="mx-4">o</span>
                <VDivider />
                </VCol> 
              -->

              <!-- auth providers -->
              <!--
                <VCol
                cols="12"
                class="text-center"
                >
                <AuthProvider />
                </VCol> 
              -->
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
