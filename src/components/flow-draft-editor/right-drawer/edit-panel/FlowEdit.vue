<!-- 编辑工作流 -->
<template>
  <div class="q-gutter-md q-pl-md q-pr-md q-py-md">
    <div class="input-title">名称</div>
    <q-input v-model="clickFlowData.name" class="q-mt-xs" dense outlined :debounce="300" @blur="checkNull" />
    <div class="input-title q-mt-sm">描述</div>
    <q-input v-model="clickFlowData.description" autogrow class="q-mt-xs" dense outlined :debounce="300" />
    <div class="input-title q-mt-sm">调度策略</div>
    <div class="row q-mt-xs q-gutter-x-sm">
      <NodeStrategySelect
        :schedulingStrategy="clickFlowData.spec?.schedulingStrategy?.type"
        :queues="clickFlowData.spec?.schedulingStrategy?.queues"
        @changeStrategy="changeFlowStrategy"
        @changeClusters="changeFlowClusters"
        class="full-width"
      />
    </div>
    <div class="input-title q-mt-sm">创建时间</div>
    <q-input v-model="formattedCreatedTime" class="q-mt-xs" dense outlined readonly />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUpdated, ref } from 'vue';
import { date } from 'quasar';
import NodeStrategySelect from 'src/components/workflow/NodeStrategySelect.vue';

const props = defineProps({
  flowData: {
    type: Object,
    default() {
      return {};
    },
  },
});
const emit = defineEmits(['changeStrategyType', 'changeStrategyClusters']);

const formattedCreatedTime = computed(() => {
  return date.formatDate(clickFlowData.value.created_time, 'YYYY/MM/DD HH:mm:SS');
});

const clickFlowData = ref<any>({
  name: '',
  description: '',
  spec: {
    type: 'Auto',
  },
});

// 修改工作流资源调度策略
const changeFlowStrategy = (newType: 'Auto' | 'Manual' | 'Prefer' | 'Unknown') => {
  emit('changeStrategyType', 'Flow', newType);
};
// 修改工作流选择的集群
const changeFlowClusters = (newClusters: string[]) => {
  emit('changeStrategyClusters', 'Flow', newClusters);
};
// 检查输入不能为空
const checkNull = () => {
  if (!clickFlowData.value.name) {
    const timeStamp = new Date();
    const formattedString = date.formatDate(timeStamp, 'YYYYMMDD');
    clickFlowData.value.name = '新建草稿' + formattedString;
  }
};

onMounted(() => {
  clickFlowData.value = props.flowData;
});
onUpdated(() => {
  clickFlowData.value = props.flowData;
});
</script>
