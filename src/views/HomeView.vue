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

<style scoped src="./HomeView.css"></style>
