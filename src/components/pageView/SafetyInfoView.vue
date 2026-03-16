<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import SkinTypeTable from '../SkinTypeTable.vue';
import SkinCancerMap from '../SkinCancerMap.vue';
import SkinCanerSex from '../SkinCanerSex.vue';
import SkinCancerAge from '../SkinCancerAge.vue';
import SkinCancerKPI from '../SkinCancerKPI.vue';

// Index for carousel slides
const plotIdx = ref(0)

// List of slides for the chart carousel
const slides = [
  {
    key: 'map',
    title: 'Skin Cancer Cases by State/Territory Over Time',
    insight: 'Cases cluster in the most populated states and rise over time.',
    component: SkinCancerMap,
  },
  {
    key: 'sex',
    title: 'Skin cancer cases for males and females over the years',
    insight: 'Male cases remain higher than female cases across most years.',
    component: SkinCanerSex,
  },
  {
    key: 'age',
    title: 'Total skin cancer cases by age group',
    insight: 'Most cases occur in older age groups, reflecting cumulative UV exposure.',
    component: SkinCancerAge,
  },
]

// Gets the current slide
const activeSlide = computed(() => slides[plotIdx.value] ?? slides[0])

// Goes to next chart
async function nextPlot() {
  plotIdx.value = (plotIdx.value + 1) % slides.length
  await nextTick()
  window.dispatchEvent(new Event('resize'))
}

// Goes to previous chart
async function prevPlot() {
  plotIdx.value = (plotIdx.value - 1 + slides.length) % slides.length
  await nextTick()
  window.dispatchEvent(new Event('resize'))
}

// List of fun facts with text and info
const funFacts = [
  {
    title: 'Did you know Australia is almost the “skin cancer capital” of the world?',
    body: 'Australia has one of the highest skin cancer rates in the world. Studies show that about two in three Australians will be diagnosed with some form of skin cancer during their lifetime.',
    sourceLabel: 'Cancer Council Australia — Sun safety',
    sourceUrl: 'https://www.cancer.org.au/cancer-information/causes-and-prevention/sun-safety',
    imageUrl: '/media/funfacts/australia-map.svg'
  },
  {
    title: 'Don’t forget to give your skin a little layer of protection!',
    body: 'When the UV Index reaches 3 or higher, UV radiation is strong enough to damage your skin, and unprotected skin can start being damaged in as little as 15 minutes.',
    sourceLabel: 'Cancer Council Australia — UV Index',
    sourceUrl: 'https://www.cancer.org.au/cancer-information/causes-and-prevention/sun-safety/uv-index',
    imageUrl: '/media/funfacts/uv-gauge.svg'
  },
  {
    title: 'Cloudy day? You still need sunscreen!',
    body: 'Around 80% of UV rays can still pass through clouds, meaning you can still get sunburnt on cloudy days.',
    sourceLabel: 'Dr Gurgen — Cloudy day UV',
    sourceUrl: 'https://drgurgen.com/are-the-suns-uv-rays-really-stronger-on-cloudy-days-fact-or-myth/',
    imageUrl: '/media/funfacts/cloud-uv.svg'
  },
  {
    title: 'Preventing skin cancer starts with sun protection',
    body: 'Over 95% of skin cancers are related to UV exposure, which means many cases could actually be prevented with proper sun protection.',
    sourceLabel: 'Cancer Council Australia — Skin cancer',
    sourceUrl: 'https://www.cancer.org.au/cancer-information/types-of-cancer/skin-cancer',
    imageUrl: '/media/funfacts/shield-sun.svg'
  },
  {
    title: 'Wear sunscreen — or skin cancer might find you',
    body: 'Melanoma is the most dangerous type of skin cancer. In Australia, around 30 people are diagnosed with melanoma every day.',
    sourceLabel: 'Healthdirect — Skin cancer and melanomas',
    sourceUrl: 'https://www.healthdirect.gov.au/skin-cancer-and-melanomas',
    imageUrl: '/media/funfacts/healthcare-cross.svg'
  },
  {
    title: 'Give doctors a break!',
    body: 'More than one million skin cancer treatments are carried out in Australia every year, making it one of the most common health issues in the country.',
    sourceLabel: 'Cancer Council NSW — About skin cancer',
    sourceUrl: 'https://www.cancercouncil.com.au/skin-cancer/about-skin-cancer/',
    imageUrl: '/media/funfacts/healthcare-cross.svg'
  },
  {
    title: 'A sunburn in childhood may come back later',
    body: 'Severe sunburn during childhood can significantly increase the risk of melanoma later in life. Even one blistering sunburn can raise the risk.',
    sourceLabel: 'Melanoma Focus — Childhood sunburn risk',
    sourceUrl: 'https://melanomafocus.org/news-blog/childhood-sunburns-are-raising-the-risk-of-melanoma-skin-cancer/',
    imageUrl: '/media/funfacts/shield-sun.svg'
  },
  {
    title: 'Australia’s UV levels are among the highest in the world',
    body: 'Because of its geographic location and clear skies, Australia often experiences some of the highest UV levels in the world.',
    sourceLabel: 'Australian Government Directory — ARPANSA',
    sourceUrl:
      'https://www.directory.gov.au/portfolios/health-and-aged-care/australian-radiation-protection-and-nuclear-safety-agency',
    imageUrl: '/media/funfacts/uv-gauge.svg'
  },
  {
    title: 'Men are actually more likely to get skin cancer than women',
    body: 'In Australia, about one in three women will develop skin cancer in their lifetime. For men, the risk is even higher — about two in three.',
    sourceLabel: 'Cancer Council Australia — About us',
    sourceUrl: 'https://www.cancer.org.au/about-us/about-cancer-council/australia',
    imageUrl: '/media/funfacts/australia-map.svg'
  },
  {
    title: 'The beach can make the sun even stronger',
    body: 'Sand can reflect about 15–18% of UV radiation, which makes it easier to get sunburnt.',
    sourceLabel: 'Cancer Council NSW — UV radiation factors',
    sourceUrl:
      'https://www.cancercouncil.com.au/cancer-prevention/sun-protection/understanding-uv-radiation/factors-that-affect-uv-radiation-levels/',
    imageUrl: '/media/funfacts/beach-reflection.svg'
  }
]

// Shuffles the list randomly
function shuffleInPlace(items) {
  for (let idx = items.length - 1; idx > 0; idx -= 1) {
    const swapIdx = Math.floor(Math.random() * (idx + 1))
    ;[items[idx], items[swapIdx]] = [items[swapIdx], items[idx]]
  }
  return items
}

// Facts shown on screen
const shownFacts = ref([])

// Tracks open fact card
const openIdx = ref(null)

// Opens or closes fact card
function toggleCard(idx) {
  openIdx.value = openIdx.value === idx ? null : idx
}

// Sets up facts when page loads
onMounted(() => {
  const shuffled = shuffleInPlace([...funFacts])
  shownFacts.value = shuffled.slice(0, 4)
})
</script>

<template>
  <!-- Section with stats and charts -->
  <section class="container py-5">
    <h2 class="didyouknow-title">Do You Know?</h2>
    <SkinCancerKPI />
    <!-- Chart slider with buttons -->
    <div class="mt-4 plot-carousel" aria-label="Skin cancer charts carousel">
      <button type="button" class="carousel-btn carousel-btn-left" aria-label="Previous chart" @click="prevPlot">
        <i class="bi bi-chevron-left" aria-hidden="true"></i>
      </button>

      <button type="button" class="carousel-btn carousel-btn-right" aria-label="Next chart" @click="nextPlot">
        <i class="bi bi-chevron-right" aria-hidden="true"></i>
      </button>

      <!-- Shows current chart -->
      <div class="plot-carousel-slide" :key="activeSlide.key">
        <div class="chart-section">
          <div class="chart-heading">{{ activeSlide.title }}</div>
          <div class="row g-4 align-items-stretch">
            <div class="col-12 col-lg-8">
              <div class="plot-frame">
                <component :is="activeSlide.component" :key="activeSlide.key" />
              </div>
            </div>
            <div class="col-12 col-lg-4">
              <div class="insight-card">
                <div class="insight-title">{{ activeSlide.insight }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="mt-4">
      <SkinTypeTable />
    </div> -->
    <!-- Links to data sources -->
    <div class="mt-3 text-center">
      <small class="text-muted citation-text">
        Data sources: 
        <a href="https://www.aihw.gov.au/reports/cancer/cancer-data-in-australia/data?&page=2" target="_blank" rel="noopener noreferrer">Australian Institute of Health and Welfare</a> and 
        <a href="https://www.canceraustralia.gov.au/cancer-types/melanoma-skin/melanoma-skin-statistics?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer">Cancer Australia</a>
      </small>
    </div>
  </section>
  <!-- Clickable facts section -->
  <section class="container py-5">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div class="w-100">
        <h1 class="didyouknow-title">Tap to Explore More</h1>
      </div>
    </div>

    <!-- Grid of facts that expand -->
    <div class="facts-grid row g-4">
      <div v-for="(fact, idx) in shownFacts" :key="fact.title" class="col-12 col-md-6">
        <button
          type="button"
          class="fact-card"
          :class="{ open: openIdx === idx }"
          :style="{ '--fact-bg': `url(${fact.imageUrl})` }"
          :aria-expanded="openIdx === idx"
          :aria-controls="`factDetails-${idx}`"
          @click="toggleCard(idx)"
        >
          <div class="fact-card-overlay" aria-hidden="true"></div>

          <div class="fact-card-content">
            <div class="d-flex align-items-center justify-content-between gap-3">
              <span class="fact-chip">
                <i class="bi bi-lightbulb-fill me-2" aria-hidden="true"></i>
                Fun fact
              </span>
              <span class="fact-tap">
                <i class="bi bi-hand-index-thumb me-1" aria-hidden="true"></i>
                Tap
              </span>
            </div>

            <h2 class="fact-card-title mt-3 mb-0">
              {{ fact.title }}
            </h2>

            <div :id="`factDetails-${idx}`" class="fact-reveal mt-3">
              <p class="mb-3 fact-body">{{ fact.body }}</p>
              <div class="d-flex flex-wrap align-items-center gap-2">
                <span class="badge rounded-pill text-bg-light fact-badge">
                  <i class="bi bi-link-45deg me-1" aria-hidden="true"></i>
                  Source
                </span>
                <a
                  class="fact-source"
                  :href="fact.sourceUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.stop
                >
                  {{ fact.sourceLabel }}
                </a>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<!-- Styles for slider, cards, and layout -->
<style scoped>
.plot-carousel {
  position: relative;
  padding: 0 0.75rem;
}

.didyouknow-title {
  text-align: center;
  font-weight: 700;
  letter-spacing: -0.03em;
  font-size: clamp(2.2rem, 4.6vw, 3.6rem);
  line-height: 1.02;
  margin: 1.5rem auto 2.75rem;
  padding: 0.5rem 0;
  color: #2b2f36;
  text-shadow: 0 18px 42px rgba(0, 0, 0, 0.12);
}

.plot-carousel-slide {
  position: relative;
}

.chart-section {
  padding: 0.25rem 0.25rem 0.75rem;
}

.chart-heading {
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  margin: 0.25rem 0.5rem 0.85rem;
  line-height: 1.2;
  color: rgba(0, 0, 0, 0.86);
}

.plot-frame {
  width: 100%;
}

.plot-frame :deep(h2.h5) {
  display: none;
}

.plot-frame :deep(.plot-shell) {
  width: 100%;
  max-width: clamp(320px, 42vw, 520px);
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 992px) {
  .plot-frame :deep(.plot-shell) {
    max-width: clamp(420px, 52vw, 720px);
  }
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  display: grid;
  place-items: center;
  color: rgba(0, 0, 0, 0.75);
  transition: transform 180ms ease, filter 180ms ease;
}

.carousel-btn:hover {
  transform: translateY(-50%) scale(1.04);
  filter: brightness(1.02);
}

.carousel-btn:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 0.3rem rgba(255, 128, 1, 0.28),
    0 12px 28px rgba(0, 0, 0, 0.18);
}

.carousel-btn-left {
  left: -6px;
}

.carousel-btn-right {
  right: -6px;
}

.insight-card {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 0.75rem 0.5rem;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: left;
}

.insight-title {
  font-size: clamp(1.6rem, 2.4vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.01em;
  width: 100%;
  background: linear-gradient(90deg, #ff6a00 0%, #ff8001 45%, #ffb156 100%);
  color: #ff8001;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow:
    0 18px 36px rgba(0, 0, 0, 0.16),
    0 6px 14px rgba(0, 0, 0, 0.10);
  margin: 0;
  max-width: 24ch;
}

.fact-card {
  width: 100%;
  text-align: left;
  border: 0;
  padding: 0;
  border-radius: 22px;
  overflow: hidden;
  position: relative;
  background:
    var(--fact-bg) center / cover no-repeat,
    radial-gradient(900px 500px at 20% 20%, rgba(255, 210, 120, 0.55) 0%, rgba(0, 0, 0, 0) 60%),
    linear-gradient(135deg, #0b4aa2 0%, #ff8001 120%);
  color: #ffffff;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.22);
  transition: transform 180ms ease, box-shadow 220ms ease, filter 220ms ease;
  isolation: isolate;
}

.fact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 56px rgba(0, 0, 0, 0.28);
  filter: saturate(1.05);
}

.fact-card:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 0.3rem rgba(255, 128, 1, 0.35),
    0 18px 56px rgba(0, 0, 0, 0.28);
}

.fact-card-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(1200px 600px at 15% 15%, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.05) 55%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.65) 100%);
  z-index: -1;
}

.fact-card-content {
  padding: 1.25rem 1.25rem 1.1rem;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.fact-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  font-weight: 800;
  letter-spacing: -0.01em;
  backdrop-filter: blur(10px);
}

.fact-tap {
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  backdrop-filter: blur(10px);
}

.fact-card-title {
  font-weight: 900;
  letter-spacing: -0.02em;
  font-size: clamp(1.1rem, 1.8vw, 1.45rem);
  line-height: 1.15;
  text-wrap: balance;
}

.fact-reveal {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 260ms ease, opacity 220ms ease;
}

.fact-card.open .fact-reveal {
  max-height: 260px;
  opacity: 1;
}

.fact-body {
  color: rgba(255, 255, 255, 0.92);
}

.fact-badge {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.fact-source {
  color: #ffffff;
  text-decoration: none;
  font-weight: 800;
}

.fact-source:hover {
  text-decoration: underline;
}

.citation-text {
  font-size: 0.75rem;
  line-height: 1.4;
}

.citation-text a {
  color: #6c757d;
  text-decoration: underline;
}

.citation-text a:hover {
  color: #495057;
}

@media (prefers-reduced-motion: reduce) {
  .fact-card,
  .fact-reveal {
    transition: none;
  }
  .fact-card:hover {
    transform: none;
  }
}
</style>
