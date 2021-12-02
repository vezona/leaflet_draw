
<template>
  <div class="wrapper">
    <router-link to="draw">leaflet-draw</router-link>
    <router-link to="mymap">mymap</router-link>
  </div>
</template>

<script setup>

</script>
<style lang="scss" scoped>
.wrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
}
a {
  margin:10px;
  padding:10px;
  width: 100px;
  background-color: rgba(40,78,78);
  color: white;
  text-decoration: none;
  font-size: 18px;
  text-align: center;
}
</style>
