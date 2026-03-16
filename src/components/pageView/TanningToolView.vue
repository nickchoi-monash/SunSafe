<script setup>
import IconUVDetector from '../icons/IconUVDetector.vue';
</script>

<template>
  <!-- Video background for the page -->
  <div class="video-background">
    <video autoplay muted loop playsinline preload="metadata">
      <source src="/media/beach.mp4" type="video/mp4">
    </video>
  </div>
  <!-- UV detector tool board in center -->
  <div class="uv-detector-wrapper">
    <IconUVDetector />
  </div>
</template>

<!-- Styles for video and icon layout -->
<style scoped>
.uv-detector-wrapper {
  padding: clamp(1rem, 3vw, 2rem);
  display: flex;
  justify-content: center;
  width: 100%;
}
.video-background{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  z-index:-1;
  overflow:hidden;
}

.video-background video{
  width:100%;
  height:100%;
  object-fit:cover;
}

.video-background::after{
  content:"";
  position:absolute;
  inset:0;
  background:rgba(0,0,0,0.1);
}
</style>
