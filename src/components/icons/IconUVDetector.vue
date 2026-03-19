<template>
  <div class="dashboard">
    <div class="dashboard-grid">

      <!-- ROW 1 -->
      <div class="row">
        <!-- LEFT: UV-->
        <div class="left">
          <div class="card uv-card">
            <p class="card-title">Current UV Risk</p>

            <div class="uv-number" :style="{ color: uvColor }">
              {{ uv }}
            </div>

            <div class="uv-level" :style="{ color: uvColor }">
              {{ uvLevel }}
            </div>

            <p class="advice">{{ advice }}</p>
          </div>
        </div>

        <!-- RIGHT: Time to burn -->
        <div class="right">
          <div class="card location-card">
            <p class="card-title">Location</p>
            <div class = "location-wrapper">
              <input
                v-model="searchLocation"
                class="location-input"
                placeholder="Search city or postcode..."
              />

              <div v-if="showSuggestions" class="suggestions">
                <div
                  v-for="item in suggestions"
                  :key="item.place_id"
                  class="suggestion-item"
                  @click="selectLocation(item)"
                >
                  {{ item.display_name || item.name}}
                </div>
              </div>
            </div>

            <div class="location-buttons">
              <button @click="useCurrentLocation">
                Use Current Location
              </button>
            </div>

            <div class="location-result">
              <div class="location-main">
                📍 {{ locationMain }}
              </div>
              <div class="location-sub">
                {{ locationSub }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ROW 2: FULL WIDTH SKIN SELECTOR -->
      <div class="row full">
        <div class="card skin-selector-card">
          <p class="card-title">Select Your Skin Type</p>
          <IconSkinTypeSelector v-model="skinType" />
        </div>
      </div>

      <!-- ROW 3 -->
      <div class="row">
        <!-- LEFT: SKIN INFO -->
        <div class="left">
          <div class="card skin-info-card">
            <h3 class="skin-title">
              {{ selectedSkin.name }}
            </h3>

            <div class="skin-description">
              {{ selectedSkin.description }}
            </div>

            <div class="skin-stats">

              <div class="stat">
                <span class="stat-label">Recommended SPF</span>
                <span class="stat-value">
                  SPF {{ selectedSkin.spf }}
                </span>
              </div>

              <div class="stat">
                <span class="stat-label">MED Range</span>
                <span class="stat-value">
                  {{ selectedSkin.med }} mJ/cm²
                </span>
              </div>

              <div class="stat">
                <span class="stat-label">Cancer Risk</span>

                <div class="risk-indicator">
                  <span
                    v-for="i in 4"
                    :key="i"
                    class="risk-dot"
                    :style="{
                      background:
                        i <= selectedSkin.risk
                          ? selectedSkin.color
                          : 'rgba(255,255,255,0.3)'
                    }"
                  />
                </div>
              </div>

              <div class="burn-text">
                {{ burnMessage }}
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: SPF -->
        <div class="right">
          <div class="card spf-card">
            <p class="card-title">🧴 SPF Reapplication</p>

            <div class="spf-timer">
              {{ formattedTime }}
            </div>

            <div class="spf-progress">
              <div
                class="spf-progress-fill"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>

            <div class="spf-buttons">
              <button class="spf-button" @click="toggleSPF">
                {{ spfRunning ? 'I Just Applied SPF' : 'Start SPF Timer' }}
              </button>

              <button class="spf-reset" @click="resetSPF">
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ROW 4: WEATHER FULL -->
      <div class="row weather-row">
        <div class="card weather-card">
          <p class="card-title">Humidity</p>
          <div class="weather-value">{{ humidity }}%</div>
        </div>

        <div class="card weather-card">
          <p class="card-title">Temp</p>
          <div class="weather-value">{{ temperature }}°C</div>
        </div>

        <div class="card weather-card">
          <p class="card-title">Wind</p>
          <div class="weather-value">{{ windSpeed }} km/h</div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-card">

        <h2 class="modal-title">
          Time to Reapply Sunscreen
        </h2>

        <p class="modal-text">
          Your scheduled reminder time has arrived. Reapply sunscreen now to maintain protection.
        </p>

        <button class="modal-btn" @click="toggleSPF">
          Record Application
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import IconSkinTypeSelector from './IconSkinTypeSelector.vue'
import IconSkinInfo from './IconSkinInfo.vue'

//UV
const uv = ref(0)
const uvLevel = ref('')
const uvColor = ref('#4CAF50')
const advice = ref('')

//UV api security
let cachedUVData = {}
let cacheTime = {}
let lastApiCall = 0

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
const RATE_LIMIT = 5000 // 5 seconds

//Location
const searchLocation = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
const locationMain = ref('')
const locationSub = ref('')

// const burnTime = ref(0)
const locationName = ref('Your Location')

// SkinType
const uvData = ref(null)  
const skinType = ref("st2")
// timer
const burnMessage = computed(() => {
  if (!uv.value || uv.value < 3) {
    return "UV is low — no significant burn risk."
  }
  return `You may start burning in ${burnTime.value} minutes based on current UV and your skin type.`
})
const timer = ref(0)
const isRunning = ref(false)
let interval = null

// Suggestion
const selectedSkin = computed(() => {
  return skinInfo[skinType.value] || skinInfo.st2
})

/*
Skin type information dataset
*/
const skinInfo = {
  st1: {
    name: "Type I (Very Fair)",
    description: "Extremely pale skin that always burns and never tans.",
    spf: "50+",
    risk: 4,
    med: "15-30",
    color: "#ff6b6b"
  },

  st2: {
    name: "Type II (Fair)",
    description: "Fair skin that usually burns and tans minimally.",
    spf: "30-50",
    risk: 3.5,
    med: "25-40",
    color: "#ff9f43"
  },

  st3: {
    name: "Type III (Medium)",
    description: "Beige or olive-toned skin that sometimes burns but tans gradually.",
    spf: "30+",
    risk: 3,
    med: "30-50",
    color: "#feca57"
  },

  st4: {
    name: "Type IV (Olive)",
    description: "Olive skin that rarely burns and tans easily.",
    spf: "30+",
    risk: 2,
    med: "40-60",
    color: "#48dbfb"
  },

  st5: {
    name: "Type V (Brown)",
    description: "Brown skin that very rarely burns and tans deeply.",
    spf: "30+",
    risk: 1,
    med: "60–90",
    color: "#1dd1a1"
  },

  st6: {
    name: "Type VI (Dark)",
    description: "Deeply pigmented skin that almost never burns.",
    spf: "30+",
    risk: 0.5,
    med: "90–150",
    color: "#10ac84"
  }
}

//SPF timer
const spfHours = ref(2)
const spfMinutes = ref(0)
const spfTimer = ref(120*60)
const spfRunning = ref(false)
const showModal = ref(false)

let spfInterval = null

// weather card
const humidity = ref(0)
const temperature = ref(0)
const windSpeed = ref(0)

async function fetchUV(lat, lng) {
  const now = Date.now()
  const key = `${lat},${lng}`

  // Rate limiting
  if (now - lastApiCall < RATE_LIMIT) {
    console.log("API request blocked: too frequent")
    return
  }

  // Cache check
  if (cachedUVData[key] && now - cacheTime[key] < CACHE_DURATION) {
    console.log("Using cached UV data for:", key)

    const result = cachedUVData[key]

    uv.value = Math.round(result.uv)
    uvData.value = result
    setUVLevel(uv.value)
    recommendSPFTime()

    return
  }

  console.log('Fetching UV data...')

  lastApiCall = now

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
    )

    if (!response.ok) {
      console.error("OpenWeather API error:", response.status)
      return
    }

    const data = await response.json()

    console.log('Weather API data:', data)

    const result = {
      uv: data.current?.uvi ?? 0
    }

    // Save cache
    cachedUVData[key] = result
    cacheTime[key] = now

    uv.value = Math.round(result.uv)
    uvData.value = result

    setUVLevel(uv.value)
    recommendSPFTime()

  } catch (error) {
    console.error("Fetch UV failed:", error)
  }
}

let debounceTimer = null

watch(searchLocation, (value) => {
  clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => {
    if (!value || value.length < 3) {
      suggestions.value = []
      showSuggestions.value = false
      return
    }

    try {
      const response = await fetch(
        `https://q6es18n8ul.execute-api.ap-southeast-2.amazonaws.com/search?q=${value}&format=json&limit=5`
        // `/geo/search?q=${value}&format=json&limit=5`
        // `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&limit=5`
      )

      suggestions.value = (await response.json()).map(item => ({
        ...item,
        display_name: item.display_name || item.name
      }))
      .slice(0,5)
      showSuggestions.value = true

    } catch (error) {
      console.error("Suggestion fetch error:", error)
    }

  }, 400)
})

function selectLocation(item) {
  const name = item.display_name || item.name

  if (!item || !name) {
    console.warn("Invalid location item:", item)
    return
  }

  searchLocation.value = item.display_name
  showSuggestions.value = false

  const lat = item.lat
  const lng = item.lon || item.lng

  const formatted = formatLocation(item.display_name)

  locationMain.value = formatted.main
  locationSub.value = formatted.sub

  fetchUV(lat, lng)
  fetchWeather(lat, lng)
}

async function useCurrentLocation() {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude
    const lng = pos.coords.longitude

    fetchUV(lat, lng)
    fetchWeather(lat, lng)
    
    try {
      const res = await fetch(
        `https://q6es18n8ul.execute-api.ap-southeast-2.amazonaws.com/reverse?lat=${lat}&lon=${lng}&format=json`
        // `/geo/reverse?lat=${lat}&lon=${lng}&format=json`
        // `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      const data = await res.json()

      updateLocationNameFromDisplay(data.display_name)
    } catch (err) {
      console.error("Reverse geo failed:", err)
    }
  })
}

function formatLocation(displayName) {
  if (!displayName) {
    return { main: '', sub: '' }
  }

  const parts = displayName.split(',')
  const clean = parts.map(p => p.trim())

  return {
    main: clean[0] || '',
    sub: clean.slice(1, 3).join(', ')
  }
}

function updateLocationNameFromDisplay(displayName) {
  if (!displayName) {
    console.warn("No display_name from API")
    return
  }

  const formatted = formatLocation(displayName)

  locationMain.value = formatted.main
  locationSub.value = formatted.sub
}

const burnTime = computed(() => {
  if (!uv.value || uv.value <= 2) return Infinity

  const factors = {
    st1: 2.5,
    st2: 3,
    st3: 4,
    st4: 5,
    st5: 8,
    st6: 15
  }

  const factor = factors[skinType.value] || 3

  return Math.round((200 * factor) / (3 * uv.value))
})

watch(burnTime, (newTime) => {
  if (!newTime || newTime === Infinity) {
    timer.value = 0
    return
  }

  timer.value = newTime * 60
})

const exposureTime = computed(()=>{
  const min = Math.floor(timer.value / 60)
  const sec = timer.value % 60

  return `${min}:${sec.toString().padStart(2,'0')}`
})

async function fetchWeather(lat, lng) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`
    )

    const data = await response.json()

    console.log("Weather API:", data)

    temperature.value = Math.round(data.main.temp)
    humidity.value = data.main.humidity
    windSpeed.value = Math.round(data.wind.speed * 3.6)
  } catch (error) {
    console.error("Weather API error:", error)
  }
}

function setUVLevel(value) {
  if (value <= 2) {
    uvLevel.value = 'Low'
    advice.value = 'Minimal protection required.'
    uvColor.value = '#4CAF50'
  }

  else if (value <= 5) {
    uvLevel.value = 'Moderate'
    advice.value = 'Wear sunscreen.'
    uvColor.value = '#FFEB3B'
  }

  else if (value <= 7) {
    uvLevel.value = 'High'
    advice.value = 'Seek shade during midday.'
    uvColor.value = '#FF9800'
  }

  else if (value <= 10) {
    uvLevel.value = 'Very High'
    advice.value = 'Protection required. Seek shade.'
    uvColor.value = '#F44336'
  }

  else {
    uvLevel.value = 'Extreme'
    advice.value = 'Avoid sun exposure.'
    uvColor.value = '#9C27B0'
  }
}

onMounted(() => {
  console.log('Component mounted')

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        console.log('User location:', lat, lng)

        fetchUV(lat, lng)
        fetchWeather(lat, lng)
      },
      error => {
        console.error('Location error:', error)

        const lat = -37.81
        const lng = 144.96

        fetchUV(lat, lng)
        fetchWeather(lat, lng)
      }
    )
  } else {
    console.log('Geolocation not supported')
    fetchUV(-37.81, 144.96)
  }
  recommendSPFTime()
  document.addEventListener("click", handleClickOutside)
})

const handleClickOutside = (e) => {
  if (!e.target.closest(".location-wrapper")) {
    showSuggestions.value = false
  }
}

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside)
})

// SPF timer
const spfDuration = computed(() => {
  return (spfHours.value * 60 + spfMinutes.value) * 60
})

const formattedTime = computed(() => {
  const total = spfRunning.value
    ? spfTimer.value      
    : spfDuration.value    

  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
})

const progressPercent = computed(() => {
  if (!spfDuration.value) return 0
  return (spfTimer.value / spfDuration.value) * 100
})

function toggleSPF() {
  clearInterval(spfInterval)

  spfTimer.value = spfDuration.value
  spfRunning.value = true
  showModal.value = false

  spfInterval = setInterval(() => {
    if (spfTimer.value > 0) {
      spfTimer.value--
    } else {
      showModal.value = true
    }
  }, 1000)
}

function resetSPF() {
  clearInterval(spfInterval)
  spfRunning.value = false
  showModal.value = false
  spfTimer.value = spfDuration.value
}

function recommendSPFTime() {
  if (uv.value <= 2) {
    spfHours.value = 0
    spfMinutes.value = 0
    return 
  } else if (uv.value <= 5) {
    spfHours.value = 2
    spfMinutes.value = 0
  } else if (uv.value <= 7) {
    spfHours.value = 1
    spfMinutes.value = 30
  } else {
    spfHours.value = 1
    spfMinutes.value = 0
  }
}

watch(uv, () => {
  recommendSPFTime()
})

</script>

<style scoped>
/* CENTER CONTAINER */
.dashboard {
  width: 100%;
}

.dashboard-grid {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

/* ROW SYSTEM */
.row {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 20px;
  align-items: stretch;
}

.row > div {
  display: flex;
}

.row > div > .card {
  flex: 1;
}

.row.full {
  grid-template-columns: 1fr;
}

/* .row .card {
  flex: 1; 
} */

/* COLUMN */
.left, .right {
  display: flex;
  flex-direction: column;
  gap: 20px;

  min-width: 0;
}

/* CARD BASE */
.card {
  background: rgba(255,255,255,0.25);  
  
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border-radius: 28px;

  border: 1px solid rgba(255,255,255,0.4);

  padding: 25px;

  box-shadow:
    0 8px 30px rgba(0,0,0,0.15);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;     
  text-align: center;    

  transition: all 0.25s ease;
  width: 100%;    
  min-width: 0;   
  word-wrap: break-word;
}

.card:hover {
  transform: translateY(-6px);

  box-shadow:
    0 18px 40px rgba(0,0,0,0.25);
}

/* TITLE */
.card-title {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.6;
  margin-bottom: 10px;
}

/* UV */
.uv-number {
  font-size: 80px;
  font-weight: 700;
  max-width: 100%;       
  word-break: break-all;
}

.uv-level {
  font-size: 24px;
}

.advice {
  margin-top: 10px;
  font-size: 14px;
}

/* BURN */
.burn-text {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.8;
}

/* LOCATION */
.location-card {
  align-items: stretch;
  text-align: left;
}

.location-input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  margin-bottom: 10px;
  min-width: 0;
  box-sizing: border-box;
}

.location-wrapper {
  position: relative;
}

.location-main {
  font-size: 18px;
  font-weight: 600;
}

.location-sub {
  font-size: 13px;
  opacity: 0.7;
  margin-top: 2px;
}

.suggestions {
  position: absolute;
  top: calc(100% - 10px);
  left: 0;
  right: 0;

  background: white;
  border-radius: 12px;
  margin-top: 5px;

  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  z-index: 100;

  max-height: 120px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.suggestions::-webkit-scrollbar {
  width: 6px;
}

.suggestions::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
}

.suggestion-item {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
}

.suggestion-item:hover {
  background: #f5f5f5;
}

.location-buttons {
  display: flex;
  gap: 10px;
}

.location-buttons button {
  min-width: 0;
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: orange;
  color: white;
  cursor: pointer;
}

.location-buttons .secondary {
  background: #ddd;
  color: #333;
}

.location-result {
  margin-top: 10px;
  font-size: 14px;
  opacity: 0.8;

  word-break: break-all;     
  overflow-wrap: anywhere;
}

/* SKIN SELECTOR */
.skin-selector-card {
  align-items: center;
}

/* Suggestion */
.skin-info-card{
  align-items:flex-start;
  text-align:left;
  gap:12px;

  width:100%;
  max-width: 100%;
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.skin-title{
  font-size:18px;
  font-weight:600;

  overflow:hidden;
  text-overflow:ellipsis;
}

.skin-description{
  font-size:14px;
  opacity:0.85;     
  min-width: 0;
  width: 100%;
}

.skin-stats {
  display: flex;
  flex-direction: column;   
  gap: 12px;               
  margin-top: 10px;
  min-width: 0;
  width: 100%;
}

.stat{
  display: flex;
  justify-content: space-between;  
  align-items: center;

  width: 100%;
}

.stat-label{
  font-size:12px;
  opacity:0.6;
}

.stat-value{
  font-size:clamp(14px,2vw,18px);
  font-weight:600;
}

.risk-indicator{
  display:flex;
  gap:6px;
}

.risk-dot{
  width:10px;
  height:10px;
  border-radius:50%;
}

/* SPF */
.spf-timer {
  font-size: 32px;
  font-weight: 700;
  margin: 10px 0;
}

.spf-picker {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.spf-picker input {
  width: 60px;
  text-align: center;
}

.spf-progress {
  width: 100%;
  height: 8px;
  background: #ddd;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 15px;
}

.spf-progress-fill {
  height: 100%;
  background: orange;
  transition: width 1s linear;
}

.spf-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.spf-button {
  background: orange;
  border: none;
  color: white;
  padding: 12px;
  border-radius: 12px;
}

.spf-reset {
  background: #eee;
  border: none;
  padding: 10px;
  border-radius: 10px;
}

/* WEATHER */
.weather-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.weather-item .label {
  font-size: 12px;
  opacity: 0.6;
}

.weather-item .value {
  font-size: 20px;
  font-weight: 600;
}

/* MOBILE */
@media (max-width: 900px) {
  .row {
    grid-template-columns: 1fr;
  }
}

/* modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background: rgba(0,0,0,0.35);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 999;
}

.modal-card {
  width: 400px;
  padding: 30px;

  border-radius: 28px;

  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);

  box-shadow: 0 20px 60px rgba(0,0,0,0.25);

  display: flex;
  flex-direction: column;
  gap: 18px;

  animation: modalPop 0.3s ease;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2d3d;
}

.modal-text {
  font-size: 14px;
  line-height: 1.5;
  color: #444;
}

.modal-btn {
  margin-top: 10px;

  padding: 14px;
  border-radius: 999px;

  border: none;
  cursor: pointer;

  font-size: 14px;
  font-weight: 600;

  color: white;

  background: linear-gradient(135deg, #2f5f85, #3b7aa8);

  transition: all 0.2s ease;
}

.modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

</style>