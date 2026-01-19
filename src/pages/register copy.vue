<script setup>
import { VNodeRenderer } from '@/@layouts/components/VNodeRenderer'
import { useAuthApp } from '@/composables/useAuthApp'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2RegisterIllustrationBorderedDark from '@images/pages/auth-v2-register-illustration-bordered-dark.png'
import authV2RegisterIllustrationBorderedLight from '@images/pages/auth-v2-register-illustration-bordered-light.png'
import authV2RegisterIllustrationDark from '@images/pages/auth-v2-register-illustration-dark.png'
import authV2RegisterIllustrationLight from '@images/pages/auth-v2-register-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { themeConfig } from '@themeConfig'

const { register,loading } = useAuthApp()

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})
const refForm = ref()
const isErrrosRegister=ref(false)
const responseRegister=ref(null)

const form = ref({
  email: '',
  password: '',
  password_confirmation: '',
  dni: '',
  name: '',
  last_name: '',
  privacyPolicies: false,
})

const imageVariant = useGenerateImageVariant(authV2RegisterIllustrationLight, authV2RegisterIllustrationDark, authV2RegisterIllustrationBorderedLight, authV2RegisterIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const registerUser=async ()=>{
  const validateForm=await refForm.value.validate()
  // VERIFICAR SI EL FORMULARIO ES VÁLIDO
  if (!validateForm.valid) {
    return
  }
  responseRegister.value=await register(form.value)
  console.log('Error al registrar el usuario:', responseRegister.value)
  if(responseRegister.value.response?.status!==201){
    isErrrosRegister.value=true
  }
}
</script>

<template>
  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>
<!-- snack bar para los manejos de errores -->
 <VSnackbar
      v-model="isErrrosRegister"
      location="top right"
      variant="flat"
      color="error"
    >
      {{ responseRegister.response?.data?.message || 'Error al registrar el usuario.'  }}
    </VSnackbar>


  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="7"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 100px;"
        >
          <VImg
            max-width="500"
            :src="imageVariant"
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
      md="5"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-2 pa-2"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Regístrate ahora
          </h4>
          <p class="mb-0">
            ¡Haz que la gestión de tu aplicación sea fácil y divertida!
          </p>
        </VCardText>

        <VCardText>
          <VForm ref="refForm" @submit.prevent="registerUser">
            <VRow >
              

              <!-- dni -->
              <VCol cols="4">
                <AppTextField
                  v-model="form.dni"
                  label="DNI"
                  maxlength="8"
                  :rules="[requiredValidator('DNI')]"
                />
              </VCol>
              

              <!-- email -->
              <VCol cols="8">
                <AppTextField
                  v-model="form.email"
                  label="Email"
                  type="email"
                  :rules="[requiredValidator('El Email')]"
                />
              </VCol>
              
              <!-- Nombre -->
              <VCol cols="6">
                <AppTextField
                  v-model="form.name"
                  label="Nombres"
                  :rules="[requiredValidator('Nombre')]"
                />
              </VCol>
              <!-- Apellido -->
              <VCol cols="6">
                <AppTextField
                  v-model="form.last_name"
                  label="Apellidos"
                  type="text"
                  :rules="[requiredValidator('Apellido')]"
                />
              </VCol>

              <VCol cols="6">
                <AppTextField
                  v-model="form.password"
                  label="Contraseña"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :rules="[requiredValidator('Contraseña'),passwordValidator]"
                  :append-inner-icon="!isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </VCol>
              <VCol cols="6">
                <AppTextField
                  v-model="form.password_confirmation"
                  label="Confirmar Contraseña"
                  placeholder="············"
                  :type="!isConfirmPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :rules="[requiredValidator('Confirmar'), confirmedValidator(form.password_confirmation, form.password)]"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <div class="d-flex align-center my-2">
                  <VCheckbox
                    id="privacy-policy"
                    v-model="form.privacyPolicies"
                    inline
                  />
                  <VLabel
                    for="privacy-policy"
                    style="opacity: 1;"
                  >
                    <span class="me-1 text-high-emphasis">Acepto</span>
                    <a
                      href="javascript:void(0)"
                      class="text-primary"
                    >política de privacidad y términos</a>
                  </VLabel>
                </div>

                <VBtn
                  block
                  type="submit"
                  :loading="loading"
                >
                  Registrarme
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-center text-base"
              >
                <span class="d-inline-block">¿Ya tienes una cuenta?</span>
                <RouterLink
                  class="text-primary ms-1 d-inline-block"
                  :to="{ name: 'login' }"
                >
                  Iniciar sesión
                </RouterLink>
              </VCol>

              <VCol
                cols="12"
                class="d-flex align-center"
              >
                <VDivider />
                <span class="mx-4">or</span>
                <VDivider />
              </VCol>

              <!-- auth providers -->
              <VCol
                cols="12"
                class="text-center"
              >
                <AuthProvider />
              </VCol>
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
