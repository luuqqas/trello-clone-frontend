<template>
  <nav :class="{ scrolled: isScrolled }">
    <div class="logo">
      <h1>Trellio</h1>
    </div>
    <div class="nav-links">
      <router-link to="/">Home</router-link>
      <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
      <router-link v-if="!isLoggedIn" to="/register">Registro</router-link>
      <router-link v-if="isLoggedIn" to="/dashboard">Dashboard</router-link>
      <div v-if="isLoggedIn && $route.name === 'Dashboard'">
        <button @click="$emit('share-board')" class="nav-button">Compartilhar Quadro</button>
        <span v-if="currentPermission && !isOwner" class="permission-indicator">
          Permissão: {{ currentPermission === 'edit' ? 'Editar' : 'Visualizar' }}
        </span>
      </div>
    </div>
  </nav>
</template>

<script>
import './NavBar.css';

export default {
  name: 'NavBar',
  props: {
    isBoardSelected: {
      type: Boolean,
      default: false
    },
    currentPermission: {
      type: String,
      default: null
    },
    isOwner: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isScrolled: false
    };
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    }
  },
  created() {
    window.addEventListener('scroll', this.handleScroll);
  },
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    }
  }
};
</script>


<style scoped src="./NavBar.css"></style>