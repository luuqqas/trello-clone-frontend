<template>
  <div id="app">
    <nav :class="{ scrolled: isScrolled }">
      <div class="logo">
        <h1 class="logo-title">Trellio</h1>
      </div>
      <div class="nav-links">
        <button @click="createBoard" class="nav-button">Criar Quadro</button>
        <button @click="toggleBoardsMenu" class="nav-button">Mostrar Quadros</button>
        <button class="nav-button logout-button" @click="logout">Logout</button>
      </div>
    </nav>

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
          <div v-if="currentBoard" class="board">
            <input type="text" v-model="currentBoard.title" class="board-title" @change="updateBoardTitle(currentBoard)">
            <div class="board-buttons">
              <button @click="addList" class="add-list">Adicionar Lista</button>
              <button @click="deleteBoard(currentBoard._id)" class="delete-board">Remover Quadro</button>
            </div>
            <div class="lists-container">
              <ListComponent
                v-for="list in currentBoard.lists"
                :key="list._id"
                :list="list"
                @move-card="moveCard"
                @update-card-content="updateCardContent"
                @update-list-title="updateListTitle"
                @add-card="addCard"
                @delete-list="deleteList"
                @delete-card="deleteCard"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>








<script>
import ListComponent from '../components/ListComponent.vue'; 
import axios from 'axios';

export default {
  data() {
  return {
    showBoardsMenu: false,
    newBoard: { title: '' },
    boards: [],
    currentBoard: null,
    authToken: localStorage.getItem('authToken'), // Certifique-se de que o token está sendo obtido corretamente
    isScrolled: false
  };
}
,
  components: {
    ListComponent
  },
  methods: {
    async fetchBoards() {
  try {
    const token = this.authToken; // Certifique-se de que o token está definido e sendo utilizado
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }
    console.log('Fetching boards with token:', token); // Logging do token
    const response = await fetch('/api/boards', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    this.boards = await response.json();

    // Verifique se há um quadro salvo no localStorage
    const savedBoardId = localStorage.getItem('currentBoardId');
    if (savedBoardId) {
      const savedBoard = this.boards.find(board => board._id === savedBoardId);
      if (savedBoard) {
        this.selectBoard(savedBoard);
      }
    }
  } catch (error) {
    console.error('Erro ao buscar quadros:', error);
  }
},
  async createBoard() {
    try {
      const token = this.authToken; // Certifique-se de que o token está definido e sendo utilizado
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: 'Novo Quadro' })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const board = await response.json();
      this.boards.push(board);
      this.selectBoard(board);
    } catch (error) {
      console.error('Erro ao criar quadro:', error);
    }
  },
    async selectBoard(board) {
      this.currentBoard = board;
      localStorage.setItem('currentBoardId', board._id); // Salve o ID do quadro selecionado no localStorage
      this.showBoardsMenu = false;
      await this.fetchLists(board._id);
    },
    async fetchLists(boardId) {
      try {
        const token = this.authToken;
        const response = await fetch(`/api/lists/${boardId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
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
          'Authorization': `Bearer ${token}`
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
      this.currentBoard.lists.push(list);
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
        const response = await fetch(`/api/boards/delete/${boardId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.boards = this.boards.filter(board => board._id !== boardId);
        if (this.currentBoard && this.currentBoard._id === boardId) {
          this.currentBoard = null;
          localStorage.removeItem('currentBoardId');
        }
      } catch (error) {
        console.error('Erro ao remover quadro:', error);
      }
    },
    async deleteList(listId) {
    try {
      const token = this.authToken;
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.currentBoard.lists = this.currentBoard.lists.filter(list => list._id !== listId);
    } catch (error) {
      console.error('Erro ao deletar lista:', error);
    }
  },
  async updateBoardTitle(board) {
    try {
      const token = this.authToken;
      const response = await fetch(`/api/boards/${board._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: board.title })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar título do quadro:', error);
    }
  },
    async updateListTitle(listId, title) {
    try {
      const token = this.authToken;
      await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      });
      const list = this.currentBoard.lists.find(list => list._id === listId);
      if (list) {
        list.title = title;
      }
    } catch (error) {
      console.error('Erro ao atualizar título da lista:', error);
    }
  },
  handleDragStart(index) {
    this.draggedListIndex = index; // Armazena o índice da lista arrastada
  },
  async handleDrop(index) {
    const movedList = this.localBoard.lists.splice(this.draggedListIndex, 1)[0]; // Remove a lista arrastada
    this.localBoard.lists.splice(index, 0, movedList); // Insere a lista arrastada na nova posição
    this.draggedListIndex = null; // Reseta o índice da lista arrastada

    try {
      const listsOrder = this.localBoard.lists.map(list => list._id);
      await axios.put(`/api/boards/${this.localBoard._id}/lists/reorder`, { listsOrder });

      this.$emit('board-updated', this.localBoard); // Emite o evento para atualizar o estado no pai
    } catch (error) {
      console.error('Erro ao reordenar listas:', error);
    }
  },
  async addCard(listId) {
    try {
      const token = this.authToken;
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: 'Novo Cartão',
          listId
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const card = await response.json();
      const list = this.currentBoard.lists.find(list => list._id === listId);
      if (list) {
        list.cards.push(card);
      }
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
    }
    },
    async updateCardContent(cardId, newContent) {
    try {
      const token = this.authToken;
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newContent })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedCard = await response.json();
      const targetCard = this.currentBoard.lists
        .flatMap(list => list.cards)
        .find(card => card._id === cardId);

      if (targetCard) {
        targetCard.content = updatedCard.content;
      }

      this.$emit('board-updated', this.currentBoard); // Emitir evento para atualizar o estado no pai
    } catch (error) {
      console.error('Erro ao atualizar o conteúdo do cartão:', error);
    }
  },
  async deleteCard(cardId) {
    try {
      const token = this.authToken;
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Remover o cartão da lista localmente
      this.currentBoard.lists.forEach(list => {
        list.cards = list.cards.filter(card => card._id !== cardId);
      });
    } catch (error) {
      console.error('Erro ao remover cartão:', error);
    }
  },

  async moveCard(cardId, newListId, fromListId, newIndex) {
  try {
    console.log(`Movendo cartão ${cardId} da lista ${fromListId} para ${newListId} na posição ${newIndex}`);
    const token = this.authToken;
    const response = await fetch(`/api/cards/${cardId}/move`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ newListId, newIndex })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedCard = await response.json();

    // Atualizar o estado local do quadro
    const fromList = this.currentBoard.lists.find(list => list._id === fromListId);
    const newList = this.currentBoard.lists.find(list => list._id === newListId);

    fromList.cards = fromList.cards.filter(card => card._id !== cardId);
    newList.cards.splice(newIndex, 0, updatedCard);

    console.log(`Cartão ${cardId} movido com sucesso`);
    this.$emit('board-updated', this.currentBoard); // Emitir evento para atualizar o estado no pai
  } catch (error) {
    console.error('Erro ao mover o cartão:', error);
  }
},


  async moveList(listId, newIndex) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/lists/${listId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newIndex })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Atualizar o estado local do quadro
      const list = this.currentBoard.lists.find(l => l._id === listId);
      this.currentBoard.lists = this.currentBoard.lists.filter(l => l._id !== listId);
      this.currentBoard.lists.splice(newIndex, 0, list);

      this.$emit('board-updated', this.currentBoard); // Emitir evento para atualizar o estado no pai
    } catch (error) {
      console.error('Erro ao mover a lista:', error);
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
    },
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    }
  },
  created() {
    this.fetchBoards();
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>



<style scoped src="./DashboardView.css"></style>
