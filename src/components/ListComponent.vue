<template>
  <div
    @dragover.prevent
    @drop="drop"
  >
    <h3>{{ list.name }}</h3>
    <div v-for="card in list.cards" :key="card._id">
      <CardComponent :card="card" />
    </div>
  </div>
</template>

<script>
import CardComponent from './CardComponent.vue';

export default {
  props: ['list'],
  components: {
    CardComponent,
  },
  methods: {
    dragOver(event) {
      // Permitir que o drop funcione
      event.preventDefault();
    },
    drop(event) {
      const cardId = event.dataTransfer.getData('cardId'); // Recupera o ID do cartão arrastado
      if (cardId) {
        this.$emit('move-card', cardId, this.list._id); // Emite o evento para o pai
      }
    },
  },
};
</script>


<style scoped>
h3 {
  color: #777;
  font-family: Arial, sans-serif;
}
</style>
