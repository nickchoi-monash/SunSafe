<template>
  <div class="skin-selector">
    <div class="skin-inner">
      <h3 class="skin-title">
        Select your skin type for custom protection suggestions
      </h3>
  
      <div class="skin-container">
        <div
          v-for="skin in skins"
          :key="skin.type"
          class="skin-item"
          :class="{ active: modelValue === skin.type }"
          @click="selectSkin(skin.type)"
          :title="skin.desc"
        >
          <div
            class="skin-circle"
            :style="{ background: skin.color }"
          ></div>
  
          <p>{{ skin.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
  const props = defineProps({
    modelValue: String
  })

  const emit = defineEmits(["update:modelValue"])
  
  const skins = [
    {
      type: "st1",
      label: "Type I",
      color: "#f8d6c2",
      desc: "Very fair skin, always burns"
    },
    {
      type: "st2",
      label: "Type II",
      color: "#f1c9a5",
      desc: "Fair skin, burns easily"
    },
    {
      type: "st3",
      label: "Type III",
      color: "#d8a77f",
      desc: "Medium skin, sometimes burns"
    },
    {
      type: "st4",
      label: "Type IV",
      color: "#b8845a",
      desc: "Olive skin, rarely burns"
    },
    {
      type: "st5",
      label: "Type V",
      color: "#8b5e3c",
      desc: "Brown skin, very rarely burns"
    },
    {
      type: "st6",
      label: "Type VI",
      color: "#5a3a26",
      desc: "Dark skin, almost never burns"
    }
  ]
  
  function selectSkin(type) {
    emit("update:modelValue", type)
  }
</script>

<style scoped>

/* ===== TITLE ===== */
.skin-title {
  align-self: flex-start;
  text-align: left;
  width: 100%;

  font-size: 13px;
  font-weight: 500;
  margin-top: 12px;

  color: #555;
  letter-spacing: 0.2px;
}


/* ===== WRAPPER ===== */
.skin-selector {
  width: 100%;
  text-align: center;
}


/* ===== CONTAINER ===== */
.skin-container {
  display: flex;
  justify-content: space-between;  
  align-items: center;

  width: 100%;
  margin-top: 18px;
  padding: 0 10px;
}


/* ===== ITEM ===== */
.skin-item {
  cursor: pointer;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 60px;

  transition: all 0.25s ease;
}


/* ===== LABEL ===== */
.skin-item p {
  font-size: 12px;
  margin-top: 6px;

  color: #666;  
  transition: all 0.2s ease;
}


/* ===== HOVER ===== */
.skin-item:hover {
  transform: translateY(-4px);
}

.skin-item:hover p {
  color: rgba(255,255,255,0.85);
}


/* ===== CIRCLE ===== */
.skin-circle {
  width: clamp(42px, 5vw, 52px);
  height: clamp(42px, 5vw, 52px);

  border-radius: 50%;
  margin-bottom: 4px;

  transition: all 0.25s ease;

  /*  subtle depth */
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}


/* hover放大 */
.skin-item:hover .skin-circle {
  transform: scale(1.08);
}


/* ===== ACTIVE ===== */
.skin-item.active {
  transform: translateY(-6px);
}

.skin-item.active p {
  color: #111;        
  font-weight: 500;
}

.skin-item.active .skin-circle {
  outline: 3px solid rgba(255,165,0,0.9);   
  outline-offset: 3px;

  box-shadow:
    0 0 12px rgba(255,165,0,0.6),
    0 6px 18px rgba(0,0,0,0.25);  
}


/* ===== MOBILE优化 ===== */
@media (max-width: 600px) {
  .skin-container {
    justify-content: space-around;
    padding: 0;
  }

  .skin-item {
    width: 50px;
  }

  .skin-item p {
    font-size: 11px;
  }
}

</style>