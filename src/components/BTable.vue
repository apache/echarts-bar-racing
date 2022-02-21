<template>
    <div>
        <div slot='header' class='clearfix text-base'>
            {{$t('data')}}
        </div>
        <div ref='table' id='table-panel' class='overflow-auto absolute bottom-4 top-16 left-5 right-5 border'>
        </div>
    </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue';
import {debounce} from 'lodash';
import Color from 'color';

declare const Handsontable;
import handsomeZh from '../i18n/handsometable-zh-CN';
Handsontable.languages.registerLanguageDictionary(handsomeZh);

const headerLength = 2;
export type ChartData = string[][];

function colorRenderer(instance, td, row, col, prop, value) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    if (col === 0 || value === '' || !value) {
        return td;
    }
    try {
        Color(value);
        td.innerHTML = `<div style="width: 14px; height: 14px; display: inline-block; margin-right: 5px; margin-top: 5px; border-radius: 50%; background-color:${value}"></div><div style="display: inline-block; position: relative; top: -2px;">${value}</div>`;
    }
    catch (e) {
        console.error(e);
    }
    return td;
}

let table;
let debouncedTableChange: _.DebouncedFunc<() => void>;

export default defineComponent({
    name: 'BTable',
    props: {
        demoData: Array
    },
    data() {
        return {
            tableData: [[]],
            debouncedTableChange: null
        }
    },
    mounted() {
        this.reset();

        debouncedTableChange = debounce(() => {
            this.$emit('afterChange', this.getChartData());
        }, 500);

        this.$emit('afterChange', this.getChartData());
    },
    unmounted() {
        debouncedTableChange?.cancel();
    },
    methods: {
        setRawData() {
            this.tableData = this.demoData && this.demoData.length
                ? [
                    // @ts-ignore:
                    this.demoData[0].map(name => name ? this.$i18n.t(name) : ''),
                    // @ts-ignore:
                    [this.$i18n.t('color')].concat(this.demoData.length > 2 ? this.demoData[1].slice(1) : [])
                ].concat(this.demoData.slice(2))
                : [];
        },

        reset() {
            this.setRawData();
            this.insertEmptyCells();

            table && (table.destroy());
            table = new Handsontable(this.$refs.table as Element, {
                data: this.tableData,
                rowHeaders: true,
                colHeaders: true,
                filters: true,
                dropdownMenu: true,
                contextMenu: true,
                language: this.$i18n.t('lang'),
                cell: [{
                    row: 0,
                    col: 0,
                    readOnly: true
                }, {
                    row: 1,
                    col: 0,
                    readOnly: true,
                    data: 'Color'
                }],
                cells: function (row, col) {
                    if (row === 1) {
                        return {
                            renderer: colorRenderer
                        };
                    }
                    else {
                        return {};
                    }
                }
            });
            table.updateSettings({
                afterChange: () => {
                    debouncedTableChange();
                }
            }, true);

            this.$emit('afterChange', this.getChartData());
        },

        getChartData(): ChartData {
            let columns = 0;
            const firstRow = this.tableData[0];
            for (let i = 1; i < firstRow.length; ++i) {
                if (!firstRow[i] || !firstRow[i].trim()) {
                    columns = i;
                    break;
                }
            }

            let rows = headerLength;
            for (let i = headerLength; i < this.tableData.length; ++i) {
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
