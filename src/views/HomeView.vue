<template>
  <div class="home-container">
    <header>
      <h1>Trellio</h1>
      <p>Bem-vindo ao Trellio, a sua ferramenta definitiva para organização e produtividade!</p>
    </header>
    <section class="features">
      <h2>Funcionalidades</h2>
      <ul>
        <li>Crie quadros para organizar seus projetos</li>
        <li>Adicione listas dentro dos quadros para categorização</li>
        <li>Insira cartões em cada lista com tarefas detalhadas</li>
        <li>Colabore com sua equipe e gerencie o progresso em tempo real</li>
      </ul>
    </section>
    <section class="goal">
      <h2>Objetivo</h2>
      <p>Nosso objetivo é tornar a gestão de projetos simples e eficiente, permitindo que você e sua equipe mantenham o foco nas tarefas mais importantes. Acesse suas tarefas de qualquer lugar e nunca perca um prazo.</p>
    </section>
    <section class="cta-section">
      <router-link to="/register" class="btn">Crie uma Conta</router-link>
      <router-link to="/login" class="btn">Faça Login</router-link>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
};
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: left;
  animation: fadeIn 0.5s ease-in-out;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

header h1 {
  font-size: 2.5em;
  color: #026aa7;
  margin-bottom: 10px;
}

header p {
  font-size: 1.2em;
  color: #333;
}

section {
  margin-bottom: 30px;
}

h2 {
  font-size: 1.8em;
  color: #026aa7;
  margin-bottom: 15px;
}

ul {
  list-style: none;
  padding: 0;
}

ul li {
  background-color: #f4f5f7;
  margin-bottom: 10px;
  padding: 10px;
  border-left: 5px solid #026aa7;
}

p {
  font-size: 1em;
  color: #333;
}

.cta-section {
  text-align: center;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  margin: 10px;
  background-color: #026aa7;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;
}

.btn:hover {
  background-color: #005a8c;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
