<!-- 草稿编辑器节点 -->
<template>
  <div class="node-all">
    <div class="default-node htc-node-1" v-if="data.isBatch"></div>
    <div class="default-node htc-node-2" v-if="data.isBatch"></div>

    <div class="default-node">
      <div class="first-row text-body-1 text-weight-medium">
        <div class="center ellipsis">
          {{ data.name }}
          <q-tooltip anchor="center right" self="center left">
            {{ data.name }}
          </q-tooltip>
        </div>
      </div>

      <div class="details-row q-mt-xs row">
        <div class="col-auto">类型：</div>
        <div class="col text-grey-7 ellipsis text-right">
          {{ getNodeType(data.type) }}
          <q-tooltip anchor="center right" self="center left">
            {{ data.type }}
          </q-tooltip>
        </div>
      </div>
    </div>

    <q-inner-loading :showing="data.name === ''" :dark="false" style="border-radius: 16px">
      <q-spinner-ios size="40px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, ref } from 'vue';
import { Node } from '@antv/x6';
import { NodeType } from '../interfaces';

// 节点数据
const data = ref({
  isBatch: false,
  name: '',
  type: '',
  requirements: {
    cpuCores: 0,
    nodeCount: 0,
    maxWallTime: 0,
    stopTime: Date.now(),
    maxCoreTime: 0,
  },
});
// 用于获取节点
const getNode = inject('getNode', Function, true);
const node = getNode() as Node;
// 获取节点类型
const getNodeType = (type: string) => {
  for (let i = 0, len = NodeType.length; i < len; i++) if (NodeType[i].name === type) return NodeType[i].label;
  return '未知';
};

onMounted(() => {
  data.value = node.getData();
  node.on('change:data', ({ current }) => {
    data.value = current;
  });
});
</script>

<style lang="scss" scoped>
@import url('../FlowDraftEditor.scss');
</style>
