const state = {
  isLoading: false,
  error: null,
}

const mutations = {
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
}

const actions = {
  async fetchData({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await fetch('/api/data')
      const data = await response.json()
      commit('SET_DATA', data)
    } catch (error) {
      commit('SET_ERROR', error)
    } finally {
      commit('SET_LOADING', false)
    }
  },
}

const getters = {
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,
}

export default {
  state,
  mutations,
  actions,
  getters,
}
