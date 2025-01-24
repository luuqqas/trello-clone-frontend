<template>
  <div
    class="list"
    draggable="true" 
    @dragstart="dragStart"
    @dragend="dragEnd"
    @dragover.prevent
    @drop="drop"
  >
    <input type="text" v-model="localList.title" class="list-title" @change="updateListTitle(localList)">
    <div class="list-buttons">
      <button @click="addCard" class="add-card">Adicionar Cartão</button>
      <button @click="deleteList" class="delete-list">Remover Lista</button>
    </div>
    <div
      v-for="(card, index) in localList.cards"
      :key="card._id"
      @dragover.prevent
      @dragenter="dragEnter(index)"
      @dragleave="dragLeave"
      @drop="dropOnCard(index)"
    >
      <CardComponent :card="card" @update-card-content="updateCardContent" @delete-card="deleteCard" />
    </div>
  </div>
</template>


<script>
import CardComponent from './CardComponent.vue';

export default {
  props: ['list'],
  components: {
    CardComponent,
  },
  emits: ['move-card', 'move-list', 'update-list-title', 'add-card', 'delete-list', 'delete-card', 'update-card-content', 'drag-end'], // Certifique-se de que os eventos estão definidos corretamente
  data() {
    return {
      localList: JSON.parse(JSON.stringify(this.list)), // Crie uma cópia local da prop
      draggedOverCardIndex: null
    };
  },
  watch: {
    list: {
      handler(newList) {
        this.localList = JSON.parse(JSON.stringify(newList)); // Atualize a cópia local quando a prop mudar
      },
      deep: true
    }
  },
  methods: {
    dragStart(event) {
      event.dataTransfer.setData('listId', this.localList._id);
      event.dataTransfer.effectAllowed = 'move';
    },
    dragEnd() {
      this.$emit('drag-end');
    },
    dragEnter(index) {
      this.draggedOverCardIndex = index;
    },
    dragLeave() {
      this.draggedOverCardIndex = null;
    },
    drop(event) {
      const cardId = event.dataTransfer.getData('cardId'); // Recupera o ID do cartão arrastado
      const fromListId = event.dataTransfer.getData('fromListId'); // Recupera o ID da lista de origem
      const listId = event.dataTransfer.getData('listId'); // Recupera o ID da lista arrastada
      if (cardId) {
        this.$emit('move-card', cardId, this.localList._id, fromListId, this.draggedOverCardIndex); // Emite o evento para o pai
      } else if (listId) {
        this.$emit('move-list', listId, this.localList._id); // Emite o evento de mover lista
      }
    },
    dropOnCard(index) {
      const cardId = event.dataTransfer.getData('cardId'); // Recupera o ID do cartão arrastado
      const fromListId = event.dataTransfer.getData('fromListId'); // Recupera o ID da lista de origem
      if (cardId) {
        this.$emit('move-card', cardId, this.localList._id, fromListId, index); // Emite o evento para o pai, com o índice do cartão sobre o qual ele foi solto
      }
      this.draggedOverCardIndex = null;
    },
    updateListTitle() {
      this.$emit('update-list-title', this.localList._id, this.localList.title);
    },
    addCard() {
      this.$emit('add-card', this.localList._id);
    },
    deleteList() {
      this.$emit('delete-list', this.localList._id);
    },
    deleteCard(cardId) {
      this.$emit('delete-card', cardId); // Emita o evento de deleção do cartão para o pai
    },
    updateCardContent(cardId, newContent) {
      this.$emit('update-card-content', cardId, newContent);
    }
  }
};
</script>
<style scoped>
.list {
  background-color: #dfe1e6;
  padding: 10px;
  border-radius: 5px;
  width: 250px;
  box-sizing: border-box;
  position: relative;
}

.list-title {
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 3px;
  box-sizing: border-box;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.list-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.add-list, .add-card, .delete-list {
  background-color: #5aac44;
  color: white; /* Mantenha apenas uma declaração de cor */
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  margin: 5px 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-list:hover, .add-card:hover, .delete-list:hover {
  background-color: #5aac44;
  color: white;
}
</style>


