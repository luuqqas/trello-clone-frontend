<template>
  <div>
    <h2>{{ board.name }}</h2>
    <div v-for="list in board.lists" :key="list._id">
      <ListComponent :list="list" />
    </div>
    <CreateBoardComponent @create-board="handleCreateBoard" />
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
    handleCreateBoard(boardName) {
      // Chame a API para criar o quadro
      fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Certifique-se de passar o token de autenticação
        },
        body: JSON.stringify({ name: boardName })
      })
      .then(response => response.json())
      .then(data => {
        this.$emit('board-created', data);
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
