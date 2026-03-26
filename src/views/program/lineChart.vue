<template>
  <div class="w-full h-full border border-[#e8ecf0] rounded-[4px] px-3 pt-3 pb-2" ref="lineChart">
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';

const props = defineProps({
  // 父组件传递的原始数据
  chartData: {
    type: Object,
    required: true,
    // 结构：{ title, legend, steps, series }
  },
});

//储存Echart的ref
const lineChart = ref();
let chartInstance: any = null;

onMounted(() => {
  nextTick(() => {
    initLineChart();
  })
});

onUnmounted(() => {
  if (chartInstance != null && chartInstance.dispose) {
    chartInstance.dispose();
  }
});

// 组装 ECharts option
const getOption = () => {
  const { title, legend, steps, series } = props.chartData || {};
  return {
    title: {
      text: title || 'Accuracy',
      left: 'left',
      textStyle: {
        fontWeight: 'bold',
        color: '#222',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any[]) {
        if (!params || !params.length) return '';
        let html = `step：${params[0].name}<br/>`;
        params.forEach(item => {
          // item.marker 是带颜色的 symbol html
          html += `${item.marker} <span style="color:${item.color};font-weight:bold">${item.seriesName}</span>：${item.value}<br/>`;
        });
        return html;
      }
    },
    legend: {
      data: legend || [],
      bottom: 0,
      left: 0,
      icon: 'rect',
      textStyle: {
        color: '#222',
        fontWeight: 'bold'
      }
    },
    grid: {
      left: '0',
      right: '30',
      bottom: '75', // 增大底部空间，防止与横坐标名称重叠
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: 'category',
      data: steps || [],
      name: 'step', // 横坐标名称
      nameLocation: 'middle', // 名称居中
      nameGap: 40, // 名称距离坐标轴的距离
      nameTextStyle: {
        fontWeight: 'bold',
        color: '#222',
        fontSize: '24px'
      },
      axisLine: {
        show: false // 隐藏横坐标轴
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: true,
        margin: 16, // 刻度与轴线距离，保证在辅助线下方
        color: '#222',
        fontWeight: 'bold',
      },
      splitLine: {
        show: true, // 显示横坐标辅助线
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed',
        }
      },
      minorSplitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed',
        }
      },
    },
    yAxis: {
      type: 'value',
      name: '', // 纵坐标名称
      nameTextStyle: {
        fontWeight: 'bold',
        color: '#222',
      },
      axisLine: {
        show: true, // 显示纵坐标轴
        lineStyle: {
          color: '#222',
          width: 2,
        }
      },
      axisTick: {
        show: true
      },
      axisLabel: {
        color: '#222',
        fontWeight: 'bold',
      },
      splitLine: {
        show: true, // 显示纵坐标辅助线
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed',
        }
      },
    },
    series: (series || []).map((item: { name: string; data: any }) => ({
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      emphasis: {
        scale: 2
      }
    })),
  };
};

// 初始化折线图表函数
const initLineChart = () => {
  const chartDom = lineChart.value;
  if (!chartDom) return;
  chartInstance = echarts.init(chartDom);
  chartInstance.setOption(getOption());
};


const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};


defineExpose({
  initLineChart,
  resizeChart
});

// 监听 chartData 变化自动渲染
watch(() => props.chartData, () => {
  if (chartInstance) {
    chartInstance.setOption(getOption(), true);
  }
}, { deep: true });
</script>