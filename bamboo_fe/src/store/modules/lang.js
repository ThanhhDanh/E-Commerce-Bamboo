const state = {
  locale: 'vi',
}

const mutations = {
  SET_LANG(state, lang) {
    state.locale = lang
  },
}

const actions = {
  changeLang({ commit }, lang) {
    commit('SET_LANG', lang)
    localStorage.setItem('locale', lang)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
