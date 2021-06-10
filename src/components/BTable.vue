<template>
    <div>
        <div slot='header' class='clearfix text-base'>
            数据
        </div>
        <div ref='table' id='table-panel' class='overflow-auto absolute bottom-4 top-14 left-5 right-5 border'>
        </div>
    </div>
</template>

<script lang='ts'>
import Handsontable from 'handsontable';
import {defineComponent} from 'vue';
import * as _ from 'lodash';

const headerLength = 2;
export type ChartData = string[][];

export default defineComponent({
    name: 'BTable',
    props: {
    },
    data() {
        return {
            tableData: [
                ['Name', 'Ford', 'Tesla', 'Toyota', 'Honda'],
                ['Color', '', '', '', ''],
                ['2017', '10', '11', '12', '13'],
                ['2018', '20', '11', '14', '13'],
                ['2019', '30', '15', '12', '13']
            ],
            table: null,
            debouncedTableChange: null
        }
    },
    mounted() {
        this.insertEmptyCells();
        this.table = new Handsontable(this.$refs.table as Element, {
            data: this.tableData,
            rowHeaders: true,
            colHeaders: true,
            filters: true,
            dropdownMenu: true,
            // cell: [{
            //     row: 0,
            //     col: 0,
            //     readOnly: true
            // }, {
            //     row: 1,
            //     col: 0,
            //     readOnly: true
            // }],
            //- cells: function (row, col) {
            //-     if (row === 1) {
            //-         return {
            //-             renderer: colorRenderer
            //-         }
            //-     }
            //-     else {
            //-         return {};
            //-     }
            //- }
        });
        this.table.updateSettings({
            afterChange: () => {
                console.log('after')
                this.debouncedTableChange();
            }
        });

        this.debouncedTableChange = _.debounce(() => {
            this.$emit('afterChange', this.getChartData());
        }, 500);

        this.$emit('afterChange', this.getChartData());
    },
    unmounted() {
        this.debouncedTableChange.cancel();
    },
    methods: {
        getChartData(): ChartData {
            let columns = 0;
            const firstRow = this.tableData[0];
            for (let i = 0; i < firstRow.length; ++i) {
                if (!firstRow[i] || !firstRow[i].trim()) {
                    columns = i;
                    break;
                }
            }

            let rows = 0;
            for (let i = 0; i < this.tableData.length; ++i) {
                if (!this.tableData[i] || !this.tableData[i][0] || !this.tableData[i][0]) {
                    rows = i;
                    break;
                }
            }

            return this.tableData.slice(0, rows)
                .map(row => row.slice(0, columns));
        },

        insertEmptyCells() {
            for (let i = 0; i < this.tableData.length; ++i) {
                for (let j = this.tableData[i].length; j < 50; ++j) {
                    this.tableData[i].push('');
                }
            }
            for (let i = this.tableData.length; i < 100; ++i) {
                const row = [];
                for (let j = 0; j < 50; ++j) {
                    row.push('');
                }
                this.tableData.push(row);
            }
        },

        trimColumns(rowData: (string | number)[]) {
            for (let i = rowData.length - 1; i > 0; --i) {
                if (rowData[i] && rowData[i] !== '') {
                    return rowData.slice(1, i + 1);
                }
            }
            return [];
        },

        trimRows() {
            const data = this.tableData;
            if (data.length <= headerLength) {
                return [];
            }
            for (let i = data.length - 1; i >= headerLength; --i) {
                let isEmpty = true;
                for (let j = 1; j < data[i].length; ++j) {
                    if (data[i][j] && data[i][j] !== '') {
                        isEmpty = false;
                        break;
                    }
                }
                if (!isEmpty) {
                    return data.slice(headerLength, i + 1);
                }
            }
            return [];
        },

        getYData() {
            if (this.tableData.length <= headerLength) {
                return [];
            }
            return this.trimColumns(this.tableData[0]);
        },

        getSeriesData(id: number) {
            if (this.tableData.length <= id + headerLength) {
                return [];
            }
            return this.trimColumns(this.tableData[id + headerLength]);
        },

        getDataName(id: number) {
            if (this.tableData.length <= id + headerLength) {
                return '';
            }
            else {
                return this.tableData[id + headerLength][0];
            }
        }
    }
})
</script>

<style scoped>
@layer utilities {
}
</style>
