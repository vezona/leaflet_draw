<template>
<div class="wrap">
  <div id="map"></div>
  <div class="geoJson_info">
    <input type="file" @change="uploadFile">
    <div class="geoJson">
      <p>GeoJSON 資料</p>
      <p class="text" >{{data}}</p>
    </div>
        <!-- 下載 -->
    <a :href="jsonObj" download="data.geojson" class="downloadGeoJSON" @click="downloadFile">下載GeoJSON檔案</a>
  </div>
</div>


</template>

<script>
import '../assets/scss/_reset.scss'
import { ref, onMounted, watch } from 'vue';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-draw"
import 'leaflet-draw/dist/leaflet.draw.css'

export default {
  setup() {
    const data = ref({
       "type": "FeatureCollection",
       "features": []
    })

    // 取上傳檔案
    const uploadFile = (e)=> {
      let file = e.target.files[0]; // Blob
      let reader = new FileReader();
      reader.readAsText(file); // 帶入Blob，轉換成text

      reader.onload = ()=> {
        // console.log('讀取結束', reader.result);
        data.value.features.push(JSON.parse(reader.result))  // 讀取結果轉成JSON格式
      };
    }

    // 下載檔案
    const jsonObj = ref()
    const downloadFile = ()=>{
      jsonObj.value = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.value));
    }

    // 地圖
    let map;
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
      // 圖層
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

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

      // 加上點點
      // const point = L.marker([25.0263064, 121.5262934], {
      //     draggable:true,
      //     autoPan: true,
      //     autoPanPadding: [200, 200],
      //     autoPanSpeed: 25
      // })
      // drawnItems.addLayer(point); 

      map.on(L.Draw.Event.CREATED, function (e) {
        console.log('建立', e);
        // console.log(e.layerType);
        var layer = e.layer;
        drawnItems.addLayer(layer);  // 加入畫完的圖層
        // data.value.features.push(layer.toGeoJSON()) // 加入GeoJSON
        console.log(JSON.stringify(drawnItems.toGeoJSON()));
        // data.value = JSON.stringify(drawnItems.toGeoJSON())
      });

      map.on(L.Draw.Event.EDITED, function (e) {
         const layers = e.layers;
         layers.eachLayer(function (layer) {
           console.log(layer.toGeoJSON());
         });
          console.log(JSON.stringify(drawnItems.toGeoJSON()));
          data.value = JSON.stringify(drawnItems.toGeoJSON())
      });


      // 監聽是否上傳檔案
      watch(data.value.features, () => {
        data.value.features.map( d => {
          const layer = L.geoJSON(d, { onEachFeature: onEachFeature })
        })
      })

      // 上傳的geoJson綁定上drawnItems 圖層
      function onEachFeature(feature, layer){
         drawnItems.addLayer(layer);
      }
    }


    // 綁定DOM
    onMounted(() => {
      mapInit()
    })

    return {
      data,
      uploadFile,
      jsonObj,
      downloadFile,

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
