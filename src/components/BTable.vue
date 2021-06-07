<template>
    <div class="w-full h-full">
        <div class="grid grid-cols-12 h-full text-sm">
            <el-card class="box-card col-span-3">
                <h1 slot="header" class="clearfix text-xl">
                    Apache ECharts Bar-Race 生成器
                </h1>
                <div id="el-config" class="align-middle">
                    <!-- <div class="my-3">
                        <el-button onclick="run()" size="medium">运行</el-button>
                        <el-button size="medium">导出</el-button>
                    </div> -->
                    <el-form ref="form">
                        <div class="grid grid-cols-3 form-row">
                            <label class="col-span-1">标题</label>
                            <el-input id="input-title" value="汽车产量动态排名" size="medium" class="col-span-2"></el-input>
                        </div>
                        <div class="grid grid-cols-3 form-row">
                            <label class="col-span-1">显示排名上限</label>
                            <el-input id="input-max" type="number" value="10" size="medium" class="col-span-2"></el-input>
                        </div>
                    </el-form>
                </div>
            </el-card>
            <el-card class="box-card col-span-4 relative" body-style="height: 100%">
                <div slot="header" class="clearfix text-base">
                    数据
                </div>
                <div id="table-panel" class="overflow-auto absolute bottom-4 top-14 left-5 right-5 border">
                </div>
            </el-card>
            <el-card class="box-card col-span-5 relative" body-style="height: 100%">
                <div slot="header" class="clearfix text-base">
                    预览
                    <a href="#">
                        <i class="el-icon-refresh"></i>
                    </a>
                </div>
                <div id="bar-race-preview" class="absolute bottom-4 top-14 left-5 right-5 border">
                </div>
            </el-card>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import btable from './btable';

export default defineComponent({
    name: 'BTable',
    props: {
    },
    mounted: () => {
        btable.initTable();
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
