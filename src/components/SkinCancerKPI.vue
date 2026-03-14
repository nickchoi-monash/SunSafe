<template>
  <div class="skin-cancer-kpi">
    <div v-if="error" class="alert alert-warning mb-4" role="alert">
      {{ error }}
    </div>

    <div class="row g-3 g-lg-4 mb-4">
      <div class="col-12 col-lg-4">
        <div class="kpi-card">
          <div class="kpi-label">Total Cases (Map)</div>
          <div class="kpi-value">{{ isLoading ? '—' : formatNumber(totalCases) }}</div>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <div class="kpi-card">
          <div class="kpi-label">Latest Year</div>
          <div class="kpi-value">{{ isLoading ? '—' : (latestYear ?? '—') }}</div>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <div class="kpi-card">
          <div class="kpi-label">Male vs Female (latest)</div>
          <div class="kpi-value">
            <span v-if="isLoading">—</span>
            <span v-else>{{ maleLatest ?? '—' }} / {{ femaleLatest ?? '—' }}</span>
          </div>
          <!-- <div v-if="!isLoading && (ratioYearUsed || ratioNote)" class="kpi-note">
            <span v-if="ratioYearUsed">Year: {{ ratioYearUsed }}</span>
            <span v-if="ratioYearUsed && ratioNote"> • </span>
            <span v-if="ratioNote">{{ ratioNote }}</span>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { generateClient } from 'aws-amplify/data'
import { onMounted, ref } from 'vue'

const client = generateClient()

const isLoading = ref(true)
const error = ref(null)

const totalCases = ref(0)
const latestYear = ref(null)

const maleLatest = ref(null)
const femaleLatest = ref(null)
const ratioNote = ref('')
const ratioYearUsed = ref(null)

function formatNumber(n) {
  return new Intl.NumberFormat().format(Number(n) || 0)
}

function toNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function normalizeSex(value) {
  const s = String(value ?? '').trim().toLowerCase()
  if (!s) return null
  if (s === 'f' || s === 'female' || s === 'females' || s.includes('female')) return 'Females'
  if (s === 'm' || s === 'male' || s === 'males') return 'Males'
  if (/(^|[^a-z])male(s)?($|[^a-z])/.test(s)) return 'Males'
  return null
}

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

onMounted(async () => {
  try {
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

    for (const r of territoryRows) {
      if (personsSex && r?.sex !== personsSex) continue
      const year = Number(r?.year)
      if (Number.isFinite(year)) maxYear = maxYear === null ? year : Math.max(maxYear, year)
      total += toNumber(r?.count_cases ?? r?.count)
    }

    totalCases.value = total
    latestYear.value = maxYear

    const genderRows = await listAllRows(genderModel)

    const years = Array.from(
      new Set(genderRows.map(r => Number(r?.year)).filter(y => Number.isFinite(y)))
    ).sort((a, b) => b - a)

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

<style scoped>
.kpi-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  min-height: 112px;
}

.kpi-label {
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.55);
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.kpi-value {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: rgba(0, 0, 0, 0.88);
}

.kpi-note {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.5);
}
</style>
