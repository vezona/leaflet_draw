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
          map.addLayer(layer) // 綁定上draw的圖層
        })
      })


      const addMarker = (lat, lng)=>{
        L.marker([lat, lng]).addTo(map).bindPopup(`經緯度: ${lat}, ${lng}`)
      }

      // map.on('click', (e)=>{
      //   console.log(e);
      //   addMarker(e.latlng.lat, e.latlng.lng)
      // })
      
      // add polygon
      const polygonData = ref([])
      const creatPolygon = (polygonData) => {
        const polygon = L.polygon(polygonData, {color: 'red'}).addTo(map);

        // zoom the map to the polygon
        map.fitBounds(polygon.getBounds());
      }

      // add startDraw
      const customControl =  L.Control.extend({
        options: {
          position: 'topright'
          // control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
        },

        onAdd: function (map) {
          const toolbar = L.DomUtil.create('div', 'toolbar');
          const startDraw = L.DomUtil.create('div', 'start');
          const endDraw = L.DomUtil.create('div', 'end');

          toolbar.style.width = '40px';
          startDraw.innerHTML = `<p>開始</p>`
          startDraw.style.border='2px solid blue'
          startDraw.style.margin='10px 0'
          startDraw.style.backgroundColor = 'white';
          endDraw.innerHTML = `<p>結束</p>`
          endDraw.style.border='2px solid green'
          endDraw.style.backgroundColor = 'white';

          toolbar.appendChild(startDraw);
          toolbar.appendChild(endDraw);

          L.DomEvent.on(startDraw, 'mouseover', () => {
             startDraw.style.cursor = 'pointer'
          })

          // 繪製矩形
          const drawPolygon = (e)=>{
            console.log(e.latlng);
            polygonData.value.push([e.latlng.lat, e.latlng.lng])
            // console.log(polygonData.value);
            const lastItem = polygonData.value[polygonData.value.length - 1]
            // console.log(polygonData.value);
            polygonData.value.length > 1 && JSON.stringify(polygonData.value[0]) === JSON.stringify(lastItem)
            if(polygonData.value.length === 2 ){
              console.log(polygonData.value);
              creatPolygon(polygonData.value)
              map._container.style.cursor = ''
              polygonData.value = [];
            }
          }

          // 開始 map click
          L.DomEvent.on(startDraw, 'click', function (ev) {
            L.DomEvent.stopPropagation(ev); // 阻止冒泡事件
            map._container.style.cursor = 'crosshair';
            // 啟動 map onclick 事件
            L.DomEvent.on(map, 'click', drawPolygon)
          });
          
          // 解除 map click
          L.DomEvent.on(endDraw, 'click', function (ev) {
            L.DomEvent.stopPropagation(ev); // 阻止冒泡事件
            L.DomEvent.off(map, 'click', drawPolygon)
          })
          
          return toolbar;
        }
      });
      map.addControl(new customControl());

      // const polygonData = [
      //       [
      //         25.119486550587364,
      //         121.5039825439453
              
      //       ],
      //       [
      //         25.121040804823515,
      //         121.46450042724608
              
      //       ],
      //       [
      //         25.088086383542663,
      //         121.46827697753906
      //       ],
      //       [
      //         25.069429002821355,
      //         121.51565551757812
      //       ],
      //       [
      //         25.105497373014686,
      //         121.55719757080077
              
      //       ],
      //       [
      //         25.119486550587364,
      //         121.5039825439453
      //       ]
      // ];

      
   
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
