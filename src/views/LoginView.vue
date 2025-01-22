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
      if (response.ok) {
        //alert(data.message);
        localStorage.setItem('authToken', data.token); // Armazenar o token com a chave 'authToken'
        this.$router.push('/dashboard'); // Redirecionar para o Dashboard
      } else {
        this.errorMessage = data.error; // Definir a mensagem de erro para exibição
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      this.errorMessage = 'Erro ao fazer login'; // Definir uma mensagem de erro genérica
    }
  }
}
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-in-out;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.btn {
  width: 100%;
  padding: 10px;
  background-color: #026aa7;
  color: #fff;
  border: none;
  border-radius: 3px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.btn:hover {
  background-color: #005a8c;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-weight: bold;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
