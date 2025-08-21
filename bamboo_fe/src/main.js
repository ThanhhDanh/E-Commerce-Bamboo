import './assets/main.css'
import 'vue3-toastify/dist/index.css'

import { createApp, watch } from 'vue'
import App from './App.vue'
import router from './router'
import Vue3Toastify from 'vue3-toastify'
import store from './store/state'
import i18n from './plugins/i18n'

const app = createApp(App)

app.use(router)

app.use(store)

app.use(i18n)

app.use(Vue3Toastify, {
  autoClose: 3000,
})

// i18n
i18n.global.locale.value = store.state.lang.locale
watch(
  () => store.state.lang.locale,
  (newLocale) => {
    i18n.global.locale.value = newLocale
  },
)

app.mount('#app')
