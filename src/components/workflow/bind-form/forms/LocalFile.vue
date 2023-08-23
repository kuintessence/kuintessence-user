<template>
  <div class="local-file" @dragover.prevent="" @drop.prevent="drop">
    <div class="file-btns">
      <q-btn unelevated color="primary" class="btn q-mr-sm q-mb-sm" @click="openSelectFile">云平台选择</q-btn>
      <select-file ref="selectFile" @success="selectSuncess" />
      <q-btn unelevated color="primary" class="btn upload-btn q-mr-sm q-mb-sm">
        <input class="input" type="file" :multiple="true" webkitdirectory @change="filesChange" /><span
          >本地选择文件夹</span
        >
      </q-btn>
      <q-btn unelevated color="primary" class="btn upload-btn q-mr-sm q-mb-sm">
        <input class="input" type="file" :multiple="true" @change="filesChange" /><span>本地选择文件</span>
      </q-btn>
    </div>
    <div class="file-folder" v-if="folders[0].children.length">
      <q-tree class="folder-tree" :nodes="folders" :default-expand-all="true" node-key="id" @lazy-load="onLazyLoad">
        <template v-slot:default-header="prop">
          <div
            class="tree-item"
            :id="`tree_${prop.node.id}`"
            :style="prop.node.file ? 'cursor: all-scroll;' : ''"
            :draggable="!!prop.node.file"
            @dragstart="dragStart($event, prop.node)"
            @dragover.prevent=""
            @click="clickFile(prop.node.file)"
            @mouseenter="hoverFile(prop.node.file, undefined)"
            @mouseleave="hoverFile(prop.node.file, true)"
          >
            <q-icon v-if="prop.node.file" name="description" color="orange" size="20px" />
            <div :class="{ 'tree-item-file': prop.node.file }">
              {{ prop.node.label }}
            </div>
          </div>
        </template>
        <template v-slot:default-body="props">
          <div class="tree-item-desc" v-if="props.node.file">
            {{ FormatSize(props.node.file.size) }}
          </div>
        </template>
      </q-tree>
    </div>
    <div class="file-empty" v-else>
      <span>将本地文件拖拽到此</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs, reactive, watch } from 'vue';
import { FileService, FormatSize } from 'src/util/file';
import { CloudFileService } from 'src/service';
import SelectFile from 'src/components/setting/my-file/SelectFile.vue';

const props = defineProps({
  currentHoverTree: {
    type: Object,
    required: false,
  },
});
const emit = defineEmits(['click-file', 'hover-file', 'drag-start']);

const { currentHoverTree } = toRefs(props);
//给左边树生成唯一id
let NodeID = 1;
function getNodeID() {
  return NodeID++;
}

//云平台选择
const selectFile: any = ref(null);
function openSelectFile() {
  selectFile.value.open();
}
function selectSuncess(rows: any) {
  let tree: any = [];
  rows.forEach((row: any) => {
    let _row: any = { label: row.name, id: getNodeID(), rowId: row.id };
    if (row.isFile) {
      _row.file = {
        name: row.name || row.fileName,
        size: row.fileSize,
        hash: row.fileHash,
        id: row.fileId,
      };
    } else {
      _row.lazy = true;
    }
    tree.push(_row);
  });
  folders[0].children.push(...tree);
}
//云平台选择的文件，使用懒加载
async function onLazyLoad({ node, key, done, fail }: any) {
  let res = await CloudFileService.getFiles(node.rowId);
  let tree: any = [];
  res.forEach((row: any) => {
    let _row: any = { label: row.name, id: getNodeID(), rowId: row.id };
    if (row.isFile) {
      _row.file = {
        name: row.name || row.fileName,
        size: row.fileSize,
        hash: row.fileHash,
        id: row.fileId,
      };
    } else {
      _row.lazy = true;
    }
    tree.push(_row);
  });
  done(tree);
}
//点击左侧file
function clickFile(file: any) {
  emit('click-file', file);
}
//鼠标悬浮在左侧file
function hoverFile(file: any, isLeave: boolean | undefined) {
  emit('hover-file', file, isLeave);
}
//左侧文件开始拖拽
function dragStart(ev: any, node: any) {
  ev.dataTransfer.setData('sourceData', JSON.stringify({ fromLocalFile: { treeId: node.id } }));
  emit('drag-start', ev, node);
}

//拖拽到左边整体文件框
function drop(ev: any) {
  let items = ev.dataTransfer.items;
  if (items.length) {
    [].forEach.call(items, (item: any) => {
      let entry = item.webkitGetAsEntry();
      if (!entry) return;
      FileService.readDirectoryAllFiles(entry).then((file_list: any) => {
        let tree: any = struct_tree(file_list);
        folders[0].children.push(tree[0]);
      });
    });
  }
}
//文件选择文件
async function filesChange(e: any) {
  let file_list: any = [];
  let files = e.target.files;
  for (let index = 0; index < files.length; index++) {
    const _file = files[index];
    let hash = await FileService.readFileToHashByBlake3(_file);
    file_list.push({
      fileEntry: _file,
      name: _file.name,
      size: _file.size,
      hash: hash,
      type: _file.type,
      path: _file.webkitRelativePath ? _file.webkitRelativePath : _file.name,
    });
  }
  let tree = struct_tree(file_list);
  folders[0].children.push(...tree);
}
//根据文件列表获取当前文件列表的文件夹层级
function struct_tree(file_list: Array<any>) {
  let nodes: any = [];

  let struct_node = (nodes: any, paths: Array<string>, file: any) => {
    if (paths.length == 0) return;
    let dirs = paths.splice(0, 1);
    let node = nodes.find((n: any) => n.label == dirs[0]);
    if (!node) {
      node = { label: dirs[0], id: getNodeID() };
      if (paths.length == 0) {
        node.file = file;
      } else {
        node.children = [];
      }
      nodes.push(node);
    }
    struct_node(node.children, paths, file);
  };

  file_list.forEach(f => {
    let path = f.path;
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    struct_node(nodes, path.split('/'), f);
  });

  return nodes;
}

// 根据treeId获取tree的item
function getTreeItem(treeId: string) {
  let treeItem: any;
  let getT = (items: any) => {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (item && item.id == treeId) {
        return (treeItem = item);
      }
      item.children && getT(item.children);
    }
  };
  getT(folders);
  return treeItem;
}

//是否显示文件列表,这里是批量上传定制功能，批量上传悬浮文件的时候，文件要高亮显示
watch(
  () => currentHoverTree,
  (newValue: any) => {
    if (newValue) {
      let findNodeFile = (node: any) => {
        if (node.file) {
          if (node.file.name == newValue.name && node.file.hash == newValue.hash) {
            let todiv: any = document.getElementById(`tree_${node.id}`);
            todiv.className = 'tree-item sparkle';
          }
        } else {
          node.children &&
            node.children.forEach((_node: any) => {
              findNodeFile(_node);
            });
        }
      };
      findNodeFile(folders[0]);
    }
  }
);

//文件夹结构
const folders: any = reactive([
  {
    label: '全部文件',
    children: [],
  },
]);

defineExpose({
  folders,
  getTreeItem,
});
</script>

<style lang="scss" scoped>
.local-file {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}
.file-btns {
  margin-bottom: 10px;
  .btn {
    cursor: pointer;
  }
  .input {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 999;
    opacity: 0;
    cursor: pointer;
  }
}
.file-folder {
  flex: 1;
  overflow: auto;
  .tree-item {
    display: flex;
    flex-wrap: wrap;
    .tree-item-file {
      color: #1976d2;
    }
    &.sparkle,
    &:hover {
      color: #279c10;
      .tree-item-file {
        font-weight: bold;
        color: #279c10;
      }
    }
  }
  .tree-item-desc {
    font-size: 12px;
    color: #999;
  }

  :deep(.q-tree__node-header-content) {
    color: #333;
  }
}
.file-empty {
  flex: 1;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  span {
    font-size: 25px;
    color: #999;
  }
}
</style>
