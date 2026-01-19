<script setup>
import AppNotification from '@/components/AppNotification.vue'
import '@/composables/broadcasting'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import {
  initConfigStore,
  useConfigStore,
} from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useCookie } from './@core/composable/useCookie'
import { useAuthApp } from './composables/useAuthApp'
import { useAuthStore } from './stores/useAuthStore'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()

const authApp = useAuthApp()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const lastActivityTime = ref(Date.now())

const status = ref('Activo')
let timer = null

const updateActivity = () => {
  lastActivityTime.value = Date.now()
  status.value = 'Activo'
}

const checkInactivity = async() => {
  
  // verificar si es una ruta publica
  const publicRoutes = ['/login', '/register', '/forgot-password']
  if (publicRoutes.includes(route.path)) {
    //console.log('Ruta pública, no se verifica inactividad.')
    return
  }

  const rawTokenTime = authStore.getStartTokenTime
  let tokenTime = Number(rawTokenTime)
  const tokenRemainingTime = authStore.getExpirationToken

  if (!tokenTime || Number.isNaN(tokenTime)) {
    // console.warn('getTimeToken inválido:', rawTokenTime)
    
    return
  }

  // Si la cookie está en segundos (ej. 10 dígitos) convertir a ms
  if (tokenTime < 1e12) tokenTime = tokenTime * 1000

  // Calcular tiempo transcurrido
  const now = Date.now()
  const elapsedSeconds = Math.floor((now - tokenTime) / 1000)

  //variable para almacenar el tiempo desde la ultima actividad
  const timeSinceLastActivity = Date.now() - lastActivityTime.value

  // //validamos si el tiempo de inactividad supera el tiempo de vida del token -15 segundos
  // if (timeSinceLastActivity/1000 >= tokenRemainingTime - 15) {
  //   status.value = 'Inactivo'
  //    //cerramos la sesion    
  //     await authApp.logout().finally(()=>{
  //       router.push(`/login?to=${encodeURIComponent(route.fullPath)}`)
  //     })
  //     return
  // }

// console.log(`Tiempo transcurrido desde inicio del token: ${elapsedSeconds}s, Tiempo desde última actividad: ${Math.floor(timeSinceLastActivity/1000)}s, Tiempo restante del token: ${tokenRemainingTime - elapsedSeconds}s`)
  //primero se valida si aun no ha expirado el token
  if (elapsedSeconds > tokenRemainingTime) {
    status.value = 'Expirado'
     //cerramos la sesion    
      await authApp.logout().finally(()=>{
        router.push(`/login?to=${encodeURIComponent(route.fullPath)}`)
      })
      return
  } else if (elapsedSeconds >= tokenRemainingTime - 15) {
       
    //verificamos si el usuario ha estado activo en la app mas del tiempo de vida del token -15 segundos
    if (timeSinceLastActivity/1000 <= tokenRemainingTime - 15) {
      authApp.refreshToken().then(response=>{
                        
        //actualizamos las cookies
        useCookie('accessToken').value = response.access_token
        useCookie('getTimeToken').value = Date.now()
        useCookie('expires_in').value = response.expires_in
          
        //actualizamos el store
        //setear el token
        authStore.setToken(response.access_token)
        authStore.setExpirationIn(response.expires_in)
        authStore.setStartTokenTime(Date.now())
        // console.log('Token renovado automáticamente por actividad del usuario.',
        //   ['Nuevo token:', response.access_token,
        //    'Expira en (s):', response.expires_in ]
        // )
      }).catch(async error=>{
        console.error('Error al renovar el token:', error)
          //cerramos la sesion
          await authApp.logout().finally(()=>{
            router.push(`/login?to=${encodeURIComponent(route.fullPath)}`)
          })
      })
    }else{
      // console.log('El usuario ha estado inactivo más tiempo que el de vida del token.')
      
       //cerramos la sesion    
      await authApp.logout().finally(()=>{
        router.push(`/login?to=${encodeURIComponent(route.fullPath)}`)
      })
    }
  }

}

onMounted(() => {
  // obtener el token
  authStore.setToken(useCookie('accessToken').value)

  //obtener el expires_in
  authStore.setExpirationIn(useCookie('expires_in').value)

  authStore.setStartTokenTime(useCookie('getTimeToken').value)
  // console.log('tiempo del token obtenido del cookie:', authStore.getStartTokenTime)

  // Agrega listeners a eventos de actividad
  window.addEventListener('mousemove', updateActivity)
  window.addEventListener('keydown', updateActivity)
  window.addEventListener('scroll', updateActivity)
  window.addEventListener('click', updateActivity)
  window.addEventListener('touchstart', updateActivity)

  // Inicia el temporizador para verificar la inactividad
  timer = setInterval(checkInactivity, 5000) // Verifica cada segundo
})

onUnmounted(() => {
  // Limpia los listeners y el temporizador
  window.removeEventListener('mousemove', updateActivity)
  window.removeEventListener('keydown', updateActivity)
  window.removeEventListener('scroll', updateActivity)
  window.removeEventListener('click', updateActivity)
  window.removeEventListener('touchstart', updateActivity)



  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />

      <ScrollToTop />
      
      <!-- 🔔 Sistema de Notificaciones Global -->
      <AppNotification />
    </VApp>
  </VLocaleProvider>
</template>
