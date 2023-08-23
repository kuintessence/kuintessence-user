<!-- 右键菜单 -->
<template>
  <q-popup-proxy context-menu class="frosted-glass-card">
    <q-list style="min-width: 100px" v-if="choiceType == 'node'">
      <q-item clickable v-close-popup @click="deleteNode">
        <q-item-section side>
          <q-icon name="delete_outline" />
        </q-item-section>
        <q-item-section>删除节点</q-item-section>
      </q-item>
      <q-separator />
      <q-item clickable v-close-popup @click="showNode">
        <q-item-section side>
          <q-icon name="code" />
        </q-item-section>
        <q-item-section>查看数据</q-item-section>
      </q-item>
    </q-list>
    <q-list style="min-width: 100px" v-else-if="choiceType == 'edge'">
      <q-item clickable v-close-popup @click="deleteEdge">
        <q-item-section side>
          <q-icon name="delete_outline" />
        </q-item-section>
        <q-item-section>删除连线</q-item-section>
      </q-item>
      <q-separator />
      <q-item clickable v-close-popup @click="showEdge">
        <q-item-section side>
          <q-icon name="code" />
        </q-item-section>
        <q-item-section>查看数据</q-item-section>
      </q-item>
    </q-list>
    <q-list style="min-width: 100px" v-else>
      <q-item clickable v-close-popup @click="showData">
        <q-item-section side>
          <q-icon name="code" />
        </q-item-section>
        <q-item-section>查看数据</q-item-section>
      </q-item>
    </q-list>
  </q-popup-proxy>
</template>

<script lang="ts" setup>
import { Graph } from '@antv/x6';
import { useQuasar } from 'quasar';

const props = defineProps({
  choiceType: {
    type: String,
    default: 'blank',
  },
  choiceId: {
    type: String,
    default: '',
  },
  graph: {
    type: Object,
  },
});
const emit = defineEmits(['openCodeDialog', 'dataToJson', 'setJsonData']);

const $q = useQuasar();

// 删除节点
const deleteNode = () => {
  $q.dialog({
    title: '删除节点',
    message: '确定要删除该节点吗？',
    cancel: {
      flat: true,
      color: 'grey-7',
    },
    class: 'frosted-glass-card',
  }).onOk(async () => {
    (props.graph as Graph).removeNode(props.choiceId);
  });
};
// 查看节点数据
const showNode = () => {
  emit('openCodeDialog');
};
// 删除连线
const deleteEdge = () => {
  $q.dialog({
    title: '删除连线',
    message: '确定要删除该连线吗？',
    cancel: {
      flat: true,
      color: 'grey-7',
    },
    class: 'frosted-glass-card',
  }).onOk(async () => {
    (props.graph as Graph).removeEdge(props.choiceId);
  });
};
// 查看连线数据
const showEdge = () => {
  emit('openCodeDialog');
};
// 查看工作流数据
const showData = () => {
  emit('setJsonData');
  emit('openCodeDialog');
};
</script>

<style lang="scss" scoped>
@import url('../FlowDraftEditor.scss');
</style>
