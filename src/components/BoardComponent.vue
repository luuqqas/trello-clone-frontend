<template>
  <div>
    <h2>{{ board.title }}</h2>
    <div v-for="list in board.lists" :key="list._id">
      <ListComponent :list="list" />
    </div>
    <CreateBoardComponent @create-board="handleCreateBoard" />
    <button @click="handleDeleteBoard(board._id)">Remover Quadro</button>
  </div>
</template>

<script>
import ListComponent from './ListComponent.vue';
import CreateBoardComponent from './CreateBoardComponent.vue';

export default {
  props: ['board'],
  components: {
    ListComponent,
    CreateBoardComponent
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
      fetch(`/api/boards/${boardId}`, {
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
    }
  }
};
</script>

<style scoped>
h2 {
  color: #555;
  font-family: Arial, sans-serif;
}
</style>
