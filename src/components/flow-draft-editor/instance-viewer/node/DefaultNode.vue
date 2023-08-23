<!-- 工作流实例可视化节点 -->
<template>
  <div class="node-all">
    <div class="default-node htc-node-1" style="height: 112px" v-if="data.isBatch"></div>
    <div class="default-node htc-node-2" style="height: 112px" v-if="data.isBatch"></div>

    <div class="default-node" style="height: 112px">
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
      <div class="details-row">
        <span>状态：</span>
        <span class="status-content" style="padding-right: 0">
          <node-state :state="data.status" />
          <q-icon
            color="negative"
            name="expand_more"
            @click="!showLog ? (showLog = true) : (showLog = false)"
            size="20px"
            class="cursor-pointer"
            :class="[!showLog ? 'expand-more' : 'expand-less']"
            v-if="data.status === InstanceNodeState.error.value"
          >
            <q-tooltip
              v-model="showLog"
              no-parent-event
              max-width="500px"
              class="bg-red-2 text-negative"
              style="pointer-events: all !important"
            >
              <div class="text-subtitle1 text-weight-medium row" style="user-select: none">
                错误日志
                <q-space />
                <q-icon
                  color="negative"
                  name="content_copy"
                  size="16px"
                  @click="copyText(data.log)"
                  class="cursor-pointer q-mr-xs"
                  style="height: 28px"
                />
                <q-icon
                  color="negative"
                  name="close"
                  size="20px"
                  @click="showLog = false"
                  class="cursor-pointer"
                  style="height: 28px"
                />
              </div>
              <div>{{ data.log }}</div>
            </q-tooltip>
          </q-icon>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, ref } from 'vue';
import { Node } from '@antv/x6';
import NodeState from 'src/components/store/InstanceNodeState.vue';
import { InstanceNodeState } from 'src/service';
import { useQuasar, copyToClipboard } from 'quasar';
import { NodeType } from '../../interfaces';

const $q = useQuasar();
// 节点数据
const data = ref({ isBatch: false, name: '', status: '', log: '', type: '' });
// 用于获取节点
const getNode = inject('getNode', Function, true);
const node = getNode() as Node;
const showLog = ref(false);

const copyText = (text: string) => {
  copyToClipboard(text)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: '复制成功',
      });
    })
    .catch(() => {
      console.log('error: 复制失败');
    });
};
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
@import url('../../FlowDraftEditor.scss');
</style>
