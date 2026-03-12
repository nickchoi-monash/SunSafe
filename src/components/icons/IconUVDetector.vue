<template>

    <div class="uv-container">
    
        <!-- uv-card -->
        <div class="uv-card">
    
            <p class="title">
                CURRENT UV INDEX - MELBOURNE
            </p>
    
            <div class="uv-number">
                {{ uv }}
            </div>
    
            <div class="uv-level">
                {{ uvLevel }}
            </div>
    
            <p class="advice">
                {{ advice }}
            </p>
    
        </div>
        
        <!-- burn-card -->
        <div class="burn-card">  
    
            <p class="title">
                Time to Burn
            </p>
    
            <div class="burn-time">
                {{ burnTime }} minutes
            </div>
    
        </div>
    
    </div>
    
    </template>
    
    <script setup>
    
    import { ref, onMounted } from "vue"

    console.log("API KEY:", import.meta.env.VITE_UV_API_KEY)
    
    const uv = ref(0)
    const uvLevel = ref("")
    const advice = ref("")
    const burnTime = ref(0)

    async function fetchUV(lat, lng) {

    console.log("Fetching UV data...")

    const response = await fetch(
    `https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}`,
    {
        headers: {
        "x-access-token": import.meta.env.VITE_UV_API_KEY,
        "Content-Type": "application/json"
        }
    }
    )

    console.log("Response status:", response.status)

    const data = await response.json()

    const result = data.result
    
    uv.value = Math.round(result.uv)

    burnTime.value = result.safe_exposure_time.st2

    setUVLevel(uv.value)

    console.log("UV API data:", data)

    }
    
    function setUVLevel(value){
    
        if(value <= 2){
    
            uvLevel.value = "Low"
            advice.value = "Minimal protection required."
    
        }
    
        else if(value <= 5){
    
            uvLevel.value = "Moderate"
            advice.value = "Wear sunscreen."
    
        }
    
        else if(value <= 7){
    
            uvLevel.value = "High"
            advice.value = "Seek shade during midday."
    
        }
    
        else if(value <= 10){
    
            uvLevel.value = "Very High"
            advice.value = "Protection required. Seek shade."
    
        }
    
        else{
    
            uvLevel.value = "Extreme"
            advice.value = "Avoid sun exposure."
    
        }
    
    }
    
    onMounted(() => {

        console.log("Component mounted")

        const lat = 51.5074
        const lng = -0.1278

        fetchUV(lat,lng)

    })
    
    </script>
    
    <style scoped>
    
    .uv-container{
    display:flex;
    gap:30px;
    }
    
    .uv-card{
    width:300px;
    background:orange;
    color:white;
    padding:30px;
    border-radius:20px;
    text-align:center;
    }
    
    .uv-number{
    font-size:60px;
    font-weight:bold;
    }
    
    .uv-level{
    font-size:22px;
    margin-top:10px;
    }
    
    .burn-card{
    width:220px;
    background:white;
    padding:30px;
    border-radius:20px;
    text-align:center;
    }
    
    .burn-time{
    font-size:40px;
    font-weight:bold;
    }
    
    .title{
    font-size:14px;
    letter-spacing:1px;
    }
    
    </style>