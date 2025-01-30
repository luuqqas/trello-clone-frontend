<template>
  <div class="forgot-container">
    <h1>Redefinir Senha</h1>
    <form @submit.prevent="sendResetLink">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required>
      </div>
      <button type="submit" class="btn">Enviar Link de Redefinição</button>
      <p v-if="message" class="message" :class="{ 'error-message': isError }">{{ message }}</p>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ForgotPassword',
  data() {
    return {
      email: '',
      message: '',
      isError: false
    };
  },
  methods: {
    async sendResetLink() {
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: this.email })
        });

        const data = await response.json();
        if (response.ok) {
          this.message = 'Email de redefinição enviado com sucesso!';
          this.isError = false;
        } else {
          this.message = data.error || 'Erro ao enviar email';
          this.isError = true;
        }
      } catch (error) {
        this.message = 'Erro na conexão';
        this.isError = true;
      }
    }
  }
};
</script>

<style scoped>
.forgot-container {
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

.message {
  margin-top: 10px;
}

.error-message {
  color: red;
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
