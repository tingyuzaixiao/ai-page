<template>
  <el-dialog :title="t('onlineAnnotation.Statistics')" width="500" v-model="visible" :close-on-click-modal="false"
    draggable>
    <v-chart class="chart" :option="option" autoresize />
  </el-dialog>
</template>

<script setup lang="ts" name="BarEcharts">
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts'; // 导入柱状图组件
import {
  TitleComponent,
  TooltipComponent,
  GridComponent // 通常柱状图需要网格组件
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { ref, provide } from 'vue';
import { getBarData } from '/@/api/annotate/onlinelabel';
import { useMessage } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 注册需要的 ECharts 组件
use([
  CanvasRenderer,
  BarChart, // 使用柱状图
  TitleComponent,
  TooltipComponent,
  GridComponent // 添加网格组件
]);

provide(THEME_KEY, 'light'); // 设置主题，如果需要的话

interface DataItem {
  value: number;
  name: string;
}

const data = ref<DataItem[]>([
  { value: 12, name: '玫瑰' },
  { value: 5, name: '向日葵' },
  { value: 6, name: '蒲公英' },
  { value: 10, name: '康乃馨' },
  { value: 17, name: '雏菊' }
]);

const getData = async (taskId: string) => {
  await getBarData(taskId).then((res) => {
    data.value = res.data;
  }).catch((err) => {
    useMessage().error(err.msg);
  }).finally(() => {
  });
};

const option = ref({
  title: {
    text: '各类别标注情况',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: data.value.map((item) => item.name)
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '个数',
      type: 'bar',
      data: data.value.map((item) => item.value)
    }
  ]
});

const visible = ref(false);

const openDialog = (taskId: string) => {
  visible.value = true;
  // console.log("taskId:", taskId);
  // getData(taskId);
};

defineExpose({
  openDialog
});
</script>

<style scoped>
.chart {
  height: 400px;
  /* 根据需要调整高度 */
}
</style>