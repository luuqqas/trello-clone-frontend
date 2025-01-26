<template>
  <div>
    <h2>
      {{ localBoard.title }}
      <i class="fa fa-star favorite-icon" :class="{ favorite: localBoard.favorite }" @click="toggleFavorite"></i>
    </h2>
    <div
      class="lists-container"
      @dragover.prevent="handleDragOverContainer"
      @drop="handleDropContainer"
    >
      <div
        v-for="(list, index) in localBoard.lists"
        :key="`${list._id}-${index}`"
        class="list-wrapper"
        draggable="true"
        @dragstart="handleDragStart(index)"
        @dragenter="handleDragEnter(index)"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        :class="{'drag-over': dragOverIndex === index}"
      >
        <ListComponent
          :list="list"
          @move-card="handleMoveCard"
          @update-card-content="handleUpdateCardContent"
        />
      </div>
    </div>
    <CreateBoardComponent @create-board="handleCreateBoard" />
    <button @click="handleDeleteBoard(localBoard._id)">Remover Quadro</button>
  </div>
</template>


<script>
import axios from 'axios';
import ListComponent from './ListComponent.vue';
import CreateBoardComponent from './CreateBoardComponent.vue';

export default {
  props: ['board'],
  data() {
    return {
      localBoard: JSON.parse(JSON.stringify(this.board)),
      draggedListIndex: null,
      dragOverIndex: null,
    };
  },
  components: {
    ListComponent,
    CreateBoardComponent,
  },
  watch: {
    board: {
      handler(newBoard) {
        this.localBoard = JSON.parse(JSON.stringify(newBoard));
      },
      deep: true,
    },
  },
  methods: {
  handleDragStart(index) {
    this.draggedListIndex = index;
  },
  handleDragEnter(index) {
    if (index !== this.draggedListIndex) {
      this.dragOverIndex = index;
    }
  },
  handleDragLeave() {
    this.dragOverIndex = null;
  },
  handleDragOver(event) {
    event.preventDefault();
  },
  async handleDrop() {
    if (this.dragOverIndex !== null && this.dragOverIndex !== this.draggedListIndex) {
      const lists = this.localBoard.lists;
      const draggedList = lists[this.draggedListIndex];
      lists.splice(this.draggedListIndex, 1);
      lists.splice(this.dragOverIndex, 0, draggedList);
    }
    this.draggedListIndex = null;
    this.dragOverIndex = null;

    try {
      const listsOrder = this.localBoard.lists.map(list => list._id);
      await axios.put(`/api/boards/${this.localBoard._id}/lists/reorder`, { listsOrder });
      this.$emit('board-updated', this.localBoard);
    } catch (error) {
      console.error('Erro ao reordenar listas:', error);
    }
  },
  async handleDropContainer() {
    if (this.draggedListIndex !== null) {
      const lists = this.localBoard.lists;
      const draggedList = lists[this.draggedListIndex];
      lists.splice(this.draggedListIndex, 1);
      lists.push(draggedList);
      this.draggedListIndex = null;

      try {
        const listsOrder = this.localBoard.lists.map(list => list._id);
        await axios.put(`/api/boards/${this.localBoard._id}/lists/reorder`, { listsOrder });
        this.$emit('board-updated', this.localBoard);
      } catch (error) {
        console.error('Erro ao reordenar listas:', error);
      }
    }
  },
  handleMoveCard(cardId, newListId, fromListId, newIndex) {
    const fromList = this.localBoard.lists.find(list => list._id === fromListId);
    const toList = this.localBoard.lists.find(list => list._id === newListId);

    if (fromList && toList) {
      const cardIndex = fromList.cards.findIndex(card => card._id === cardId);

      if (cardIndex !== -1) {
        const [card] = fromList.cards.splice(cardIndex, 1);

        // Evita adicionar duplicatas
        const existingCardIndex = toList.cards.findIndex(existingCard => existingCard._id === cardId);
        if (existingCardIndex === -1) {
          if (newIndex === null || newIndex >= toList.cards.length) {
            toList.cards.push(card); // Adiciona ao final da lista
          } else {
            toList.cards.splice(newIndex, 0, card); // Adiciona na posição especificada
          }
        }
      }
    }
    this.$emit('board-updated', this.localBoard); // Assegura que o estado é atualizado
  },
  handleUpdateCardContent(cardId, newContent) {
    const listIndex = this.localBoard.lists.findIndex(list => list.cards.some(card => card._id === cardId));
    if (listIndex !== -1) {
      const card = this.localBoard.lists[listIndex].cards.find(card => card._id === cardId);
      if (card) {
        card.content = newContent;
      }
    }
    this.$emit('board-updated', this.localBoard); // Assegura que o estado é atualizado
  },
}



};
</script>






<style scoped>
h2 {
  color: #555;
  font-family: Arial, sans-serif;
}

.lists-container {
  border: 2px dashed transparent; /* Inicialmente transparente */
  padding: 10px;
  min-height: 100px; /* Ajuste conforme necessário */
}

.lists-container.drag-over {
  border: 2px dashed #007bff; /* Cor da borda quando a lista está sendo arrastada sobre */
}

.list-wrapper {
  margin-bottom: 10px;
}

.drag-over {
  border: 2px dashed #007bff; /* Ajuste a cor e o estilo conforme necessário */
}
</style>
