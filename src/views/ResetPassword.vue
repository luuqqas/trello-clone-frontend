<template>
  <div class="reset-container">
    <h1>Nova Senha</h1>
    <form @submit.prevent="resetPassword">
      <div class="form-group">
        <label for="password">Nova Senha:</label>
        <input type="password" v-model="password" required>
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirmar Nova Senha:</label>
        <input type="password" v-model="confirmPassword" required>
      </div>
      <button type="submit" class="btn">Redefinir Senha</button>
      <p v-if="message" class="message" :class="{ 'error-message': isError }">{{ message }}</p>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ResetPassword',
  data() {
    return {
      password: '',
      confirmPassword: '',
      message: '',
      isError: false
    };
  },
  computed: {
    token() {
      return this.$route.query.token;
    }
  },
  methods: {
    async resetPassword() {
      if (this.password !== this.confirmPassword) {
        this.message = 'As senhas não coincidem';
        this.isError = true;
        return;
      }

      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: this.token,
            newPassword: this.password
          })
        });

        const data = await response.json();
        if (response.ok) {
          this.message = 'Senha redefinida com sucesso!';
          this.isError = false;
          setTimeout(() => this.$router.push('/login'), 2000);
        } else {
          this.message = data.error || 'Erro ao redefinir senha';
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
.reset-container {
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
