<template>
  <div
    class="card"
    draggable="true"
    @dragstart="dragStart"
    @dragend="dragEnd"
  >
    <textarea v-model="localContent" class="card-title" @input="updateContent"></textarea>
    <button @click="$emit('delete-card', card._id)" class="delete-card-icon">X</button>
  </div>
</template>

<script>
export default {
  props: ['card'],
  emits: ['delete-card', 'update-card-content', 'drag-end'], // Certifique-se de que os eventos estão definidos
  data() {
    return {
      localContent: this.card.content // Use um estado local para o conteúdo do cartão
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
      this.$emit('update-card-content', this.card._id, this.localContent); // Emita o evento para atualizar o conteúdo no componente pai
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
