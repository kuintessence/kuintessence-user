<template>
  <div class="file-container">
    <!-- 左侧file的树 -->
    <div class="box left">
      <local-file
        ref="localFile"
        :currentHoverTree="currentHoverTree"
        @click-file="clickLocalFile"
        @hover-file="hoverLocalFile"
        @drag-start="localDragStart"
      />
    </div>
    <div class="center"><q-icon class="icon" name="arrow_forward"></q-icon></div>
    <!-- 右侧的节点列表-->
    <div class="box right">
      <div class="node-container">
        <div class="node-btns">
          <q-btn unelevated class="btn" color="positive" style="margin-right: 10px" @click="matchFiles">智能匹配</q-btn>
          <q-toggle
            dense
            size="sm"
            v-model="autoUploadCom"
            label="自动上传"
            style="margin-right: 12px"
            @click="shAutoUpload"
          />
        </div>
        <div class="node-list" v-if="nodes.length">
          <div class="node-item" v-for="(node, nodeIndex) in nodes" :key="nodeIndex">
            <div class="node-title">
              <!-- 批量节点 显示特殊icon -->
              <q-icon v-if="(node as any).isBatch" class="title-icon" name="view_list" color="secondary">
                <q-tooltip>批量节点</q-tooltip>
              </q-icon>
              {{ (node as any).name }}
            </div>
            <div class="node-child-list">
              <div
                class="node-child-item"
                :id="`${(node as any).externalId}_${slot.slotId}`"
                v-for="(slot, slotIndex) in (node as any).inputSlots"
                :key="slotIndex"
              >
                <slot-input-view
                  :autoUpload="autoUpload"
                  :draftId="draftId"
                  :slotData="slot"
                  :nodeIsBatch="(node as any).isBatch"
                  :currentHoverFile="currentHoverFile"
                  @hover-file="hoverNode"
                  @drop="drop($event, node as any, slot)"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="node-empty" v-else>您还没选择节点</div>
      </div>
    </div>
    <!-- 右侧的节点列表-->
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs, computed } from 'vue';
import { DraftService } from 'src/service';
import SlotInputView from 'src/components/flow-draft-editor/input-slot/InputView.vue';
import { useQuasar } from 'quasar';
import { UploadState } from 'src/service/upload';
import {
  InputSlotKind,
  SlotData,
  FileSlotData,
  NodeDraft,
  WorkflowSlotService,
  FileSlotDataResult,
} from 'src/service/workflow-slot';
import LocalFile from './LocalFile.vue';

const props = defineProps({
  draftId: {
    type: String,
    required: true,
  },
  nodes: {
    type: Array,
    required: true,
  },
  autoUpload: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['shAutoUpload']);

const $q = useQuasar();
const { draftId, nodes } = toRefs(props);

const autoUploadCom = computed(() => {
  return props.autoUpload;
});
//本地文件ref
const localFile = ref();

function shAutoUpload() {
  emit('shAutoUpload');
}
//点击本地file
function clickLocalFile(file: any) {
  if (!file) return;
  // 高亮显示
  for (let ni = 0; ni < nodes.value.length; ni++) {
    let node: NodeDraft = nodes.value[ni] as any;
    for (let i = 0; i < node.inputSlots.length; i++) {
      let item: FileSlotData = <FileSlotData>node.inputSlots[i];
      let rfile = item.result.find((r: FileSlotDataResult) => {
        r.name == file.name;
      });
      if (rfile) {
        (document as any).getElementById(`${node.externalId}_${item.slotId}`).scrollIntoView(true);
        return;
      }
    }
  }
}
//鼠标悬浮在左侧file上 高亮右边匹配文件
const currentHoverFile: any = ref(null);
function hoverLocalFile(file: any, isLeave: boolean) {
  if (isLeave) {
    currentHoverFile.value = null;
  } else {
    currentHoverFile.value = file;
  }
}
//取消右边所有文件的展示
function localDragStart() {
  let todivs = document.getElementsByClassName('file-list-div');
  [].forEach.call(todivs, (_div: Element) => {
    _div.className = 'file-list-div';
  });
}
//鼠标悬浮右侧文件 左边高亮
const currentHoverTree: any = ref(null);
function hoverNode(file: FileSlotDataResult, isLeave: boolean) {
  if (isLeave) {
    currentHoverTree.value = null;
  } else {
    currentHoverTree.value = file;
  }
}
/*  系统匹配文件,匹配规则是
        1.按文件名匹配
		    2.如果文件名重名，则按他直接上级文件夹当作node节点的名称，通过node名称和文件名称共同匹配
    */
function matchFiles() {
  let folders = localFile.value.folders;
  if (!(folders && folders[0].children.length)) return $q.notify({ message: '请先上传文件', icon: 'info' });
  let findAllTreeItem = (fileName: string) => {
    let result: Array<{ treeItem: any; parentName: string }> = [];
    let findItem = (treeArr: Array<object>, parentTreeName: string) => {
      treeArr.forEach((tree: any, treeIndex: number) => {
        if (tree.file) {
          if (tree.file.name == fileName) {
            result.push({ treeItem: tree, parentName: parentTreeName });
          }
        } else {
          tree.children && findItem(tree.children, tree.label);
        }
      });
    };
    findItem(folders, '');
    return result;
  };
  let num = 0;
  nodes.value.forEach(node => {
    let inputSlots = <FileSlotData[]>(node as NodeDraft).inputSlots;
    inputSlots.forEach((item: FileSlotData, itemIndex: number) => {
      if (item.kind != InputSlotKind.File) return;
      let fileName = (<FileSlotData>item).dataName || item.name;
      if (!fileName) return;
      let resultTree = findAllTreeItem(fileName);
      let matchTreeItem = resultTree.find((_t: any) => {
        _t.parentName == (node as NodeDraft).name;
      });
      if (!matchTreeItem && resultTree.length) {
        matchTreeItem = resultTree[0];
      }
      if (matchTreeItem && matchTreeItem.treeItem) {
        let treeItem = matchTreeItem.treeItem;
        if (item?.result) {
          let ff = item.result.find((_f: any) => _f.name == treeItem.file.name && _f.hash == treeItem.file.hash);
          if (!ff) {
            if (item.isMultiple) {
              num++;
              item.result.push({
                name: treeItem.file.name,
                size: treeItem.file.size,
                hash: treeItem.file.hash,
              });
              saveRelation(node as NodeDraft, item, item.result.length - 1, treeItem);
            } else {
              if (item.result && item.result.length) return;
              num++;
              item.result = [
                {
                  name: treeItem.file.name,
                  size: treeItem.file.size,
                  hash: treeItem.file.hash,
                },
              ];
              saveRelation(node as NodeDraft, item, 0, treeItem);
            }
          }
        } else {
          num++;
          item.result = [
            {
              name: treeItem.file.name,
              size: treeItem.file.size,
              hash: treeItem.file.hash,
            },
          ];
          saveRelation(node as NodeDraft, item, 0, treeItem);
        }
      }
    });
  });
  $q.notify({ message: `共匹配到${num}个文件` });
}

//拖拽文件到右侧文件
function drop(ev: any, targetNode: NodeDraft, targetItem: FileSlotData) {
  let sourceData = ev.dataTransfer.getData('sourceData');
  if (!sourceData) return;
  let source = JSON.parse(sourceData);
  if (source.fromLocalFile) {
    let fromLocalFile = source.fromLocalFile;
    if (fromLocalFile.treeId == undefined) return;
    //获取file在localFile的源数据
    let treeItem: any = localFile.value.getTreeItem(fromLocalFile.treeId);
    if (!treeItem) return;
    //左侧file赋值给右侧node
    if (targetItem.result) {
      let ff = targetItem.result.find(
        (_f: FileSlotDataResult) => _f.name == treeItem.file.name && _f.hash == treeItem.file.hash
      );
      if (ff) return $q.notify({ message: '文件已存在' });
      if (targetItem.isMultiple) {
        //目标是高通量节点
        targetItem.result.push({
          name: treeItem.file.name,
          size: treeItem.file.size,
          hash: treeItem.file.hash,
        });
        saveRelation(targetNode, targetItem, targetItem.result.length - 1, treeItem);
      } else {
        targetItem.result = [
          {
            name: treeItem.file.name,
            size: treeItem.file.size,
            hash: treeItem.file.hash,
          },
        ];
        saveRelation(targetNode, targetItem, 0, treeItem);
      }
    } else {
      targetItem.result = [
        {
          name: treeItem.file.name,
          size: treeItem.file.size,
          hash: treeItem.file.hash,
        },
      ];
      saveRelation(targetNode, targetItem, 0, treeItem);
    }
  }
}

//保存文件和node之间的关系
async function saveRelation(targetNode: NodeDraft, targetItem: FileSlotData, targetFileIndex: number, treeItem: any) {
  let targetFile = targetItem.result[targetFileIndex];
  if (!targetFile) return;
  if (treeItem.file.id) {
    targetFile.id = treeItem.file.id;
    saveNodeFile(targetItem);
  } else {
    targetFile.fileEntry = treeItem.file.fileEntry;
    //如果是自动上传，就直接上传文件
    if (props.autoUpload) {
      let fileId = await upload(targetFile, targetItem);
      treeItem.file.id = fileId;
      saveNodeFile(targetItem);
    } else {
      saveNodeFile(targetItem);
    }
  }
}
//保存节点对应file的数据关系
async function saveNodeFile(slotData: SlotData) {
  //实时保存到数据库
  WorkflowSlotService.updateSlot(draftId.value, slotData);
}

//文件上传
async function upload(targetFile: FileSlotDataResult, targetItem: FileSlotData) {
  if (!targetFile) return;
  targetFile.uploadStatus = UploadState.uploading;
  targetFile.progress = { progress: 0, speed: '', takeTime: '' };
  if (!targetFile.fileEntry) return;
  return DraftService.uploadDraftFile(
    draftId.value,
    targetFile.fileEntry,
    (progress: { state: UploadState; progress?: number; speed?: string; takeTime?: string }) => {
      //更新状态
      if (progress.state == UploadState.stopped) {
        targetFile.uploadStatus = UploadState.stopped;
      } else if (progress.state == UploadState.canceled) {
        targetFile.uploadStatus = UploadState.canceled;
        let targetFileIndex = targetItem.result.findIndex(r => r.hash && r.hash == targetFile.hash);
        targetItem.result.splice(targetFileIndex, 1);
      } else if (progress.state == UploadState.uploading) {
        //更新进度
        targetFile.uploadStatus = UploadState.uploading;
        if (targetFile.progress) {
          progress.progress && (targetFile.progress.progress = progress.progress);
          progress.speed && (targetFile.progress.speed = progress.speed);
          progress.takeTime && (targetFile.progress.takeTime = progress.takeTime);
        } else {
          targetFile.progress = {
            progress: progress.progress || 0,
            speed: progress.speed || '',
            takeTime: progress.takeTime || '',
          };
        }
      }
    },
    (cancel: (state: UploadState) => void) => {
      //中断执行方法赋值给file
      targetFile.cancel = cancel;
    },
    (_retry: () => void) => {
      targetFile.retry = _retry;
    }
  )
    .then((fileId: string) => {
      //上传成功
      targetFile.id = fileId;
      targetFile.progress = { progress: 1, speed: '', takeTime: '' };
      targetFile.uploadStatus = UploadState.uploaded;

      return fileId;
    })
    .catch((error: any) => {
      //上传失败
      if (error?.message == UploadState.error) {
        targetFile.uploadStatus = UploadState.error;
      }
      console.log('error: ' + error?.content || '上传失败');
      throw error;
    });
}
</script>

<style lang="scss" scoped>
.file-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  .center {
    margin: 0 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    .icon {
      font-size: 30px;
      color: #999;
    }
  }
  .box {
    height: 100%;
    border: 2px dashed #999;
    padding: 10px;
    overflow: hidden;
    border-radius: 4px;
    position: relative;
    &.left {
      width: 60%;
    }
    &.right {
      flex: 1;
    }
  }
}
.node-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .node-btns {
    margin-bottom: 10px;
    text-align: right;
  }
  .node-list {
    flex: 1;
    overflow: auto;
    .node-item {
      margin-right: 10px;
      margin-bottom: 10px;
      .node-title {
        color: #333;
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 10px;
      }
      .title-icon {
        font-size: 20px;
      }
      .node-child-list {
        padding-left: 20px;
        .node-child-item {
          width: 100%;
          margin-right: 10px;
          margin-bottom: 20px;
        }
      }
    }
  }
  .node-empty {
    flex: 1;
    font-size: 20px;
    color: #999;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
