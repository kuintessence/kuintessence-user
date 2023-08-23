<template>
  <div id="compute-chart">
    <div class="fit text-grey text-center column justify-center">
      <div>
        <div><q-icon name="inbox" size="34px" /></div>
        <div class="q-pt-xs">没有计算任务</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { echarts } from 'src/boot/echarts';
import { onBeforeUnmount } from 'vue';

let computeChart: any = null;
let themeName: any = null;

const initChart = (data: any) => {
  if (data.lengthList.length > 0) {
    const chartEle = document.getElementById('compute-chart') as HTMLElement;
    if (!chartEle) return;
    computeChart && computeChart.dispose();
    chartEle.removeAttribute('_echarts_instance_');
    computeChart = echarts.init(chartEle, themeName);
    computeChart.setOption({
      grid: {
        top: '30px',
        bottom: '30px',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },
        extraCssText: `
        box-shadow: 0 1px 3px rgb(0 0 0 / 20%), 0 1px 1px rgb(0 0 0 / 14%), 0 2px 1px -1px rgb(0 0 0 / 12%) !important;
        background-color: rgba(255, 255, 255, 0.72) !important;
        backdrop-filter: blur(10px) !important;
        border-radius: 16px;`,
      },
      xAxis: {
        show: false,
        type: 'category',
        boundaryGap: false,
        data: data?.timeList,
      },
      yAxis: {
        show: false,
        type: 'value',
        // boundaryGap: [0, '100%'],
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          name: '计算任务',
          type: 'line',
          smooth: true,
          symbol: 'none',
          // 折线图在数据量远大于像素点时候的降采样策略
          sampling: 'lttb',
          itemStyle: {
            color: 'rgb(84, 112, 198)',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgb(84, 112, 198)',
              },
              {
                offset: 1,
                color: 'rgba(25, 118, 210, 0)',
              },
            ]),
          },
          data: data?.lengthList,
          animation: false,
        },
      ],
    });

    window.addEventListener('resize', function () {
      computeChart.resize();
    });
  }
};

onBeforeUnmount(() => {
  computeChart && computeChart.dispose();
});

defineExpose({
  initChart,
});
</script>

<style lang="scss" scoped>
#compute-chart {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
