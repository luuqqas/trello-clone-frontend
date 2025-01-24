<template>
  <div class="register-container">
    <h1>Registro</h1>
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">Senha:</label>
        <input type="password" v-model="password" required>
      </div>
      <button type="submit" class="btn">Registrar</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '' // Adicionar uma propriedade para mensagens de erro
    };
  },
  methods: {
    async register() {
      try {
        const response = await fetch('/api/auth/register', {
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
        if (response.ok) {
          alert(data.message);
          this.$router.push('/login');
        } else {
          this.errorMessage = data.error; // Definir a mensagem de erro para exibição
        }
      } catch (error) {
        console.error('Erro ao registrar:', error);
        this.errorMessage = 'Erro ao registrar'; // Definir uma mensagem de erro genérica
      }
    }
  }
};
</script>

<style scoped src="./RegisterView.css"></style>
