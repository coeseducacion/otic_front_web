import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import '@mdi/font/css/materialdesignicons.css'
import { createApp } from 'vue'

// Leaflet styles
import 'leaflet/dist/leaflet.css'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)


// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
