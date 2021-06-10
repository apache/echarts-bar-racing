<template>
<el-container>
    <el-main>
        <BBody/>
    </el-main>
</el-container>
</template>

<script lang='ts' setup>

import BBody from './components/BBody.vue';

</script>

<style scoped lang="scss">
#echarts-spa-app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;

    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}

.el-container {
    height: 100%;
}

.el-main {
    padding: 5px;
}
</style>