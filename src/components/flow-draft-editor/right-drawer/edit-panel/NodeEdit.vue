<!-- 编辑节点 -->
<template>
  <div class="q-gutter-md q-pl-md q-pr-md q-py-md">
    <div class="input-title">名称</div>
    <q-input v-model="clickNodeData.name" class="q-mt-xs" dense outlined :debounce="300" @blur="checkNull" />
    <div class="input-title q-mt-sm">描述</div>
    <q-input v-model="clickNodeData.description" autogrow class="q-mt-xs" dense outlined :debounce="300" />
    <div class="q-mt-sm q-ml-md row" style="line-height: 2.5rem">
      <q-toggle v-model="clickNodeData.isBatch" color="primary" dense class="q-mr-sm" />
      指定为高通量节点
    </div>
    <q-btn
      v-if="clickNodeData.batchStrategies ?? '' !== ''"
      class="full-width q-mt-none"
      color="secondary"
      dense
      flat
      icon="list"
      label="查看子任务详情"
      disable
    />

    <q-expansion-item
      expand-separator
      label="数据配置"
      class="q-mt-sm full-width q-mb-md"
      header-class="text-weight-medium"
      style="margin-left: 1.25rem"
      dense
      switch-toggle-side
    >
      <div class="q-px-md q-pb-md">
        <div class="q-mt-sm q-pl-xs text-weight-medium row">任务输入</div>
        <input-slot-view
          ref="inputSlotViewRef"
          class="q-mt-sm"
          :draftId="flowData.id"
          :autoUpload="autoUpload"
          :nodeIsBatch="clickNodeData.isBatch"
          :slotData="item"
          v-for="(item, itemIndex) in clickNodeData.inputSlots"
          :key="itemIndex"
        />
        <div class="text-grey-7 text-center" v-if="clickNodeData.inputSlots.length === 0">
          <div>任务输入为空</div>
        </div>
        <div class="q-mt-sm q-pl-xs text-weight-medium row">任务输出</div>
        <q-card
          v-for="(slot, index) in clickNodeData.outputSlots"
          :key="index"
          class="dialog-card q-mt-sm"
          style="border-radius: 8px !important"
          flat
        >
          <q-item class="q-px-none q-py-sm">
            <q-item-section>
              <q-item-label class="text-body2 ellipsis"> 文件：{{ slot.fileName ? slot.fileName : '-' }} </q-item-label>
              <q-item-label class="text-body2 ellipsis-2-lines text-grey q-pt-xs" v-if="slot.description">
                描述：{{ slot.description }}
              </q-item-label>
              <q-item-label class="text-body2 ellipsis text-grey q-pt-xs">
                类型：{{ slot.type === 'File' ? '文件' : slot.type === 'Text' ? '文本' : '待定' }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon
                :name="slot.type === 'File' ? 'description' : slot.type === 'Text' ? 'notes' : 'question_mark'"
                size="30px"
                class="text-grey"
              />
            </q-item-section>
          </q-item>
        </q-card>
        <div class="text-grey-7 text-center" v-if="clickNodeData.outputSlots.length === 0">
          <div>任务输出为空</div>
        </div>
      </div>
    </q-expansion-item>

    <div class="input-title q-mt-sm">调度策略</div>
    <div class="row q-mt-xs q-gutter-x-sm">
      <NodeStrategySelect
        :schedulingStrategy="clickNodeData.schedulingStrategy?.type"
        :queues="clickNodeData.schedulingStrategy?.queues"
        @changeStrategy="changeStrategy"
        @changeClusters="changeClusters"
        class="full-width"
      />
    </div>

    <div class="row q-mt-sm" style="line-height: 2.5rem">
      <q-toggle v-model="openNotify" disable dense />
      <span class="q-pl-sm q-pr-xs">排队达</span>
      <span class="cursor-pointer" style="text-decoration: underline">
        {{ notifyMinutes }}
        <q-popup-edit v-model="notifyMinutes" auto-save>
          <q-input v-model="notifyMinutes" autofocus dense max="99" min="1" type="number" :debounce="300" />
        </q-popup-edit>
      </span>
      <span class="q-pl-xs q-px-none">分钟通知我</span>
    </div>

    <q-expansion-item
      expand-separator
      label="详细配置"
      class="q-mt-sm full-width"
      header-class="text-weight-medium"
      style="margin-left: 1.25rem"
      dense
      switch-toggle-side
    >
      <div class="q-px-md q-pb-md">
        <div class="q-mt-sm q-pl-xs text-weight-medium row">
          <div class="col-6 q-pr-xs">核心数</div>
          <div class="col-6 q-pl-xs">节点数</div>
        </div>
        <div class="row q-mt-xs">
          <div class="col-6 q-pr-xs">
            <q-input
              type="number"
              v-model.number="clickNodeData.requirements.cpuCores"
              @update:model-value="checkNum"
              class="q-mt-xs"
              dense
              outlined
              :debounce="300"
            />
          </div>
          <div class="col-6 q-pl-xs">
            <q-input
              type="number"
              v-model.number="clickNodeData.requirements.nodeCount"
              @update:model-value="checkNum"
              class="q-mt-xs"
              dense
              outlined
              :debounce="300"
            />
          </div>
        </div>
        <div class="q-mt-sm q-pl-xs text-weight-medium row">
          <div class="col-6 q-pr-xs">最长运行时间(h)</div>
          <div class="col-6 q-pl-xs">最大核时消耗(h)</div>
        </div>
        <div class="row q-mt-xs">
          <div class="col-6 q-pr-xs">
            <q-input
              type="number"
              v-model.number="clickNodeData.requirements.maxWallTime"
              @update:model-value="checkNum"
              class="q-mt-xs"
              dense
              outlined
              :debounce="300"
            />
          </div>
          <div class="col-6 q-pl-xs">
            <q-input
              type="number"
              v-model.number="clickNodeData.requirements.maxCpuTime"
              @update:model-value="checkNum"
              class="q-mt-xs"
              dense
              outlined
              :debounce="300"
            />
          </div>
        </div>
      </div>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Node as X6Node } from '@antv/x6';
import NodeStrategySelect from 'src/components/workflow/NodeStrategySelect.vue';
import InputSlotView from '../../input-slot/InputView.vue';
import { SlotData, InputSlotKind } from 'src/service/workflow-slot';

const props = defineProps({
  clickNode: {
    type: X6Node,
  },
  autoUpload: {
    type: Boolean,
    default: false,
  },
  flowData: {
    type: Object,
    default() {
      return {
        id: '',
      };
    },
  },
});
const emit = defineEmits(['changeStrategyType', 'changeStrategyClusters']);

const inputSlotViewRef = ref();
// 选中节点数据
const clickNodeData = ref<any>({
  additionalDatas: {},
  batchStrategies: null,
  inputSlots: [],
  isBatch: false,
  name: '',
  outputSlots: [],
  requirements: {
    cpuCores: 56,
    nodeCount: 0,
    maxWallTime: 0,
    maxCpuTime: 0,
    stopTime: new Date(),
  },
});
// TODO: 排队信息和预估时间/费用
const openNotify = ref(false);
const notifyMinutes = ref(10);

// 修改节点资源调度策略
const changeStrategy = (newType: 'Auto' | 'Manual' | 'Prefer' | 'Unknown') => {
  emit('changeStrategyType', 'Node', newType);
};
// 修改节点选择的集群
const changeClusters = (newClusters: string[]) => {
  emit('changeStrategyClusters', 'Node', newClusters);
};
// 省略小数
const roundDown = (num: number) => {
  if (String(num).indexOf('.') < 1) return num;
  else return Number(String(num).slice(0, String(num).indexOf('.')));
};
// 检查输入框数据
const checkNum = () => {
  if (clickNodeData.value.requirements.cpuCores < 0) clickNodeData.value.requirements.cpuCores = 0;
  else if (clickNodeData.value.requirements.cpuCores === '') clickNodeData.value.requirements.cpuCores = null;
  if (clickNodeData.value.requirements.nodeCount < -1) clickNodeData.value.requirements.nodeCount = -1;
  else if (clickNodeData.value.requirements.nodeCount === '') clickNodeData.value.requirements.nodeCount = null;
  if (clickNodeData.value.requirements.maxWallTime < 0) clickNodeData.value.requirements.maxWallTime = 0;
  else if (clickNodeData.value.requirements.maxWallTime === '') clickNodeData.value.requirements.maxWallTime = null;
  if (clickNodeData.value.requirements.maxCpuTime < 0) clickNodeData.value.requirements.maxCpuTime = 0;
  else if (clickNodeData.value.requirements.maxCpuTime === '') clickNodeData.value.requirements.maxCpuTime = null;

  const { cpuCores, nodeCount, maxWallTime, maxCpuTime, stopTime } = clickNodeData.value.requirements;
  clickNodeData.value.requirements = {
    cpuCores: roundDown(cpuCores),
    nodeCount: roundDown(nodeCount),
    maxWallTime: roundDown(maxWallTime),
    maxCpuTime: roundDown(maxCpuTime),
    stopTime: stopTime,
  };
};
// 主动更新数据
const updateData = (data: any) => {
  clickNodeData.value = data;
  data.inputSlots?.forEach((slot: SlotData, i: number) => {
    clickNodeData.value.inputSlots[i] = slot;
    slot.result.forEach((res: any, r: number) => {
      if (slot.kind == InputSlotKind.File) {
        clickNodeData.value.inputSlots[i].result[r] = {
          name: '',
          hash: '',
          size: 0,
          id: '',
          uploadStatus: '',
          progress: 0,
        };
      } else if (slot.kind == InputSlotKind.Text) {
        clickNodeData.value.inputSlots[i].result[r] = {
          trueValue: '',
          isError: false,
        };
      }
      clickNodeData.value.inputSlots[i].result[r] = res;
    });
  });
};
// 检查输入不能为空
const checkNull = () => {
  if (!clickNodeData.value.name) clickNodeData.value.name = '未命名节点';
};

onMounted(() => {
  clickNodeData.value = props.clickNode?.getData();
});

defineExpose({
  updateData,
});
</script>
