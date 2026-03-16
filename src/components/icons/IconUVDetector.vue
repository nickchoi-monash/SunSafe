<template>
  <div class="dashboard-grid">
    <!-- UV CARD -->
    <div class="card uv-card" :style="{background: uvColor}">
      <p class="title">CURRENT UV INDEX - {{ locationName }}</p>
      <div class="uv-number">{{ uv }}</div>
      <div class="uv-level">{{ uvLevel }}</div>
      <p class="advice">{{ advice }}</p>
    </div>

    <IconSkinTypeSelector v-model="skinType" />

    <!-- MID CARD -->
    <div class="card mid-card">
      <IconSkinInfo :skinType="skinType" />
    </div>

    <!-- TIME TO BURN -->
    <div class="card burn-card">
      <p class="card-title">Time to Burn</p>
      <div class="burn-circle" :style="{borderColor: uvColor}">
        <div class="burn-value">
          {{ uv <= 2 ? '∞' :  exposureTime }}
        </div>
        <div class="burn-unit">
          {{ uv <= 2 ? 'No burn risk' : 'time remaining' }}
        </div>
      </div>
      <div class="timer-buttons">

      <button
        class="timer-btn"
        v-if="!isRunning"
        @click="startTimer"
      >
      Start
      </button>

      <button
        class="timer-btn"
        v-if="isRunning"
        @click="pauseTimer"
      >
      Pause
      </button>

      <button
        class="timer-btn cancel"
        @click="cancelTimer"
      >
      Cancel
      </button>

      </div>
    </div>

    <div class="card spf-card">
      <p class="spf-title">🧴 SPF Reapplication</p>
      <!-- TIME DISPLAY -->
      <div class="spf-timer">
        {{ formattedTime }}
      </div>

      <!-- TIME PICKER -->
      <div v-if="!spfRunning" class="spf-picker">
        <input
          type="number"
          v-model="spfHours"
          min="0"
          max="6"
        />

        <span>h</span>

        <input
          type="number"
          v-model="spfMinutes"
          min="0"
          max="59"
          step="1"
        />

        <span>m</span>
      </div>

      <!-- PROGRESS BAR -->
      <div class="spf-progress">
        <div
          class="spf-progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <!-- BUTTON -->
      <div class="spf-buttons">
        <button
          class="spf-button"
          @click="toggleSPF"
        >
          {{ spfRunning ? 'I Just Applied SPF' : 'Start SPF Timer' }}
        </button>

        <button
          class="spf-reset"
          @click="resetSPF"
        >
          Reset
        </button>
      </div>
    </div>

    <div class="card humidity-card">
      <p class="card-title">Humidity</p>
      <div class="weather-value">{{ humidity }}%</div>
    </div>

    <div class="card temp-card">
      <p class="card-title">Temp</p>
      <div class="weather-value">{{ temperature }}°C</div>
    </div>

    <div class="card wind-card">
      <p class="card-title">Wind</p>
      <div class="weather-value">{{ windSpeed }} km/h</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,computed, watch } from 'vue'
import IconSkinTypeSelector from './IconSkinTypeSelector.vue'
import IconSkinInfo from './IconSkinInfo.vue'

console.log('API KEY:', import.meta.env.VITE_UV_API_KEY)

const uv = ref(0)
const uvLevel = ref('')
const uvColor = ref('#4CAF50')
const advice = ref('')
// const burnTime = ref(0)
const locationName = ref('Your Location')
// SkinType
const uvData = ref(null)  
const skinType = ref("st2")
// timer
const timer = ref(0)
const isRunning = ref(false)
let interval = null

//SPF timer
const spfHours = ref(2)
const spfMinutes = ref(0)
const spfTimer = ref(120*60)
const spfRunning = ref(false)

let spfInterval = null

// weather card
const humidity = ref(0)
const temperature = ref(0)
const windSpeed = ref(0)

async function fetchUV(lat, lng) {
  console.log('Fetching UV data...')

  const response = await fetch(`https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}`, {
    headers: {
      'x-access-token': import.meta.env.VITE_UV_API_KEY,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    console.error("OpenUV API error:", response.status)
    return
  }

  console.log('Response status:', response.status)

  const data = await response.json()
  const result = data.result

  uv.value = Math.round(result.uv)
  uvData.value = result
  // burnTime.value = result.safe_exposure_time[skinType.value]
  // timer.value = burnTime.value
  setUVLevel(uv.value)

  console.log('UV API data:', data)
  recommendSPFTime()
}

const burnTime = computed(() => {
  if (!uvData.value) return 0

  return uvData.value.safe_exposure_time[skinType.value]
})

watch(burnTime, (newTime) => {
  if (!newTime) return

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

// timer
function startTimer() {
  if (isRunning.value) return

  isRunning.value = true

  interval = setInterval(() => {

    if (timer.value > 0) {
      timer.value--
    }

    else {
      clearInterval(interval)
      isRunning.value = false
    }

  }, 1000) //decrease per minute
}

function pauseTimer() {
  clearInterval(interval)
  isRunning.value = false

}

function cancelTimer() {
  clearInterval(interval)

  timer.value = burnTime.value * 60
  isRunning.value = false
}

async function fetchCity(lat, lng) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  )
  const data = await response.json()

  console.log('City data:', data)

  locationName.value =
    data.address.city ||
    data.address.town ||
    data.address.village ||
    data.address.state ||
    'Unknown Location'
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
        fetchCity(lat, lng)
        fetchWeather(lat, lng)
      },
      error => {
        console.error('Location error:', error)

        const lat = -37.81
        const lng = 144.96

        fetchUV(lat, lng)
        fetchCity(lat, lng)
        fetchWeather(lat, lng)
      }
    )
  } else {
    console.log('Geolocation not supported')
    fetchUV(-37.81, 144.96)
  }
})

// SPF timer
const spfDuration = computed(() => {
  return (spfHours.value * 60 + spfMinutes.value) * 60
})

const formattedTime = computed(() => {
  const total = spfTimer.value

  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
})

const progressPercent = computed(() => {
  return (spfTimer.value / spfDuration.value) * 100
})

function toggleSPF() {
  if (!spfRunning.value) {

    spfTimer.value = spfDuration.value
    spfRunning.value = true

    spfInterval = setInterval(() => {
      if (spfTimer.value > 0) {
        spfTimer.value--
      } else {
        clearInterval(spfInterval)
        spfTimer.value = spfDuration.value
        alert("Time to reapply sunscreen!")
        resetSPF()
      }
    }, 1000)
  } else {
    spfTimer.value = spfDuration.value
  }
}

function resetSPF() {
  clearInterval(spfInterval)
  spfRunning.value = false
  spfTimer.value = spfDuration.value
}

function recommendSPFTime() {
  if (uv.value <= 2) {
    spfHours.value = 0
    spfMinutes.value = 0
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

</script>

<style scoped>
/* Dashboard background */
.dashboard {
  background:#f5f6f8;
  padding:30px clamp(20px,5vw,80px);
  min-height:100vh;
  margin-top:40px;
  margin-bottom:40px auto;
}

/* GRID SYSTEM */
.dashboard-grid {
  display:grid;
  width: 100%;
  grid-template-columns:repeat(9,1fr);
  grid-auto-rows:minmax(60px,auto);
  gap:20px;
}

/* BASE CARD STYLE */
.card {
  background:rgba(255,255,255,0.25);

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border-radius:28px;

  border:1px solid rgba(255,255,255,0.4);

  padding:30px;

  box-shadow:
    0 8px 30px rgba(0,0,0,0.15);

  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  text-align:center;

  transition:all 0.3s ease;
}

.card:hover {
transform:translateY(-5px);

box-shadow:
  0 15px 40px rgba(0,0,0,0.2);
}

/* UV CARD */
.uv-card {
  grid-column:1 / 7;
  grid-row:1 / 7;
  background:rgba(255,150,0,0.35);

  backdrop-filter: blur(20px);
}

.uv-number {
  font-size:90px;
  font-weight:700;
}

.uv-level {
  font-size:28px;
  margin-top:10px;
}

.advice {
  margin-top:10px;
  font-size:15px;
}

/* MID CARD */
.mid-card {
  grid-column:1 / 4;
  grid-row:10 / 13;
}

/* BURN CARD */
.burn-card {
  grid-column:4 / 7;
  grid-row:7 / 13;
}

.burn-circle {
  width:clamp(120px, 35vw, 200px);
  height:clamp(120px, 35vw, 200px);
  border:14px solid;
  border-radius:50%;
  background:transparent;

  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;

  box-shadow:0 6px 20px rgba(0,0,0,0.1);
}

.burn-value {
  font-size:clamp(28px, 6vw, 48px);
  font-weight:700;
}

.burn-unit {
  font-size:clamp(12px, 3vw, 14px);
  color:#888;

  max-width:80%;
  line-height:1.2;
}

.timer-buttons{
  margin-top:20px;
  display:flex;
  justify-content:center;
  gap:10px;
  flex-wrap:wrap;
}

.timer-btn{
  background:orange;
  border:none;
  color:white;
  padding:8px 16px;
  border-radius:8px;
  cursor:pointer;
}

.timer-btn.cancel{
  background:#999;
}

/* SPF CARD */
.spf-card {
  grid-column:7 / 10;
  grid-row:1 / 7;

  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
}

.spf-title {
  font-weight:600;
  margin-bottom:10px;
}

.spf-timer {
  font-size:36px;
  font-weight:700;
  margin:10px 0 20px 0;
}

.spf-picker {
  display:flex;
  align-items:center;
  gap:8px;
  margin-bottom:20px;
}

.spf-picker input {
  width:60px;
  padding:6px;
  font-size:16px;
  text-align:center;
}

.spf-progress {
  width:90%;
  height:8px;
  background:#ddd;
  border-radius:6px;
  overflow:hidden;
  margin-bottom:20px;
}

.spf-progress-fill {
  height:100%;
  background:orange;
  transition:width 1s linear;
}

.spf-buttons {
  width:90%;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.spf-reset {
  background:#eee;
  border:none;
  padding:10px;
  border-radius:10px;
  cursor:pointer;
}

.spf-button {
  background:orange;
  border:none;
  color:white;
  padding:14px;
  border-radius:12px;
  cursor:pointer;
  font-weight:600;
}

.spf-button:hover {
  background:#ff8c00;
}

/* BOTTOM CARDS */
.humidity-card {
  grid-column:7 / 10;
  grid-row:7 / 9;
}

.temp-card {
  grid-column:7 / 10;
  grid-row:9 / 11;
}

.wind-card {
  grid-column:7 / 10;
  grid-row:11 / 13;
}

.weather-value {
  font-size:24px;
  font-weight:600;
}

/* MOBILE RESPONSIVE */
@media (max-width:900px) {
  .dashboard-grid {
  grid-template-columns:repeat(3,1fr);;
  grid-template-rows:auto;
  }
  .card {
  grid-column:1 / -1 !important;
  grid-row:auto !important;
  }
  .uv-number {
  font-size:70px;
  }
  /* weather cards stay on one row */
  .humidity-card,
  .temp-card,
  .wind-card{
    grid-column:auto !important;
  }
}
</style>
