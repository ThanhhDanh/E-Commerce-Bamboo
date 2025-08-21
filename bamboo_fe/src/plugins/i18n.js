import { createI18n } from 'vue-i18n'
import vi from '@/locale/vi/lang.json'
import en from '@/locale/en/lang.json'

const messages = {
  vi,
  en,
}

const i18n = createI18n({
  legacy: false, // dùng Composition API
  locale: 'vi',
  fallbackLocale: 'vi',
  messages,
})

export default i18n
