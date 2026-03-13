<template>
  <div class="container mt-5">
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white">
        <h3 class="card-title mb-0">
          <i class="bi bi-shield-shaded me-2"></i>Fitzpatrick Skin Phototypes
        </h3>
      </div>
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Retrieving skin data from RDS...</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Phototype</th>
                <th>Phenotype Description</th>
                <th>Eumelanin</th>
                <th>UV Response</th>
                <th>MED (mJ/cm²)</th>
                <th>Cancer Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in skinData" :key="item.id">
                <td><span class="badge bg-secondary">{{ item.id }}</span></td>
                <td><strong>Type {{ item.fitzpatrick_phototype }}</strong></td>
                <td>{{ item.phenotype }}</td>
                <td><code>{{ item.epidermal_eumelanin }}</code></td>
                <td>
                  <span :class="getBadgeClass(item.cutaneous_response_to_uv)">
                    {{ item.cutaneous_response_to_uv || 'N/A' }}
                  </span>
                </td>
                <td>{{ item.med_mj_cm2 }}</td>
                <td>
                  <div class="progress" style="height: 20px;">
                    <div 
                      class="progress-bar bg-danger" 
                      role="progressbar" 
                      :style="{ width: (item.cancer_risk_out_of_4 / 4) * 100 + '%' }"
                    >
                      {{ item.cancer_risk_out_of_4 }}/4
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* Fetches skin data from the RDS MySQL instance via Amplify 
*/
import { generateClient } from 'aws-amplify/data';
import { onMounted, ref } from 'vue';

const client = generateClient();
const skinData = ref([]);
const isLoading = ref(true);

async function fetchSkinTypes() {
  try {
    /* Fetching list from the uv_skin_data model (matches Amplify model name) */
    const model = client.models.uv_skin_data;
    if (!model?.list) {
      throw new Error(
        'Amplify model "uv_skin_data" not found on client.models. Check amplify_outputs.json and your data schema model name.'
      );
    }

    const { data: items, errors } = await model.list();
    
    if (errors) {
      console.error("Database connection error:", errors);
    } else {
      /* Sorting by ID to ensure Type I shows first as requested */
      skinData.value = (items ?? []).sort((a, b) => a.id - b.id);
    }
  } catch (err) {
    console.error("Failed to fetch data:", err);
  } finally {
    isLoading.value = false;
  }
}

/* Helper function to color-code the UV response badges */
function getBadgeClass(response) {
  if (!response) return 'badge bg-light text-dark';
  if (response.includes('Always Burns')) return 'badge bg-danger';
  if (response.includes('Peels')) return 'badge bg-warning text-dark';
  return 'badge bg-info text-dark';
}

onMounted(() => {
  fetchSkinTypes();
});
</script>

<style scoped>
/* Scoped styles for the progress bar text alignment */
.progress-bar {
  font-size: 0.75rem;
  font-weight: bold;
}
</style>
