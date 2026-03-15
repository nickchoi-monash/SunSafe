<template>
  <div class="skin-cancer-age">
    <h2 class="h5 mb-3">Total skin cancer cases by age group</h2>

    <div class="plot-shell">
      <div ref="plotEl" class="plot" role="img" aria-label="Bar chart of skin cancer cases by age group"></div>

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
let resizeObserver = null
let lastAppliedSize = null

async function ensurePlotly() {
  if (Plotly) return Plotly
  const mod = await import('plotly.js-dist-min')
  Plotly = mod?.default ?? mod
  return Plotly
}

function squareSize() {
  const shell = plotEl.value?.parentElement
  const rect = shell?.getBoundingClientRect?.()
  const width = Math.round(rect?.width ?? 0)
  const height = Math.round(rect?.height ?? 0)
  const size = Math.min(width || 0, height || 0) || width || height || 0
  return size > 0 ? size : null
}

function applySquareLayout() {
  if (!Plotly || !currentGraphDiv) return
  const size = squareSize()
  if (size && size !== lastAppliedSize) {
    lastAppliedSize = size
    Plotly.relayout(currentGraphDiv, { height: size, width: size })
  }
  Plotly.Plots?.resize?.(currentGraphDiv)
}

async function listAllRows(model, limit = 2000) {
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

function ageSortKey(value) {
  const s = String(value ?? '')
  const match = s.match(/(\d+)/)
  return match ? Number(match[1]) : 9999
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

  const grouped = new Map()
  for (const row of rows ?? []) {
    const ageGroup = String(row?.age_group_years ?? '').trim()
    if (!ageGroup) continue
    if (/all ages/i.test(ageGroup)) continue

    const count = toNumber(row?.count)
    grouped.set(ageGroup, (grouped.get(ageGroup) ?? 0) + count)
  }

  const items = Array.from(grouped.entries())
    .map(([ageGroupYears, count]) => ({ ageGroupYears, count }))
    .sort((a, b) => ageSortKey(a.ageGroupYears) - ageSortKey(b.ageGroupYears))

  if (!items.length) {
    error.value = 'No age-group rows found to chart.'
    return
  }

  const trace = {
    type: 'bar',
    x: items.map(i => i.ageGroupYears),
    y: items.map(i => i.count),
    marker: {
      color: items.map(i => i.count),
      colorscale: [
        [0, '#d7f2ee'],
        [0.5, '#6db3bf'],
        [1, '#1f5673'],
      ],
      cmin: 0,
      cmax: Math.max(...items.map(i => i.count), 1),
      showscale: true,
      colorbar: {
        title: 'Cases',
        thickness: 18,
        len: 0.72,
        x: 1.04,
      },
      line: { width: 0, color: 'rgba(0,0,0,0)' },
    },
    hovertemplate: 'Age group: %{x}<br>Count: %{y}<extra></extra>',
  }

  const layout = {
    margin: { l: 70, r: 80, t: 10, b: 110 },
    height: squareSize() ?? 600,
    paper_bgcolor: '#f3f5f7',
    plot_bgcolor: '#fbfbfb',
    xaxis: {
      title: 'Age group',
      tickangle: -35,
      automargin: true,
      gridcolor: 'rgba(0,0,0,0.06)',
    },
    yaxis: {
      title: 'Cases',
      tickformat: '~s',
      gridcolor: 'rgba(0,0,0,0.06)',
      zerolinecolor: 'rgba(0,0,0,0.10)',
    },
  }

  const config = { responsive: true, displayModeBar: false }

  if (currentGraphDiv) {
    plotly.purge(currentGraphDiv)
    currentGraphDiv = null
  }

  currentGraphDiv = el
  await plotly.newPlot(el, [trace], layout, config)
  applySquareLayout()
}

onMounted(async () => {
  try {
    const model = client.models?.cancer_age_data
    if (!model?.list) {
      error.value =
        'Amplify model "cancer_age_data" not found. Deploy backend changes and regenerate amplify_outputs.json.'
      return
    }

    const rows = await listAllRows(model)
    await renderPlot(rows)

    const shell = plotEl.value?.parentElement
    if (shell && typeof ResizeObserver !== 'undefined' && !resizeObserver) {
      resizeObserver = new ResizeObserver(() => applySquareLayout())
      resizeObserver.observe(shell)
    }
    window.addEventListener('resize', applySquareLayout, { passive: true })
  } catch (err) {
    console.error('Failed to load cancer_age_data:', err)
    error.value = 'Failed to load chart data. Check console for details.'
  } finally {
    isLoading.value = false
  }
})

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

<style scoped>
.skin-cancer-age {
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
