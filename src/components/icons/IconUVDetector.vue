<template>

    <div class="dashboard-grid">

        <!-- UV CARD -->
        <div class="card uv-card">

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

        <!-- MID CARD -->
        <div class="card mid-card">

            <!-- <div class="info-block">
                <p class="info-title">UV Status</p>
                <h3>{{ uvLevel }}</h3>
            </div>

            <div class="info-block">
                <p class="info-title">Recommended</p>
                <h3>SPF 50+</h3>
            </div>

            <div class="info-block">
                <p class="info-title">Recommended</p>
                <h3>SPF 50+</h3>
            </div>

            <div class="info-block">
                <p class="info-title">Recommended</p>
                <h3>SPF 50+</h3>
            </div> -->

        </div>

        <!-- TIME TO BURN -->
        <div class="card burn-card">

            <p class="card-title">
                Time to Burn
            </p>

            <div class="burn-circle">

                <div class="burn-value">
                    {{ burnTime }}
                </div>

                <div class="burn-unit">
                    minutes
                </div>

            </div>

        </div>

        <div class="card spf-card">
        SPF
        </div>

        <div class="card humidity-card">
        HUM
        </div>

        <div class="card temp-card">
        TEMP
        </div>

        <div class="card wind-card">
        WIND
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

/* Dashboard background */

.dashboard{
  background:#f5f6f8;
  padding:40px;
  min-height:100vh;

  margin-top:40px;
  margin-bottom:40px;
}


/* GRID SYSTEM */

.dashboard-grid{

  display:grid;

  grid-template-columns:repeat(9,1fr);

  grid-template-rows:repeat(7,120px);

  gap:20px;

}


/* BASE CARD STYLE */

.card{

  background:white;

  border-radius:20px;

  padding:30px;

  box-shadow:0 10px 25px rgba(0,0,0,0.05);

  display:flex;

  flex-direction:column;

  justify-content:center;

  align-items:center;

  text-align:center;

}


/* UV CARD */

.uv-card{

  grid-column:1 / 7;

  grid-row:1 / 5;

  background:linear-gradient(135deg,#ff9800,#ff6a00);

  color:white;

}


.uv-number{

  font-size:90px;

  font-weight:700;

}


.uv-level{

  font-size:28px;

  margin-top:10px;

}


.advice{

  margin-top:10px;

  font-size:15px;

}


/* MID CARD */

.mid-card{

grid-column:1 / 7;

grid-row:5 / 7;

}


/* BURN CARD */

.burn-card{

  grid-column:7 / 10;

  grid-row:1 / 4;

}


.burn-circle{

  width:150px;

  height:150px;

  border:10px solid orange;

  border-radius:50%;

  display:flex;

  flex-direction:column;

  justify-content:center;

  align-items:center;

}


.burn-value{

  font-size:40px;

  font-weight:700;

}


.burn-unit{

  font-size:14px;

  color:#888;

}


/* SPF CARD */

.spf-card{

  grid-column:7 / 10;

  grid-row:4 / 7;

}


.spf-timer{

  font-size:32px;

  font-weight:700;

  margin:20px 0;

}


.spf-button{

  background:orange;

  border:none;

  color:white;

  padding:12px 24px;

  border-radius:10px;

  cursor:pointer;

}


.spf-button:hover{

  background:#ff8c00;

}


/* BOTTOM CARDS */

.humidity-card{

  grid-column:1 / 4;

  grid-row:7;

}

.temp-card{

  grid-column:4 / 7;

  grid-row:7;

}

.wind-card{

  grid-column:7 / 10;

  grid-row:7;

}


/* MOBILE RESPONSIVE */

@media (max-width:900px){

.dashboard-grid{

  grid-template-columns:1fr;

  grid-template-rows:auto;

}

.card{

  grid-column:auto !important;

  grid-row:auto !important;

}

.uv-number{

  font-size:70px;

}

.burn-circle{

  width:120px;

  height:120px;

}

}

</style>