const state = {
  user: null,
  token: null,
  isAuthenticated: false,
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
    state.isAuthenticated = !!user
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  },
  SET_TOKEN(state, token) {
    state.token = token
  },
  LOGOUT(state) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    localStorage.removeItem('user')
  },
}

const actions = {
  login({ commit }, { user, token }) {
    commit('SET_USER', user)
    commit('SET_TOKEN', token)
  },
  logout({ commit }) {
    commit('LOGOUT')
  },
  register({ commit }, user) {
    // Simulate registration logic
    commit('SET_USER', user)
    commit('SET_TOKEN', 'access-token') // Replace with actual token from backend
  },
}

const getters = {
  isAuthenticated: (state) => state.isAuthenticated,
  user: (state) => state.user,
  token: (state) => state.token,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
// This module manages authentication state, including user information and token.
// It provides actions for logging in, logging out, and registering a user.
// The state includes the user object, authentication token, and a flag indicating if the user is authenticated.
// Mutations update the state, while getters provide access to the authentication status and user information.
// This module can be used in a Vuex store to manage user authentication across the application.
// It is designed to work with Vue Router for navigation and can be integrated with API calls for real authentication logic.
// The `login` action simulates a login process, while the `logout` action clears the user and token.
// The `register` action simulates user registration and sets a dummy token.
// This module is essential for managing user sessions in a Vue.js application, especially in e-commerce scenarios where user authentication is crucial.
// It can be extended to include more complex authentication flows, such as OAuth or JWT-based authentication.
// The module is structured to be easily maintainable and scalable for future enhancements.
// It can be imported into the main Vuex store file and used in components to manage user sessions.
// The module's actions can be dispatched from components to handle user interactions like login, logout, and registration.
// It is a foundational part of the application's state management system, ensuring that user authentication is handled consistently across the app.
// The module can be tested independently to ensure that authentication logic works as expected.
// It can also be integrated with Vue Devtools for easier debugging and state management visualization.
