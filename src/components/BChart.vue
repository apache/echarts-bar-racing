<template>
    <div>
        <div slot="header" class="clearfix text-base">
            预览{{title}}
            <a href="#">
                <i class="el-icon-refresh"></i>
            </a>
        </div>
        <div
            id="bar-race-preview"
            ref="chart"
            class="absolute bottom-4 top-14 left-5 right-5 border">
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import * as echarts from 'echarts';

const headerLength = 2;
let chart: echarts.ECharts;

export default defineComponent({
    name: 'BChart',
    props: {
        title: String,
        chartData: Array
    },
    data() {
        return {
            timeoutHandlers: []
        };
    },
    watch: {
        chartData() {
            this.run();
        }
    },
    mounted() {
        chart = echarts.init(this.$refs.chart as HTMLElement);
    },
    methods: {
        run() {
            if (!chart) {
                return;
            }
            const option = {
                dataset: {
                    source: this.chartData
                },
                xAxis: {
                    type: 'value'
                },
                yAxis: {
                    type: 'category',
                    inverse: true,
                    animationDuration: 300,
                    animationDurationUpdate: 300
                },
                series: [{
                    id: 'bar',
                    type: 'bar',
                    encode: {
                        x: 2
                    },
                    seriesLayoutBy: 'row',
                    realtimeSort: true,
                    label: {
                        show: true,
                        position: 'right'
                    }
                }],
                grid: {
                    right: 60
                },
                animationDurationUpdate: 5000,
                animationEasing: 'linear',
                animationEasingUpdate: 'linear'
            };
            chart.setOption(option as echarts.EChartsOption, true);

            const dataCnt = this.chartData.length - headerLength - 1;
            const that = this;
            for (let i = 0; i < dataCnt; ++i) {
                (function (i: number) {
                    let timeout: number;
                    const timeoutCb = function () {
                        chart.setOption({
                            // title: [{
                            //     text: getDataName(i)
                            // }],
                            series: [{
                                type: 'bar',
                                id: 'bar',
                                encode: {
                                    x: i + headerLength + 1
                                }
                            }]
                        });
                        that.removeTimeoutHandlers(timeout);
                    };
                    timeout = window.setTimeout(timeoutCb, i * 5000);
                    that.timeoutHandlers.push(timeout);
                })(i);
            }
        },

        clearTimeoutHandlers() {
            for (let i = 0; i < this.timeoutHandlers.length; ++i) {
                clearTimeout(this.timeoutHandlers[i]);
                this.timeoutHandlers.splice(i, 1);
            }
        },

        removeTimeoutHandlers(handler: number) {
            for (let i = 0; i < this.timeoutHandlers.length; ++i) {
                if (this.timeoutHandlers[i] === handler) {
                    this.timeoutHandlers.splice(i, 1);
                }
            }
        }
    }
})
</script>

<style scoped>
@layer utilities {
}
</style>
