<template>
  <div class="skin-cancer-sex">
    <h2 class="h5 mb-3">Skin cancer (Male vs Female) over time</h2>

    <div class="plot-shell">
      <div ref="plotEl" class="plot" role="img" aria-label="Line chart of male vs female skin cancer over time"></div>

      <div v-if="isLoading" class="plot-overlay text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted mb-0">Fetching chart data…</p>
      </div>
    </div>

    <div v-if="!isLoading && error" class="alert alert-warning mt-3 mb-0" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { generateClient } from 'aws-amplify/data'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const client = generateClient()

const isLoading = ref(true)
const error = ref(null)
const plotEl = ref(null)

let Plotly = null
let currentGraphDiv = null

async function ensurePlotly() {
  if (Plotly) return Plotly
  const mod = await import('plotly.js-dist-min')
  Plotly = mod?.default ?? mod
  return Plotly
}

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

function normalizeSex(value) {
  const s = String(value ?? '').trim().toLowerCase()
  if (!s) return null
  // Important: check female first because "female" contains "male" as a substring.
  if (s === 'f' || s === 'female' || s === 'females' || s.includes('female')) return 'Females'
  if (s === 'm' || s === 'male' || s === 'males') return 'Males'
  if (/(^|[^a-z])male(s)?($|[^a-z])/.test(s)) return 'Males'
  return null
}

function pickMetricKey(sampleRow) {
  const candidates = [
    'count_cases',
    'count',
    'cases',
    'Count',
    'rate_per_100k',
    'rate',
  ]
  for (const k of candidates) {
    if (sampleRow && Object.prototype.hasOwnProperty.call(sampleRow, k)) return k
  }
  return null
}

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

async function renderPlot(rows) {
  let el = plotEl.value
  if (!el) {
    await nextTick()
    el = plotEl.value
    if (!el) return
  }

  const plotly = await ensurePlotly()

  const metricKey = pickMetricKey(rows?.[0])
  if (!metricKey) {
    error.value =
      'No numeric metric column found for skin_cancer_gender (expected something like count/rate_per_100k).'
    return
  }

  const byYear = new Map()
  for (const row of rows ?? []) {
    const year = Number(row?.year ?? row?.Year)
    if (!Number.isFinite(year)) continue

    const sex = normalizeSex(row?.sex ?? row?.Sex)
    if (!sex) continue

    const value = toNumber(row?.[metricKey])
    if (!byYear.has(year)) byYear.set(year, { Males: 0, Females: 0 })
    byYear.get(year)[sex] += value
  }

  const years = Array.from(byYear.keys()).sort((a, b) => a - b)
  if (!years.length) {
    error.value = 'No Male/Female rows found to chart.'
    return
  }

  const x = years
  const males = years.map(y => byYear.get(y)?.Males ?? 0)
  const females = years.map(y => byYear.get(y)?.Females ?? 0)

  const yLabel = metricKey === 'rate_per_100k' || metricKey === 'rate' ? 'Rate per 100k' : 'Count'

  const traces = [
    {
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Males',
      x,
      y: males,
      line: { color: '#0d6efd', width: 3 },
      marker: { size: 7 },
    },
    {
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Females',
      x,
      y: females,
      line: { color: '#d63384', width: 3 },
      marker: { size: 7 },
    },
  ]

  const layout = {
    margin: { l: 48, r: 18, t: 10, b: 46 },
    height: 550,
    paper_bgcolor: '#f3f5f7',
    plot_bgcolor: '#ffffff',
    xaxis: { title: 'Year', tickmode: 'linear', dtick: 2, gridcolor: 'rgba(0,0,0,0.06)' },
    yaxis: { title: yLabel, gridcolor: 'rgba(0,0,0,0.06)' },
    legend: { orientation: 'h', x: 0, y: 1.15 },
  }

  const config = { responsive: true, displayModeBar: false }

  if (currentGraphDiv) {
    plotly.purge(currentGraphDiv)
    currentGraphDiv = null
  }

  currentGraphDiv = el
  await plotly.newPlot(el, traces, layout, config)
}

onMounted(async () => {
  try {
    const model = client.models?.skin_cancer_gender
    if (!model?.list) {
      error.value =
        'Amplify model "skin_cancer_gender" not found. Deploy backend changes and regenerate amplify_outputs.json.'
      return
    }

    const rows = await listAllRows(model)
    await renderPlot(rows)
  } catch (err) {
    console.error('Failed to load skin_cancer_gender:', err)
    error.value = 'Failed to load chart data. Check console for details.'
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
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

<style scoped>
.skin-cancer-sex {
  width: 100%;
}

.plot-shell {
  position: relative;
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
  width: 100%;
  min-height: 550px;
}
</style>
