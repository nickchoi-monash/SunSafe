<template>
  <div class="container mt-5">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
      <h3 class="mb-0">
        <i class="bi bi-table me-2" aria-hidden="true"></i>UV Skin DB Preview
      </h3>
      <span class="text-muted small">All columns • first 3 rows</span>
    </div>

    <div class="row g-4">
      <div v-for="table in TABLES" :key="table.key" class="col-12 col-lg-6">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i :class="table.icon" aria-hidden="true"></i>
              <span class="fw-semibold">{{ table.title }}</span>
            </div>
            <span class="badge bg-light text-dark">{{ table.key }}</span>
          </div>

          <div class="card-body">
            <div v-if="tableState[table.key]?.isLoading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted mb-0">Fetching data…</p>
            </div>

            <div v-else-if="tableState[table.key]?.error" class="alert alert-warning mb-0" role="alert">
              {{ tableState[table.key].error }}
            </div>

            <div v-else class="table-responsive">
              <table class="table table-sm table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th v-for="colKey in columnsFor(table.key)" :key="colKey" scope="col">
                      {{ colKey }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in tableState[table.key]?.rows" :key="row?.id ?? idx">
                    <td v-for="colKey in columnsFor(table.key)" :key="colKey">
                      <span
                        class="cell text-truncate d-inline-block"
                        :title="formatCell(row?.[colKey], true)"
                      >
                        {{ formatCell(row?.[colKey]) }}
                      </span>
                    </td>
                  </tr>

                  <tr v-if="(tableState[table.key]?.rows?.length ?? 0) === 0">
                    <td :colspan="columnsFor(table.key).length" class="text-muted py-3">
                      No rows found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import Amplify client and Vue functions
import { generateClient } from 'aws-amplify/data';
import { onMounted, ref } from 'vue';
import outputs from '../../amplify_outputs.json';

// Create Amplify data client
const client = generateClient();

// Limit for preview rows
const ROW_LIMIT = 3;

// List of tables to preview
const TABLES = [
  {
    key: 'uv_skin_data',
    title: 'uv_skin_data',
    icon: 'bi bi-shield-shaded',
  },
  {
    key: 'cancer_age_data',
    title: 'cancer_age_data',
    icon: 'bi bi-bar-chart-line',
  },
  {
    key: 'skin_cancer_gender',
    title: 'skin_cancer_gender',
    icon: 'bi bi-gender-ambiguous',
  },
  {
    key: 'skin_cancer_territory',
    title: 'skin_cancer_territory',
    icon: 'bi bi-geo-alt',
  },
];

const tableColumns = TABLES.reduce((acc, t) => {
  const model = outputs?.data?.model_introspection?.models?.[t.key];
  const fields = model?.fields ? Object.keys(model.fields) : [];
  acc[t.key] = fields.length ? fields : ['id'];
  return acc;
}, {});

// Gets columns for a table
function columnsFor(tableKey) {
  return tableColumns[tableKey] ?? ['id'];
}

// State for each table's data
const tableState = ref(
  TABLES.reduce((acc, t) => {
    acc[t.key] = { rows: [], isLoading: true, error: null };
    return acc;
  }, {})
);

// Formats cell values for display
function formatCell(value, forTitle = false) {
  if (value === null || value === undefined || value === '') return forTitle ? '' : '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

// Fetches data with optional limit
async function listWithOptionalLimit(model, limit) {
  try {
    return await model.list({ limit });
  } catch (err) {
    return await model.list();
  }
}

// Loads preview data for a table
async function fetchPreview(tableKey) {
  const state = tableState.value[tableKey];
  state.isLoading = true;
  state.error = null;

  try {
    const model = client.models?.[tableKey];
    if (!model?.list) {
      state.error =
        `Amplify model "${tableKey}" not found. Update your Amplify SQL schema + regenerate amplify outputs, then refresh.`;
      return;
    }

    const { data: items, errors } = await listWithOptionalLimit(model, ROW_LIMIT);
    if (errors?.length) {
      console.error(`Errors loading ${tableKey}:`, errors);
      const combined = errors.map(e => e?.message).filter(Boolean).join(' | ');
      if (/UnknownType|FieldUndefined/i.test(combined)) {
        state.error =
          `The backend API doesn't have "${tableKey}" deployed yet. Run "npx ampx sandbox --once" to deploy backend changes and regenerate amplify_outputs.json.`;
      } else {
        state.error = `Failed to load "${tableKey}" from the API.`;
      }
      return;
    }

    const sorted = (items ?? []).slice().sort((a, b) => {
      const aId = Number(a?.id);
      const bId = Number(b?.id);
      if (Number.isFinite(aId) && Number.isFinite(bId)) return aId - bId;
      return 0;
    });

    state.rows = sorted.slice(0, ROW_LIMIT);
  } catch (err) {
    console.error(`Failed to fetch ${tableKey}:`, err);
    state.error = `Failed to load "${tableKey}". Check console for details.`;
  } finally {
    state.isLoading = false;
  }
}

// Loads all table previews on mount
onMounted(async () => {
  await Promise.all(TABLES.map(t => fetchPreview(t.key)));
});
</script>

<!-- Styles for table cells -->
<style scoped>
.cell {
  max-width: 22rem;
  vertical-align: middle;
}
</style>
