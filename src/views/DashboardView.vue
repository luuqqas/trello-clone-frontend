<template>
  <div id="app">
    <nav :class="{ scrolled: isScrolled }">
      <div class="logo">
        <h1 class="logo-title">Trellio</h1>
      </div>
      <div class="nav-links">
        <button @click="createBoard" class="nav-button">Criar Quadro</button>
        <button @click="toggleBoardsMenu" class="nav-button">Mostrar Quadros</button>
        <button v-if="currentBoard" @click="toggleShareBoard" class="nav-button">Compartilhar Quadro</button>
        <span v-if="currentBoard && currentPermission && !isOwner" class="permission-indicator">
          <span :class="currentPermission">{{ currentPermission === 'edit' ? 'Editar' : 'Visualizar' }}</span>
        </span>
        <button class="nav-button logout-button" @click="logout">Logout</button>
      </div>
    </nav>

    <main>
      <div class="main-content">
        <aside :class="['boards-menu', { active: showBoardsMenu }]">
          <h2>Meus Favoritos</h2>
          <ul id="favorite-boards-list">
            <li v-for="board in favoriteBoards" :key="board._id" :id="`board-${board._id}`" @click="selectBoard(board)">
              <span>{{ board.title }}</span>
              <i class="fa fa-star favorite-icon" :class="{ favorite: board.favorite || (board.sharedWith && board.sharedWith.some(sw => sw.user === user._id && sw.favorite)) }" @click.stop="toggleFavorite(board._id)"></i>
              <button @click.stop="deleteBoard(board._id)">Remover</button>
              <i v-if="board.sharedWith && board.sharedWith.some(sw => sw.user === user._id)" class="fa fa-share-alt shared-icon"></i>
            </li>
          </ul>
          <h2>Meus Quadros</h2>
          <ul id="boards-list">
            <li v-for="board in boards" :key="board._id" :id="`board-${board._id}`" @click="selectBoard(board)">
              <span>{{ board.title }}</span>
              <i class="fa fa-star favorite-icon" :class="{ favorite: board.favorite }" @click.stop="toggleFavorite(board._id)"></i>
              <button @click.stop="deleteBoard(board._id)">Remover</button>
              <i v-if="board.sharedWith && board.sharedWith.length > 0" class="fa fa-share-alt shared-icon"></i>
            </li>
          </ul>
          <h2>Quadros Compartilhados</h2>
          <ul id="shared-boards-list">
            <li v-for="board in sharedBoards" :key="board._id" :id="`board-${board._id}`" @click="selectBoard(board)">
              <span>{{ board.title }}</span>
              <i class="fa fa-star favorite-icon" :class="{ favorite: board.favorite }" @click.stop="toggleFavorite(board._id)"></i>
              <button @click.stop="removeSharedBoard(board._id)">Remover Compartilhamento</button>
            </li>
          </ul>
          <h2>Quadros Compartilhados Comigo</h2>
          <ul id="boards-shared-with-me-list">
            <li v-for="board in boardsSharedWithMe" :key="board._id" :id="`board-${board._id}`" @click="selectBoard(board)">
              <span>{{ board.title }}</span>
              <i class="fa fa-star favorite-icon" :class="{ favorite: board.sharedWith && board.sharedWith.some(sw => sw.user === user._id && sw.favorite) }" @click.stop="toggleFavorite(board._id)"></i>
              <i class="fa fa-share-alt shared-icon"></i> <!-- Ícone de compartilhamento -->
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
                @change="updateBoardTitle(currentBoard._id, currentBoard.title)"
                :disabled="currentPermission === 'view' && !isOwner"
              />

              <!-- Escolha de Cores -->
              <div class="color-selectors">
                <label>
                  Cor de Fundo:
                  <input 
                    type="color" 
                    v-model="currentBoard.backgroundColor" 
                    @change="updateBoardColors(currentBoard)"
                    :disabled="currentPermission === 'view' && !isOwner"
                  />
                </label>
                <label>
                  Cor do Texto:
                  <input 
                    type="color" 
                    v-model="currentBoard.textColor" 
                    @change="updateBoardColors(currentBoard)"
                    :disabled="currentPermission === 'view' && !isOwner"
                  />
                </label>
              </div>
              <div class="board-buttons">
                <button @click="addList" class="add-list" :disabled="currentPermission === 'view' && !isOwner">Adicionar Lista</button>
                <button @click="deleteBoard(currentBoard._id)" class="delete-board" :disabled="currentPermission === 'view' && !isOwner">Remover Quadro</button>
              </div>
              <div class="lists-container" @dragover.prevent="handleDragOverContainer" @drop="handleDrop">
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
                    :isEditable="currentPermission === 'edit' && !isOwner"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <ShareBoardModal v-if="showShareBoardModal" :show="showShareBoardModal" :boardId="currentBoard._id" @close="toggleShareBoard" @shared="handleBoardShared" />
    </main>
  </div>
</template>













<script>
import ListComponent from '../components/ListComponent.vue';
import ShareBoardModal from '@/components/ShareBoardModal.vue';
import axios from 'axios';

export default {
  data() {
    return {
      showShareBoardModal: false,
      showBoardsMenu: false,
      newBoard: { title: '' },
      boards: [],
      currentBoard: null,
      currentPermission: null,
      isOwner: false,
      authToken: localStorage.getItem('authToken'), // Certifique-se de que o token está sendo obtido corretamente
      isScrolled: false,
      draggedListIndex: null,
      dragOverIndex: null,
      boardsSharedWithMeData: [],
      user: null // Inicializar como null
    };
  },

  components: {
    ListComponent,
    ShareBoardModal,
  },

  computed: {
    favoriteBoards() {
      const sharedFavorites = this.boardsSharedWithMeData.filter(board =>
        board.sharedWith.some(sw => sw.user === this.user._id && sw.favorite)
      );
      return this.boards.filter(board => board.favorite).concat(sharedFavorites);
    },
    sharedBoards() {
      return this.boards.filter(board => board.sharedWith && board.sharedWith.length > 0);
    },
    boardsSharedWithMe() {
      return this.boardsSharedWithMeData; // Assumindo que você irá buscar esses dados do backend
    }
  },

  created() {
    this.user = this.$store.getters.getUser;
    console.log("Usuário carregado no created:", this.user);
    if (!this.user) {
      console.error('Usuário não carregado corretamente no created:', this.user);
      this.$router.push('/login');
    } else {
      this.fetchBoards();
      this.fetchBoardsSharedWithMe();
    }
    window.addEventListener('scroll', this.handleScroll);
    
  },

  methods: {
    async mounted() {
      await this.fetchBoards();
      await this.fetchBoardsSharedWithMe();
    },
  
    async fetchBoardsSharedWithMe() {
      try {
        const response = await axios.get('/api/boards/shared-with-me', {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        this.boardsSharedWithMeData = response.data;
      } catch (error) {
        console.error('Erro ao buscar quadros compartilhados com você:', error);
      }
    },

    async removeSharedBoard(boardId) {
      try {
        await axios.put(`/api/boards/${boardId}/remove-share`, {}, {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        // Atualize a lista de quadros
        this.fetchBoards();
      } catch (error) {
        console.error('Erro ao remover compartilhamento do quadro:', error);
      }
    },

    toggleShareBoard() {
      this.showShareBoardModal = !this.showShareBoardModal;
    },

    handleBoardShared(sharedData) {
      console.log('Quadro compartilhado com sucesso:', sharedData);
      this.showShareBoardModal = false;
    },

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

         // Restaurar o quadro atual a partir do armazenamento local
         const savedBoardId = localStorage.getItem('currentBoardId');
        if (savedBoardId) {
          const savedBoard = this.boards.find(board => board._id === savedBoardId);
          if (savedBoard) {
            this.selectBoard(savedBoard);
          } else {
            this.restoreCurrentBoard(savedBoardId);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar quadros:', error);
      }
    },

    async restoreCurrentBoard(boardId) {
      try {
        const response = await axios.get(`/api/boards/${boardId}`, {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        const board = response.data;
        if (board) {
          this.selectBoard(board);
        }
      } catch (error) {
        console.error('Erro ao restaurar quadro atual:', error);
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
      if (!board || typeof board !== 'object' || !board._id) {
        console.error('Quadro inválido:', board);
        return;
      }

      this.currentBoard = board;
      localStorage.setItem('currentBoardId', board._id);
      this.showBoardsMenu = false;

      // Atualização da verificação do estado do usuário
      if (!this.user || !this.user._id) {
        console.error('Usuário não carregado corretamente:', this.user);
        this.$router.push('/login'); // Adicionar redirecionamento para login
        return;
      }

      this.isOwner = board.createdBy === this.user._id;

      if (Array.isArray(board.sharedWith)) {
        const sharedWithUser = board.sharedWith.find(sw => sw.user === this.user._id);
        if (sharedWithUser) {
          this.currentPermission = sharedWithUser.mode;
        } else {
          this.currentPermission = 'edit';
        }
      } else {
        this.currentPermission = 'edit';
      }

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
    async updateBoardColors(board) {
  try {
    const token = this.authToken;
    const response = await axios.put(`/api/boards/color/${board._id}`, {
      backgroundColor: board.backgroundColor,
      textColor: board.textColor
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    this.currentBoard.backgroundColor = response.data.backgroundColor;
    this.currentBoard.textColor = response.data.textColor;
    this.$emit('board-updated', this.currentBoard);
  } catch (error) {
    console.error('Erro ao atualizar cores do quadro:', error);
  }
},
async updateBoardTitle(boardId, newTitle) {
  if (!newTitle || typeof newTitle !== 'string' || typeof newTitle.trim !== 'function') {
    console.error('Título inválido:', newTitle);
    return;
  }

  try {
    const token = this.authToken;
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await axios.put(`/api/boards/${boardId}`, { title: newTitle.trim() }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Atualizar o título do quadro no frontend
    const updatedBoard = response.data.board;
    this.currentBoard.title = updatedBoard.title;
    console.log('Título do quadro atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar o título do quadro:', error);
  }
},

    async updateListTitle(listId, title) {
      if (title.trim() === '') {
        alert('O título não pode ser apenas espaços em branco.');
        return;
      }
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
  if (!newContent.trim()) {
    alert('O cartão não pode estar vazio ou conter apenas espaços em branco.');
    return;
  }
  console.log('Método updateCardContent chamado', { cardId, newContent, file });
  try {
    const formData = new FormData();
    formData.append('content', newContent);
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
      targetCard.updatedAt = updatedCard.updatedAt; // Atualiza a data de modificação no front
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
    console.log('Cartão deletado com sucesso');
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
    console.log(`Lista ${listId} movida com sucesso`);
  } catch (error) {
    console.error('Erro ao mover a lista:', error);
  }
}
,
async toggleFavorite(boardId) {
  try {
    const token = this.authToken;
    const response = await axios.put(`/api/boards/${boardId}/favorite`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const updatedBoard = response.data;
    
    // Atualizar a lista de quadros
    const boardIndex = this.boards.findIndex(board => board._id === boardId);
    if (boardIndex !== -1) {
      this.boards[boardIndex].favorite = updatedBoard.favorite;
    }
    
    // Atualizar a lista de quadros compartilhados
    const sharedBoardIndex = this.boardsSharedWithMeData.findIndex(board => board._id === boardId);
    if (sharedBoardIndex !== -1) {
      const sharedUser = this.boardsSharedWithMeData[sharedBoardIndex].sharedWith.find(sw => sw.user === this.user._id);
      if (sharedUser) {
        sharedUser.favorite = updatedBoard.sharedWith.find(sw => sw.user === this.user._id).favorite;
      }
    }
    
    // Atualizar a exibição dos favoritos
    this.$forceUpdate();
    
    console.log('Favorito alternado com sucesso');
  } catch (error) {
    console.error('Erro ao alternar favorito:', error);
  }
}
,

    async handleDragStart(index) {
      this.draggedListIndex = index;
      console.log('Início do arraste:', index);
    },

    async handleDragEnter(index) {
      this.dragOverIndex = index;
      console.log('Entrando em uma área de soltar:', index);
    },

    async handleDragOver(event) {
      event.preventDefault();
      console.log('Arrastando sobre a área de soltar');
    },

    async handleDragLeave(index) {
      console.log('Saindo de uma área de soltar:', index);
    },

    async handleDrop() {
      if (this.draggedListIndex !== null && this.dragOverIndex !== null && this.draggedListIndex !== this.dragOverIndex) {
        const draggedList = this.currentBoard.lists.splice(this.draggedListIndex, 1)[0];
        this.currentBoard.lists.splice(this.dragOverIndex, 0, draggedList);
        console.log('Lista movida:', this.draggedListIndex, 'para', this.dragOverIndex);
        this.draggedListIndex = null;
        this.dragOverIndex = null;
      }
    },
    toggleBoardsMenu() {
      this.showBoardsMenu = !this.showBoardsMenu;
    },


    handleScroll() {
      this.isScrolled = window.scrollY > 0;
      console.log('Scroll detectado:', this.isScrolled);
    },

    logout() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      this.$store.commit('clearUser');
      this.$router.push('/login');
      console.log('Logout realizado com sucesso');
    }
  }
};
</script>



<style scoped src="./DashboardView.css"></style>
