<template>
  <div>
    <h4>{{ card.title }}</h4>
    <p>{{ card.description }}</p>
  </div>
</template>

<script>
export default {
  props: ['card'],
  name: 'CardComponent'
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
