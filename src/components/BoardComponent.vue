<template>
  <div>
    <h2>{{ localBoard.title }}</h2>
    <div
      v-for="(list, index) in localBoard.lists"
      :key="list._id"
      draggable="true"
      @dragstart="handleDragStart(index)"
      @dragover.prevent="handleDragOver(index)"
      @drop="handleDrop(index)"
      @dragenter="handleDragEnter(index)"
      @dragleave="handleDragLeave"
      :class="{'drag-over': dragOverIndex === index}"
    >
      <ListComponent :list="list" @move-card="handleMoveCard" @update-card-content="handleUpdateCardContent" />
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
      localBoard: JSON.parse(JSON.stringify(this.board)), // Copie a prop board para o estado local
      draggedListIndex: null, // Novo estado para armazenar o índice da lista arrastada
      dragOverIndex: null // Novo estado para armazenar o índice da lista sobre a qual estamos arrastando
    };
  },
  components: {
    ListComponent,
    CreateBoardComponent
  },
  watch: {
    board: {
      handler(newBoard) {
        this.localBoard = JSON.parse(JSON.stringify(newBoard)); // Atualize o estado local quando a prop mudar
      },
      deep: true
    }
  },
  methods: {
    handleCreateBoard(boardTitle) {
      fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ title: boardTitle })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.$emit('board-created', data);
      })
      .catch(error => {
        console.error('Erro ao criar quadro:', error);
      });
    },
    handleDeleteBoard(boardId) {
      fetch(`/api/boards/delete/${boardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.$emit('board-deleted', boardId);
      })
      .catch(error => {
        console.error('Erro ao remover quadro:', error);
      });
    },
    handleDragStart(index) {
      this.draggedListIndex = index; // Armazena o índice da lista arrastada
    },
    handleDragEnter(index) {
      if (index !== this.draggedListIndex) {
        this.dragOverIndex = index; // Atualize o índice da lista sobre a qual estamos arrastando
      }
    },
    handleDragLeave() {
      this.dragOverIndex = null; // Reseta o índice da lista sobre a qual estamos arrastando
    },
    handleDragOver(event) {
      event.preventDefault(); // Previna o comportamento padrão
    },
    async handleDrop() {
      if (this.dragOverIndex !== null && this.dragOverIndex !== this.draggedListIndex) {
        const lists = this.localBoard.lists;
        const draggedList = lists[this.draggedListIndex];
        lists.splice(this.draggedListIndex, 1); // Remove a lista arrastada
        lists.splice(this.dragOverIndex, 0, draggedList); // Adicione a lista arrastada na nova posição
      }
      this.draggedListIndex = null; // Reseta o índice da lista arrastada
      this.dragOverIndex = null; // Reseta o índice da lista sobre a qual estamos arrastando

      try {
        const listsOrder = this.localBoard.lists.map(list => list._id);
        await axios.put(`/api/boards/${this.localBoard._id}/lists/reorder`, { listsOrder });

        this.$emit('board-updated', this.localBoard); // Emite o evento para atualizar o estado no pai
      } catch (error) {
        console.error('Erro ao reordenar listas:', error);
      }
    },
    async handleMoveCard(cardId, newListId, fromListId, newIndex) {
      try {
        const response = await axios.put(`/api/cards/${cardId}/move`, { newListId, newIndex });
        const updatedCard = response.data;

        // Atualizar o estado local do quadro
        this.localBoard.lists = this.localBoard.lists.map((list) => {
          if (list._id === fromListId) {
            list.cards = list.cards.filter((card) => card._id !== cardId);
          }
          if (list._id === newListId) {
            list.cards.splice(newIndex, 0, updatedCard);
          }
          return list;
        });

        this.$emit('board-updated', this.localBoard); // Emitir evento para atualizar o estado no pai
      } catch (error) {
        console.error('Erro ao mover o cartão:', error);
      }
    },
    async handleUpdateCardContent(cardId, newContent) {
      try {
        await axios.put(`/api/cards/${cardId}`, { content: newContent });

        const targetCard = this.localBoard.lists
          .flatMap(list => list.cards)
          .find(card => card._id === cardId);

        if (targetCard) {
          targetCard.content = newContent;
        }

        this.$emit('board-updated', this.localBoard); // Emitir evento para atualizar o estado no pai
      } catch (error) {
        console.error('Erro ao atualizar o conteúdo do cartão:', error);
      }
    }
  }
};
</script>



<style scoped>
h2 {
  color: #555;
  font-family: Arial, sans-serif;
}

.drag-over {
  border: 2px dashed #007bff; /* Ajuste a cor e o estilo conforme necessário */
}
</style>
