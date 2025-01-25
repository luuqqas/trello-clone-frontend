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
    <div 
      v-if="currentBoard" 
      class="board" 
      :style="{ backgroundColor: currentBoard.backgroundColor, color: currentBoard.textColor }"
    >
      <!-- Título do Quadro -->
      <input 
        type="text" 
        v-model="currentBoard.title" 
        class="board-title" 
        :style="{ color: currentBoard.textColor }"
        @change="updateBoardTitle(currentBoard)"
      >

      <!-- Escolha de Cores -->
      <div class="color-selectors">
        <label>
          Cor de Fundo:
          <input 
            type="color" 
            v-model="currentBoard.backgroundColor" 
            @change="updateBoardColors(currentBoard)"
          >
        </label>
        <label>
          Cor do Texto:
          <input 
            type="color" 
            v-model="currentBoard.textColor" 
            @change="updateBoardColors(currentBoard)"
          >
        </label>
      </div>
            <div class="board-buttons">
              <button @click="addList" class="add-list">Adicionar Lista</button>
              <button @click="deleteBoard(currentBoard._id)" class="delete-board">Remover Quadro</button>
            </div>
            <div
              class="lists-container"
              @dragover.prevent="handleDragOverContainer"
              @drop="handleDrop"
            >
              <div
                v-for="(list, index) in currentBoard.lists"
                :key="list._id"
                class="list-wrapper"
                draggable="true"
                @dragstart="handleDragStart(index)"
                @dragenter="handleDragEnter(index)"
                @dragover.prevent="handleDragOver"
                @dragleave="handleDragLeave"
                :class="{'drag-over': dragOverIndex === index}"
              >
                <ListComponent
                  :list="list"
                  :textColor="currentBoard.textColor" 
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
      isScrolled: false,
      draggedListIndex: null,
      dragOverIndex: null,
    };
  },
  components: {
    ListComponent,
  },
  methods: {
    async fetchBoards() {
      try {
        const token = this.authToken;
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }
        console.log('Fetching boards with token:', token);
        const response = await axios.get('/api/boards', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.boards = response.data;

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
        const token = this.authToken;
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }
        const response = await axios.post('/api/boards', { title: 'Novo Quadro' }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const board = response.data;
        this.boards.push(board);
        this.selectBoard(board);
      } catch (error) {
        console.error('Erro ao criar quadro:', error);
      }
    },
    async selectBoard(board) {
      this.currentBoard = board;
      localStorage.setItem('currentBoardId', board._id);
      this.showBoardsMenu = false;
      await this.fetchLists(board._id);
    },
    async fetchLists(boardId) {
      try {
        const token = this.authToken;
        const response = await axios.get(`/api/lists/${boardId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        this.currentBoard.lists = response.data;
      } catch (error) {
        console.error('Erro ao buscar listas:', error);
      }
    },
    async addList() {
      try {
        const token = this.authToken;
        const response = await axios.post('/api/lists', {
          title: 'Nova Lista',
          boardId: this.currentBoard._id
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const list = response.data;
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
        await axios.delete(`/api/boards/delete/${boardId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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
        await axios.delete(`/api/lists/${listId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
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
        await axios.put(`/api/boards/${board._id}`, { title: board.title }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Erro ao atualizar título do quadro:', error);
      }
    },
    
    async updateBoardColors(board) {
  try {
    const token = this.authToken;
    await axios.put(`/api/boards/${board._id}`, {
      backgroundColor: board.backgroundColor,
      textColor: board.textColor,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.$emit('board-updated', this.currentBoard);
  } catch (error) {
    console.error('Erro ao atualizar cores do quadro:', error);
  }
}

,
    async updateListTitle(listId, title) {
      try {
        const token = this.authToken;
        await axios.put(`/api/lists/${listId}`, { title }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const list = this.currentBoard.lists.find(list => list._id === listId);
        if (list) {
          list.title = title;
        }
      } catch (error) {
        console.error('Erro ao atualizar título da lista:', error);
      }
    },
    async addCard(listId) {
      try {
        const token = this.authToken;
        const response = await axios.post('/api/cards', {
          content: 'Novo Cartão',
          listId
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const card = response.data;
        const list = this.currentBoard.lists.find(list => list._id === listId);
        if (list) {
          list.cards.push(card);
        }
      } catch (error) {
        console.error('Erro ao adicionar cartão:', error);
      }
    },

  async updateCardContent(cardId, newContent, file) {
  try {
    const formData = new FormData();
    formData.append('content', newContent);
    console.log(file);
    if (file) {
      formData.append('file', file); // Adiciona o arquivo ao FormData
    }

    const token = this.authToken;
    const response = await axios.put(`/api/cards/${cardId}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    const updatedCard = response.data;
    const targetCard = this.currentBoard.lists
      .flatMap(list => list.cards)
      .find(card => card._id === cardId);

    if (targetCard) {
      targetCard.content = updatedCard.content;
      targetCard.fileName = updatedCard.fileName; // Atualiza no front
    }

    this.$emit('board-updated', this.currentBoard);
  } catch (error) {
    console.error('Erro ao atualizar o conteúdo do cartão:', error);
  }
},

    async deleteCard(cardId) {
      try {
        const token = this.authToken;
        await axios.delete(`/api/cards/${cardId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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
        const response = await axios.put(`/api/cards/${cardId}/move`, {
          newListId, newIndex
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const updatedCard = response.data;

        const fromList = this.currentBoard.lists.find(list => list._id === fromListId);
        const newList = this.currentBoard.lists.find(list => list._id === newListId);

        fromList.cards = fromList.cards.filter(card => card._id !== cardId);
        newList.cards.splice(newIndex, 0, updatedCard);

        console.log(`Cartão ${cardId} movido com sucesso`);
        this.$emit('board-updated', this.currentBoard);
      } catch (error) {
        console.error('Erro ao mover o cartão:', error);
      }
    },
    async moveList(listId, newIndex) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.put(`/api/lists/${listId}/move`, { newIndex }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const list = this.currentBoard.lists.find(l => l._id === listId);
        this.currentBoard.lists = this.currentBoard.lists.filter(l => l._id !== listId);
        this.currentBoard.lists.splice(newIndex, 0, list);

        this.$emit('board-updated', this.currentBoard);
      } catch (error) {
        console.error('Erro ao mover a lista:', error);
      }
    },
    async handleDragStart(index) {
      this.draggedListIndex = index;
    },
    async handleDragEnter(index) {
      if (index !== this.draggedListIndex) {
        this.dragOverIndex = index;
      }
    },
    async handleDragLeave() {
      this.dragOverIndex = null;
    },
    async handleDragOver(event) {
      event.preventDefault();
    },
    async handleDrop() {
  if (this.dragOverIndex !== null && this.dragOverIndex !== this.draggedListIndex) {
    const lists = this.currentBoard.lists;
    const draggedList = lists[this.draggedListIndex];
    lists.splice(this.draggedListIndex, 1); // Remove a lista arrastada
    lists.splice(this.dragOverIndex, 0, draggedList); // Adicione a lista arrastada na nova posição
  }
  this.draggedListIndex = null; // Reseta o índice da lista arrastada
  this.dragOverIndex = null; // Reseta o índice da lista sobre a qual estamos arrastando

  try {
    const listsOrder = this.currentBoard.lists.map(list => list._id);
    const token = this.authToken; // Inclua o token no cabeçalho
    await axios.put(`/api/boards/${this.currentBoard._id}/lists/reorder`, { listsOrder }, {
      headers: {
        'Authorization': `Bearer ${token}` // Inclua o token no cabeçalho
      }
    });

    this.$emit('board-updated', this.currentBoard); // Emite o evento para atualizar o estado no pai
  } catch (error) {
    console.error('Erro ao reordenar listas:', error);
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
