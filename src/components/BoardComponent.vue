<template>
  <div>
    <h2>
      {{ localBoard.title }}
      <i class="fa fa-star favorite-icon" :class="{ favorite: localBoard.favorite }" @click="toggleFavorite"></i>
    </h2>
    <div class="lists-container" @dragover.prevent="handleDragOverContainer" @drop="handleDropContainer">
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
        :class="{ 'drag-over': dragOverIndex === index }"
      >
        <ListComponent :list="list" @move-card="handleMoveCard" @update-card-content="handleUpdateCardContent" />
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
      if (this.draggedListIndex !== null && this.dragOverIndex !== this.draggedListIndex) {
        const lists = this.localBoard.lists;
        const draggedList = lists[this.draggedListIndex];
        lists.splice(this.draggedListIndex, 1);
        lists.splice(this.dragOverIndex, 0, draggedList);
      }
      this.draggedListIndex = null;
      this.dragOverIndex = null;

      try {
        const listsOrder = this.localBoard.lists.map((list) => list._id);
        await axios.put(`/api/boards/${this.localBoard._id}/lists/reorder`, { listsOrder }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
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
          const listsOrder = this.localBoard.lists.map((list) => list._id);
          await axios.put(`/api/boards/${this.localBoard._id}/lists/reorder`, { listsOrder }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          });
          this.$emit('board-updated', this.localBoard);
        } catch (error) {
          console.error('Erro ao reordenar listas:', error);
        }
      }
    },
    async handleMoveCard(cardId, newListId, fromListId, newIndex) {
      const fromList = this.localBoard.lists.find((list) => list._id === fromListId);
      const toList = this.localBoard.lists.find((list) => list._id === newListId);

      if (fromList && toList) {
        const cardIndex = fromList.cards.findIndex((card) => card._id === cardId);

        if (cardIndex !== -1) {
          const [card] = fromList.cards.splice(cardIndex, 1);

          const existingCardIndex = toList.cards.findIndex((existingCard) => existingCard._id === cardId);
          if (existingCardIndex === -1) {
            if (newIndex === null || newIndex >= toList.cards.length) {
              toList.cards.push(card);
            } else {
              toList.cards.splice(newIndex, 0, card);
            }
          }

          card.updatedAt = new Date();

          await axios.put(`/api/cards/${cardId}/move`, { newListId, newIndex }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          });
        }
      }

      this.$emit('board-updated', this.localBoard);
    },
    async handleUpdateCardContent(cardId, newContent, file) {
      const card = this.localBoard.lists.flatMap((list) => list.cards).find((card) => card._id === cardId);

      if (card) {
        card.content = newContent;
        const updatedAtFrontend = new Date();

        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('content', newContent);

          await axios.put(`/api/cards/${cardId}`, formData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'multipart/form-data',
            },
          }).then(() => {
            card.fileName = file.name;
            card.updatedAt = updatedAtFrontend;
            this.$emit('board-updated', this.localBoard);
          }).catch((error) => {
            console.error('Erro ao atualizar cartão:', error);
          });
        } else {
          await axios.put(`/api/cards/${cardId}`, { content: newContent }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }).then(() => {
            card.updatedAt = updatedAtFrontend;
            this.$emit('board-updated', this.localBoard);
          }).catch((error) => {
            console.error('Erro ao atualizar cartão:', error);
          });
        }
      }
    },
    async toggleFavorite() {
      try {
        const response = await axios.put(`/api/boards/${this.localBoard._id}/favorite`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        this.localBoard.favorite = response.data.favorite;
        this.$emit('board-updated', this.localBoard);
      } catch (error) {
        console.error('Erro ao favoritar quadro:', error);
      }
    },
    async handleDeleteBoard(boardId) {
      try {
        await axios.delete(`/api/boards/${boardId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        this.$emit('board-deleted', boardId);
      } catch (error) {
        console.error('Erro ao remover quadro:', error);
      }
    },
  },
};
</script>
