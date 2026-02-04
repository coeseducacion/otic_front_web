<script setup>
import AppSelect from '@/@core/components/app-form-elements/AppSelect.vue'
import { useAuthApp } from '@/composables/useAuthApp'
import { useReniec } from '@/composables/useReniec'
import { useRoleUsers } from '@/composables/useRolUsers'
import { useTypeDocuments } from '@/composables/useTypeDocuments'
import { useUbigeo } from '@/composables/useUbigeo'
import { useDebounce } from '@/utils/debounce'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { default as registerMultiStepIllustrationDark, default as registerMultiStepIllustrationLight } from '@images/coes/auth-register-multisteps-illustration.png'
import registerMultiStepBgDark from '@images/pages/register-multi-step-bg-dark.png'
import registerMultiStepBgLight from '@images/pages/register-multi-step-bg-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { VBtn } from 'vuetify/components'

const {getTypeDocuments, loading: loadingTypeDocs}=useTypeDocuments()
const { getDNI, loading: loadingDNI}=useReniec()
const {getDistrictWithRegion, loading: loadingDistricts}=useUbigeo()
const {getRoleUsers, loading: loadingRoles}=useRoleUsers()
const {register, writeCookies,loading: loadingRegister} =useAuthApp()

const registerMultiStepBg = useGenerateImageVariant(registerMultiStepBgLight, registerMultiStepBgDark)

const currentStep = ref(0)
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const registerMultiStepIllustration = useGenerateImageVariant(registerMultiStepIllustrationLight, registerMultiStepIllustrationDark)

// variable refienciales
const formRefStep1=ref(null)
const formRefStep2=ref(null)

const searchText = ref('')// para el autocompletado de distritos
const isSelecting = ref(false)// para controlar si se está seleccionando una opción
const typeDocuments=ref([])// tipos de documentos
const districts=ref([])// distritos
const rolUsers=ref([])// roles de usuarios


const items = [
  {
    title: 'Personal',
    subtitle: 'Información de la Personal',
    icon: 'tabler-file-analytics',
  },
  {
    title: 'Cuenta',
    subtitle: 'Enter Información de la Cuenta',
    icon: 'tabler-user',
  },
]

const form = ref({
  id:'',
  district_id:'',
  name:'',
  last_name:'',
  apellido_materno:'',
  celular:'',
  celular_institucional:'',
  telefono:'',
  correo_personal:'',
  correo_institucional:'',
  role_id:'',
  type_document_id:'',
  document:'',
  name:'',
  email:'',
  email_verified_at:'',
  password:'',
  phone:'',
})

const typeDocument = computed(() => {
  if (!form.value.type_document_id) return null
  return typeDocuments.value.find(td => td.id === form.value.type_document_id)
})



onMounted( async () => {
  const [responseTypes, responseRoles] = await Promise.all([
    getTypeDocuments(),
    getRoleUsers()
  ])
  
  typeDocuments.value = responseTypes.data
  rolUsers.value = responseRoles.data
})

const onSubmit = async () => {
  try {
    const validateForm=await formRefStep2.value.validate()
    if (!validateForm.valid) {
      return
    }
    const response=await register(form.value)
    console.log('Form submitted:', response);
    // guardar cookies
    writeCookies(response.token, response.user,'')
    // redirigir al home
    // window.location.href = '/'
  } catch (error) {
    console.error('Registration failed:', error)
  }

  // console.log('Form submitted:', response);
}

// Modifica getDistricts:
const getDistricts = useDebounce(async (searchText) => {
  if (isSelecting.value) {
    isSelecting.value = false
    return // ❌ No buscar si está seleccionando
  }
  
  const params = {
    search: { value: searchText },
    includes: [{ relation: 'province.region' }]
  }
  const response = await getDistrictWithRegion(params)
  districts.value = response.data
}, 500)

// Agrega función para detectar selección:
const onDistrictSelect = () => {
  isSelecting.value = true
}
// funcion computata para obtener el nombre de la region a partir del distrito

const getDistrictFullName = computed(() => {
  return (district) => {
    if (district.province && district.province.region) {
      return `${district.name} / ${district.province.name} / ${district.province.region.name}`
    }
    if (district.province) {
      return `${district.name} / ${district.province.name}`
    }
    return district.name
  }
})


// funcion para obtener datos de reniec
const getReniecInfo=async ()=>{
  // console.log(form.value.document.length,typeDocument.value);
  if(form.value.document.length===8 && typeDocument.value.id===1){
    const response= await getDNI({ dni: form.value.document })
    // console.log('reniec info',response.data)
    form.value.name=response.data.first_name
    form.value.last_name=response.data.last_name+ ' ' +response.data.mother_last_name
    form.value.apellido_materno=response.data.mother_last_name
  }
}
// funcion para validar el formulario
const stepsValidation=async(step)=>{
  let isValid=false
  if(step===0){
    const validateForm=await formRefStep1.value.validate()
    isValid=validateForm.valid
  }else if(step===1){
    const validateForm=await formRefStep2.value.validate()
    isValid=validateForm.valid
  }
  if(isValid){
    currentStep.value++
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

  <VRow
    no-gutters
    class="auth-wrapper"
  >
    <VCol
      md="6"
      class="d-none d-md-flex"
    >
      <!-- here your illustration -->
      <div class="d-flex justify-center align-center w-100 position-relative">
        <VImg
          :src="registerMultiStepIllustration"
          class="illustration-image flip-in-rtl"
        />

        <img
          class="bg-image position-absolute w-100 flip-in-rtl"
          :src="registerMultiStepBg"
          alt="register-multi-step-bg"
          height="340"
        >
      </div>
      
    </VCol>

    <VCol
      cols="12"
      md="6"
      class="auth-card-v2 d-flex align-center justify-center pa-10"
      style="background-color: rgb(var(--v-theme-surface));"
    >
      <VCard
        flat
        class="mt-12 mt-sm-10"
      >
      
        <AppStepper
          v-model:current-step="currentStep"
          :items="items"
          :direction="$vuetify.display.smAndUp ? 'horizontal' : 'vertical'"
          icon-size="22"
          class="stepper-icon-step-bg mb-12"
          
        />

        <VWindow
          v-model="currentStep"
          class="disable-tab-transition"
          style="max-inline-size: 681px;"
        >
          <VForm ref="formRefStep1">
            <VWindowItem >
              <h4 class="text-h4">
                Información Personal
              </h4>
              <p class="text-body-1 mb-6">
                Ingresa sus datos personales
              </p>

              <VRow>
                
                <!-- 👉 type document -->
                <VCol cols="6">
                  <AppAutocomplete
                    v-model="form.type_document_id"
                    label="Tipo de documento"
                    :items="typeDocuments"
                    item-title="name"
                    item-value="id"
                    placeholder="Seleccionar tipo de documento"
                    :rules="[requiredValidator('Tipo de documento')]"
                  />
                </VCol>
                <!-- document -->
              <VCol cols="6" >
                <AppTextField
                  v-model="form.document"
                  :label="typeDocument!==null ? typeDocument.name : 'Documento'"
                  :maxlength="typeDocument!==null ? typeDocument.max_length : 15"
                  :rules="[requiredValidator(typeDocument?.name)]"
                >
                <template #append>
                  <VBtn @click="getReniecInfo()" 
                  icon="tabler-search" 
                  :disabled="typeDocument?.id===1 ? false : true"
                  size="small"
                  :loading="loadingDNI"
                   rounded=""/>
                </template>
              </AppTextField>
              </VCol>

              
              <!-- Nombre -->
              <VCol cols="6">
                <AppTextField
                  v-model="form.name"
                  label="Nombres"
                  :rules="[requiredValidator('Nombre')]"
                >
                
              </AppTextField>
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
                <VCol cols="12">
                    <AppAutocomplete
                      v-model="form.district_id"
                      v-model:search="searchText"
                      @update:search="getDistricts"
                      @update:model-value="onDistrictSelect"
                      label="Distrito"
                      placeholder="Seleccione su distrito"
                      :items="districts"
                      :item-title="getDistrictFullName"
                      item-value="id"
                      :loading="loadingDistricts"
                      :rules="[requiredValidator('Distrito')]"
                    />
                </VCol>
              </VRow>
            </VWindowItem>
          </VForm>
          <VForm ref="formRefStep2">
            <VWindowItem>
              <h4 class="text-h4">
                Información de la Cuenta
              </h4>
              <p>
                Ingresa los detalles de tu cuenta
              </p>

              <VRow>
                <!-- email -->
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="form.email"
                  label="Email"
                  type="email"
                  :rules="[requiredValidator('El Email'), emailValidator]"
                />
              </VCol>
                <!-- 👉 rolde usuario -->
                <VCol cols="12" md="6" >
                  <AppSelect
                    v-model="form.role_id"
                    label="Rol"
                    :items="rolUsers"
                    item-title="name"
                    item-value="id"
                    :rules="[requiredValidator('Rol')]"
                  />
              </VCol>
              <!-- password -->
              <VCol cols="12" md="6">
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
              <VCol cols="12" md="6">
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
            </VRow>
          </VWindowItem>
        </VForm>

          
        </VWindow>

        <div class="d-flex flex-wrap justify-space-between gap-x-4 mt-6">
          <VBtn
            color="secondary"
            :disabled="currentStep === 0"
            variant="tonal"
            @click="currentStep--"
          >
            <VIcon
              icon="tabler-arrow-left"
              start
              class="flip-in-rtl"
            />
            Anterior
          </VBtn>

          <VBtn
            v-if="items.length - 1 === currentStep"
            color="success"
            @click="onSubmit"
            :loading="loadingRegister"
          >
            Registrarme
          </VBtn>

          <VBtn
            v-else
            @click="stepsValidation(currentStep)"
          >
            Siguiente

            <VIcon
              icon="tabler-arrow-right"
              end
              class="flip-in-rtl"
            />
          </VBtn>
        </div>
        <VCol
                cols="12"
                class="text-body-1 text-center"
              >
                <span class="d-inline-block">
                  ¿Tienes una cuenta?
                </span>
                <RouterLink
                  class="text-primary font-weight-bold ms-1 d-inline-block"
                  :to="{ name: 'login' }"
                >
                  Iniciar sessión
                </RouterLink>
              </VCol>
      </VCard>
    </VCol>
  </VRow>

</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

.illustration-image {
  block-size: 550px;
  inline-size: 248px;
}

.bg-image {
  inset-block-end: 0;
}
</style>
