<template>
  <div id="app">
    <nav>
      <div class="logo">
        <h1>Trellio</h1>
      </div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Registro</router-link>
        <router-link to="/dashboard">Dashboard</router-link>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
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

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #026aa7;
  padding: 10px 20px;
}

.logo h1 {
  color: #fff;
  font-size: 1.5em;
  margin: 0;
}

.nav-links a {
  margin: 0 15px;
  text-decoration: none;
  color: #fff;
  font-weight: 600;
  transition: color 0.2s ease-in-out;
}

.nav-links a:hover {
  color: #ffab00;
}

h1 {
  color: #026aa7;
}
</style>
