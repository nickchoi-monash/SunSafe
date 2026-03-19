<script setup>
import { ref } from 'vue';
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'
import SkinCancerKPI from '../SkinCancerKPI.vue';

// Reactive state for controlling hero video display
const showHeroVideo = ref(true);

// Fallback handler for video loading errors
const handleHeroVideoError = () => {
  showHeroVideo.value = false;
};
</script>

<template>
  <!-- Hero section with background media and main content -->
  <section class="hero">
    <!-- Background media container with video or fallback image -->
    <div class="hero-media" aria-hidden="true">
      <video-player v-if="showHeroVideo"
        src="/media/bgv2.mp4"
        poster="/media/hero-poster.png"
        :controls="false"
        :fill="true"
        :loop="true"
        :volume="0"
        :muted="true"
        :autoplay="true"
        :playsinline="true"
        class="hero-video"
        @error="handleHeroVideoError"
      />
      <img v-else class="hero-poster" src="/media/hero-poster.png" alt="" loading="eager" decoding="async" />
      <div class="hero-scrim"></div>
    </div>

    <!-- Main hero content with title, subtitle, and call-to-action buttons -->
    <div class="container hero-content py-5">
      <p class="hero-eyebrow mb-2">SunSafety for teens</p>
      <h1 class="hero-title mb-3">Tan smarter. Protect your skin.</h1>
      <p class="hero-subtitle mb-4">
        Track the UV level near you, set a tanning timer, and get quick tips to stay safe while still enjoying the
        beach.
      </p>

      <!-- Primary navigation buttons -->
      <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <router-link to="/tanning-tool" class="btn btn-lg btn-light fw-bold hero-primary-btn">
          Open Tanning Tool
        </router-link>
        <router-link to="/safety-info" class="btn btn-lg btn-outline-light fw-bold">
          Safety Info
        </router-link>
      </div>

      <!-- Feature highlight badges -->
      <div class="d-flex flex-wrap gap-2 mt-4 justify-content-center">
        <span class="hero-feature">
          <i class="bi bi-geo-alt me-1"></i>
          Location UV
        </span>
        <span class="hero-feature">
          <i class="bi bi-stopwatch me-1"></i>
          Tanning timer
        </span>
        <span class="hero-feature">
          <i class="bi bi-shield-check me-1"></i>
          Safety tips
        </span>
      </div>
    </div>
  </section>

  <!-- Features section showcasing key app capabilities -->
  <section class="container py-5">
    <SkinCancerKPI />
  </section>
</template>

<!-- Styles for hero section layout and visual effects -->
<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: stretch;
  overflow: hidden;
  isolation: isolate;
  background: #0b1320;
}

.hero-media {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: saturate(1.15) contrast(1.05);
  transform: scale(1.02);
}

.hero-video :deep(.video-js),
.hero-video :deep(.v-video-player),
.hero-video :deep(.vjs-tech) {
  width: 100%;
  height: 100%;
}

.hero-video :deep(.vjs-tech) {
  object-fit: cover;
}

.hero-video :deep(.vjs-control-bar),
.hero-video :deep(.vjs-big-play-button) {
  display: none !important;
}

.hero-poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.15) contrast(1.05);
  transform: scale(1.02);
}

.hero-scrim {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1200px 600px at 20% 20%, rgba(255, 200, 120, 0.45) 0%, rgba(0, 0, 0, 0) 60%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.35) 35%, rgba(0, 0, 0, 0.50) 100%);
}

.hero-content {
  color: #ffffff;
  align-self: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-eyebrow {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
}

.hero-title {
  font-weight: 800;
  letter-spacing: -0.02em;
  font-size: clamp(2.2rem, 4.5vw, 3.5rem);
  line-height: 1.05;
  text-wrap: balance;
}

.hero-subtitle {
  max-width: 52ch;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin-left: auto;
  margin-right: auto;
}

.hero-feature {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 400;
}

.hero-primary-btn,
.hero-primary-btn:hover,
.hero-primary-btn:focus,
.hero-primary-btn:active {
  color: #2b2b2b;
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fe850d 0%, #ed6820 100%);
  color: #ffffff;
  font-size: 1.25rem;
}

@media (prefers-reduced-motion: reduce) {
  .hero-video {
    display: none;
  }
}
</style>
