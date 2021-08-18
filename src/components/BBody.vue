<template>
    <div class="w-full h-full">
        <div class="grid grid-cols-12 h-full text-sm">
            <el-card class="box-card col-span-3">
                <h1 slot="header" class="clearfix text-xl">
                    {{$t('toolName')}}
                </h1>
                <div id="el-config" class="align-middle">
                    <el-form ref="form">
                        <div class="grid grid-cols-3 form-row">
                            <label class="col-span-1">{{$t('chartTitle')}}</label>
                            <el-input
                                id="input-title"
                                size="medium"
                                class="col-span-2"
                                v-model="title"
                                @change="runChart"
                            >
                            </el-input>
                        </div>
                        <div class="grid grid-cols-3 form-row">
                            <label class="col-span-1">显示排名上限</label>
                            <el-input
                                id="input-max"
                                type="number"
                                value=""
                                size="medium"
                                class="col-span-2"
                                v-model="maxDataCnt"
                                @change="runChart"
                            >
                            </el-input>
                        </div>
                        <div class="grid grid-cols-3 form-row">
                            <label class="col-span-1">每行动画时长（毫秒）</label>
                            <el-input
                                id="input-animation-duration"
                                type="number"
                                value="5000"
                                size="medium"
                                class="col-span-2"
                                v-model="animationDuration"
                                @change="runChart"
                            >
                            </el-input>
                        </div>
                        <div class="grid grid-cols-3 form-row">
                            <label class="col-span-1">视频宽度</label>
                            <el-input
                                type="number"
                                size="medium"
                                class="col-span-2"
                                v-model="width"
                            >
                            </el-input>
                        </div>
                        <div class="grid grid-cols-3 form-row">
                            <label class="col-span-1">视频高度</label>
                            <el-input
                                type="number"
                                size="medium"
                                class="col-span-2"
                                v-model="height"
                            >
                            </el-input>
                        </div>
                        <el-form-item>
                            <el-button @click="download" type="primary">下载代码</el-button>
                            <el-button @click="downloadVideo">生成视频</el-button>
                        </el-form-item>

                        <div class="grid grid-cols-3 form-row">
                            <label class="col-span-1">视频生成中</label>
                            <el-progress class="col-span-2"
                                :text-inside="true"
                                :stroke-width="20"
                                :percentage="videoPercentage">
                            </el-progress>
                        </div>
                    </el-form>
                </div>
            </el-card>
            <el-card
                class="box-card col-span-4 relative"
                body-style="height: 100%"
            >
                <BTable
                    ref="btable"
                    @after-change="tableAfterChange"
                />
            </el-card>
            <el-card
                class="box-card col-span-5 relative"
                body-style="height: 100%"
            >
                <BChart
                    ref="bchart"
                    :title="title"
                    :chartData="chartData"
                    :maxDataCnt="maxDataCnt"
                    :animationDuration="animationDuration"
                />
            </el-card>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import BTable, {ChartData} from './BTable.vue';
import BChart from './BChart.vue';
import template from '../helper/template';

export default defineComponent({
    name: 'BBody',
    data() {
        return {
            // @ts-ignore:
            title: this.$i18n.t('defaultChartTitle'),
            maxDataCnt: null,
            chartData: null,
            animationDuration: 3000,
            width: 1280,
            height: 720,
            videoPercentage: 40
        }
    },
    components: {
        BTable,
        BChart
    },
    mounted: () => {
    },
    methods: {
        tableAfterChange(data: ChartData) {
            this.chartData = data;
        },

        runChart() {
            (this.$refs.bchart as any).run();
        },

        download() {
            let html = template;
            const map = {
                animationDuration: this.animationDuration,
                maxDataCnt: this.maxDataCnt,
                title: this.title,
                data: (this.$refs.btable as any).getChartData()
            };
            for (let attr in map) {
                const value = (map as any)[attr];
                html = html.replace(`{{${attr}}}`, JSON.stringify(value));
            }

            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));
            element.setAttribute('download', 'echarts-bar-racing.html');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        },

        async downloadVideo() {
            const isSuccess = await (this.$refs.bchart as any).captureVideo(this.width, this.height);
            if (!isSuccess) {
                // this.$notify.error({
                //     title: '导出失败！',
                //     message: '建议使用最新版 Chrome 或 Firefox',
                //     duration: 0,
                //     position: 'bottom-left'
                // });
            }
        }
    }
})
</script>

<style scoped>
@layer utilities {
    .form-row {
        @apply my-3;

        label {
            @apply py-1;
        }
    }

    .box-card {
        @apply m-1;
    }
}
</style>
