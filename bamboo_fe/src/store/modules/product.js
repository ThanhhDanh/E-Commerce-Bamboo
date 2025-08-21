const state = {
  products: [],
  product: null,
  loading: false,
  error: null,
  categories: [],
  category: null,
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
  SET_CATEGORIES(state, categories) {
    state.categories = categories
  },
  SET_CATEGORY(state, category) {
    state.category = category
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
}

const getters = {
  products: (state) => state.products,
  product: (state) => state.product,
  loading: (state) => state.loading,
  error: (state) => state.error,
  categories: (state) => state.categories,
  category: (state) => state.category,
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
