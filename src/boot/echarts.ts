import { boot } from 'quasar/wrappers';

import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { BarChart, GaugeChart, PieChart, LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  GaugeChart,
  PieChart,
  LineChart,
  UniversalTransition,
  LabelLayout,
  CanvasRenderer,
]);

export default boot(({ app }) => {
  app.config.globalProperties.$echarts = echarts;
});

export { echarts };
