<template>
<div class="wrap">
  <div id="map"></div>
  <div class="geoJson_info">
    <input type="file" @change="uploadFile">
    <div class="geoJson">
      <p>GeoJSON 資料</p>
      <p class="text" >{{data}}</p>
    </div>
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
    // 取上傳檔案
    const data = ref({
       "type": "FeatureCollection",
       "features": []
    })
    const uploadFile = (e)=> {
      let file = e.target.files[0]; // Blob
      let reader = new FileReader();
      reader.readAsText(file); // 帶入Blob，轉換成text

      reader.onload = ()=> {
        // console.log('讀取結束', reader.result);
        data.value.features.push(JSON.parse(reader.result)) // 讀取結果轉成JSON格式
      };
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

      // 監聽是否上傳檔案
      watch(data.value.features, () => {
        data.value.features.map(d=>{
          // L.geoJSON(d).addTo(map);
          const layer = L.geoJSON(d)
          // drawnItems.addLayer(layer) // 綁定上draw的圖層
        })
      })

      // 可拖曳的marker
      const point = L.marker([25.0263064, 121.5262934], {
          draggable:true,
          autoPan: true,
          autoPanPadding: [200, 200],
          autoPanSpeed: 25
      }).addTo(map);

      data.value.features.push(point.toGeoJSON())
      // console.log('toGeoJSON', point.toGeoJSON());

      // leaflet-draw
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
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

      map.on(L.Draw.Event.CREATED, function (e) {
          console.log('建立', e);
          // console.log(e.layerType);
          var layer = e.layer;
          drawnItems.addLayer(layer);  // 加入畫完的圖層
          data.value.features.push(layer.toGeoJSON()) // 加入GeoJSON

      });

      map.on(L.Draw.Event.EDITED, function (e) {
          console.log('編輯',e.layers.toGeoJSON());
          // console.log(e.layerType);
          // var layer = e.layer;
          // drawnItems.addLayer(layer);  // 加入畫完的圖層
          // data.value.features.push(layer.toGeoJSON()) // 加入GeoJSON
      });
    }


    // 綁定DOM
    onMounted(() => {
      mapInit()
    })

    return {
      data,
      uploadFile

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

</style>
