<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>
    <button @click="showCreateBoardForm = true" class="btn">Criar um novo Quadro</button>
    <div v-if="showCreateBoardForm" class="create-board-form">
      <input type="text" v-model="boardName" placeholder="Nome do Quadro">
      <button @click="createBoard" class="btn">Criar</button>
      <button @click="showCreateBoardForm = false" class="btn">Cancelar</button>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div class="boards-list">
      <div v-for="board in boards" :key="board._id" class="board" @click="openBoard(board)">
        {{ board.name }}
      </div>
    </div>
    <div v-if="selectedBoard" class="board-details">
      <h2>{{ selectedBoard.name }}</h2>
      <button @click="showCreateListForm = true" class="btn">Criar uma nova Lista</button>
      <div v-if="showCreateListForm" class="create-list-form">
        <input type="text" v-model="listName" placeholder="Nome da Lista">
        <button @click="createList" class="btn">Criar</button>
        <button @click="showCreateListForm = false" class="btn">Cancelar</button>
      </div>
      <div v-for="list in lists" :key="list._id" class="list">
        <h3>{{ list.name }}</h3>
        <button @click="showCreateCardForm = list._id" class="btn">Criar um novo Cartão</button>
        <div v-if="showCreateCardForm === list._id" class="create-card-form">
          <input type="text" v-model="cardTitle" placeholder="Título do Cartão">
          <input type="text" v-model="cardDescription" placeholder="Descrição do Cartão">
          <button @click="createCard(list._id)" class="btn">Criar</button>
          <button @click="showCreateCardForm = null" class="btn">Cancelar</button>
        </div>
        <div v-for="card in list.cards" :key="card._id" class="card">
          <h4>{{ card.title }}</h4>
          <p>{{ card.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardView',
  data() {
    return {
      showCreateBoardForm: false,
      boardName: '',
      errorMessage: '',
      boards: [],
      selectedBoard: null,
      showCreateListForm: false,
      listName: '',
      lists: [],
      showCreateCardForm: null,
      cardTitle: '',
      cardDescription: ''
    };
  },
  methods: {
    async createBoard() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/boards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: this.boardName
          })
        });
        const data = await response.json();
        if (response.ok) {
          this.boards.push(data);
          this.boardName = '';
          this.showCreateBoardForm = false;
        } else {
          this.errorMessage = data.error;
        }
      } catch (error) {
        console.error('Erro ao criar quadro:', error);
        this.errorMessage = 'Erro ao criar quadro';
      }
    },
    async fetchBoards() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/boards', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          this.boards = data;
        } else {
          this.errorMessage = data.error;
        }
      } catch (error) {
        console.error('Erro ao buscar quadros:', error);
        this.errorMessage = 'Erro ao buscar quadros';
      }
    },
    async openBoard(board) {
      this.selectedBoard = board;
      this.fetchLists(board._id);
    },
    async fetchLists(boardId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/lists/${boardId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          this.lists = data;
        } else {
          this.errorMessage = data.error;
        }
      } catch (error) {
        console.error('Erro ao buscar listas:', error);
        this.errorMessage = 'Erro ao buscar listas';
      }
    },
    async createList() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: this.listName,
            boardId: this.selectedBoard._id
          })
        });
        const data = await response.json();
        if (response.ok) {
          this.lists.push(data);
          this.listName = '';
          this.showCreateListForm = false;
        } else {
          this.errorMessage = data.error;
        }
      } catch (error) {
        console.error('Erro ao criar lista:', error);
        this.errorMessage = 'Erro ao criar lista';
      }
    },
    async createCard(listId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: this.cardTitle,
            description: this.cardDescription,
            listId: listId
          })
        });
        const data = await response.json();
        if (response.ok) {
          const listIndex = this.lists.findIndex(list => list._id === listId);
          this.lists[listIndex].cards.push(data);
          this.cardTitle = '';
          this.cardDescription = '';
          this.showCreateCardForm = null;
        } else {
          this.errorMessage = data.error;
        }
      } catch (error) {
        console.error('Erro ao criar cartão:', error);
        this.errorMessage = 'Erro ao criar cartão';
      }
    }
  },
  created() {
    this.fetchBoards();
  }
};
</script>

<style scoped>
.dashboard-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-in-out;
}

.create-board-form, .create-list-form, .create-card-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}

input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.btn {
  width: 100%;
  padding: 10px;
  background-color: #026aa7;
  color: #fff;
  border: none;
  border-radius: 3px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.btn:hover {
  background-color: #005a8c;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-weight: bold;
}

.boards-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.board {
  padding: 20px;
  background-color: #f4f4f4;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.board-details {
  margin-top: 30px;
}

.list {
  margin-top: 20px;
}

.card {
  padding: 10px;
  background-color: #e4e4e4;
  border-radius: 3px;
  margin-top: 10px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
