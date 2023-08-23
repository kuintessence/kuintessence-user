<!-- 顶部工具栏 -->
<template>
  <q-header bordered id="x6-header">
    <q-toolbar class="x6-toolbar">
      <div style="width: 228px">
        <q-btn flat dense class="q-px-sm" @click="toPageWithParams('/compute', { type: 'FlowDraft' }, $event)">
          <span class="material-icons"> arrow_back_ios_new </span>
          <span> 返回 </span>
        </q-btn>
        <q-btn flat dense label="文件" class="q-px-sm">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="saveFlowDraft">
                <q-item-section> 保存草稿 </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="openSaveTemplateDialog">
                <q-item-section> 保存为模板 </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="openFileDialog = true">
                <q-item-section> 导入JSON </q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section> 导出为 </q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
                <q-menu anchor="top end" self="top start">
                  <q-list style="min-width: 100px">
                    <q-item clickable v-close-popup>
                      <q-item-section @click="downloadData"> JSON </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup>
                      <q-item-section @click="exportToSVG">SVG</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup>
                      <q-item-section @click="exportToPNG">PNG</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat dense label="布局" class="q-px-sm">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="shGrid">
                <q-item-section> 显示网点 </q-item-section>
                <q-item-section side>
                  <q-icon left name="check_box_outline_blank" class="q-mr-none" v-if="!showGrid" />
                  <q-icon left name="check_box" class="q-mr-none" v-else />
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="shLeftDrawer">
                <q-item-section> 显示组件库 </q-item-section>
                <q-item-section side>
                  <q-icon left name="check_box_outline_blank" class="q-mr-none" v-if="!props.showLeftDrawer" />
                  <q-icon left name="check_box" class="q-mr-none" v-else />
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="shRightDrawer">
                <q-item-section> 显示编辑区 </q-item-section>
                <q-item-section side>
                  <q-icon left name="check_box_outline_blank" class="q-mr-none" v-if="!showRightDrawer" />
                  <q-icon left name="check_box" class="q-mr-none" v-else />
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="centerContent">
                <q-item-section> 居中 </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="layout">
                <q-item-section> 自动布局 </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="zoomTo(1)">
                <q-item-section> 重置比例 </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="zoomToFit">
                <q-item-section> 适应内容 </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <q-separator inset vertical />

      <q-btn dense flat round icon="remove_circle_outline" @click="zoomOut" style="margin-left: 12px">
        <q-tooltip :offset="[8, 8]"> 缩小 (Ctrl + 滚轮向下) </q-tooltip>
      </q-btn>
      <span style="padding-left: 2px; padding-right: 2px">{{ zoom }}%</span>
      <q-btn dense flat round icon="add_circle_outline" @click="zoomIn">
        <q-tooltip :offset="[8, 8]"> 放大 (Ctrl + 滚轮向上) </q-tooltip>
      </q-btn>

      <div class="x6-toolbar-center">
        <q-btn dense round flat :icon="showLeftDrawer ? 'archive' : 'o_archive'" @click="shLeftDrawer">
          <q-tooltip :offset="[8, 8]"> 组件库 </q-tooltip>
        </q-btn>
        <q-btn dense round flat :icon="showRightDrawer ? 'settings' : 'o_settings'" @click="shRightDrawer">
          <q-tooltip :offset="[8, 8]"> 编辑区 </q-tooltip>
        </q-btn>
        <q-btn dense round flat icon="filter_center_focus" @click="centerContent">
          <q-tooltip :offset="[8, 8]"> 居中 </q-tooltip>
        </q-btn>
        <q-btn dense round flat icon="auto_mode" class="small-icon" @click="layout">
          <q-tooltip :offset="[8, 8]"> 自动布局 </q-tooltip>
        </q-btn>
      </div>
      <q-space />
      <q-toggle
        dense
        size="sm"
        v-model="autoUploadCom"
        label="自动上传"
        style="margin-right: 12px"
        @click="emit('shAutoUpload')"
      />

      <q-separator inset vertical />

      <div class="row justify-end" style="width: 288px">
        <q-btn dense round flat icon="save" @click="saveFlowDraft" :loading="isSaving" :disable="!canSave">
          <q-tooltip :offset="[8, 8]"> 保存草稿 </q-tooltip>
        </q-btn>
        <q-btn dense round flat icon="feed" @click="show">
          <q-tooltip :offset="[8, 8]"> 智能输入配置 </q-tooltip>
        </q-btn>
        <q-btn dense round flat icon="play_circle_filled" @click="runWorkFlow" :disable="isSaving">
          <q-tooltip :offset="[8, 8]"> 提交任务 </q-tooltip>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>

  <bind-form
    ref="dragUpload"
    :draftId="flowData.id"
    :autoUpload="autoUpload"
    @dataFromJson="dataFromJson"
    @dispose="dispose"
    @initFlow="initFlow"
    @blankClickResponse="blankClickResponse"
    @shAutoUpload="shAutoUpload"
    @setNodeDrafts="setNodeDrafts"
  />
  <q-dialog persistent v-model="openFileDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">选择文件</div>
      </q-card-section>
      <q-card-section class="q-px-md q-py-none">
        <q-file v-model="file" filled counter accept=".json" style="width: 300px">
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="取消" color="grey-7" @click="cancel" v-close-popup />
        <q-btn
          flat
          label="确定"
          color="primary"
          @click="importJson"
          data-autofocus="true"
          :disabled="!file"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="prompt" persistent class="frosted-glass-dialog">
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">保存为模板</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="text-body1">名称</div>
        <q-input dense outlined v-model="promptData.name" class="q-pt-xs" />
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="text-body1">描述</div>
        <q-input dense outlined v-model="promptData.description" type="textarea" class="q-pt-xs" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" v-close-popup class="text-grey-7" />
        <q-btn
          flat
          label="保存"
          @click="saveFlowDraftAsTemplate"
          v-close-popup
          class="text-primary"
          :disable="!promptData.name"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
export default {
  name: 'HeaderComponent',
};
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useQuasar, date } from 'quasar';
import { DataUri, Graph } from '@antv/x6';
import { useRoute } from 'vue-router';
import { exportStylesheet, FlowDraft, NodeDraft } from '../interfaces';
import { DraftService } from 'src/service';
import BindForm from 'src/components/workflow/bind-form/BindForm.vue';
import { useCommonStore } from 'src/stores/common';

const props = defineProps({
  showGrid: {
    type: Boolean,
    default: false,
  },
  showLeftDrawer: {
    type: Boolean,
    default: true,
  },
  showRightDrawer: {
    type: Boolean,
    default: true,
  },
  zoom: {
    type: Number,
    default: 100,
  },
  graph: {
    type: Graph,
  },
  rightDrawer: {
    type: Object,
  },
  flowData: {
    type: Object,
    default() {
      return {
        id: '',
      };
    },
  },
  autoUpload: {
    type: Boolean,
    default: false,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  canSave: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits([
  'setZoom',
  'shGrid',
  'shLeftDrawer',
  'shRightDrawer',
  'dataFromJson',
  'initGraph',
  'initDnd',
  'initEvent',
  'initFlow',
  'setFlowData',
  'downloadData',
  'saveFlowDraft',
  'runWorkFlow',
  'layout',
  'setSpec',
  'layout',
  'shAutoUpload',
  'setNodeDrafts',
]);

// 开关自动上传
const autoUploadCom = computed(() => {
  return props.autoUpload;
});
const route = useRoute();
const $q = useQuasar();
const commonStore = useCommonStore();

const openFileDialog = ref(false);
const file: any = ref(null);
const dragUpload: any = ref(null);
/**
 * 保存模板dialog
 */
const prompt = ref(false);
const promptData = ref({ name: '', description: '' });

const toPageWithParams = (fullPath: string, params: any, event: any) => {
  if (fullPath !== route.fullPath) {
    const { x, y } = event;
    commonStore.lastParams = params;
    commonStore.animate(x, y, fullPath);
  }
};
const setNodeDrafts = (nodeDrafts: NodeDraft[]) => {
  emit('setNodeDrafts', nodeDrafts);
};
const shAutoUpload = () => {
  emit('shAutoUpload');
};
const dataFromJson = () => {
  emit('dataFromJson');
};
// 销毁工作流
const dispose = () => {
  props.graph?.dispose();
};
// 加载工作流
const initFlow = () => {
  emit('initFlow');
};
// 响应点击画布
const blankClickResponse = () => {
  props.rightDrawer?.blankClickResponse();
};
// 开始拖拽上传
function show() {
  const nodes = (props.graph as Graph).getNodes();
  dragUpload.value.open(nodes);
}
// 放大
const zoomIn = () => {
  if (props.zoom <= 280) {
    props.graph?.zoom(0.2); // 在原来缩放级别上增加 0.2
    setTimeout(() => {
      emit('setZoom', Number(((props.graph as Graph).zoom() * 100).toFixed(0)));
    }, 50);
  }
};
// 缩小
const zoomOut = () => {
  if (props.zoom >= 70) {
    props.graph?.zoom(-0.2); // 在原来缩放级别上减少 0.2
    setTimeout(() => {
      emit('setZoom', Number(((props.graph as Graph).zoom() * 100).toFixed(0)));
    }, 50);
  }
};
// 居中
const centerContent = () => {
  props.graph?.centerContent(); // 将画布内容中心与视口中心对齐
};
// 显示网格
const shGrid = () => {
  if (props.showGrid) props.graph?.hideGrid();
  else props.graph?.showGrid();
  emit('shGrid');
};
// 显示组件库
const shLeftDrawer = () => {
  emit('shLeftDrawer');
};
// 显示编辑面板
const shRightDrawer = () => {
  emit('shRightDrawer');
};
// 自动布局
const layout = () => {
  emit('layout');
};
// 导出工作流数据
const downloadData = () => {
  $q.dialog({
    title: '导出数据',
    message: '确定要导出该流程的 JSON 数据吗？',
    cancel: {
      flat: true,
      color: 'grey-7',
    },
    class: 'frosted-glass-card',
  }).onOk(() => {
    emit('downloadData');
  });
};
// 关闭弹窗后清空选择文件
const cancel = () => {
  file.value = null;
};
// 缩放到指定比例
const zoomTo = (num: number) => {
  (props.graph as any)?.zoomTo(num);
  setTimeout(() => {
    emit('setZoom', Number(((props.graph as Graph).zoom() * 100).toFixed(0)));
  }, 50);
};
// 缩放到适应内容
const zoomToFit = () => {
  (props.graph as any)?.zoomToFit();
  setTimeout(() => {
    emit('setZoom', Number(((props.graph as Graph).zoom() * 100).toFixed(0)));
  }, 50);
};
// 导入JSON文件
const importJson = () => {
  let reader = new FileReader();
  reader.readAsText(file.value);
  reader.onload = async () => {
    const json = JSON.parse(reader.result as string);
    await DraftService.validateFlowDraft(json);
    if (json.spec) {
      emit('setSpec', json.spec);
      emit('dataFromJson');
      props.graph?.dispose();
      emit('initGraph');
      emit('initDnd');
      emit('initEvent');
      setTimeout(() => {
        props.graph?.centerContent();
      }, 0);
      $q.notify({
        message: 'JSON 文件导入成功',
        type: 'positive',
      });
      file.value = null;
    } else {
      $q.notify({
        message: '导入失败，请检查数据是否正确',
        type: 'positive',
      });
      file.value = null;
    }
  };
};
// 导出SVG
const exportToSVG = () => {
  const width = (document.getElementById('x6-container') as HTMLElement).style.width;
  const height = (document.getElementById('x6-container') as HTMLElement).style.height;
  (props.graph as any)?.toSVG(
    (dataUri: string) => {
      DataUri.downloadDataUri(
        DataUri.svgToDataUrl(dataUri),
        'chart' + date.formatDate(new Date(), 'YYYYMMDDHHmm') + '.svg'
      );
    },
    {
      stylesheet: exportStylesheet,
      viewBox: {
        x: 240,
        y: 40,
        width: Number(width.substring(0, width.length - 2)) - 540,
        height: Number(height.substring(0, height.length - 2)) - 40,
      },
    }
  );
};
// 导出PNG
const exportToPNG = () => {
  (props.graph as any)?.toPNG(
    (dataUri: string) => {
      DataUri.downloadDataUri(dataUri, 'chart' + date.formatDate(new Date(), 'YYYYMMDDHHmm') + '.png');
    },
    {
      padding: 16,
      stylesheet: exportStylesheet,
      quality: 1,
      backgroundColor: '#dff9ff',
    }
  );
};
// 保存草稿
const saveFlowDraft = () => {
  emit('saveFlowDraft');
};
// 保存为模板
const openSaveTemplateDialog = () => {
  promptData.value = { name: props.flowData.name, description: props.flowData.description };
  prompt.value = true;
};
const saveFlowDraftAsTemplate = () => {
  let spec;
  emit('setFlowData', async (flowData: FlowDraft) => {
    spec = flowData.spec;
    if (!spec) {
      return;
    }
    await DraftService.saveFlowDraftAsTemplate(promptData.value as FlowDraft, spec);
    $q.notify({
      type: 'positive',
      message: '保存成功',
    });
  });
};
// 运行工作流
const runWorkFlow = async (event: any) => {
  emit('runWorkFlow', props.flowData.id, event);
};
</script>

<style lang="scss" scoped>
@import url('../FlowDraftEditor.scss');

.x6-toolbar {
  min-height: 40px;
  height: 40px;
}
.x6-toolbar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>
