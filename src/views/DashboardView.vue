<template>
  <div id="app">
    <header>
  <h1>Trellio</h1>
  <button class="logout-button" @click="logout">Logout</button>
  <div id="buttons-container">
    <button @click="createBoard">Criar Quadro</button>
    <button id="edit-board" v-if="currentBoard" @click="editBoard">Editar Quadro</button>
    <button id="show-boards" @click="toggleBoardsMenu">Mostrar Quadros</button>
  </div>
</header>

    <main>
      <aside :class="['boards-menu', { active: showBoardsMenu }]">
        <h2>Quadros</h2>
        <ul id="boards-list">
          <li v-for="board in boards" :key="board._id" :id="`board-${board._id}`" @click="selectBoard(board)">
            <span>{{ board.title }}</span>
            <i class="fa fa-star favorite-icon" :class="{ favorite: board.favorite }" @click.stop="toggleFavorite(board._id)"></i>
            <button @click.stop="deleteBoard(board._id)">Remover</button>
          </li>
        </ul>
      </aside>
      <section id="board-view">
        <div id="boards-container">
  <div v-for="board in boards" :key="board._id" class="board">
    <input type="text" v-model="board.title" class="board-title" @change="updateBoardTitle(board)">
    <button @click="addList" class="add-list">Adicionar Lista</button>
    <button @click="deleteBoard(board._id)" class="delete-board">Remover Quadro</button>
    <div class="lists-container">
      <div v-for="list in board.lists" :key="list._id" class="list">
        <input type="text" v-model="list.title" class="list-title" @change="updateListTitle(list)">
        <button @click="addCard(list)" class="add-card">Adicionar Cartão</button>
        <button @click="deleteList(list._id)" class="delete-list">Remover Lista</button>
        <div class="cards-container">
          <div v-for="card in list.cards" :key="card._id" class="card">
            <textarea v-model="card.title" class="card-title"></textarea>
            <textarea v-model="card.description" class="card-content"></textarea>
            <button @click="deleteCard(card._id)" class="delete-card-icon">X</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


      </section>
    </main>
  </div>
</template>
<script>
export default {
  data() {
    return {
      showBoardsMenu: false,
      newBoard: { title: '' },
      boards: [], // Inicializar como um array vazio
      currentBoard: null,
      authToken: localStorage.getItem('authToken') // Certifique-se de obter o token
    };
  },
  methods: {
    async fetchBoards() {
      try {
        const token = this.authToken;
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }
        const response = await fetch('/api/boards', {
          headers: {
            'Authorization': `Bearer ${token}` // Incluir o token de autenticação no cabeçalho
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.boards = await response.json();
      } catch (error) {
        console.error('Erro ao buscar quadros:', error);
      }
    },
    async createBoard() {
      try {
        const token = this.authToken;
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }
        const response = await fetch('/api/boards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Incluir o token de autenticação no cabeçalho
          },
          body: JSON.stringify({ title: 'Novo Quadro' }) // Define um título padrão
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const board = await response.json();
        this.boards.push(board);
        this.selectBoard(board);  // Selecionar o quadro recém-criado
      } catch (error) {
        console.error('Erro ao criar quadro:', error);
      }
    },
    async selectBoard(board) {
      this.currentBoard = board;
      this.showBoardsMenu = false;
      await this.fetchLists(board._id);
    },
    async fetchLists(boardId) {
      try {
        const token = this.authToken;
        const response = await fetch(`/api/lists/${boardId}`, {
          headers: {
            'Authorization': `Bearer ${token}` // Incluir o token de autenticação no cabeçalho
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.currentBoard.lists = await response.json();
      } catch (error) {
        console.error('Erro ao buscar listas:', error);
      }
    },
    async addList() {
      try {
        const token = this.authToken;
        const response = await fetch('/api/lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Incluir o token de autenticação no cabeçalho
          },
          body: JSON.stringify({
            title: 'Nova Lista',
            boardId: this.currentBoard._id
          })
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const list = await response.json();
        const boardIndex = this.boards.findIndex(board => board._id === this.currentBoard._id);
        this.boards[boardIndex].lists.push(list);
      } catch (error) {
        console.error('Erro ao adicionar lista:', error);
      }
    },
    async deleteBoard(boardId) {
      try {
        const token = this.authToken;
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }
        const response = await fetch(`/api/boards/${boardId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}` // Incluir o token de autenticação no cabeçalho
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.boards = this.boards.filter(board => board._id !== boardId); // Remover o quadro do estado
        if (this.currentBoard && this.currentBoard._id === boardId) {
          this.currentBoard = null; // Desselecionar o quadro se ele estiver sendo visualizado
        }
      } catch (error) {
        console.error('Erro ao remover quadro:', error);
      }
    },
    async deleteList(listId) {
      try {
        const token = this.authToken;
        await fetch(`/api/lists/${listId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}` // Incluir o token de autenticação no cabeçalho
          }
        });
        this.currentBoard.lists = this.currentBoard.lists.filter(list => list._id !== listId);
      } catch (error) {
        console.error('Erro ao deletar lista:', error);
      }
    },
    async updateBoardTitle(board) {
      try {
        const token = this.authToken;
        await fetch(`/api/boards/${board._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Incluir o token de autenticação no cabeçalho
          },
          body: JSON.stringify({ title: board.title })
        });
      } catch (error) {
        console.error('Erro ao atualizar título do quadro:', error);
      }
    },
    async updateListTitle(list) {
      try {
        const token = this.authToken;
        await fetch(`/api/lists/${list._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Incluir o token de autenticação no cabeçalho
          },
          body: JSON.stringify({ title: list.title })
        });
      } catch (error) {
        console.error('Erro ao atualizar título da lista:', error);
      }
    },
    async addCard(list) {
      try {
        const token = this.authToken;
        const response = await fetch('/api/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Incluir o token de autenticação no cabeçalho
          },
          body: JSON.stringify({
            title: 'Novo Cartão',
            description: '',
            listId: list._id
          })
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const card = await response.json();
        list.cards.push(card);
      } catch (error) {
        console.error('Erro ao adicionar cartão:', error);
      }
    },
    async deleteCard(cardId) {
      try {
        const token = this.authToken;
        await fetch(`/api/cards/${cardId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}` // Incluir o token de autenticação no cabeçalho
          }
        });
        this.currentBoard.lists.forEach(list => {
          list.cards = list.cards.filter(card => card._id !== cardId);
        });
      } catch (error) {
        console.error('Erro ao deletar cartão:', error);
      }
    },
    toggleBoardsMenu() {
      this.showBoardsMenu = !this.showBoardsMenu;
    },
    logout() {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    },
    toggleFavorite(boardId) {
      const board = this.boards.find(board => board._id === boardId);
      board.favorite = !board.favorite;
    }
  },
  created() {
    this.fetchBoards();
  }
};
</script>


<style scoped>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f4f4;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #026aa7;
  color: white;
  padding: 10px 20px;
}

header h1 {
  margin: 0;
}

header button {
  background-color: #5aac44;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
}

header button:hover {
  background-color: #519839;
}

#buttons-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

#show-boards {
  background-color: #5aac44;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
}

#show-boards:hover {
  background-color: #519839;
}

nav a {
  color: #fff;
  margin: 0 10px;
  text-decoration: none;
}

main {
  display: flex;
  padding: 20px;
}

.container {
  max-width: 400px;
  margin: auto;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.board {
  background-color: #0079bf;
  color: white;
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
}

.board-title {
  width: calc(100% - 20px);
  padding: 10px;
  margin: 10px auto;
  border: none;
  border-radius: 3px;
  font-size: 20px;
  text-align: center;
  background-color: #005a8c;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: block;
}

.add-list, .delete-board {
  background-color: #5aac44;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 3px;
  margin-right: 5px;
}

.add-list:hover, .delete-board:hover {
  background-color: #519839;
}

.boards-menu {
  width: 250px;
  background-color: #026aa7;
  color: white;
  position: fixed;
  height: 100%;
  top: 0;
  left: 0;
  overflow-x: hidden;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  font-family: 'Roboto', sans-serif;
}

.boards-menu.active {
  transform: translateX(0);
}

.boards-menu h2 {
  color: #fff;
  text-align: center;
  padding: 20px 0;
  font-size: 20px;
}

.boards-menu ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.boards-menu ul li {
  padding: 10px;
  border-bottom: 1px solid #444;
  transition: background-color 0.3s, transform 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.boards-menu ul li:hover {
  background-color: #4c9ed9;
  transform: translateX(5px);
}

.boards-menu ul li.active {
  background-color: #1d78c1;
}

.boards-menu ul li.active span {
  color: #fff;
}

.boards-menu ul li button {
  margin-left: 0.5rem;
  background: #ff4d4d;
  color: white;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.boards-menu ul li button:hover {
  background: #e60000;
}

#edit-board {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  display: none;
}

#edit-board:hover {
  background-color: #e68900;
}

.edit-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-container label {
  font-size: 14px;
  color: #333;
}

.edit-container input[type="color"] {
  width: 100px;
  height: 30px;
  border: none;
  cursor: pointer;
}

#save-changes, #cancel-changes {
  background-color: #5aac44;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 3px;
}

#save-changes:hover, #cancel-changes:hover {
  background-color: #519839;
}

#cancel-changes {
  background-color: #d32f2f;
}

#cancel-changes:hover {
  background-color: #b71c1c;
}

.favorite-icon {
  color: #ccc; /* Cor padrão para não favoritos */
  cursor: pointer;
  margin-right: 10px; /* Espaçamento entre o ícone e o título */
}

.favorite-icon.favorite {
  color: #ff0; /* Cor dourada para favoritos */
}

/* Estilos do cards.css */

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

.card-title {
  width: calc(100% - 40px); /* Ajusta a largura do título para evitar sobreposição */
  padding: 10px;
  border: none;
  border-radius: 3px;
  box-sizing: border-box; /* Garante que o padding não afete o layout */
  margin-bottom: 10px; /* Adiciona espaço abaixo do título */
  resize: none; /* Remove a opção de redimensionamento */
  overflow: auto; /* Adiciona rolagem automática */
  white-space: pre-wrap; /* Permite a quebra de linha */
  word-wrap: break-word; /* Quebra palavras longas */
  height: auto; /* Permite que a altura se ajuste conforme o conteúdo */
  min-height: 40px; /* Define uma altura mínima para o campo */
  max-height: 150px; /* Define uma altura máxima para o campo */
}

.card-content {
  margin-bottom: 10px;
}

.card-dates {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 10px;
  color: #888;
  text-align: right;
}

.card-dates.fixed-dates {
  color: #888 !important;
}

.delete-card-icon {
  position: absolute;
  top: 10px; /* Move o botão para o topo do cartão */
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  color: #d32f2f;
}

.delete-card-icon:hover {
  color: #b71c1c;
}

.placeholder {
  background-color: #f0f0f0;
  border: 2px dashed #ccc;
  margin-bottom: 10px;
  border-radius: 3px;
}

/* Estilos do lists.css */

.list {
  background-color: #dfe1e6;
  padding: 10px;
  border-radius: 5px;
  width: 250px; /* Define a largura da lista */
  box-sizing: border-box; /* Garante que o padding e a borda sejam incluídos na largura total */
  position: relative; /* Permite o posicionamento absoluto dos elementos dentro da lista */
}

.list-title {
  width: calc(100% - 20px); /* Ajusta a largura do título para evitar sobreposição */
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 3px;
  box-sizing: border-box; /* Garante que o padding não afete o layout */
  overflow: auto; /* Adiciona rolagem automática */
  white-space: pre-wrap; /* Permite a quebra de linha */
  word-wrap: break-word; /* Quebra palavras longas */
}

.add-card, .delete-list {
  background-color: #5aac44;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 3px;
  margin-right: 5px;
}

.add-card:hover, .delete-list:hover {
  background-color: #519839;
}

.lists-container {
  display: flex;
  gap: 10px;
}
</style>

