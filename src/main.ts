import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeflex/primeflex.css'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
  license:
    'eyJpZCI6IjYxYjE4ODYyLTVkMjAtNDBiZC04ZWQwLTQ1YjFhYTFjY2Y3YiIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3ODc2ODYwNDgsImV4cCI6MTgxOTIyMjA0OH0.l3_L-1n-sR08WADiQVzQmyS1lZ2iEVyJB1jHAWKVzCjAaNdwqkO1RCLR8trxh2Qst0TxMhFsxuCQX3-1ou2ECg',
})

app.use(createPinia())
app.use(router)
app.use(ToastService)
app.use(ConfirmationService)
app.config.globalProperties.$filters = {
  currency(value: number) {
    const format = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    })
    return format.format(value)
  },
}

app.mount('#app')
