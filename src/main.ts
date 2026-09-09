import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import App from './App.vue'
import './assets/main.css'
import { setupAppUpdateChecks } from '@/lib/appUpdate'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

setupAppUpdateChecks()
setupNotificationRouting()

function setupNotificationRouting() {
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'OPEN_NOTIFICATION_URL' && typeof event.data.url === 'string') {
      router.push(event.data.url).catch(() => null)
    }
  })
}
