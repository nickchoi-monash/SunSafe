<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
</script>

<template>
  <div class="app-container">
    <Header />

    <main class="content-area">
      <router-view v-slot="{ Component, route }">
        <transition name="route-fade" mode="out-in" :duration="1000">
          <div :key="route.fullPath" class="route-view">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </main>

    <Footer />
  </div>
</template>

<style>
/* Global styles for the app. Using Warm Grey for the entire site background. */
body {
  background:#c0c0c0;
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

.route-view {
  width: 100%;
  display: block;
}

.route-fade-enter-active,
.route-fade-leave-active {
  transition: opacity 1000ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity;
}

.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .route-fade-enter-active,
  .route-fade-leave-active {
    transition: none;
  }
}
</style>
