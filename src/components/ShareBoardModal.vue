<template>
  <div class="modal-overlay" v-if="show">
    <div class="modal-content">
      <h3>Compartilhar Quadro</h3>
      <label for="email">E-mail do usuário:</label>
      <input type="email" v-model="email" id="email" class="input-field" />
      <label for="mode">Modo:</label>
      <select v-model="mode" id="mode" class="input-field">
        <option value="edit">Modo Edição</option>
        <option value="view">Modo Visualização</option>
      </select>
      <div class="modal-buttons">
        <button @click="shareBoard" class="modal-button" :disabled="isLoading">
          {{ isLoading ? 'Compartilhando...' : 'Compartilhar' }}
        </button>
        <button @click="$emit('close')" class="modal-button cancel">Cancelar</button>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: ['show', 'boardId'],
  data() {
    return {
      email: '',
      mode: 'view',
      errorMessage: '',
      isLoading: false
    };
  },
  methods: {
    async shareBoard() {
  this.errorMessage = ''; // Reset the error message
  this.isLoading = true; // Set loading state
  try {
    const response = await axios.post(`http://localhost:3000/api/boards/${this.boardId}/share`, {
      email: this.email,
      mode: this.mode
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    this.$emit('close');
    this.$emit('shared', response.data);
    alert('Quadro compartilhado com sucesso!');
  } catch (error) {
    if (error.response && error.response.data) {
      this.errorMessage = error.response.data.error;
    } else {
      this.errorMessage = 'Erro ao compartilhar quadro';
    }
    console.error('Erro ao compartilhar quadro:', error);
  } finally {
    this.isLoading = false; // Reset loading state
  }
}

  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  width: 300px;
}

.input-field {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-sizing: border-box;
}

.modal-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.modal-button {
  background-color: #5aac44;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.3s ease-in-out;
}

.modal-button.cancel {
  background-color: #d9534f;
}

.modal-button:hover {
  background-color: #519839;
}

.modal-button.cancel:hover {
  background-color: #c9302c;
}

.modal-button:disabled {
  background-color: #8b8b8b;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>
