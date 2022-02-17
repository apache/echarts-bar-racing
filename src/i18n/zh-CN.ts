import langEn from './en-US';

type DEFAULT_LANG_TYPE = typeof langEn;

const langCn: DEFAULT_LANG_TYPE = {
    lang: 'zh-CN',
    toolName: '动态排序柱状图生成器',
    chartTitle: '图表标题',
    titleNone: '空数据',
    titleSimple: '简单的例子',
    titleComplicated: '复杂的例子',
    maxDataCount: '排名上限',
    animationDuration: '动画时长（毫秒）',
    download: '下载',
    data: '数据',
    color: '颜色',
    blueberry: '蓝莓',
    banana: '香蕉',
    kiwi: '猕猴桃',
    watermelon: '西瓜',
    preview: '预览',
    exporting: '视频正在导出中'
};

export default langCn;