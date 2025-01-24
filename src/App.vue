<template>
  <div id="app">
    <NavBar />
    <router-view />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';

export default {
  name: 'App',
  components: {
    NavBar
  }
};
</script>

<style>
body {
  font-family: 'Open Sans', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f5f7;
}

#app {
  text-align: center;
}
</style>
