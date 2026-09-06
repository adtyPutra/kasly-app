import { createApp, watch } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './style.css'
import { initAuth, isAuthReady } from './stores/auth.js'

initAuth()

let app
watch(isAuthReady, (ready) => {
  if (ready && !app) {
    app = createApp(App)
    app.use(router)
    app.mount('#app')
  }
}, { immediate: true })
