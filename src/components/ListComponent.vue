<template>
  <div
    class="list"
    draggable="true" 
    @dragstart="dragStart"
    @dragend="dragEnd"
    @dragover.prevent
    @drop="drop"
  >
    <input type="text" v-model="localList.title" class="list-title" :style="{ color: textColor }" @change="updateListTitle">
    <div class="list-buttons">
      <button @click="addCard" class="add-card">Adicionar Cartão</button>
      <button @click="deleteList" class="delete-list">Remover Lista</button>
    </div>
    <div
      v-for="(card, index) in localList.cards"
      :key="card._id"
      @dragover.prevent
      @dragenter="dragEnter(index)"
      @dragleave="dragLeave"
      @drop="dropOnCard(index)"
    >
      <CardComponent :card="card" :textColor="textColor" @update-card-content="updateCardContent" @delete-card="deleteCard" />
    </div>
  </div>
</template>

<script>
import CardComponent from './CardComponent.vue';

export default {
  props: ['list', 'textColor'],
  components: {
    CardComponent
  },
  emits: ['move-card', 'move-list', 'update-list-title', 'add-card', 'delete-list', 'delete-card', 'update-card-content', 'drag-end'],
  data() {
    return {
      localList: JSON.parse(JSON.stringify(this.list)),
      draggedOverCardIndex: null
    };
  },
  watch: {
    list: {
      handler(newList) {
        if (JSON.stringify(newList) !== JSON.stringify(this.localList)) {
          this.localList = JSON.parse(JSON.stringify(newList));
        }
      },
      deep: true
    }
  },
  methods: {
    dragStart(event) {
      event.dataTransfer.setData('listId', this.localList._id);
      event.dataTransfer.effectAllowed = 'move';
    },
    dragEnd() {
      this.$emit('drag-end');
    },
    dragEnter(index) {
      this.draggedOverCardIndex = index;
    },
    dragLeave() {
      this.draggedOverCardIndex = null;
    },
    drop(event) {
      const cardId = event.dataTransfer.getData('cardId');
      const fromListId = event.dataTransfer.getData('fromListId');
      const listId = event.dataTransfer.getData('listId');
      if (cardId) {
        this.$emit('move-card', cardId, this.localList._id, fromListId, this.draggedOverCardIndex);
      } else if (listId && listId !== this.localList._id) {
        this.$emit('move-list', listId, this.localList._id);
      }
      this.draggedOverCardIndex = null;
    },
    dropOnCard(index) {
      const cardId = event.dataTransfer.getData('cardId');
      const fromListId = event.dataTransfer.getData('fromListId');
      if (cardId) {
        this.$emit('move-card', cardId, this.localList._id, fromListId, index);
      }
      this.draggedOverCardIndex = null;
    },
    updateListTitle() {
      this.$emit('update-list-title', this.localList._id, this.localList.title);
    },
    addCard() {
      this.$emit('add-card', this.localList._id);
    },
    deleteList() {
      this.$emit('delete-list', this.localList._id);
    },
    deleteCard(cardId) {
      this.$emit('delete-card', cardId);
    },
    updateCardContent(cardId, newContent, file) {
      this.$emit('update-card-content', cardId, newContent, file);
    }
  }
};
</script>

<style scoped>
.list {
  background-color: #dfe1e6;
  padding: 10px;
  border-radius: 5px;
  width: 250px;
  box-sizing: border-box;
  position: relative;
}

.list-title {
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 3px;
  box-sizing: border-box;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.list-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.add-list, .add-card, .delete-list {
  background-color: #5aac44;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  margin: 5px 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-list:hover, .add-card:hover, .delete-list:hover {
  background-color: #519839;
}
</style>
