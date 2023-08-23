<template>
  <q-dialog
    v-model="dialog_show"
    :no-backdrop-dismiss="true"
    @update:model-value="close"
    @escape-key="close"
    :maximized="maximized"
    :full-width="maximized"
    :full-height="maximized"
  >
    <div class="dialog-container frosted-glass-card">
      <div class="dialog-title text-h6 q-mb-sm">
        <q-tabs v-model="tab" dense class="q-tabs" active-color="primary" narrow-indicator>
          <q-tab name="file" label="上传文件" class="rounded-borders" />
          <q-tab name="text" label="填写其他" class="rounded-borders" />
        </q-tabs>
        <span class="title-text">节点表单</span>
        <div class="q-btns">
          <q-btn dense flat icon="crop_square" v-if="!maximized" @click="maximized = true">
            <q-tooltip :offset="[8, 8]"> 最大化 </q-tooltip>
          </q-btn>
          <q-btn dense flat icon="minimize" v-else @click="maximized = false">
            <q-tooltip :offset="[8, 8]"> 最小化 </q-tooltip>
          </q-btn>
          <q-btn dense flat icon="close" @click="close">
            <q-tooltip :offset="[8, 8]"> 关闭 </q-tooltip>
          </q-btn>
        </div>
      </div>
      <div class="dialog-content">
        <q-tab-panels class="q-tab-panels" v-model="tab" animated keep-alive>
          <q-tab-panel name="file">
            <bind-file :draftId="draftId" :nodes="fileNodes" :autoUpload="autoUpload" @shAutoUpload="shAutoUpload" />
          </q-tab-panel>
          <q-tab-panel name="text">
            <bind-text :draftId="draftId" :nodes="textNodes" />
          </q-tab-panel>
        </q-tab-panels>

        <q-inner-loading :showing="loading" v-if="loading">
          <q-spinner-ios size="50px" color="primary" />
        </q-inner-loading>
      </div>
    </div>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { NodeDraft, SlotData, InputSlotKind, FileSlotData, TextSlotData } from 'src/service/workflow-slot';
import BindFile from './forms/BindFile.vue';
import BindText from './forms/BindText.vue';
import { Node } from '@antv/x6';

defineProps({
  draftId: {
    type: String,
    required: true,
  },
  autoUpload: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits([
  'dataFromJson',
  'dispose',
  'initFlow',
  'blankClickResponse',
  'shAutoUpload',
  'setNodeDrafts',
]);

//弹出框操作
let dialog_show = ref(false);
const maximized = ref(false);

function shAutoUpload() {
  emit('shAutoUpload');
}
function open(nodes: Node[]) {
  loadNodeList(nodes);
  dialog_show.value = true;
}
function close() {
  // validate();
  dialog_show.value = false;
}

//构建节点数据
const loading = ref(false);
const fileNodes = ref([] as NodeDraft[]);
const textNodes = ref([] as NodeDraft[]);
async function loadNodeList(nodes: Node[]) {
  loading.value = true;
  fileNodes.value = [];
  textNodes.value = [];
  nodes.forEach((node: Node) => {
    const nodeData: NodeDraft = node.getData();

    let fileSlots: FileSlotData[] = [];
    let textSlots: TextSlotData[] = [];
    nodeData.inputSlots.forEach((inputSlot: SlotData) => {
      if (inputSlot.kind == InputSlotKind.File) {
        fileSlots.push(<FileSlotData>inputSlot);
      }
      if (inputSlot.kind == InputSlotKind.Text) {
        textSlots.push(<TextSlotData>inputSlot);
      }
    });

    let fileNode = JSON.parse(JSON.stringify(nodeData));
    fileNode.inputSlots = fileSlots;
    fileNodes.value.push(fileNode);

    let textNode = JSON.parse(JSON.stringify(nodeData));
    textNode.inputSlots = textSlots;
    textNodes.value.push(textNode);
  });
  loading.value = false;
}

//切换tab
const tab = ref('file');

defineExpose({
  open,
  close,
});
</script>

<style lang="scss" scoped>
.dialog-container {
  color: #333;
  width: 1000px;
  height: 90%;
  max-width: 1000px;
  max-height: 90%;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.dialog-title {
  line-height: 50px;
  height: 50px;
  border-bottom: 1px solid #eee;
  position: relative;
  text-align: center;
  .q-tabs {
    position: absolute;
    left: 0;
    bottom: 0;
  }
  .q-btns {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
.dialog-content {
  flex: 1;
  overflow: hidden;
  .q-tab-panels {
    width: 100%;
    height: 100%;
  }
}
.q-tab-panels {
  background: transparent;
}
</style>
