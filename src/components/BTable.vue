<template>
    <div class="w-full h-full">
        <div class="grid grid-cols-3 h-full">
            <div id="el-table" class="col-span-2 h-full" style="border: 1px solid red;"></div>
            <div id="el-config" class="p-3 align-middle">
                <div>
                    <el-button type="button" onclick="run()" size="medium">运行</el-button>
                    <el-button type="button" size="medium">导出</el-button>
                </div>
                <el-form ref="form">
                    <div class="grid grid-cols-2 form-row">
                        <label>标题</label>
                        <el-input id="input-title" value="汽车产量动态排名" size="medium"></el-input>
                    </div>
                    <div class="grid grid-cols-2 form-row">
                        <label>显示排名上限</label>
                        <el-input id="input-max" type="number" value="10" size="medium"></el-input>
                    </div>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
export default defineComponent({
    name: 'BTable',
    props: {
    },
    setup: () => {
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
}
</style>
