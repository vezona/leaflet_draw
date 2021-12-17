<template>
<div class="wrap">
  <div id="map"></div>
  <div class="geoJson_info">
    <input type="file" @change="uploadFile">
    <a :href="jsonObj" download="data.geojson" class="downloadGeoJSON" @click="downloadFile">下載GeoJSON檔案</a>
  </div>
</div>
</template>

<script>
import '../assets/scss/_reset.scss'
import { ref, onMounted } from 'vue';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-draw"
import 'leaflet-draw/dist/leaflet.draw.css'

export default {
  setup() {
    // 地圖
    let map, drawnItems;
    const mapInit = () => {
      map = L.map("map", {
        center: [25.0263064, 121.5262934],
        zoom: 10,
      });
      map.zoomControl.setPosition('bottomright');

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", 
                    { attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>contributors'}
                  ).addTo(map);
      
      // leaflet-draw
      drawnItems = new L.FeatureGroup()
      drawnItems.addTo(map);

      // toolbar
      const drawControl = new L.Control.Draw({
        position: 'topright',
        draw:{
           rectangle: { showArea: false }
        },
        edit: {
          featureGroup: drawnItems
         }
      });
      map.addControl(drawControl);

      // 建立
      map.on('draw:created', function (e) {
        const layer = e.layer;
        drawnItems.addLayer(layer);  // 加入畫完的圖層
      });
    }

    // 取上傳檔案
    const uploadFile = (e) => {
      let file = e.target.files[0]; // Blob
      let reader = new FileReader();
      reader.readAsText(file); // 帶入Blob，轉換成text

      reader.onload = () => {
        // console.log('讀取結束', reader.result);
        const result =  JSON.parse(reader.result)
        L.geoJSON(result, { onEachFeature: onEachFeature }) // onEachFeature 會遍歷每一個新建的 layer
      };
    }

    // 上傳的 geoJson 綁定上 drawnItems 圖層
    function onEachFeature (feature, layer){
      // console.log(layer);
      drawnItems.addLayer(layer);
    }

    // 下載檔案
    const jsonObj = ref()
    const downloadFile = () => {
      jsonObj.value = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(drawnItems.toGeoJSON()));
    }

    // 綁定DOM
    onMounted(() => {
      mapInit()
    })

    return {
      uploadFile,
      jsonObj,
      downloadFile

    }
  }
  
}

</script>

<style lang="scss" scoped>
.wrap{
  display: flex;
}

#map{
  width: 70vw;
  height: 100vh;
}

.geoJson_info{
  box-sizing: border-box;
  width: 30vw;
  padding: 10px
}

.geoJson{
  padding-top: 10px;
}

.downloadGeoJSON{
  display: inline-block;
  background-color: #eee;
  text-decoration: none;
  color:black;
  padding:5px;
  margin:10px;
  border:1px solid black;
  border-radius: 2px;
}

</style>
