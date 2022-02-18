export default `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Apache ECharts Bar Racing</title>

    <style>
        #chart {
            width: 100%;
            height: 500px;
            border: 1px solid #ddd;
        }
    </style>

    <script src="https://cdn.jsdelivr.net/npm/echarts@5.1.2/dist/echarts.js"></script>
</head>
<body>
    <div id="chart"></div>

    <script>
        var colorAll = [
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
        var headerLength = 2;

        var animationDuration = {{animationDuration}};
        var sortDuration = {{sortDuration}};
        var maxDataCnt = {{maxDataCnt}};
        var title = {{title}};
        var data = {{data}};

        var chart;
        var timeoutHandlers = [];

        run();

        function run() {
            clearTimeoutHandlers();
            if (chart) {
                chart.dispose();
            }

            chart = echarts.init(document.getElementById('chart'));
            var option = {
                xAxis: {
                    type: 'value',
                    max: 'dataMax'
                },
                yAxis: {
                    type: 'category',
                    data: data[0].slice(1),
                    inverse: true,
                    animationDuration: sortDuration,
                    animationDurationUpdate: sortDuration,
                    max: maxDataCnt ? maxDataCnt - 1 : null
                },
                series: [{
                    id: 'bar',
                    type: 'bar',
                    data: getDataLine(0),
                    seriesLayoutBy: 'row',
                    realtimeSort: true,
                    label: {
                        show: true,
                        position: 'right'
                    },
                    itemStyle: {
                        color: function (param) {
                            return data[1][param.dataIndex + 1] || colorAll[param.dataIndex % colorAll.length];
                        }
                    }
                }],
                grid: {
                    right: 60,
                    bottom: 30,
                    left: 110
                },
                title: [{
                    text: data[headerLength][0],
                    right: 20,
                    bottom: 15,
                    textStyle: {
                        color: '#ccc',
                        opacity: 0.3,
                        fontSize: 70
                    }
                }, {
                    text: title,
                    left: 10,
                    top: 10
                }],
                animationDuration: 0,
                animationDurationUpdate: animationDuration,
                animationEasing: 'linear',
                animationEasingUpdate: 'linear'
            };
            chart.setOption(option, true);

            var dataCnt = data.length - headerLength - 1;
            for (var i = 0; i < dataCnt; ++i) {
                (function (i) {
                    var timeout;
                    var timeoutCb = function () {
                        chart.setOption({
                            series: [{
                                type: 'bar',
                                id: 'bar',
                                data: getDataLine(i + 1),
                                label: {
                                    valueAnimation: true
                                }
                            }],
                            title: [{
                                text: data[headerLength + i + 1][0]
                            }]
                        });
                        removeTimeoutHandlers(timeout);
                    };
                    timeout = window.setTimeout(timeoutCb, i * animationDuration);
                    timeoutHandlers.push(timeout);
                })(i);
            }
        }

        function getDataLine(n) {
            return data[headerLength + n].slice(1).map(function (n) {
                return parseInt(n, 10);
            });
        }

        function clearTimeoutHandlers() {
            for (let i = 0; i < timeoutHandlers.length; ++i) {
                clearTimeout(timeoutHandlers[i]);
            }
            timeoutHandlers = [];
        }

        function removeTimeoutHandlers(handler) {
            for (let i = 0; i < timeoutHandlers.length; ++i) {
                if (timeoutHandlers[i] === handler) {
                    timeoutHandlers.splice(i, 1);
                }
            }
        }
    </script>
</body>
</html>
`;
