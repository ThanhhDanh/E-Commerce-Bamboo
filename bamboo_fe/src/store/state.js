import { createStore } from 'vuex'
import auth from './modules/auth'
import product from './modules/product'
import cart from './modules/cart'
import lang from './modules/lang'

const store = createStore({
  modules: {
    auth,
    product,
    cart,
    lang,
  },
})

// Khôi phục user từ localStorage khi app khởi động
const savedUser = localStorage.getItem('user')
if (savedUser) {
  store.commit('auth/SET_USER', JSON.parse(savedUser))
}

// Khôi phục ngôn ngữ từ localStorage khi app khởi động
const savedLocale = localStorage.getItem('locale')
if (savedLocale) {
  store.commit('lang/SET_LANG', savedLocale)
}

// Khôi phục giỏ hàng từ localStorage khi app khởi động
const savedCart =
  localStorage.getItem('cart_guest') || localStorage.getItem(`cart_${JSON.parse(savedUser)?.name}`)
if (savedCart) {
  store.commit('cart/SET_CART', JSON.parse(savedCart))
}

export default store
