<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">Senha:</label>
        <input type="password" v-model="password" required>
      </div>
      <button type="submit" class="btn">Login</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '' // Adicionar uma propriedade para mensagens de erro
    };
  },
  methods: {
    async login() {
      try {
        console.log("Iniciando o processo de login com email:", this.email);
        const response = await fetch('/api/auth/login', { // Certifique-se de que a rota está correta
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });
        const data = await response.json();
        console.log("Resposta da API de login:", data);

        if (response.ok && data.accessToken) {
          if (!data.user) {
            throw new Error('Dados do usuário ausentes');
          }
          console.log("Usuário obtido da API:", data.user);
          localStorage.setItem('authToken', data.accessToken); // Certifique-se de que o token está sendo armazenado com a chave correta
          localStorage.setItem('user', JSON.stringify(data.user)); // Armazenar o usuário localmente
          this.$store.commit('setUser', data.user); // Armazenar o usuário no Vuex store
          this.$store.commit('setAuthToken', data.accessToken); // Armazenar o token de autenticação no Vuex store
          console.log("Usuário armazenado no Vuex store e localStorage:", data.user);
          this.$router.push('/dashboard'); // Redirecionar para o Dashboard
        } else {
          this.errorMessage = data.error || 'Erro desconhecido'; // Definir a mensagem de erro para exibição
          console.error("Erro ao fazer login:", this.errorMessage);
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        this.errorMessage = 'Erro ao fazer login'; // Definir uma mensagem de erro genérica
      }
    }
  }
};
</script>

<style scoped src="./LoginView.css"></style>
