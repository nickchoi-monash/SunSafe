<template>
    <div class="card skin-card">
      <h3 class="skin-title">
        Select your skin type for custom protection alerts
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

<style>
.skin-title{
  align-self:flex-start;
  text-align:left;
  width:100%;
  font-size:12px;      
  font-weight:500;
  margin-top:12px; 
}

.skin-card p{
  font-size:clamp(10px,2vw,12px); 
  font-weight:500;
  margin-bottom:10px;
}

.skin-card {
  grid-column: 1 / 4;
  grid-row: 7 / 10;

  width: 100%;

  background: white;
  border-radius: 20px;
  padding: 15px 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.skin-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: auto;
  width: 100%;
  margin-top: 15px;
}

.skin-item{
  cursor:pointer;
  transition:all 0.25s ease;

  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  width:60px;
} 

.skin-item:hover{
  transform:translateY(-3px);
}

.skin-circle {
  width:clamp(40px,5vw,50px);
  height:clamp(40px,5vw,50px);
  border-radius: 50%;
  margin-bottom:4px;
  transition:all 0.25s ease;
  transform:translateY(-4px);
}

.skin-item:hover .skin-circle{
  transform:scale(1.1);
}

.skin-item.active .skin-circle{
  outline:4px solid orange;
  box-shadow:0 0 12px rgba(255,165,0,0.7);
}
</style>