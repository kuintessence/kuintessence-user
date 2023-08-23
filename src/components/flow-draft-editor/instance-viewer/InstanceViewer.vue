<!-- 工作流实例可视化展示 -->
<template>
  <q-layout view="hHh LpR fFf" container class="full-width viewer-layout">
    <div id="viewer-container" class="fit" />
    <TeleportContainer v-if="route.fullPath === `/instance-detail?id=${flowData.id}`" class="fit" />
  </q-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { DagreLayout } from '@antv/layout';
import { Graph } from '@antv/x6';
import { register, getTeleport } from '@antv/x6-vue-shape';
import DefaultNode from './node/DefaultNode.vue';
import { FlowDraft, NodeOrigin, NodeRelationOrigin, instancePorts } from '../interfaces';
import { uid } from 'quasar';
import { useRoute } from 'vue-router';

const props = defineProps({
  json: {
    type: Object,
  },
  nodeList: {
    type: Array,
  },
});

// 更新节点运行状态
watch(props.nodeList as { id: string; status: string; log: string }[], () => {
  updateStatus();
});

const TeleportContainer = getTeleport();
const route = useRoute();

// 声明画布
let graph = ref<Graph>();
// 画布缩放比例
const zoom = ref(100);
// 选择的类型
const choiceType = ref('blank');
// 选择的节点id
const choiceId = ref('');
// 初始化节点数据
let data: { nodes: any; edges: any } = { nodes: [], edges: [] };
// 工作流数据
const flowData = ref<any>({
  id: '',
});
// 正在加载画布
const isLoading = ref(true);

// 更新节点状态
const updateStatus = () => {
  const nodes = (graph.value as Graph).getNodes();
  props.nodeList?.forEach((newNode: any) => {
    nodes.forEach((editorNode: any) => {
      if (editorNode.id === newNode.id) {
        editorNode.setData({ status: newNode.status, log: newNode.log });
        return;
      }
    });
  });
};
// json数据转换成x6数据
const dataFromJson = () => {
  // 转换节点数据
  if (flowData.value.spec?.nodeSpecs) {
    data.nodes = [];
    const nodeDrafts = flowData.value.spec.nodeSpecs;
    for (let i = 0, len = nodeDrafts.length; i < len; i++) {
      const pushNodeOrigin: NodeOrigin = {
        id: nodeDrafts[i].id,
        data: nodeDrafts[i],
        shape: 'default-node',
        ports: { ...instancePorts },
      };
      data.nodes.push(pushNodeOrigin);
    }
  }
  // 转换连线数据
  if (flowData.value.spec?.nodeRelations) {
    data.edges = [];
    const nodeRelations = flowData.value.spec.nodeRelations;
    for (let i = 0, len = nodeRelations.length; i < len; i++) {
      const pushNodeRelationOrigin: NodeRelationOrigin = {
        id: uid(),
        source: nodeRelations[i].fromId,
        target: nodeRelations[i].toId,
        data: {
          slotRelations: nodeRelations[i].slotRelations,
        },
        shape: 'default-edge',
        zIndex: -1,
      };
      data.edges.push(pushNodeRelationOrigin);
    }
  }
};
// 初始化自定义节点、连线形状
const initShape = () => {
  register({
    shape: 'default-node',
    width: 150,
    height: 112,
    component: DefaultNode,
  });
  Graph.registerEdge(
    'default-edge',
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#c2c8d5',
          strokeWidth: 1.5,
          targetMarker: null,
        },
      },
    },
    true
  );
};
// 初始化工作流
function initGraph() {
  // 自动布局：使用dagre布局算法，判断data层次
  const dagreLayout = new DagreLayout({
    type: 'dagre',
    ranksep: 60,
    nodesep: 30,
    rankdir: 'LR',
    align: 'DL',
    controlPoints: false,
  });
  dagreLayout.layout(data);

  // 渲染画布
  graph.value = new Graph({
    container: document.getElementById('viewer-container') as HTMLElement, // 画布容器
    background: {
      opacity: 0,
    },
    autoResize: true,
    grid: {
      size: 10, // 网格大小 10px
      visible: true, // 渲染网格背景
      type: 'dot',
      args: {
        color: '#a0a0a0', // 网格线/点颜色
        thickness: 1, // 网格线宽度/网点大小
      },
    },
    panning: {
      enabled: true,
      eventTypes: ['leftMouseDown'],
    },
    interacting: false,
    preventDefaultContextMenu: false,
    mousewheel: {
      // 支持鼠标滚轮缩放
      enabled: false,
      zoomAtMousePosition: true,
      modifiers: 'ctrl', // Ctrl+滚轮缩放
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      // 连线
      snap: false, // 自动吸附
      allowBlank: false, // 是否允许连接到画布空白位置的点
      allowMulti: false, // 是否允许在相同的起始节点和终止之间创建多条边
      allowLoop: false, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点
      allowNode: false, // 是否允许边链接到节点（非节点上的链接桩)
      allowEdge: false, // 是否允许边链接到另一个边
      allowPort: false, // 是否允许边链接到链接桩
      highlight: false, // 拖动边时，是否高亮显示所有可用的连接桩或节点
      anchor: 'center', // 锚点位置
      connectionPoint: 'boundary', // 连线点
      router: {
        // 路由将边的路径点 vertices 做进一步转换处理，并在必要时添加额外的点，然后返回处理后的点
        name: 'er',
        args: {
          offset: 24,
          direction: 'L',
        },
      },
      connector: {
        // 连接器将起点、路由返回的点、终点加工为 元素的 d 属性，决定了边渲染到画布后的样式
        name: 'rounded',
        args: {
          radius: 20,
        },
      },
    },
  }).fromJSON(data);
}
// 初始化事件
function initEvent() {
  // 绑定右键点击事件
  (graph.value as Graph).on('node:contextmenu', ({ node }) => {
    choiceType.value = 'node';
    choiceId.value = node.id;
  });
  (graph.value as Graph).on('edge:contextmenu', ({ edge }) => {
    choiceType.value = 'edge';
    choiceId.value = edge.id;
  });
  (graph.value as Graph).on('blank:contextmenu', () => {
    choiceType.value = 'blank';
    choiceId.value = '';
  });
  // 绑定画布缩放事件
  (graph.value as Graph).on('scale', () => {
    setTimeout(() => {
      zoom.value = Number(((graph.value as Graph).zoom() * 100).toFixed(0));
    }, 50);
  });
  // 绑定节点数据更改事件
  (graph.value as Graph).on('node:change:data', ({ node }) => {
    // 根据节点状态改变连线样式
    const data = node.getData();
    const incomingEdges = (graph.value as Graph).getIncomingEdges(node);
    const outgoingEdges = (graph.value as Graph).getOutgoingEdges(node);
    incomingEdges?.forEach((edge: { attr: (arg0: string, arg1: string | number) => void }) => {
      if (data.status === 'running') {
        edge.attr('line/strokeDasharray', 5);
        edge.attr('line/style/animation', 'running-line 30s infinite linear');
      } else {
        edge.attr('line/strokeDasharray', '');
        edge.attr('line/style/animation', '');
      }
    });
    outgoingEdges?.forEach((edge: { attr: (arg0: string, arg1: number) => void }) => {
      if (data.isBatch) {
        edge.attr('line/strokeWidth', 5);
      } else {
        edge.attr('line/strokeWidth', 1.5);
      }
    });
  });
}
// 初始化工作流
const initFlow = () => {
  if (props.json !== undefined && isLoading.value) {
    isLoading.value = true;
    flowData.value = props.json as FlowDraft;
    dataFromJson();
    initShape();
    initGraph();
    initEvent();
    (graph.value as Graph).centerContent(); // 将画布内容中心与视口中心对齐
    isLoading.value = false;
  }
};

onMounted(() => {
  initFlow();
  updateStatus();
});
</script>

<style lang="scss" scoped>
@import url('../FlowDraftEditor.scss');

.viewer-layout {
  height: calc(100vh - 88px) !important;
}
#viewer-container {
  height: calc(100vh - 88px) !important;
}
@keyframes running-line {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>
