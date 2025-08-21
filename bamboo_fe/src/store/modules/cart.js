const state = {
  products: [],
  product: null,
  cart: [],
  loading: false,
  error: null,
}

function getCartKey() {
  const user = JSON.parse(localStorage.getItem('user'))
  return user ? `cart_${user.name}` : 'cart_guest'
}

const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products
  },
  SET_PRODUCT(state, product) {
    state.product = product
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  ADD_TO_CART(state, product) {
    const existingProduct = state.cart.find((item) => item.id === product.id)
    if (existingProduct) {
      existingProduct.quantity += 1
    } else {
      state.cart.push({ ...product, quantity: 1 })
    }

    localStorage.setItem(getCartKey(), JSON.stringify(state.cart))
  },
  REMOVE_FROM_CART(state, productId) {
    state.cart = state.cart.filter((item) => item.id !== productId)
    localStorage.setItem(getCartKey(), JSON.stringify(state.cart))
  },
  CLEAR_CART(state) {
    state.cart = []
    localStorage.setItem(getCartKey(), JSON.stringify(state.cart))
  },
  SET_CART(state, cart) {
    state.cart = cart
  },
  INCREASE_CART_QTY(state, productId) {
    const item = state.cart.find((p) => p.id === productId)
    if (item) item.quantity++
  },
  DECREASE_CART_QTY(state, productId) {
    const item = state.cart.find((p) => p.id === productId)
    if (item && item.quantity > 1) item.quantity--
  },
}

const actions = {
  async fetchProducts({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      commit('SET_PRODUCTS', data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchProduct({ commit }, productId) {
    commit('SET_LOADING', true)
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }
      const data = await response.json()
      commit('SET_PRODUCT', data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchCategories({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      commit('SET_CATEGORIES', data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchCategory({ commit }, categoryId) {
    commit('SET_LOADING', true)
    try {
      const response = await fetch(`/api/categories/${categoryId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch category')
      }
      const data = await response.json()
      commit('SET_CATEGORY', data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  addToCart({ commit }, product) {
    commit('ADD_TO_CART', product)
  },
  removeFromCart({ commit }, productId) {
    commit('REMOVE_FROM_CART', productId)
  },
  clearCart({ commit }) {
    commit('CLEAR_CART')
  },
  increaseCartQty({ commit }, productId) {
    commit('INCREASE_CART_QTY', productId)
  },
  decreaseCartQty({ commit }, productId) {
    commit('DECREASE_CART_QTY', productId)
  },
}

const getters = {
  products: (state) => state.products,
  product: (state) => state.product,
  loading: (state) => state.loading,
  error: (state) => state.error,
  cart: (state) => state.cart,
  cartItemCount: (state) => state.cart.reduce((count, item) => count + item.quantity, 0),
  cartTotalPrice: (state) =>
    state.cart.reduce((total, item) => total + item.price * item.quantity, 0),
  cartItems: (state) =>
    state.cart.map((item) => ({
      ...item,
      totalPrice: item.price * item.quantity,
    })),
  isCartEmpty: (state) => state.cart.length === 0,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}

// This module manages product-related state in a Vuex store.
// It includes actions to fetch products, a single product, categories, and a specific category from an API.
// The state holds the products, the currently selected product, loading status, and any errors that occur during fetching.
// Mutations update the state based on the fetched data or errors.
// Getters provide access to the state properties for use in components.
// This module can be used in a Vue.js application to manage product data efficiently.
