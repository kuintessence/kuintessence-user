<!-- 编辑区抽屉 -->
<template>
  <q-drawer class="right-drawer" v-model="showRightDrawer" :width="300" behavior="desktop" side="right" bordered>
    <div class="x6-drawer-title absolute-top">
      <div class="q-pl-md text-weight-medium">
        编辑{{ clickType === 'node' ? '节点' : clickType === 'edge' ? '连线' : '工作流' }}
      </div>
      <q-separator />
    </div>
    <q-scroll-area class="right-drawer-scroll">
      <node-edit
        ref="nodeEditRef"
        :clickNode="clickNode"
        :autoUpload="autoUpload"
        :flowData="flowData"
        @changeStrategyType="changeStrategyType"
        @changeStrategyClusters="changeStrategyClusters"
        v-if="clickType === 'node'"
      />
      <edge-edit :clickEdgeBindData="clickEdgeBindData" :clickEdge="clickEdge" v-else-if="clickType === 'edge'" />
      <flow-edit
        :flowData="flowData"
        @changeStrategyType="changeStrategyType"
        @changeStrategyClusters="changeStrategyClusters"
        v-else
      />
    </q-scroll-area>
  </q-drawer>
</template>

<script lang="ts" setup>
import { ref, watch, toRefs } from 'vue';
import { Node, Edge } from '@antv/x6';
import NodeEdit from './edit-panel/NodeEdit.vue';
import EdgeEdit from './edit-panel/EdgeEdit.vue';
import FlowEdit from './edit-panel/FlowEdit.vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
  },
  showRightDrawer: {
    type: Boolean,
    default: true,
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
const { showRightDrawer } = toRefs(props);

// 选定的节点/连线本体
const clickNodeData = ref();
// 选定的类型: node、edge、blank
const clickType = ref('blank');
// 选定的节点/连线/工作流信息副本，用于存储点击保存前编辑的信息
const clickNode = ref();
const clickEdge = ref();
// 临时保存: 数据插槽、调度策略等信息
const clickEdgeBindData = ref({});
// 需要刷新编辑面板
const refreshEditPanel = ref(false);
// nodeEdit Ref
const nodeEditRef = ref();

watch(refreshEditPanel, newStatus => {
  if (newStatus && clickType.value === 'node') {
    refreshEditPanel.value = false;
  }
});

// 更新节点数据
const updateData = () => {
  nodeEditRef.value?.updateData(clickNodeData.value);
};
// 鼠标事件响应方法
const nodeClickResponse = async (node: Node) => {
  // 判断点击类型
  clickType.value = 'node';
  // 保存节点到clickNode
  clickNode.value = node;
  // 构造节点数据，并保存到clickNodeData
  clickNodeData.value = node.getData();
  updateData();
};
const edgeClickResponse = async (edge: Edge) => {
  // 判断点击类型
  clickType.value = 'edge';
  // 保存连线到clickEdge
  clickEdge.value = edge;
  // 保存连线source节点的outputSlots、target节点的inputSlots、依赖关系dependencies、流转策略选项strategies
  clickEdgeBindData.value = {
    sourceNode: edge.getSourceNode(),
    targetNode: edge.getTargetNode(),
    targetNodeData: JSON.parse(JSON.stringify(edge.getTargetNode()?.getData())),
  };
};
const blankClickResponse = () => {
  clickType.value = 'blank';
};
// 修改资源调度策略
const changeStrategyType = (objectType: 'Flow' | 'Node', newType: 'Manual' | 'Auto' | 'Prefer' | 'Unknown') => {
  let object = objectType === 'Flow' ? props.flowData.spec : clickNodeData.value;
  if (object) {
    if (newType === 'Auto' || newType === 'Unknown') {
      // 类型为自动或待定，赋值类型的同时删除clusters
      object.schedulingStrategy = { type: newType };
    } else {
      // 类型为优先或手动，赋值类型并判断clusters是否存在，不存在则初始化
      object.schedulingStrategy.type = newType;
      const { type } = object.schedulingStrategy;
      if (type === 'Manual' || type === 'Prefer') {
        if (typeof object.schedulingStrategy.queues === 'undefined') {
          object.schedulingStrategy.queues = [];
        }
      }
    }
  }
};
// 修改选择的集群
const changeStrategyClusters = (objectType: 'Flow' | 'Node', newClusters: string[]) => {
  let object = objectType === 'Flow' ? props.flowData.spec : clickNodeData.value;
  if (object) {
    if (object.schedulingStrategy.type === 'Manual' || object.schedulingStrategy.type === 'Prefer') {
      object.schedulingStrategy.queues = newClusters;
    }
  }
};
// 判断是否当前节点/连线
const judgeCurrentNode = (id: string) => {
  if (clickType.value === 'node' && clickNode.value.id === id) blankClickResponse();
};
const judgeCurrentEdge = (id: string) => {
  if (clickType.value === 'edge' && clickEdge.value.id === id) blankClickResponse();
};

defineExpose({
  updateData,
  nodeClickResponse,
  edgeClickResponse,
  blankClickResponse,
  judgeCurrentNode,
  judgeCurrentEdge,
});
</script>

<style lang="scss" scoped>
@import url('../FlowDraftEditor.scss');

.right-drawer-scroll {
  height: calc(100% - 40px);
  top: 40px;
  width: 100%;
  :deep(.q-scrollarea__content) {
    width: 100%;
  }
}
</style>

<style lang="scss">
.right-drawer {
  background-color: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(10px) !important;
}
</style>
