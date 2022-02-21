<template>
    <div>
        <div slot="header" class="clearfix text-base" v-if="!isExportingVideo">
            {{$t('preview')}}
            <a href="javascript:;" @click="run()">
                <i class="el-icon-refresh"></i>
            </a>
        </div>
        <div slot="header" class="clearfix text-base" v-if="isExportingVideo">
            <i class="el-icon-loading"></i>
            {{$t('exporting')}}
            <el-button @click="cancelDownload()" >
                {{$t('cancel')}}
            </el-button>
        </div>
        <div
            id="bar-race-preview"
            ref="chart"
            class="absolute bottom-4 top-16 left-5 right-5 border"
            :class="isExportingVideo ? 'top-28' : ''"
        >
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import * as timeline from '../helper/timeline';
import * as echarts from 'echarts';
import WebMWriter from 'webm-writer';

const headerLength = 2;
let chart: echarts.ECharts;
let recorder;

export default defineComponent({
    name: 'BChart',
    props: {
        title: String,
        chartData: Array,
        maxDataCnt: Number,
        animationDuration: Number,
        sortDuration: Number
    },
    data() {
        return {
            timeoutHandlers: [],
            isExportingVideo: false
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

        captureVideo(width: number, height: number, fps: number): Promise<boolean> {
            return new Promise(resolve => {
                try {
                    this.isExportingVideo = true;
                    this.doResetChart(width, height, 1);
                    const container = chart.getDom();
                    const canvas = container.children[0].children[0] as HTMLCanvasElement;
                    if (container.clientHeight) {
                        if (container.clientWidth / container.clientHeight > width / height) {
                            canvas.style.height = container.clientHeight + 'px';
                            canvas.style.width = container.clientHeight / height * width + 'px';
                        }
                        else {
                            canvas.style.width = container.clientWidth + 'px';
                            canvas.style.height = container.clientWidth / width * height + 'px';
                        }
                    }

                    recorder = new WebMWriter({
                        frameRate: fps || 30,
                        transparent: true
                    });

                    timeline.setFixedFrameRate(fps);
                    timeline.onMockFaq(elapsed => {
                        recorder.addFrame(canvas, elapsed);
                    });
                    timeline.startMock();

                    const title = this.title || this.$t('toolName') || 'bar-racing';

                    this.doRun(() => {
                        let hasError = false;
                        try {
                            recorder.complete()
                                .then(function(webMBlob) {
                                    const url = URL.createObjectURL(webMBlob);
                                    const link = document.createElement('a');
                                    link.download = title;
                                    link.href = url;
                                    const event = new MouseEvent('click');
                                    link.dispatchEvent(event);
                                    setTimeout(() => {
                                        URL.revokeObjectURL(url);
                                    }, 1);
                                });
                        }
                        catch (e) {
                            console.error(e);
                            hasError = true;
                        }

                        timeline.stopMock();
                        this.isExportingVideo = false;
                        setTimeout(() => {
                            this.run();
                            resolve(!hasError);
                        });
                    });
                }
                catch (e) {
                    console.error(e);
                    this.isExportingVideo = false;
                    resolve(false);
                }
            });
        },

        cancelDownload() {
            if (recorder) {
                recorder.complete();
                recorder = null;
            }

            timeline.stopMock();
            this.isExportingVideo = false;
            setTimeout(() => {
                this.run();
            });
            this.$emit('downloadCancelled');
        },

        doResetChart(width?: number, height?: number, dpr?: number) {
            this.clearTimeoutHandlers();
            if (chart) {
                chart.dispose();
                chart = null;
            }

            chart = echarts.init(this.$refs.chart as HTMLElement, null, {
                width: width || undefined,
                height: height || undefined,
                devicePixelRatio: dpr
            });

            if (!this.chartData || this.chartData.length < headerLength) {
                return;
            }

            const animationDuration = this.animationDuration;
            try {
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
                        animationDuration: this.sortDuration || 300,
                        animationDurationUpdate: this.sortDuration || 300,
                        max: this.maxDataCnt ? this.maxDataCnt - 1 : null
                    },
                    color: this.chartData[1].length > 1 ? this.chartData[1].slice(1) : null,
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
                        colorBy: 'item'
                    }],
                    grid: {
                        right: 60,
                        bottom: 30,
                        left: 110
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
            }
            catch (e) {}
        },

        doRun(onCompleted?: Function) {
            if (!this.chartData || this.chartData.length < headerLength) {
                return;
            }
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
                                },
                                silent: this.isExportingVideo
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
