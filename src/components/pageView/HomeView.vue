<script setup>
import { ref } from 'vue';
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'

const showHeroVideo = ref(true);
const handleHeroVideoError = () => {
  showHeroVideo.value = false;
};
</script>

<template>
  <section class="hero">
    <div class="hero-media" aria-hidden="true">
      <video-player v-if="showHeroVideo"
        src="https://sun-safety-media.s3.ap-southeast-2.amazonaws.com/womenapplyingsunscreen.mp4"
        poster="/media/hero-poster.png" controls :loop="true" :volume="0" :muted="true" :autoplay="true"
        :playsinline="true" class="hero-video" />
      <img v-else class="hero-poster" src="/media/hero-poster.png" alt="" loading="eager" decoding="async" />
      <div class="hero-scrim"></div>
    </div>

    <div class="container hero-content py-5">
      <p class="hero-eyebrow mb-2">SunSafety for teens</p>
      <h1 class="hero-title mb-3">Tan smarter. Protect your skin.</h1>
      <p class="hero-subtitle mb-4">
        Track the UV level near you, set a tanning timer, and get quick tips to stay safe while still enjoying the
        beach.
      </p>

      <div class="d-flex flex-column flex-sm-row gap-3">
        <router-link to="/tanning-tool" class="btn btn-lg hero-cta hero-cta-primary">
          <span class="hero-cta-label">Open Tanning Tool</span>
        </router-link>
        <router-link to="/safety-info" class="btn btn-lg hero-cta hero-cta-secondary">
          <span class="hero-cta-label">Safety Info</span>
        </router-link>
      </div>

      <div class="d-flex flex-wrap gap-2 mt-4">
        <span class="badge rounded-pill hero-pill">
          <i class="bi bi-geo-alt me-1"></i>
          Location UV
        </span>
        <span class="badge rounded-pill hero-pill">
          <i class="bi bi-stopwatch me-1"></i>
          Tanning timer
        </span>
        <span class="badge rounded-pill hero-pill">
          <i class="bi bi-shield-check me-1"></i>
          Safety tips
        </span>
      </div>
    </div>
  </section>

  <section class="container py-5">
    <div class="row g-4">
      <div class="col-12 col-lg-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="feature-icon mb-3">
              <i class="bi bi-brightness-high"></i>
            </div>
            <h2 class="h5 mb-2">Understand UV</h2>
            <p class="text-muted mb-0">
              UV can be high even when it’s cloudy. Check your local level and make better choices outdoors.
            </p>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="feature-icon mb-3">
              <i class="bi bi-sunrise"></i>
            </div>
            <h2 class="h5 mb-2">Plan your tan</h2>
            <p class="text-muted mb-0">
              Use a timer so you don’t lose track of time. Aim for safer exposure, not “as long as possible.”
            </p>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="feature-icon mb-3">
              <i class="bi bi-heart-pulse"></i>
            </div>
            <h2 class="h5 mb-2">Protect your future</h2>
            <p class="text-muted mb-0">
              Sunburn adds up. Small habits today can help reduce long‑term damage to your skin.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

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
  object-fit: cover;
  filter: saturate(1.15) contrast(1.05);
  transform: scale(1.02);
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
    linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.55) 35%, rgba(0, 0, 0, 0.72) 100%);
}

.hero-content {
  color: #ffffff;
  align-self: center;
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
}

.hero-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.65rem 2.35rem;
  border: 0 !important;
  background: transparent !important;
  border-radius: 16px;
  overflow: visible;
  box-shadow: none;
  transition: transform 260ms ease, filter 260ms ease;
}

.hero-cta::before {
  content: "";
  position: absolute;
  inset: -18px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 0;
  pointer-events: none;
  filter: none;
}

.hero-cta-label {
  position: relative;
  z-index: 1;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.hero-cta-primary {
  color: #1c1400;
}

.hero-cta-primary::before {
  background-image: url("../../assets/cream_background1.png");
}

.hero-cta-secondary {
  color: #1c1400 !important;
}

.hero-cta-secondary::before {
  background-image: url("../../assets/cream_background2.png");
}

.hero-cta:hover {
  transform: translateY(-1px);
  filter: brightness(1.02);
}

.hero-cta-secondary:hover {
  color: rgba(255, 255, 255, 0.96) !important;
}

.hero-cta:active {
  transform: translateY(0);
  filter: brightness(0.99);
}

.hero-cta:focus-visible {
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(255, 128, 1, 0.35);
}

.hero-pill {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.95);
  padding: 0.55rem 0.8rem;
  font-weight: 600;
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
