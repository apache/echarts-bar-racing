import * as $ from 'jquery';
import Handsontable from 'handsontable';
import * as echarts from 'echarts';

const headerLength = 2;

let chart: echarts.ECharts;
const data = [
    ["Name", "Ford", "Tesla", "Toyota", "Honda"],
    ["Color", "", "", "", ""],
    ["2017", 10, 11, 12, 13],
    ["2018", 20, 11, 14, 13],
    ["2019", 30, 15, 12, 13]
];

function initTable() {
    for (let i = 0; i < data.length; ++i) {
        for (let j = data[i].length; j < 50; ++j) {
            data[i].push('');
        }
    }
    for (let i = data.length; i < 100; ++i) {
        const row = [];
        for (let j = 0; j < 50; ++j) {
            row.push('');
        }
        data.push(row);
    }

    // function colorRenderer(instance, td, row, col) {
    //     //- console.log(instance);

    // }

    const container = document.getElementById('table-panel') as Element;
    console.log(container)

    const table = new Handsontable(container, {
        data: data,
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
    table.updateSettings({
        afterChange: function () {
            run();
        }
    });

    chart = echarts.init($('#bar-race-preview')[0]);
    run();
}

const timeoutHandlers: number[] = [];

function clearTimeoutHandlers() {
    for (let i = 0; i < timeoutHandlers.length; ++i) {
        clearTimeout(timeoutHandlers[i]);
        timeoutHandlers.splice(i, 1);
    }
}
function removeTimeoutHandlers(handler: number) {
    for (let i = 0; i < timeoutHandlers.length; ++i) {
        if (timeoutHandlers[i] === handler) {
            timeoutHandlers.splice(i, 1);
        }
    }
}

function initEvents() {
    $('.form-group').change(function () {
        run();
    });
}


function run() {
    clearTimeoutHandlers();

    const title = $('#input-title').val();
    const max = $('#input-max').val();
    chart.setOption({
        title: [{
            text: getDataName(0),
            textStyle: {
                fontFamily: 'monospace',
                fontSize: 80,
                color: 'rgba(100, 100, 100, 0.2)'
            },
            bottom: 60,
            right: 20
        }, {
            text: title
        }],
        grid: {
            right: 20
        },
        yAxis: {
            type: 'category',
            data: getYData(),
            inverse: true,
            max: max,
            animationDuration: 0,
            animationDurationUpdate: 0
        },
        xAxis: {},
        series: [{
            type: 'bar',
            data: getChartData(0),
            realtimeSort: true,
            colorBy: 'item',
            label: {
                show: true,
                position: 'insideRight'
            }
        }],
        animationDurationUpdate: 5000,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear'
    }, true);

    const rows = trimRows();
    for (let i = 1; i < rows.length; ++i) {
        (function (i) {
            var dataRow = getChartData(i);
            let timeout: number;
            const timeoutCb = function () {
                chart.setOption({
                    title: [{
                        text: getDataName(i)
                    }],
                    yAxis: {
                        animationDuration: 300,
                        animationDurationUpdate: 300,
                    },
                    series: [{
                        type: 'bar',
                        data: dataRow
                    }]
                });
                removeTimeoutHandlers(timeout);
            };
            timeout = window.setTimeout(timeoutCb, (i - 1) * 5000);
            timeoutHandlers.push(timeout);
        })(i);
    }
}

const trimColumns = function (rowData: (string | number)[]) {
    for (let i = rowData.length - 1; i > 0; --i) {
        if (rowData[i] && rowData[i] !== '') {
            return rowData.slice(1, i + 1);
        }
    }
    return [];
};

const trimRows = function () {
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
};

const getYData = function () {
    if (data.length <= headerLength) {
        return [];
    }
    return trimColumns(data[0]);
};

const getChartData = function (id: number) {
    if (data.length <= id + headerLength) {
        return [];
    }
    return trimColumns(data[id + headerLength]);
};

const getDataName = function (id: number) {
    if (data.length <= id + headerLength) {
        return '';
    }
    else {
        return data[id + headerLength][0];
    }
}

function download() {
    // saveFile()
}

function saveFile(name: string, type: string) {
    // if (isSafari()) {
    //     window.open('data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    // } else {
    //     try {
    //         var file = new Blob([data], {type: type});
    //         saveAs(file, name);
    //     } catch(e) {
    //         console.error(e);
    //         window.open('data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    //     }
    // }
}

function isSafari() {
    return navigator.userAgent.indexOf('Safari') > 0 &&
        navigator.userAgent.indexOf('Chrome') < 0;
}

export default {initTable};
