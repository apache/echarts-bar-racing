<template>
    <div class="w-full h-full">
        <div class="grid grid-cols-12 h-full text-sm">
            <el-card class="box-card col-span-3 scroll-card">
                <h1 slot="header" class="clearfix text-xl">
                    {{$t('toolName')}}
                    <span id="github-button">
                        <a class="github-button" href="https://github.com/apache/echarts-bar-racing" data-size="large" data-show-count="true" aria-label="Star apache/echarts-bar-racing on GitHub">Star</a>
                    </span>
                </h1>
                <div id="el-config" class="align-middle">
                    <el-form ref="form" :disabled="isExportingVideo">
                        <h2>
                            {{$t('chartConfigs')}}
                        </h2>
                        <el-row>
                            <el-select v-model="selectedDemo"
                                @change="onTitleChanged($event)"
                            >
                                <el-option
                                    value="complicated"
                                    :label="titleComplicated"
                                >
                                </el-option>
                                <el-option
                                    value="simple"
                                    :label="titleSimple"
                                >
                                </el-option>
                                <el-option
                                    value="none"
                                    :label="titleNone"
                                >
                                </el-option>
                            </el-select>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                {{$t('chartTitle')}}
                            </el-col>
                            <el-col :span="12">
                                <el-input
                                    id="input-title"
                                    size="medium"
                                    class="col-span-1"
                                    v-model="title"
                                    @change="runChart"
                                >
                                </el-input>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                {{$t('maxDataCount')}}
                            </el-col>
                            <el-col :span="12">
                                <el-input
                                    id="input-max"
                                    type="number"
                                    value=""
                                    size="medium"
                                    class="col-span-2"
                                    :placeholder="$t('maxDataPlaceholder')"
                                    v-model.number="maxDataCnt"
                                    @change="runChart"
                                >
                                </el-input>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                {{$t('animationDuration')}}
                            </el-col>
                            <el-col :span="12">
                                <el-input
                                    id="input-animation-duration"
                                    type="number"
                                    size="medium"
                                    class="col-span-2"
                                    v-model="animationDuration"
                                    @change="runChart"
                                >
                                </el-input>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                {{$t('reorderDuration')}}
                            </el-col>
                            <el-col :span="12">
                                <el-input
                                    id="input-sort-duration"
                                    type="number"
                                    value="500"
                                    size="medium"
                                    class="col-span-2"
                                    v-model="sortDuration"
                                    @change="runChart"
                                >
                                </el-input>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-button @click="download" type="primary">
                                <i class="el-icon-download"></i>
                                {{$t('download')}}
                            </el-button>
                        </el-row>

                        <el-divider></el-divider>

                        <h2>{{$t('videoConfig')}}</h2>
                        <el-row>
                            <el-col :span="12">
                                {{$t('videoWidth')}}
                            </el-col>
                            <el-col :span="12">
                                <el-input
                                    type="number"
                                    size="medium"
                                    class="col-span-2"
                                    v-model="width"
                                >
                                </el-input>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                {{$t('videoHeight')}}
                            </el-col>
                            <el-col :span="12">
                                <el-input
                                    type="number"
                                    size="medium"
                                    class="col-span-2"
                                    v-model="height"
                                >
                                </el-input>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                {{$t('videoFps')}}
                            </el-col>
                            <el-col :span="12">
                                <el-input
                                    type="number"
                                    size="medium"
                                    class="col-span-2"
                                    v-model="fps"
                                >
                                </el-input>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-button @click="downloadVideo" v-if="isChrome">
                                <i class="el-icon-video-camera"></i>
                                {{$t('generateVideo')}}
                            </el-button>
                            <el-label class="mt-4 text-red-600" v-if="!isChrome">
                                {{$t('videoSupported')}}
                            </el-label>
                        </el-row>
                    </el-form>
                </div>
            </el-card>
            <el-card
                v-if="!isExportingVideo"
                class="box-card col-span-4 relative"
                body-style="height: 100%"
            >
                <BTable
                    ref="btable"
                    :demoData="demoData"
                    @after-change="tableAfterChange"
                />
            </el-card>
            <el-card
                class="box-card relative"
                :class="isExportingVideo ? 'col-span-9' : 'col-span-5'"
                body-style="height: 100%"
            >
                <BChart
                    ref="bchart"
                    :title="title"
                    :chartData="chartData"
                    :maxDataCnt="maxDataCnt"
                    :animationDuration="animationDuration"
                    :sortDuration="sortDuration"
                    @downloadCancelled="downloadCancelled"
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
import fruit from '../data/fruit';
import expectancy from '../data/expectancy';

export default defineComponent({
    name: 'BBody',
    data() {
        const i18n = this.$i18n as any;
        return {
            isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
            selectedDemo: 'complicated',
            demoData: expectancy,
            title: i18n.t('titleComplicated'),
            titleComplicated: i18n.t('titleComplicated'),
            titleSimple: i18n.t('titleSimple'),
            titleNone: i18n.t('titleNone'),
            maxDataCnt: 10,
            chartData: null,
            animationDuration: 3000,
            sortDuration: 300,
            width: 1280,
            height: 720,
            fps: 30,
            videoPercentage: 40,
            isExportingVideo: false
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

        setData(name: 'fruit' | 'expectancy') {
            if (name === 'fruit') {
                this.demoData = fruit;
                this.title = this.titleComplicated;
            } else {
                this.demoData = expectancy;
                this.title = this.titleSimple;
            }
            setTimeout(() => {
                this.$refs.btable.reset();
                this.$refs.bchart.run();
            });
        },

        onTitleChanged(demoName) {
            if (demoName === 'simple') {
                this.demoData = fruit;
                this.title = this.titleSimple;
                this.maxDataCnt = null;
            }
            else if (demoName === 'complicated') {
                this.demoData = expectancy;
                this.title = this.titleComplicated;
                this.maxDataCnt = 10;
            }
            else {
                this.demoData = [[], []];
                this.title = this.titleNone;
                this.maxDataCnt = null;
            }
            setTimeout(() => {
                this.$refs.btable.reset();
                this.$refs.chart
            });
        },

        download() {
            let html = template;
            const map = {
                animationDuration: this.animationDuration,
                maxDataCnt: this.maxDataCnt,
                title: this.title,
                data: (this.$refs.btable as any).getChartData(),
                sortDuration: this.sortDuration
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
            if (!this.width || !this.height) {
                this.$notify.error({
                    title: this.$i18n.t('videSizeError'),
                    message: this.$i18n.t('videSizeErrorHint'),
                    duration: 0,
                    position: 'bottom-left'
                });
                return;
            }

            this.isExportingVideo = true;
            const isSuccess = await (this.$refs.bchart as any).captureVideo(this.width, this.height, this.fps);
            this.isExportingVideo = false;
            if (isSuccess) {
                this.$notify({
                    title: this.$i18n.t('videoSuccess'),
                    type: 'success',
                    duration: 3000,
                    position: 'bottom-left'
                });
            }
            else {
                this.$notify.error({
                    title: this.$i18n.t('videoFail'),
                    message: this.$i18n.t('videoFailHint'),
                    duration: 0,
                    position: 'bottom-left'
                });
            }
        },

        downloadCancelled() {
            this.isExportingVideo = false;
        }
    }
})
</script>

<style scoped>
#github-button {
    float: right;
}

.scroll-card {
    overflow-y: auto;
}

.el-col-12 {
    place-self: center;
}

h1 {
    margin-bottom: 15px;
    font-weight: bold;
    font-size: 1.75rem;
}

h2 {
    margin-bottom: 15px;
    font-size: 1.4rem;
    font-weight: bold;
}

.hint {
    color: #999;
    font-size: 12px;
}

.el-button i {
    display: inline-block;
    margin-right: 2px;
}

@layer utilities {
    .el-row {
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
