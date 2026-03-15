<script setup>
import { computed } from "vue"

const props = defineProps({
  skinType: {
    type: String,
    default: "st2"
  }
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

/*
Current skin type info
*/
const selectedSkin = computed(() => {
  return skinInfo[props.skinType] || skinInfo.st2
})
</script>

<template>
  <div class="skin-info-card">

    <h3 class="skin-title">
      {{ selectedSkin.name }}
    </h3>

    <p class="skin-description">
      {{ selectedSkin.description }}
    </p>

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

    </div>

  </div>
</template>

<style scoped>

.skin-info-card{
  align-items:flex-start;
  text-align:left;
  gap:12px;
}

.skin-title{
  font-size:18px;
  font-weight:600;
}

.skin-description{
  font-size:14px;
  opacity:0.85;
}

.skin-stats{
  display:flex;
  gap:35px;
  margin-top:10px;
}

.stat{
  display:flex;
  flex-direction:column;
  gap:4px;
}

.stat-label{
  font-size:12px;
  opacity:0.6;
}

.stat-value{
  font-size:18px;
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

</style>