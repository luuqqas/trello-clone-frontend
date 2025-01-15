<template>
  <div>
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
    CardComponent
  }
};
</script>

<style scoped>
h3 {
  color: #777;
  font-family: Arial, sans-serif;
}
</style>
