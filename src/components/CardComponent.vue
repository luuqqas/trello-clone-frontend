<template>
  <div
  class="card"
    draggable="true"
    @dragstart="dragStart"
    @dragend="dragEnd"
  >
    <h4>{{ card.title }}</h4>
    <p>{{ card.description }}</p>
  </div>
</template>

<script>
export default {
  props: ['card'],
  name: 'CardComponent',
  methods: {
    dragStart(event) {
      event.dataTransfer.setData('cardId', this.card._id);
    },
    dragEnd() {
    },
  },
};
</script>


<style scoped>
h4 {
  color: #999;
  font-family: Arial, sans-serif;
}

p {
  color: #aaa;
  font-family: Arial, sans-serif;
}
</style>
