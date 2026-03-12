<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
</script>

<template>
  <div class="app-container">
    <Header />

    <main class="content-area">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<style>
/* Global styles for the app. Using Warm Grey for the entire site background. */
body {
  background-color: #f8f7f5;
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-area {
  /* Pushes the footer down */
  flex: 1; 
}
</style>