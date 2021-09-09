<template>
    <div>
        <div slot="header" class="clearfix text-base">
            {{$t('preview')}}
            <a href="javascript:;" @click="run()">
                <i class="el-icon-refresh"></i>
            </a>
        </div>
        <div
            id="bar-race-preview"
            ref="chart"
            class="absolute bottom-4 top-14 left-5 right-5 border"
            :class="isHidden ? 'hidden' : ''"
        >
        </div>
        <div id="chart-hint" v-if="isHidden">
            视频生成中无法预览
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import * as echarts from 'echarts';
import canvasRecord from 'canvas-record';

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
let time: number;

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
            timeoutHandlers: [],
            isHidden: false
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
            this.doResetChart();
            time = Date.now();
            this.doRun();
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
        },

        captureVideo(width?: number, height?: number): Promise<boolean> {
            return new Promise(resolve => {
                try {
                    this.isHidden = true;
                    this.doResetChart(width, height);
                    const canvas = chart.getDom().children[0].children[0] as HTMLCanvasElement;
                    const recorder = canvasRecord(canvas);
                    time = Date.now();

                    recorder.start();

                    this.doRun(() => {
                        let hasError = false;
                        try {
                            recorder.stop();
                        }
                        catch (e) {
                            console.error(e);
                            hasError = true;
                        }

                        this.isHidden = false;
                        setTimeout(() => {
                            this.run();
                        });
                        resolve(hasError);
                    });
                }
                catch (e) {
                    console.error(e);
                    this.isHidden = false;
                    resolve(false);
                }
            });
        },

        doResetChart(width?: number, height?: number) {
            this.clearTimeoutHandlers();
            if (chart) {
                chart.dispose();
                chart = null;
            }

            if (!this.chartData.length) {
                return;
            }

            chart = echarts.init(this.$refs.chart as HTMLElement, null, {
                width: width || undefined,
                height: height || undefined
            });

            const animationDuration = this.animationDuration;
            const option = {
                backgroundColor: '#fff',
                xAxis: {
                    type: 'value',
                    max: 'dataMax'
                },
                yAxis: {
                    type: 'category',
                    data: (this.chartData[0] as string[]).slice(1),
                    inverse: true,
                    animationDuration: 300,
                    animationDurationUpdate: 300,
                    max: this.maxDataCnt ? this.maxDataCnt - 1 : null
                },
                series: [{
                    id: 'bar',
                    type: 'bar',
                    data: (this.chartData[headerLength] as string[]).slice(1).map(str => parseInt(str, 10)),
                    seriesLayoutBy: 'row',
                    realtimeSort: true,
                    label: {
                        show: true,
                        position: 'right'
                    },
                    itemStyle: {
                        color: (param: any) => {
                            return (this.chartData[1] as string[])[param.dataIndex + 1] || colorAll[param.dataIndex % colorAll.length];
                        }
                    }
                }],
                grid: {
                    right: 60,
                    bottom: 30
                },
                title: [{
                    text: (this.chartData as any)[headerLength][0],
                    right: 20,
                    bottom: 15,
                    textStyle: {
                        color: '#ccc',
                        opacity: 0.3,
                        fontSize: 70
                    }
                }, {
                    text: this.title,
                    left: 10,
                    top: 10
                }],
                animationDuration: 0,
                animationDurationUpdate: animationDuration,
                animationEasing: 'linear',
                animationEasingUpdate: 'linear'
            };
            chart.setOption(option as echarts.EChartsOption, true);
        },

        doRun(onCompleted?: Function) {
            const dataCnt = this.chartData.length - headerLength - 1;
            const that = this;
            for (let i = 0; i < dataCnt; ++i) {
                (function (i: number) {
                    let timeout: number;
                    const timeoutCb = function () {
                        const row = that.chartData[headerLength + i + 1] as string[];
                        chart.setOption({
                            series: [{
                                type: 'bar',
                                id: 'bar',
                                data: row.slice(1).map(str => parseInt(str, 10)),
                                label: {
                                    valueAnimation: true
                                }
                            }],
                            title: [{
                                text: row[0]
                            }]
                        });
                        that.removeTimeoutHandlers(timeout);
                        if (i === dataCnt - 1 && typeof onCompleted === 'function') {
                            setTimeout(onCompleted, that.animationDuration);
                        }
                    };
                    timeout = window.setTimeout(timeoutCb, i * that.animationDuration);
                    that.timeoutHandlers.push(timeout);
                })(i);
            }
        }
    }
})
</script>

<style>
.hidden {
    visibility: hidden;
}

#chart-hint {
    position: absolute;
    top: 55px;
    left: 20px;
    color: #999;
}
</style>
