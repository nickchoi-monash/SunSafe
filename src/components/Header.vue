<template>
  <!-- Navigation bar with logo and menu -->
  <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-3">
    <div class="container">
      
      <!-- Logo -->
      <router-link class="navbar-brand d-flex align-items-center" to="/" @click="closeMobileMenu">
        <div class="logo-icon-box d-flex align-items-center justify-content-center me-2">
          <img :src="sunsafetyLogo3" alt="SunSafety logo" class="logo-image" />
        </div>
        <span class="logo-text">SunSafety</span>
      </router-link>

      <button 
        class="navbar-toggler border-0 shadow-none" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#sunSafetyNavbar"
        aria-controls="sunSafetyNavbar" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navigation Links -->
      <div class="collapse navbar-collapse" id="sunSafetyNavbar">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link custom-nav-link" to="/" exact-active-class="active" @click="closeMobileMenu">
              Home
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link custom-nav-link" to="/tanning-tool" active-class="active" @click="closeMobileMenu">
              Tanning Tool
            </router-link>
          </li>
          <!-- <li class="nav-item">
            <router-link class="nav-link custom-nav-link" to="/prevention-guide" active-class="active">
              Prevention Guide
            </router-link>
          </li> -->
          <li class="nav-item">
            <router-link class="nav-link custom-nav-link" to="/safety-info" active-class="active" @click="closeMobileMenu">
              Safety Info
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
// Import logo image
import sunsafetyLogo3 from '../assets/sunsafetylogo3.png';

export default {
  name: 'HeaderComponent',
  data() {
    return {
      sunsafetyLogo3
    };
  },
  methods: {
    // Closes mobile menu when link clicked
    closeMobileMenu() {
      const collapseEl = this.$el?.querySelector?.('#sunSafetyNavbar');
      if (!collapseEl?.classList?.contains('show')) return;

      const togglerBtn = this.$el?.querySelector?.('.navbar-toggler');
      if (!togglerBtn) return;

      // Use Bootstrap's built-in data-api toggle so we don't accidentally load Bootstrap twice.
      togglerBtn.click();
    }
  }
}
</script>

<!-- Styles for logo and navigation -->
<style scoped>
/* Logo Styling */
.logo-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  overflow: hidden;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.logo-text {
  font-weight: 700;
  font-size: 1.5rem;
  color: #333333;
  letter-spacing: -0.5px;
}

/* Navigation Links Styling */
.custom-nav-link {
  color: #505e70 !important;
  font-weight: 500;
  margin-left: 1.5rem;
  padding-bottom: 4px;
  display: inline-block;
  border-bottom: 2px solid transparent;
  transition: all 0.25s ease-in-out;
}

/* Hover State (Visual feedback but no underline) */
.custom-nav-link:hover {
  color: #ff8001 !important;
}

/* Active State (Orange text + Orange underline) */
.custom-nav-link.active {
  color: #ff8001 !important;
  border-bottom: 2px solid #ff8001;
}

/* Mobile Adjustments */
@media (max-width: 991.98px) {
  .navbar-nav {
    padding: 1rem 0;
  }
  
  .custom-nav-link {
    margin-left: 0;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    /* Keeps underline from stretching full width on mobile */
    display: table; 
  }
}
</style>
