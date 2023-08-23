<!-- 工作流草稿编辑器 -->
<template>
  <q-layout view="hHh LpR fFf" container class="flow-editor page-px shadow">
    <Header
      :showGrid="showGrid"
      :showLeftDrawer="showLeftDrawer"
      :showRightDrawer="showRightDrawer"
      :zoom="zoom"
      :graph="graph"
      :rightDrawer="rightDrawer"
      :flowData="flowData"
      :autoUpload="autoUpload"
      :isSaving="isSaving"
      :canSave="canSave"
      @setZoom="setZoom"
      @shGrid="shGrid"
      @shLeftDrawer="shLeftDrawer"
      @shRightDrawer="shRightDrawer"
      @dataFromJson="dataFromJson"
      @initGraph="initGraph"
      @initDnd="initDnd"
      @initEvent="initEvent"
      @initFlow="initFlow"
      @setFlowData="setFlowData"
      @downloadData="downloadData"
      @saveFlowDraft="saveFlowDraft"
      @setSpec="setSpec"
      @layout="layout"
      @shAutoUpload="shAutoUpload"
      @setNodeDrafts="setNodeDrafts"
      @runWorkFlow="runWorkFlow"
    />
    <LeftDrawer :showLeftDrawer="showLeftDrawer" @startDrag="startDrag" />
    <RightDrawer
      ref="rightDrawer"
      :isLoading="isLoading"
      :showRightDrawer="showRightDrawer"
      :autoUpload="autoUpload"
      :flowData="flowData"
      @setName="setName"
      @setSpec="setSpec"
      @saveFlowDraft="saveFlowDraft"
    />
    <div id="x6-container" class="fit">
      <ContextMenu
        :choiceType="choiceType"
        :choiceId="choiceId"
        :graph="graph"
        @openCodeDialog="openCodeDialog"
        @dataToJson="dataToJson"
        @setJsonData="setJsonData"
      />
    </div>
    <TeleportContainer v-if="route.fullPath === `/draft-editor?id=${flowData.id}`" class="fit" />
    <transition enter-active-class="animated fadeIn">
      <div class="loading text-primary" v-if="isSaving">
        <q-spinner-ios color="primary" size="2em" class="q-mr-xs" /> 正在保存...
      </div>
    </transition>
    <q-inner-loading :showing="isLoading">
      <q-spinner-ios size="50px" color="primary" />
    </q-inner-loading>
  </q-layout>

  <CodeDialog :data="jsonData" ref="codeDialog" />
  <StoreDialog ref="storeDialog" :droppingNodeData="droppingNodeData" :graph="graph" :newRepoNode="newRepoNode" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useQuasar, uid, date } from 'quasar';
import { useRoute } from 'vue-router';
import { DagreLayout } from '@antv/layout';
import { Graph } from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Export } from '@antv/x6-plugin-export';
import { register, getTeleport } from '@antv/x6-vue-shape';
import Header from './header/Header.vue';
import LeftDrawer from './left-drawer/LeftDrawer.vue';
import RightDrawer from './right-drawer/RightDrawer.vue';
import DefaultNode from './node/DefaultNode.vue';
import ContextMenu from './container/ContextMenu.vue';
import CodeDialog from './dialog/CodeDialog.vue';
import StoreDialog from './dialog/StoreDialog.vue';
import {
  FlowDraft,
  NodeDraft,
  NodeRelation,
  FlowDraftSpec,
  ports,
  NodeOrigin,
  NodeRelationOrigin,
  NodeOriginData,
} from './interfaces';
import { WorkflowSlotService, FileSlotDataResult, SlotData, InputSlotKind } from 'src/service/workflow-slot';
import { useKeepAliveStore } from 'src/stores/keep-alive';
import { useCommonStore } from 'src/stores/common';
import { UploadState } from '../../service/upload';
import { DraftService, InstanceService, ProjectService } from '../../service';

const $q = useQuasar();
const route = useRoute();
const keepAliveStore = useKeepAliveStore();
const commonStore = useCommonStore();
const TeleportContainer = getTeleport();

// 声明画布、拖拽组件
let graph = ref<Graph>();
let dnd: Dnd;
// 声明Ref
const rightDrawer = ref();
const codeDialog = ref();
const storeDialog = ref();
// 画布缩放比例
const zoom = ref(100);
// 是否显示网格
const showGrid = ref(false);
// 是否显示组件库
const showLeftDrawer = ref(true);
// 是否显示编辑面板
const showRightDrawer = ref(true);
// json
const jsonData = ref();
// 初始化节点数据
let data: { nodes: any[]; edges: any[] } = { nodes: [], edges: [] };
// 选择的类型
const choiceType = ref<'node' | 'edge' | 'blank'>('blank');
// 选择的节点id
const choiceId = ref('');
// 拖拽生成节点时使用
const newRepoNode = ref();
// StoreDialog用到的变量
const droppingNodeData = ref({ id: '', uuid: '', kind: '' }); // 生成通用节点-生成的节点id、选择的通用节点kind、选择的通用节点kind
// 正在加载画布
const isLoading = ref(false);
// 正在保存
const isSaving = ref(false);
// 正在保存
const canSave = ref(true);
// 工作流数据
const flowData = ref<FlowDraft>({ id: '' });
// 是否开启自动上传
const autoUpload = ref(false);

// 修改工作流数据
const setName = (name: string) => {
  flowData.value.name = name;
};
const setSpec = (spec: FlowDraftSpec) => {
  flowData.value.spec = spec;
};
const setNodeDrafts = (nodeDrafts: NodeDraft[]) => {
  if (flowData.value.spec) flowData.value.spec.nodeDrafts = nodeDrafts;
};
// 打开弹窗
const openCodeDialog = () => {
  codeDialog.value.open();
};
// 修改json数据
const setJsonData = () => {
  jsonData.value = JSON.stringify(dataToJson(), null, 2);
};
// 修改缩放大小
const setZoom = (newValue: number) => {
  zoom.value = newValue;
};
// 开关网点
const shGrid = () => {
  showGrid.value = !showGrid.value;
  // 保存到LocalStorage
  // LocalStorage.set('showGrid', showGrid.value);
};
// 开关侧边栏
const shLeftDrawer = () => {
  showLeftDrawer.value = !showLeftDrawer.value;
};
const shRightDrawer = () => {
  showRightDrawer.value = !showRightDrawer.value;
};
// 保存工作流数据
const setFlowData = (callback: any) => {
  flowData.value = dataToJson();
  if (callback) callback(flowData.value);
};
// 开关自动上传
const shAutoUpload = () => {
  autoUpload.value = !autoUpload.value;
};
// 自动布局
const layout = () => {
  isLoading.value = true;
  setFlowData(undefined);
  if (!flowData.value.spec) return;
  // 重构nodeDrafts结构
  setNodeDrafts(
    WorkflowSlotService.analyNode(
      flowData.value.spec.nodeDrafts,
      flowData.value.spec.nodeRelations
    ) as unknown as NodeDraft[]
  );
  dataFromJson();
  graph.value?.dispose();
  initGraph();
  initDnd();
  initEvent();
  setTimeout(() => {
    graph.value?.centerContent(); // 将画布内容中心与视口中心对齐
  }, 0);
  isLoading.value = false;
};
const downloadData = () => {
  const datastr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToJson(), null, '\t'));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', datastr);
  downloadAnchorNode.setAttribute('download', 'data' + date.formatDate(new Date(), 'YYYYMMDDHHmm') + '.json');
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  $q.notify({
    message: '正在下载 JSON 文件',
    color: 'info',
  });
};
// 检查节点和连线数据是否完整
const checkFlowData = () => {
  const nodes = (graph.value as Graph).getNodes();
  for (let i = 0, len = nodes.length; i < len; i++) if (nodes[i].getData().name === '') return false;
  const edges = (graph.value as Graph).getEdges() as any;
  for (let i = 0, len = edges.length; i < len; i++) if (!edges[i].source.cell || !edges[i].target.cell) return false;
  return true;
};
// 保存工作流数据
const saveFlowDraft = async () => {
  if (!isLoading.value && !isSaving.value) {
    isSaving.value = true;
    const result = checkFlowData();
    if (result) {
      try {
        // 先上传所有数据
        await uploadAllFiles();
        // 保存草稿数据
        flowData.value.spec = dataToSpec();
        await DraftService.saveFlowDraft(flowData.value, flowData.value.spec);

        // 重构nodeDrafts结构
        setNodeDrafts(
          WorkflowSlotService.analyNode(
            flowData.value.spec.nodeDrafts,
            flowData.value.spec.nodeRelations
          ) as unknown as NodeDraft[]
        );
        keepAliveStore.tabList.forEach(tab => {
          if (tab.fullPath === route.fullPath)
            tab.meta.title = flowData.value.name ? (flowData.value.name as string) : '新建草稿';
        });
        setTimeout(() => {
          $q.notify({
            type: 'positive',
            message: '保存成功',
          });
          isSaving.value = false;
        }, 300);
      } catch (e: any) {
        setTimeout(() => {
          console.log('error: ' + e?.content || '保存失败');
          isSaving.value = false;
        }, 300);
        throw e;
      }
    } else {
      $q.notify({
        type: 'info',
        message: '处理数据中，请等待后保存',
      });
      isSaving.value = false;
    }
  }
};
const toPage = (fullPath: string, event: any) => {
  if (fullPath !== route.fullPath) {
    const { x, y } = event;
    commonStore.animate(x, y, fullPath);
  }
};

// 上传全部文件
async function uploadAllFiles() {
  let promiseArr = [];
  const nodes = (graph.value as Graph).getNodes();
  for (let i = 0, len = nodes.length; i < len; i++) {
    let node = nodes[i];
    let nodeData = node.getData();
    for (let y = 0; y < nodeData.inputSlots.length; y++) {
      const inputSlot: SlotData = nodeData.inputSlots[y];
      if (inputSlot.kind == InputSlotKind.File) {
        for (let z = 0; z < inputSlot.result.length; z++) {
          const fileItem = <FileSlotDataResult>inputSlot.result[z];
          if (!fileItem.id) {
            if (!fileItem.fileEntry) return;
            fileItem.uploadStatus = UploadState.uploading; // 1 ：正在上传 2：上传成功 3：上传失败
            fileItem.progress = { progress: 0, speed: '', takeTime: '' };
            rightDrawer.value?.updateData();
            let promise = new Promise((resolve: any, reject: any) => {
              if (!fileItem.fileEntry) return reject('没有文件');
              DraftService.uploadDraftFile(
                flowData.value.id,
                fileItem.fileEntry,
                (progress: { state: UploadState; progress?: number; speed?: string; takeTime?: string }) => {
                  //更新状态
                  if (progress.state == UploadState.stopped) {
                    fileItem.uploadStatus = UploadState.stopped;
                    rightDrawer.value?.updateData();
                    return reject({ state: UploadState.stopped });
                  } else if (progress.state == UploadState.canceled) {
                    fileItem.uploadStatus = UploadState.canceled;
                    let fileIndex = inputSlot.result.findIndex((r: any) => r.hash && r.hash == fileItem.hash);
                    inputSlot.result.splice(fileIndex, 1);
                    node.setData(nodeData);
                    rightDrawer.value?.updateData();
                    return reject({ state: UploadState.canceled });
                  } else if (progress.state == UploadState.uploading) {
                    //更新进度
                    fileItem.uploadStatus = UploadState.uploading;
                    if (fileItem.progress) {
                      progress.progress && (fileItem.progress.progress = progress.progress);
                      progress.speed && (fileItem.progress.speed = progress.speed);
                      progress.takeTime && (fileItem.progress.takeTime = progress.takeTime);
                    } else {
                      fileItem.progress = {
                        progress: progress.progress || 0,
                        speed: progress.speed || '',
                        takeTime: progress.takeTime || '',
                      };
                    }
                    rightDrawer.value?.updateData();
                  }
                },
                (cancel: (state: UploadState) => void) => {
                  //中断执行
                  fileItem.cancel = cancel;
                },
                (_retry: () => void) => {
                  fileItem.retry = _retry;
                }
              )
                .then((fileId: string) => {
                  //上传成功
                  fileItem.id = fileId;
                  fileItem.progress = { progress: 1, speed: '', takeTime: '' };
                  fileItem.uploadStatus = UploadState.uploaded;
                  rightDrawer.value?.updateData();
                  resolve();
                })
                .catch(error => {
                  //上传失败
                  if (error?.message == UploadState.error) {
                    fileItem.uploadStatus = UploadState.error;
                  }
                  rightDrawer.value?.updateData();
                  reject(error);
                });
            });
            promiseArr.push(promise);
          }
        }
      }
    }
  }
  await Promise.all(promiseArr).catch(error => {
    throw error;
  });
}
// 提交工作流任务
const runWorkFlow = async (id: string, event: any) => {
  if (flowData.value.spec)
    flowData.value.spec.additionalData = {
      ompType: 0,
    };
  await saveFlowDraft();
  setTimeout(async () => {
    const uuid = await InstanceService.runFlowDraft(id);
    toPage(`/instance-detail?id=${uuid}`, event);
  }, 300);
};
// x6数据转换成json数据
const dataToJson = () => {
  const spec = dataToSpec();
  const returnFlow: FlowDraft = {
    id: flowData.value.id,
    name: flowData.value.name,
    description: flowData.value.description,
    spec: spec,
    user_id: flowData.value.user_id,
    created_time: flowData.value.created_time,
    last_modified_time: flowData.value.last_modified_time,
    type: flowData.value.type,
  };
  return returnFlow;
};
// x6数据转换成只包含spec的json
const dataToSpec = () => {
  const x6Data = (graph.value as Graph).toJSON().cells;
  let nodeDrafts: NodeDraft[] = [];
  let nodeRelations: NodeRelation[] = [];
  // 遍历x6数据
  for (let i = 0, len = x6Data.length; i < len; i++) {
    if (x6Data[i].shape === 'default-edge') {
      // 存储连线
      if (x6Data[i].source.cell && x6Data[i].target.cell) {
        const pushNodeRelation: NodeRelation = {
          fromId: x6Data[i].source.cell,
          toId: x6Data[i].target.cell,
          slotRelations: (x6Data[i].data?.slotRelations ?? '') !== '' ? x6Data[i].data.slotRelations : [],
        };
        nodeRelations.push(pushNodeRelation);
      }
    } else {
      // 存储节点
      let pushNodeDraft = x6Data[i].data;
      pushNodeDraft.externalId = x6Data[i].id;
      nodeDrafts.push(pushNodeDraft);
    }
  }
  const generatedNodeDrafts = WorkflowSlotService.generateNodeData(nodeDrafts as any) as NodeDraft[]; // TODO
  const returnSpec: FlowDraftSpec = {
    schedulingStrategy: flowData.value.spec
      ? flowData.value.spec.schedulingStrategy
      : {
          type: 'Auto',
        },
    nodeDrafts: generatedNodeDrafts,
    nodeRelations: nodeRelations,
    additionalData: flowData.value.spec?.additionalData,
  };
  return returnSpec;
};
// json数据转换成x6数据
const dataFromJson = () => {
  // 转换节点数据
  data.nodes.length = 0;
  if (flowData.value.spec?.nodeDrafts) {
    const nodeDrafts = flowData.value.spec.nodeDrafts;
    for (let i = 0, len = nodeDrafts.length; i < len; i++) {
      const pushNodeOrigin: NodeOrigin = {
        id: nodeDrafts[i].externalId,
        data: nodeDrafts[i],
        shape: 'default-node',
        ports: { ...ports },
      };
      data.nodes.push(pushNodeOrigin);
    }
  }
  // 转换连线数据
  data.edges.length = 0;
  if (flowData.value.spec?.nodeRelations) {
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
// 初始化工作流
const initFlow = () => {
  try {
    initShape();
    initGraph();
    initDnd();
    initEvent();
    (graph.value as Graph).centerContent(); // 将画布内容中心与视口中心对齐
    isLoading.value = false;
  } catch (e) {
    isLoading.value = false;
    console.log('error: 初始化失败');
    keepAliveStore.deleteTabByPath('/draft-editor?id=' + route.query.id);
  }
};
// 初始化自定义节点、连线形状
const initShape = () => {
  register({
    shape: 'default-node',
    width: 150,
    height: 80,
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
    nodesep: 25,
    rankdir: 'LR',
    align: 'DL',
    controlPoints: false,
  });
  dagreLayout.layout(data);

  // 渲染画布
  graph.value = new Graph({
    container: document.getElementById('x6-container') as HTMLElement, // 画布容器
    background: {
      opacity: 0,
    },
    autoResize: true,
    grid: {
      visible: showGrid.value, // 渲染网格背景
      type: 'dot',
      size: 10, // 网格大小 10px
      args: {
        color: '#a0a0a0', // 网格线/点颜色
        thickness: 1, // 网格线宽度/网点大小
      },
    },
    panning: {
      enabled: true,
      eventTypes: ['leftMouseDown', 'mouseWheel'],
    },
    mousewheel: {
      // 支持鼠标滚轮缩放
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: 'ctrl', // Ctrl+滚轮缩放
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      // 连线
      snap: true, // 自动吸附
      allowBlank: false, // 是否允许连接到画布空白位置的点
      allowMulti: false, // 是否允许在相同的起始节点和终止之间创建多条边
      allowLoop: false, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点
      allowNode: false, // 是否允许边链接到节点（非节点上的链接桩)
      allowEdge: false, // 是否允许边链接到另一个边
      allowPort: true, // 是否允许边链接到链接桩
      highlight: true, // 拖动边时，是否高亮显示所有可用的连接桩或节点
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
      createEdge() {
        // 连接的过程中创建新的边
        return (graph.value as Graph).createEdge({
          shape: 'default-edge',
          attrs: {
            line: {
              strokeDasharray: '5 5',
            },
          },
          zIndex: -1,
        });
      },
      validateConnection({
        // 在移动边的时候判断连接是否有效，如果返回 false，当鼠标放开的时候，不会连接到当前元素，否则会连接到当前元素
        targetMagnet,
        sourceCell,
        targetCell,
      }) {
        // 验证节点是否加载完成
        if (sourceCell?.getData().name === '' || targetCell?.getData().name === '') return false;
        // 验证连接桩存在
        if (!targetMagnet) {
          return false;
        }
        // 只允许连线到左侧连接桩
        if (targetMagnet.getAttribute('port-group') !== 'left') {
          return false;
        }
        // 禁止双向连线
        const is2way = (graph.value as Graph).toJSON().cells.find(ele => {
          if (ele.shape === 'default-edge' && ele.target.cell === sourceCell?.id && ele.source.cell === targetCell?.id)
            return true;
        });
        if (is2way) return false;
        return !!targetMagnet;
      },
    },
    highlighting: {
      // 连接桩高亮，当链接桩可以被链接时，在链接桩外围渲染一个框
      magnetAvailable: {
        name: 'stroke',
      },
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#fff',
            stroke: '#31d0c6',
          },
        },
      },
    },
  }).fromJSON(data);
  // 使用框选插件
  graph.value.use(
    new Selection({
      enabled: true, // 支持选择节点
      multiple: false, // 是否多选
      rubberband: false, // 是否启用框选
      rubberEdge: true, // 可以选中连线
      showNodeSelectionBox: false, // 显示节点选择框
      showEdgeSelectionBox: false, // 显示连线选择框
    })
  );
  // 使用对齐线插件
  graph.value.use(
    new Snapline({
      enabled: true,
    })
  );
  // 使用导出插件
  graph.value.use(new Export());
}
// dnd开始拖动
const startDrag = (
  e: MouseEvent,
  prop: {
    node: {
      id: string;
      name: string;
      software_version_id?: string;
      usecase_version_id?: string;
    };
  }
) => {
  // 拖拽生成节点
  const nodeOriginWithoutId: NodeOrigin = {
    data: {
      // name: prop.node.name,
      name: '',
      usecaseVersionId: prop.node.usecase_version_id,
      softwareVersionId: prop.node.software_version_id,
      type: 'SoftwareUsecaseComputing', // TODO
    },
    shape: 'default-node',
    ports: { ...ports },
  };
  const node = (graph.value as Graph).createNode(nodeOriginWithoutId);
  if (!prop.node.usecase_version_id && !prop.node.software_version_id) droppingNodeData.value.uuid = prop.node.id;
  dnd.start(node, e);
};
// 初始化dnd
const initDnd = async () => {
  dnd = new Dnd({
    target: graph.value as Graph,
    validateNode: async droppingNode => {
      if (!droppingNode.data.usecaseVersionId && !droppingNode.data.softwareVersionId) {
        // 通用组件
        newRepoNode.value = droppingNode;
        droppingNodeData.value.id = droppingNode.id;
        storeDialog.value.open();
      } else {
        // 定制组件
        try {
          let res = (await ProjectService.getGeneralContentToNodeById(
            droppingNode.data.usecaseVersionId,
            droppingNode.data.softwareVersionId
          )) as unknown as NodeOriginData;
          if (res === null || typeof res === 'undefined') {
            console.log('error: 组件不存在');
            return false;
          } else {
            if (!res.requirements) res.requirements = { cpuCores: 56 };
            let nodeOriginData = WorkflowSlotService.analyTheNode(res, []) as unknown as NodeOriginData; // TODO
            droppingNode.setData(nodeOriginData);
          }
        } catch (e) {
          return false;
        }
      }
      return true;
    },
  });
};
// 初始化事件
function initEvent() {
  // 绑定右键点击事件
  (graph.value as Graph).on('node:contextmenu', ({ node }) => {
    choiceType.value = 'node';
    choiceId.value = node.id;
    let rawData = {
      ...node.data,
    };
    rawData.externalId = node.id;
    const generatedNodeData = WorkflowSlotService.generateTheNodeData(rawData);
    jsonData.value = JSON.stringify(generatedNodeData, null, 2);
  });
  (graph.value as Graph).on('edge:contextmenu', ({ edge }) => {
    choiceType.value = 'edge';
    choiceId.value = edge.id;
    jsonData.value = JSON.stringify(
      {
        // externalId: x6Data[i].id,
        fromId: (edge.source as { cell: string }).cell,
        toId: (edge.target as { cell: string }).cell,
        ...edge.data,
      },
      null,
      2
    );
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
  // 绑定左键点击事件
  (graph.value as Graph).on('node:click', ({ node }) => {
    if (node.getData().name === '') {
      $q.notify({
        message: '节点加载中，请等待',
        type: 'info',
      });
      (graph.value as any).cleanSelection();
      rightDrawer.value.blankClickResponse();
    } else {
      if (!node.getData().requirements) node.setData({ requirements: { cpuCores: 56 } }); // TODO
      rightDrawer.value.nodeClickResponse(node);
    }
  });
  (graph.value as Graph).on('edge:click', ({ edge }) => {
    if (!(edge.source as { cell: string }).cell || !(edge.target as { cell: string }).cell) {
      $q.notify({
        message: '连线加载中，请等待',
        type: 'info',
      });
      (graph.value as any).cleanSelection();
      rightDrawer.value.blankClickResponse();
    } else {
      dataToJson();
      rightDrawer.value.edgeClickResponse(edge);
    }
  });
  (graph.value as Graph).on('blank:click', ({}) => {
    rightDrawer.value.blankClickResponse();
  });
  // 绑定拖动节点事件
  // (graph.value as Graph).on('node:mousemove', ({ node }) => {
  //   rightDrawer.value.nodeMouseMoveResponse(node);
  // });
  // 绑定连线事件
  (graph.value as Graph).on('edge:connected', ({ edge }) => {
    edge.attr({
      line: {
        strokeDasharray: '',
      },
    });
  });
  // 绑定节点数据更改事件
  (graph.value as Graph).on('node:change:data', ({ node }) => {
    // 根据节点状态改变连线样式
    const data = node.getData();
    const outgoingEdges = (graph.value as Graph).getOutgoingEdges(node);
    outgoingEdges?.forEach((edge: { attr: (arg0: string, arg1: number) => void }) => {
      if (data.isBatch) {
        edge.attr('line/strokeWidth', 5);
      } else {
        edge.attr('line/strokeWidth', 1.5);
      }
    });
  });
  // 删除节点后不显示编辑
  (graph.value as Graph).on('node:removed', ({ node }) => {
    rightDrawer.value.judgeCurrentNode(node.id);
  });
  // 删除连线后不显示编辑
  (graph.value as Graph).on('edge:removed', ({ edge }) => {
    rightDrawer.value.judgeCurrentEdge(edge.id);
  });
  // 绑定快捷键
  // (graph.value as Graph).bindKey('ctrl+z', () => {
  //   (graph.value as Graph).undo();
  //   return false;
  // });
  // (graph.value as Graph).bindKey('ctrl+y', () => {
  //   (graph.value as Graph).redo();
  //   return false;
  // });
  // 添加连线后自动保存
  // (graph.value as Graph).on('edge:connected', ({ isNew, edge }) => {
  //   console.log('edge: ', edge);
  // });
  // 修改工作流、节点或连线数据后自动保存
  // (graph.value as Graph).on('cell:change:data', () => {
  //   console.log('cell:change:data');
  //   saveFlowDraft();
  // });
  // 删除节点或连线后自动保存
  // (graph.value as Graph).on('cell:removed', () => {
  //   console.log('cell:removed');
  //   saveFlowDraft();
  // });
  // 添加节点后自动保存
  // (graph.value as Graph).on('node:added', ({ node }) => {
  //   console.log('node:added');
  //   if (node.data.name !== '') saveFlowDraft();
  // });
}

onMounted(async () => {
  // 判断id参数是否存在，存在则根据id请求数据，不存在则渲染空工作流
  if (route.query.id) {
    isLoading.value = true;
    // 获取并验证工作流数据
    const id = route.query.id as string;
    try {
      const validatedFlowData = await DraftService.getAndValidateFlowDraft(id);
      if (validatedFlowData === null) {
        console.log('error: 草稿不存在');
        isLoading.value = false;
        keepAliveStore.deleteTabByPath('/draft-editor?id=' + id);
      } else {
        keepAliveStore.tabList.forEach(tab => {
          if (tab.fullPath === route.fullPath)
            tab.meta.title = validatedFlowData?.name
              ? validatedFlowData.name + ' - 草稿编辑器'
              : '新建草稿 - 草稿编辑器';
        });
        flowData.value = validatedFlowData;
      }
    } catch (e) {
      console.log('error: 初始化失败');
      isLoading.value = false;
      keepAliveStore.deleteTabByPath('/draft-editor?id=' + id);
    }
    if (
      flowData.value.spec &&
      (flowData.value.spec.nodeDrafts.length > 0 || flowData.value.spec.nodeRelations.length > 0)
    )
      dataFromJson();
    initFlow();
  } else {
    console.log('error: 缺少参数');
    keepAliveStore.deleteTabByPath(route.fullPath);
  }
});
</script>

<style lang="scss" scoped>
@import url('./FlowDraftEditor.scss');

.flow-editor {
  height: calc(100vh - 88px);
  border-radius: 16px;
}
.loading {
  position: fixed;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
