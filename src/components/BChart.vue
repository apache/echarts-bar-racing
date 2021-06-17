<template>
    <div>
        <div slot="header" class="clearfix text-base">
            预览
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

const colorAll = [
    '#5470c6',
    '#91cc75',
    '#fac858',
    '#ee6666',
    '#73c0de',
    '#3ba272',
    '#fc8452',
    '#9a60b4',
    '#ea7ccc'
];
const headerLength = 2;
let chart: echarts.ECharts;

export default defineComponent({
    name: 'BChart',
    props: {
        title: String,
        chartData: Array,
        maxDataCnt: Number,
        animationDuration: Number
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
    },
    methods: {
        run() {
            this.clearTimeoutHandlers();
            if (chart) {
                chart.dispose();
            }

            chart = echarts.init(this.$refs.chart as HTMLElement);
            const animationDuration = this.animationDuration || 5000;

            const option = {
                dataset: {
                    source: this.chartData
                },
                xAxis: {
                    type: 'value',
                    max: 'dataMax'
                },
                yAxis: {
                    type: 'category',
                    inverse: true,
                    animationDuration: 300,
                    animationDurationUpdate: 300,
                    max: this.maxDataCnt ? this.maxDataCnt - 1 : null
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
                        position: 'right',
                        valueAnimation: true
                    },
                    itemStyle: {
                        color: param => {
                            return param.data[1] || colorAll[param.dataIndex % colorAll.length];
                        }
                    }
                }],
                grid: {
                    right: 60
                },
                title: {
                    text: this.title,
                    left: 10,
                    top: 10
                },
                animationDuration: 0,
                animationDurationUpdate: animationDuration,
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
                    timeout = window.setTimeout(timeoutCb, i * animationDuration);
                    that.timeoutHandlers.push(timeout);
                })(i);
            }
        },

        clearTimeoutHandlers() {
            for (let i = 0; i < this.timeoutHandlers.length; ++i) {
                clearTimeout(this.timeoutHandlers[i]);
            }
            this.timeoutHandlers = [];
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
