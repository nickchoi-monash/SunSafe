import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../components/pageView/HomeView.vue'
import TanningToolView from '../components/pageView/TanningToolView.vue'
import PreventionGuideView from '../components/pageView/PreventionGuideView.vue'
import SafetyInfoView from '../components/pageView/SafetyInfoView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/tanning-tool',
    name: 'tanning-tool',
    component: TanningToolView
  },
  {
    path: '/prevention-guide',
    name: 'prevention-guide',
    component: PreventionGuideView
  },
  {
    path: '/safety-info',
    name: 'safety-info',
    component: SafetyInfoView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env?.BASE_URL || '/'),
  routes
})

export default router