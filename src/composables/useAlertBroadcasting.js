import { useSnackbar } from '@/composables/useSnackBar'
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Composable para escuchar eventos de broadcasting de alertas
 * Escucha el canal 'alerts' y el evento 'AlertCreated'
 */
export function useAlertBroadcasting() {
  const { showNotification } = useSnackbar()
  const isConnected = ref(false)
  const alertsReceived = ref([])
  const connectionStatus = ref('disconnected')

  let echoChannel = null

  /**
   * Inicializa la escucha de eventos
   */
  const initializeBroadcasting = () => {
    try {
      // Verificar que Echo esté disponible
      if (!window.Echo) {
        console.error('❌ Laravel Echo no está disponible')
        connectionStatus.value = 'error'
        return
      }

      // Suscribirse al canal 'alerts'
      echoChannel = window.Echo.channel('alerts')

      // Escuchar el evento 'AlertCreated'
      echoChannel.listen('.AlertCreated', (data) => {
        console.log('✅ Evento AlertCreated recibido:', data)

        // Agregar a la lista de alertas recibidas
        alertsReceived.value.unshift({
          id: data.data?.id || null,
          device_uuid: data.device_uuid || null,
          type_device_id: data.type_device_id || null,
          data: data.data || data,
          timestamp: new Date().toLocaleString(),
        })

        // Mantener solo las últimas 50 alertas
        if (alertsReceived.value.length > 50) {
          alertsReceived.value = alertsReceived.value.slice(0, 50)
        }

        // Mostrar notificación al usuario
        showNotification({
          text: `Nueva alerta recibida #${data.data?.id || 'N/A'}`,
          type: 'info',
          duration: 5000,
        })

        // También puedes emitir un evento personalizado si es necesario
        // window.dispatchEvent(new CustomEvent('alert-created', { detail: data }))
      })

      // Escuchar eventos de conexión
      const pusher = window.Echo.connector?.pusher || window.Echo.pusher

      if (pusher && pusher.connection) {
        pusher.connection.bind('connected', () => {
          console.log('✅ Conectado a WebSocket')
          isConnected.value = true
          connectionStatus.value = 'connected'
        })

        pusher.connection.bind('disconnected', () => {
          console.log('❌ Desconectado de WebSocket')
          isConnected.value = false
          connectionStatus.value = 'disconnected'
        })

        pusher.connection.bind('error', (error) => {
          console.error('❌ Error de conexión:', error)
          isConnected.value = false
          connectionStatus.value = 'error'
        })

        // Verificar estado inicial
        if (pusher.connection.state === 'connected') {
          isConnected.value = true
          connectionStatus.value = 'connected'
        }
      }

      console.log('📡 Broadcasting de alertas inicializado')
    } catch (error) {
      console.error('❌ Error al inicializar broadcasting:', error)
      connectionStatus.value = 'error'
    }
  }

  /**
   * Desconecta la escucha de eventos
   */
  const disconnectBroadcasting = () => {
    if (window.Echo && echoChannel) {
      window.Echo.leave('alerts')
      echoChannel = null
      isConnected.value = false
      connectionStatus.value = 'disconnected'
      console.log('📡 Broadcasting de alertas desconectado')
    }
  }

  // Inicializar automáticamente al montar
  onMounted(() => {
    initializeBroadcasting()
  })

  // Desconectar al desmontar
  onUnmounted(() => {
    disconnectBroadcasting()
  })

  return {
    isConnected,
    connectionStatus,
    alertsReceived,
    initializeBroadcasting,
    disconnectBroadcasting,
  }
}

