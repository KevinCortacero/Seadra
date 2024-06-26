/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

const app = createApp(App)
app.config.globalProperties.$request_base_url = ''
app.config.globalProperties.$dirSep = window.navigator.platform.toLowerCase()==='win32'?'\\':'/'
registerPlugins(app)

app.mount('#app')
