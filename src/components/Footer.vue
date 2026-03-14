<template>
  <footer class="footer-section py-5 bg-white border-top">
    <div class="container text-center">
      
      <div class="footer-logo d-flex align-items-center justify-content-center mb-3">
        <img :src="sunsafetyLogo3" alt="SunSafety logo" class="footer-logo-image me-2" />
        <span class="footer-logo-text">SunSafety</span>
      </div>

      <p class="footer-secondary-text mb-4">
        © 2026 SunSafety Australia. Stay safe in the sun.
      </p>

      <div class="footer-links d-flex justify-content-center gap-4">
        <span class="footer-link-item">Privacy Policy</span>
        <span class="footer-link-item">Terms of Use</span>
        <span class="footer-link-item">Contact Us</span>
      </div>
      
    </div>
  </footer>
</template>

<script>
import sunsafetyLogo3 from '../assets/sunsafetylogo3.png';

export default {
  name: 'FooterComponent',
  data() {
    return {
      sunsafetyLogo3
    };
  }
}
</script>

<style scoped>
/* Theme Orange for the logo and icon */
.footer-logo-text {
  font-weight: 700;
  font-size: 1.5rem;
  color: #ff8001;
}

.footer-logo-image {
  width: 34px;
  height: 34px;
  object-fit: contain;
  display: block;
}

/* Navigation Button Color for secondary text */
.footer-secondary-text {
  color: #505e70;
  font-size: 0.95rem;
  opacity: 0.8;
}

/* Styling for the non-functional link buttons */
.footer-link-item {
  color: #505e70;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: default;
  transition: color 0.2s ease;
}

/* Subtle hover effect for visual consistency */
.footer-link-item:hover {
  color: #ff8001;
}

/* Mobile adjustments for link spacing */
@media (max-width: 576px) {
  .footer-links {
    flex-direction: column;
    gap: 1rem !important;
  }
}
</style>
