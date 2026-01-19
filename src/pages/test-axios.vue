<script setup>
import { ref } from 'vue'
import { useAxios } from '@/composables/useAxios'
import { api } from '@/plugins/axios'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const { get, post } = useAxios()
const result = ref(null)
const error = ref(null)
const loading = ref(false)

// Método 1: Usando el composable useAxios
const testWithComposable = async () => {
  loading.value = true
  error.value = null
  result.value = null
  
  const response = await get('/users')
  
  loading.value = false
  
  if (response.error) {
    error.value = response.error
    console.error('Error:', response.error)
  } else {
    result.value = response.data
    console.log('Data:', response.data)
  }
}

// Método 2: Usando api directamente
const testWithApiDirect = async () => {
  loading.value = true
  error.value = null
  result.value = null
  
  try {
    const response = await api.get('/users')
    result.value = response.data
    console.log('Data:', response.data)
  } catch (err) {
    error.value = err.response?.data || err.message
    console.error('Error:', error.value)
  } finally {
    loading.value = false
  }
}

// Método 3: Usando el composable con acceso directo
const testWithComposableApi = async () => {
  loading.value = true
  error.value = null
  result.value = null
  
  const { api: axiosInstance } = useAxios()
  
  try {
    const response = await axiosInstance.get('/users')
    result.value = response.data
    console.log('Data:', response.data)
  } catch (err) {
    error.value = err.response?.data || err.message
    console.error('Error:', error.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle>Prueba de Axios - Tres Métodos</VCardTitle>
          <VCardText>
            <p class="mb-4">
              <strong>API Base URL:</strong> {{ api.defaults.baseURL }}
            </p>

            <VRow>
              <VCol cols="12" md="4">
                <VBtn
                  color="primary"
                  block
                  :loading="loading"
                  @click="testWithComposable"
                >
                  Método 1: useAxios().get()
                </VBtn>
              </VCol>

              <VCol cols="12" md="4">
                <VBtn
                  color="secondary"
                  block
                  :loading="loading"
                  @click="testWithApiDirect"
                >
                  Método 2: api.get()
                </VBtn>
              </VCol>

              <VCol cols="12" md="4">
                <VBtn
                  color="success"
                  block
                  :loading="loading"
                  @click="testWithComposableApi"
                >
                  Método 3: useAxios().api.get()
                </VBtn>
              </VCol>
            </VRow>

            <VDivider class="my-6" />

            <div v-if="loading" class="text-center">
              <VProgressCircular indeterminate color="primary" />
              <p class="mt-2">Cargando...</p>
            </div>

            <VAlert
              v-if="error"
              type="error"
              class="mb-4"
            >
              <strong>Error:</strong>
              <pre>{{ JSON.stringify(error, null, 2) }}</pre>
            </VAlert>

            <VAlert
              v-if="result"
              type="success"
              class="mb-4"
            >
              <strong>Respuesta exitosa:</strong>
              <pre>{{ JSON.stringify(result, null, 2) }}</pre>
            </VAlert>

            <VCard v-if="!loading && !error && !result" class="pa-4 bg-grey-lighten-4">
              <p class="text-center text-grey">
                Haz clic en cualquier botón para probar la conexión con la API
              </p>
            </VCard>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Sección de ejemplos de código -->
    <VRow class="mt-6">
      <VCol cols="12">
        <VCard>
          <VCardTitle>Ejemplos de Uso</VCardTitle>
          <VCardText>
            <h3 class="mb-2">1. Usando el Composable (RECOMENDADO)</h3>
            <pre class="bg-grey-lighten-4 pa-4 rounded">
import { useAxios } from '@/composables/useAxios'

const { get, post, put, delete: del } = useAxios()

// GET
const { data, error } = await get('/users')

// POST
const { data, error } = await post('/users', { name: 'Juan' })

// PUT
const { data, error } = await put('/users/1', { name: 'Pedro' })

// DELETE
const { data, error } = await del('/users/1')
            </pre>

            <h3 class="mb-2 mt-6">2. Usando API Directamente</h3>
            <pre class="bg-grey-lighten-4 pa-4 rounded">
import { api } from '@/plugins/axios'

try {
  const response = await api.get('/users')
  console.log(response.data)
} catch (error) {
  console.error(error)
}
            </pre>

            <h3 class="mb-2 mt-6">3. Con Parámetros y Headers</h3>
            <pre class="bg-grey-lighten-4 pa-4 rounded">
// Con composable
const { data } = await get('/users', {
  params: { page: 1, limit: 10 },
  headers: { 'X-Custom': 'value' }
})

// Con api directa
const response = await api.get('/users', {
  params: { page: 1 },
  headers: { 'Authorization': 'Bearer token' }
})
            </pre>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped>
pre {
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
}
</style>
