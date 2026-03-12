<template>

    <div class="uv-container">
    
        <!-- uv-card -->
        <div class="uv-card">
    
            <p class="title">
                CURRENT UV INDEX - {{ locationName }}
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
                {{ burnTime > 0 ? burnTime + " minutes" : "No risk" }}
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
    const locationName = ref("Your Location")

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

    async function fetchCity(lat, lng) {

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        )

        const data = await response.json()

        console.log("City data:", data)

        locationName.value =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.state ||
            "Unknown Location"
    }
    
    onMounted(() => {

        console.log("Component mounted")

        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(

                position => {

                    const lat = position.coords.latitude
                    const lng = position.coords.longitude

                    console.log("User location:", lat, lng)

                    fetchUV(lat, lng)

                    fetchCity(lat, lng)

                },

                error => {

                    console.error("Location error:", error)

                    // If error, use default location
                    const lat = -37.81
                    const lng = 144.96

                    fetchUV(lat, lng)

                    fetchCity(lat, lng)

                }

            )

        } else {

            console.log("Geolocation not supported")

            fetchUV(-37.81,144.96)

        }

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