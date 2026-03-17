<template>
  <div class="skin-cancer-kpi">
    <div v-if="error" class="alert alert-warning mb-4" role="alert">
      {{ error }}
    </div>

    <div class="row g-4 kpi-row">
      <div class="col-12 col-lg-4 kpi-col">
        <div class="card h-100 kpi-feature-card">
          <div class="card-body">
            <div class="kpi-feature-icon mb-3" aria-hidden="true">
              <i class="bi bi-map"></i>
            </div>
            <h2 class="h5 mb-2">Total skin cancer cases</h2>
            <div class="kpi-value mb-1">{{ isLoading ? '—' : formatNumber(totalCases) }}</div>
            <p class="text-muted mb-0 kpi-subtitle">
              Sum of reported skin cancer cases across Australia between
              <span v-if="!isLoading && yearSpanLabel">{{ yearSpanLabel }}</span><span v-else>available years</span>.
            </p>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4 kpi-col">
        <div class="card h-100 kpi-feature-card">
          <div class="card-body">
            <div class="kpi-feature-icon mb-3" aria-hidden="true">
              <i class="bi bi-graph-up-arrow"></i>
            </div>
            <h2 class="h5 mb-2">Change over time (2011 → 2021)</h2>
            <div class="kpi-value mb-1">{{ isLoading ? '—' : (changePercentLabel ?? '—') }}</div>
            <p class="text-muted mb-0 kpi-subtitle">
              <span v-if="isLoading">Loading…</span>
              <span
                v-else-if="changeStartYearUsed !== null && changeEndYearUsed !== null && changeStartTotal !== null && changeEndTotal !== null"
              >
                From {{ changeStartYearUsed }} ({{ formatNumber(changeStartTotal) }}) to {{ changeEndYearUsed }}
                ({{ formatNumber(changeEndTotal) }}): {{ changeDeltaLabel }} cases.
              </span>
              <span v-else>—</span>
            </p>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4 kpi-col">
        <div class="card h-100 kpi-feature-card">
          <div class="card-body">
            <div class="kpi-feature-icon mb-3" aria-hidden="true">
              <i class="bi bi-gender-ambiguous"></i>
            </div>
            <h2 class="h5 mb-2">Male vs female (latest skin cancer rate)</h2>
            <div class="kpi-value mb-1">
              <span v-if="isLoading">—</span>
              <span v-else>{{ maleLatest ?? '—' }} / {{ femaleLatest ?? '—' }}</span>
            </div>
            <p class="text-muted mb-0 kpi-subtitle">
              <span v-if="isLoading">Loading…</span>
              <span v-else>
                <span v-if="ratioYearUsed">Year {{ ratioYearUsed }}</span>
                <span v-if="ratioYearUsed && ratioNote"> • </span>
                <span v-if="ratioNote">{{ ratioNote }}</span>
                <span v-if="!ratioYearUsed && !ratioNote">—</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import Amplify client and Vue functions
import { generateClient } from 'aws-amplify/data'
import { computed, onMounted, ref } from 'vue'

// Create Amplify data client
const client = generateClient()

// Loading and error states
const isLoading = ref(true)
const error = ref(null)

// KPI data values
const totalCases = ref(0)
const latestYear = ref(null)
const earliestYear = ref(null)
const changeStartYearUsed = ref(null)
const changeEndYearUsed = ref(null)
const changeStartTotal = ref(null)
const changeEndTotal = ref(null)

const maleLatest = ref(null)
const femaleLatest = ref(null)
const ratioNote = ref('')
const ratioYearUsed = ref(null)

// Formats numbers for display (e.g. 123456 -> 123,456)
function formatNumber(n) {
  return new Intl.NumberFormat().format(Number(n) || 0)
}

// Converts to number safely (returns 0 for invalid values)
function toNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const yearSpanLabel = computed(() => {
  const start = Number(earliestYear.value)
  const end = Number(latestYear.value)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return ''
  const years = Math.max(1, end - start + 1)
  return `${start}–${end} (${years} year${years === 1 ? '' : 's'})`
})

const changeDelta = computed(() => {
  const start = Number(changeStartTotal.value)
  const end = Number(changeEndTotal.value)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  return end - start
})

const changeDeltaLabel = computed(() => {
  const d = Number(changeDelta.value)
  if (!Number.isFinite(d)) return '—'
  return `${d >= 0 ? '+' : ''}${formatNumber(d)}`
})

const changePercentLabel = computed(() => {
  const start = Number(changeStartTotal.value)
  const d = Number(changeDelta.value)
  if (!Number.isFinite(start) || !Number.isFinite(d) || start <= 0) return '—'
  const pct = (d / start) * 100
  const absPct = Math.abs(pct)
  const digits = absPct >= 100 ? 0 : absPct >= 10 ? 1 : 1
  const txt = pct.toFixed(digits)
  return `${pct >= 0 ? '+' : ''}${txt}%`
})

// Normalizes sex values to standard format
function normalizeSex(value) {
  const s = String(value ?? '').trim().toLowerCase()
  if (!s) return null
  if (s === 'f' || s === 'female' || s === 'females' || s.includes('female')) return 'Females'
  if (s === 'm' || s === 'male' || s === 'males') return 'Males'
  if (/(^|[^a-z])male(s)?($|[^a-z])/.test(s)) return 'Males'
  return null
}

// Picks "persons" sex from options
function pickPersonsSex(options) {
  const pref = ['persons', 'all persons', 'total persons']
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

// Gets all data rows from model
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

// Loads data and calculates KPIs on mount
// - Fetches all territory rows and sums cases for the latest available year
// - Fetches gender rows to compute male vs female rate/count
onMounted(async () => {
  try {
    const TARGET_START_YEAR = 2011
    const TARGET_END_YEAR = 2021

    const territoryModel = client.models?.skin_cancer_territory
    const genderModel = client.models?.skin_cancer_gender

    if (!territoryModel?.list) {
      throw new Error('Amplify model "skin_cancer_territory" not found.')
    }
    if (!genderModel?.list) {
      throw new Error('Amplify model "skin_cancer_gender" not found.')
    }

    const territoryRows = await listAllRows(territoryModel)

    const territorySexes = Array.from(
      new Set(territoryRows.map(r => r?.sex).filter(Boolean))
    )
    const personsSex = pickPersonsSex(territorySexes) ?? null

    let total = 0
    let maxYear = null
    let minYear = null
    const totalsByYear = new Map()

    for (const r of territoryRows) {
      if (personsSex && r?.sex !== personsSex) continue
      const year = Number(r?.year)
      if (Number.isFinite(year)) {
        maxYear = maxYear === null ? year : Math.max(maxYear, year)
        minYear = minYear === null ? year : Math.min(minYear, year)
      }
      const count = toNumber(r?.count_cases ?? r?.count)
      total += count
      if (Number.isFinite(year)) {
        totalsByYear.set(year, (totalsByYear.get(year) ?? 0) + count)
      }
    }

    totalCases.value = total
    latestYear.value = maxYear
    earliestYear.value = minYear

    // Change-over-time: compare 2011 vs 2021 (fallback to closest available years if missing)
    const availableYears = Array.from(totalsByYear.keys()).filter(y => Number.isFinite(y))
    const sortedYears = availableYears.sort((a, b) => a - b)

    const nearestYear = (target) => {
      if (!sortedYears.length) return null
      let best = sortedYears[0]
      let bestDist = Math.abs(best - target)
      for (const y of sortedYears) {
        const d = Math.abs(y - target)
        if (d < bestDist) {
          bestDist = d
          best = y
        }
      }
      return best
    }

    const startYear = totalsByYear.has(TARGET_START_YEAR) ? TARGET_START_YEAR : nearestYear(TARGET_START_YEAR)
    const endYear = totalsByYear.has(TARGET_END_YEAR) ? TARGET_END_YEAR : nearestYear(TARGET_END_YEAR)

    changeStartYearUsed.value = startYear
    changeEndYearUsed.value = endYear
    changeStartTotal.value = startYear === null ? null : (totalsByYear.get(startYear) ?? 0)
    changeEndTotal.value = endYear === null ? null : (totalsByYear.get(endYear) ?? 0)

    const genderRows = await listAllRows(genderModel)

    // Determine available years from gender data (descending order)
    const years = Array.from(
      new Set(genderRows.map(r => Number(r?.year)).filter(y => Number.isFinite(y)))
    ).sort((a, b) => b - a)

    // Helper to read numeric fields safely
    const getNumeric = (row, key) => {
      if (!row) return null
      const v = Number(row?.[key])
      return Number.isFinite(v) ? v : null
    }

    let found = false
    for (const y of years) {
      const rowsForYear = genderRows.filter(r => Number(r?.year) === y)
      const maleRow = rowsForYear.find(r => normalizeSex(r?.sex) === 'Males')
      const femaleRow = rowsForYear.find(r => normalizeSex(r?.sex) === 'Females')
      if (!maleRow || !femaleRow) continue

      const maleRate = getNumeric(maleRow, 'rate_per_100k')
      const femaleRate = getNumeric(femaleRow, 'rate_per_100k')
      const maleCount = getNumeric(maleRow, 'count')
      const femaleCount = getNumeric(femaleRow, 'count')

      let metricKey = null
      if (maleRate !== null && femaleRate !== null) metricKey = 'rate_per_100k'
      else if (maleCount !== null && femaleCount !== null) metricKey = 'count'
      else continue

      ratioYearUsed.value = y
      ratioNote.value = metricKey === 'rate_per_100k' ? 'Rate per 100k' : ''

      const fmt = v => (metricKey === 'rate_per_100k' ? v.toFixed(1) : formatNumber(v))
      maleLatest.value = fmt(getNumeric(maleRow, metricKey))
      femaleLatest.value = fmt(getNumeric(femaleRow, metricKey))
      found = true
      break
    }

    if (!found) {
      maleLatest.value = null
      femaleLatest.value = null
      ratioNote.value = ''
      ratioYearUsed.value = null
    }
  } catch (e) {
    console.error(e)
    error.value = String(e?.message ?? e ?? 'Failed to load KPIs.')
  } finally {
    isLoading.value = false
  }
})
</script>

<!-- Styles for KPI cards (match HomeView feature cards) -->
<style scoped>
.kpi-value {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgba(0, 0, 0, 0.88);
}

.kpi-feature-card {
  border: 0;
  box-shadow: none;
}

.kpi-subtitle {
  font-size: 0.95rem;
}

.kpi-feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fe850d 0%, #ed6820 100%);
  color: #ffffff;
  font-size: 1.25rem;
}

.kpi-col {
  position: relative;
}

.kpi-col + .kpi-col::before {
  content: "";
  position: absolute;
  left: 25%;
  width: 50%;
  height: 1px;
  top: -0.75rem;
  background: rgba(0, 0, 0, 0.18);
}

@media (min-width: 992px) {
  .kpi-col + .kpi-col::before {
    top: 25%;
    left: -0.5rem;
    width: 1px;
    height: 50%;
  }
}
</style>
