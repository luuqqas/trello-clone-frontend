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
      </div>
    </nav>
  </template>
  
  <script>
  import './NavBar.css';
  
  export default {
    name: 'NavBar',
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
  