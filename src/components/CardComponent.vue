<template>
  <div
    class="card"
    draggable="true"
    @dragstart="dragStart"
    @dragend="dragEnd"
  >
    <textarea v-model="localContent" class="card-title" :style="{ color: textColor }" @input="updateContent"></textarea>
    <p v-if="file" class="file-title">{{ file.name }}</p>
    <button class="upload-button" @click="triggerFileUpload">Anexar PDF</button>
    <input 
      type="file" 
      ref="fileInput" 
      accept=".pdf" 
      @change="handleFileUpload" 
      class="hidden-file-input"
    />    
    <button @click="$emit('delete-card', card._id)" class="delete-card-icon">X</button>
  </div>
</template>

<script>
export default {
  props: ['card','textColor'],
  emits: ['delete-card', 'update-card-content', 'drag-end'], // Certifique-se de que os eventos estão definidos
  data() {
    return {
      localContent: this.card.content, // Use um estado local para o conteúdo do cartão
      file: null // Variável para armazenar o arquivo PDF
    };
  },
  watch: {
    card: {
      handler(newCard) {
        this.localContent = newCard.content; // Atualize o estado local quando a prop mudar
      },
      deep: true
    }
  },
  methods: {
    dragStart(event) {
      event.dataTransfer.setData('cardId', this.card._id);
      event.dataTransfer.setData('fromListId', this.card.list); // Adiciona o ID da lista de origem aos dados de transferência
      event.dataTransfer.effectAllowed = 'move';
    },
    dragEnd() {
      this.$emit('drag-end');
    },
    updateContent() {
      console.log('Evento update-card-content emitido');
      this.$emit('update-card-content', this.card._id, this.localContent, this.file); // Emita o evento para atualizar o conteúdo no componente pai
    },
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      this.file = event.target.files[0]; // Armazena o arquivo PDF selecionado
      this.updateContent();
    }
  }
};
</script>

<style scoped>
.card {
  background-color: white;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  width: 100%; /* Garante que o cartão fique dentro da lista */
  position: relative;
  box-sizing: border-box; /* Inclui padding e border na largura total */
}

.upload-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background-color: #0056b3;
}

.hidden-file-input {
  display: none; /* Input completamente escondido */
}

.file-title {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #555;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  max-width: 100%; /* Garante que não ultrapassa o cartão */
  box-sizing: border-box;
}

.delete-card-icon {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-card-icon:hover {
  background-color: #c82333;
}

.card-title {
  resize: none; /* Desativa o redimensionamento */
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
  box-sizing: border-box;
}
</style>
