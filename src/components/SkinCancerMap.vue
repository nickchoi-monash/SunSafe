<template>
  <div class="skin-cancer-map">
    <h2 class="h5 mb-3">Skin Cancer Cases by State/Territory Over Time (Persons)</h2>

    <div class="plot-shell">
      <!-- Plotly renders the animated map -->
      <div ref="plotEl" class="plot" role="img" aria-label="Animated map of Australia with case markers"></div>

      <div v-if="isLoading" class="plot-overlay text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted mb-0">Fetching map data…</p>
      </div>
    </div>

    <div v-if="!isLoading && error" class="alert alert-warning mt-3 mb-0" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
// Import Amplify client and Vue functions
import { generateClient } from 'aws-amplify/data'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

// Create Amplify data client
const client = generateClient()

// Maps state names to codes
const stateCodeMap = {
  'New South Wales': 'NSW',
  Victoria: 'VIC',
  Queensland: 'QLD',
  'South Australia': 'SA',
  'Western Australia': 'WA',
  Tasmania: 'TAS',
  'Northern Territory': 'NT',
  'Australian Capital Territory': 'ACT',
  NSW: 'NSW',
  VIC: 'VIC',
  QLD: 'QLD',
  SA: 'SA',
  WA: 'WA',
  TAS: 'TAS',
  NT: 'NT',
  ACT: 'ACT',
}

// State coordinates for map markers
const stateCoords = {
  NSW: { lat: -33.8688, lon: 151.2093, label: 'New South Wales' },
  VIC: { lat: -37.8136, lon: 144.9631, label: 'Victoria' },
  QLD: { lat: -27.4698, lon: 153.0251, label: 'Queensland' },
  SA: { lat: -34.9285, lon: 138.6007, label: 'South Australia' },
  WA: { lat: -31.9505, lon: 115.8605, label: 'Western Australia' },
  TAS: { lat: -42.8821, lon: 147.3272, label: 'Tasmania' },
  NT: { lat: -12.4634, lon: 130.8456, label: 'Northern Territory' },
  ACT: { lat: -35.2809, lon: 149.13, label: 'Australian Capital Territory' },
}

// Loading and error states
const isLoading = ref(true)
const error = ref(null)
const rawRows = ref([])

const sexForPersons = ref(null)
const plotEl = ref(null)

// Plotly variables
let Plotly = null
let currentGraphDiv = null
let resizeObserver = null
let lastAppliedSize = null

// Converts state names to codes
function normalizeStateCode(value) {
  if (!value) return null
  const trimmed = String(value).trim()
  const direct = stateCodeMap[trimmed]
  if (direct) return direct
  const upper = trimmed.toUpperCase()
  return stateCodeMap[upper] ?? null
}

// Picks "persons" sex from options
function pickPersonsSex(options) {
  const pref = ['persons', 'all persons', 'total persons', 'total', 'all']
  for (const want of pref) {
    const hit = options.find(s => String(s).toLowerCase() === want)
    if (hit) return hit
  }
  for (const want of pref) {
    const hit = options.find(s => String(s).toLowerCase().includes(want))
    if (hit) return hit
  }
  return null
}

// Gets all data rows from model (handles paginated responses)
async function listAllRows(model, limit = 1000) {
  const all = []
  let nextToken = undefined

  while (true) {
    let resp
    try {
      resp = await model.list({ limit, nextToken })
    } catch {
      resp = await model.list()
    }

    all.push(...(resp?.data ?? []))
    nextToken = resp?.nextToken
    if (!nextToken) break
  }

  return all
}

// Gets unique sex options from data
const sexOptions = computed(() => {
  const set = new Set(rawRows.value.map(r => r?.sex).filter(Boolean))
  return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)))
})

// Groups data by year and state
function aggregateCountsByYearAndState(sex) {
  const byYear = new Map()

  for (const row of rawRows.value) {
    if (sex && row?.sex !== sex) continue

    const year = Number(row?.year)
    if (!Number.isFinite(year)) continue

    const stateCode = normalizeStateCode(row?.territory_code ?? row?.territory_name)
    if (!stateCode) continue

    const count =
      Number(row?.count_cases) ||
      Number(row?.count) ||
      0

    if (!byYear.has(year)) byYear.set(year, new Map())
    const byState = byYear.get(year)
    byState.set(stateCode, (byState.get(stateCode) ?? 0) + count)
  }

  const years = Array.from(byYear.keys()).sort((a, b) => a - b)
  let globalMax = 0
  for (const byState of byYear.values()) {
    for (const v of byState.values()) globalMax = Math.max(globalMax, Number(v) || 0)
  }
  if (globalMax <= 0) globalMax = 1

  return { byYear, years, globalMax }
}

// Builds data for one year of map
function buildPlotData(byYear, year, globalMax) {
  const byState = byYear.get(year) ?? new Map()
  const states = Object.keys(stateCoords)

  const lats = []
  const lons = []
  const counts = []
  const labels = []

  for (const code of states) {
    const coord = stateCoords[code]
    const count = Number(byState.get(code) ?? 0)
    lats.push(coord.lat)
    lons.push(coord.lon)
    counts.push(count)
    labels.push(`${coord.label} (${code})`)
  }

  const desiredMaxMarkerPx = 44
  const sizeref = (2.0 * globalMax) / (desiredMaxMarkerPx ** 2)

  return {
    lats,
    lons,
    counts,
    labels,
    sizeref,
  }
}

// Loads Plotly library
async function ensurePlotly() {
  if (Plotly) return Plotly
  const mod = await import('plotly.js-dist-min')
  Plotly = mod?.default ?? mod
  return Plotly
}

// Gets square size for plot
function squareSize() {
  const shell = plotEl.value?.parentElement
  const rect = shell?.getBoundingClientRect?.()
  const width = Math.round(rect?.width ?? 0)
  const height = Math.round(rect?.height ?? 0)
  const size = Math.min(width || 0, height || 0) || width || height || 0
  return size > 0 ? size : null
}

// Makes plot square and responsive
function applySquareLayout() {
  if (!Plotly || !currentGraphDiv) return
  const size = squareSize()
  if (size && size !== lastAppliedSize) {
    lastAppliedSize = size
    Plotly.relayout(currentGraphDiv, { height: size, width: size })
  }
  Plotly.Plots?.resize?.(currentGraphDiv)
}

// Creates and shows the animated map
// - Builds data frames for each year
// - Configures Plotly map layout, colors and animation controls
// - Renders the map into the DOM element in the template above
async function renderPlot() {
  // Ensure the target div exists before rendering
  let el = plotEl.value
  if (!el) {
    await nextTick()
    el = plotEl.value
    if (!el) return
  }

  const plotly = await ensurePlotly()
  const { byYear, years, globalMax } = aggregateCountsByYearAndState(sexForPersons.value)

  if (!years.length) {
    error.value = 'No map data found for this selection.'
    return
  }

  // First frame uses the earliest year in the dataset
  const firstYear = years[0]
  const first = buildPlotData(byYear, firstYear, globalMax)

  const targetHeight = squareSize() ?? 560

  const trace = {
    type: 'scattergeo',
    mode: 'markers',
    lat: first.lats,
    lon: first.lons,
    text: first.labels,
    customdata: first.counts,
    hovertemplate: '%{text}<br>Cases: %{customdata}<extra></extra>',
    marker: {
      size: first.counts,
      sizemode: 'area',
      sizeref: first.sizeref,
      sizemin: 6,
      color: first.counts,
      colorscale: [
        [0, '#fff7bc'],
        [0.5, '#fec44f'],
        [1, '#d7301f'],
      ],
      cmin: 0,
      cmax: globalMax,
      showscale: true,
      colorbar: {
        title: 'Cases',
        tickmode: 'array',
        tickvals: [0, globalMax],
        ticktext: ['Low', 'High'],
      },
      line: { width: 0.8, color: 'rgba(0,0,0,0.25)' },
      opacity: 0.8,
    },
  }

  const frameArgs = {
    mode: 'immediate',
    frame: { duration: 600, redraw: true },
    transition: { duration: 250, easing: 'cubic-in-out' },
  }

  // Build animation frames: one frame per year
  // Each frame updates marker sizes/colors based on that year's counts.
  const frames = years.map(year => {
    const d = buildPlotData(byYear, year, globalMax)
    return {
      name: String(year),
      data: [
        {
          lat: d.lats,
          lon: d.lons,
          customdata: d.counts,
          marker: {
            size: d.counts,
            sizeref: d.sizeref,
            color: d.counts,
            cmax: globalMax,
          },
        },
      ],
    }
  })

  // Slider control to pick year in the animation
  const sliders = [
    {
      active: 0,
      currentvalue: { prefix: 'Year: ' },
      pad: { t: 16 },
      steps: years.map(year => ({
        label: String(year),
        method: 'animate',
        args: [[String(year)], frameArgs],
      })),
    },
  ]

  // Play/pause buttons for the animation
  const updatemenus = [
    {
      type: 'buttons',
      direction: 'left',
      x: 0.01,
      y: 0.99,
      xanchor: 'left',
      yanchor: 'top',
      pad: { t: 2, r: 8, l: 2, b: 2 },
      bgcolor: 'rgba(255,255,255,0.75)',
      bordercolor: 'rgba(0,0,0,0.12)',
      borderwidth: 1,
      buttons: [
        { label: 'Play', method: 'animate', args: [null, frameArgs] },
        { label: 'Pause', method: 'animate', args: [[null], { mode: 'immediate', frame: { duration: 0 } }] },
      ],
    },
  ]

  const layout = {
    title: { text: '', font: { size: 14 } },
    margin: { l: 10, r: 10, t: 10, b: 70 },
    paper_bgcolor: '#f3f5f7',
    height: targetHeight,
    geo: {
      projection: { type: 'natural earth' },
      center: { lat: -25.2744, lon: 133.7751 },
      lataxis: { range: [-45, -10] },
      lonaxis: { range: [110, 155] },
      bgcolor: '#d6dbde',
      showframe: false,
      showland: true,
      landcolor: '#fbfbfb',
      showocean: true,
      oceancolor: '#d6dbde',
      showlakes: true,
      lakecolor: '#d6dbde',
      showcoastlines: true,
      coastlinecolor: 'rgba(0,0,0,0.18)',
      coastlinewidth: 0.7,
      showcountries: true,
      countrycolor: 'rgba(0,0,0,0.16)',
      countrywidth: 0.6,
      showsubunits: true,
      subunitcolor: 'rgba(0,0,0,0.10)',
      subunitwidth: 0.7,
    },
    sliders,
    updatemenus,
  }

  const config = { responsive: true, displayModeBar: false }

  if (currentGraphDiv) {
    plotly.purge(currentGraphDiv)
    currentGraphDiv = null
  }

  await nextTick()
  currentGraphDiv = el
  await plotly.newPlot(el, [trace], layout, config)
  await plotly.addFrames(el, frames)
  applySquareLayout()
}

// Loads data and sets up map on mount
onMounted(async () => {
  try {
    const model = client.models?.skin_cancer_territory
    if (!model?.list) {
      error.value =
        'Amplify model "skin_cancer_territory" not found. Deploy backend changes and regenerate amplify_outputs.json.'
      return
    }

    rawRows.value = await listAllRows(model)
    if (!sexOptions.value.length) {
      error.value = 'No rows found in skin_cancer_territory.'
      return
    }

    sexForPersons.value = pickPersonsSex(sexOptions.value)
    if (!sexForPersons.value) {
      error.value = `Couldn't find a "Persons" series (available: ${sexOptions.value.join(', ')}).`
      return
    }

    await renderPlot()

    const shell = plotEl.value?.parentElement
    if (shell && typeof ResizeObserver !== 'undefined' && !resizeObserver) {
      resizeObserver = new ResizeObserver(() => applySquareLayout())
      resizeObserver.observe(shell)
    }
    window.addEventListener('resize', applySquareLayout, { passive: true })
  } catch (err) {
    console.error('Failed to load skin_cancer_territory:', err)
    error.value = 'Failed to load map data. Check console for details.'
  } finally {
    isLoading.value = false
  }
})

// Cleans up when component unmounts
onBeforeUnmount(() => {
  window.removeEventListener('resize', applySquareLayout)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (Plotly && currentGraphDiv) {
    try {
      Plotly.purge(currentGraphDiv)
    } catch {
      // ignore
    }
  }
  currentGraphDiv = null
})
</script>

<!-- Styles for map container -->
<style scoped>
.skin-cancer-map {
  width: 100%;
}

.plot-shell {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
}

.plot-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(2px);
}

.plot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
