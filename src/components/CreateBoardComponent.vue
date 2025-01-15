<template>
    <div>
      <input v-model="boardName" placeholder="Nome do Quadro" />
      <button @click="createBoard">Criar Quadro</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        boardName: ''
      };
    },
    methods: {
      createBoard() {
        this.$emit('create-board', this.boardName);
        this.boardName = '';
      }
    }
  };
  </script>
  
  <style scoped>
  input {
    margin-right: 10px;
  }
  button {
    padding: 5px 10px;
  }
  </style>
  