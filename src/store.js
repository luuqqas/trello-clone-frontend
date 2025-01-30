import { createStore } from 'vuex';

function getUserFromLocalStorage() {
  const user = localStorage.getItem('user');
  console.log("Usuário no localStorage:", user); // Log adicional
  if (!user) {
    return null;
  }
  try {
    const parsedUser = JSON.parse(user);
    console.log("Usuário analisado do localStorage:", parsedUser); // Log adicional
    return parsedUser;
  } catch (e) {
    console.error("Erro ao analisar o usuário do localStorage:", e);
    localStorage.removeItem('user'); // Remover dados inválidos
    return null;
  }
}

export default createStore({
  state: {
    user: getUserFromLocalStorage(),
    authToken: localStorage.getItem('authToken') || null
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      console.log("Usuário definido no Vuex store:", user); // Log adicional
    },
    setAuthToken(state, token) {
      state.authToken = token;
      localStorage.setItem('authToken', token);
      console.log("Token de autenticação definido no Vuex store:", token); // Log adicional
    },
    clearUser(state) {
      state.user = null;
      state.authToken = null;
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      console.log("Usuário e token de autenticação removidos do Vuex store"); // Log adicional
    }
  },
  actions: {
    login({ commit }, user) {
      commit('setUser', user);
      console.log("Usuário logado e definido no Vuex store:", user); // Log adicional
    },
    logout({ commit }) {
      commit('clearUser');
    }
  },
  getters: {
    isLoggedIn: state => !!state.authToken,
    getUser: state => state.user,
  }
});
