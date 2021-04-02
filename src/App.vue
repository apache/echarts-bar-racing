<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" /> -->
  <h1>Apache ECharts 动态排序柱状图生成工具</h1>
  <p>This is content</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// import HelloWorld from './components/HelloWorld.vue'

export default defineComponent({
  name: 'App',
  components: {
    // HelloWorld
  }
})
</script>

<style>
#table-row {
  margin: 0;
}
#table-panel {
  border: 1px solid #eee;
  height: 600px;
  overflow: hidden;
}
#bar-race-preview {
  width: 100%;
  height: 400px;
  margin: 30px 0;
}
#bar-race-preview div, #bar-race-preview canvas {
  width: 100% !important;
  height: 100% !important;
}
.btn {
  margin-right: 10px;
}
</style>