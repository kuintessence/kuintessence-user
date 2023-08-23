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
    <div class="dialog-container">
      <div class="dialog-title text-h6 row text-weight-regular q-mb-sm">
        选择文件夹
        <q-space />
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
      <div class="table-container">
        <div class="table-btns">
          <div class="breadcrumbs-div">
            <div class="breadcrumbs-item" @click="clickBreadcrumbs(-1)">
              <q-icon class="icon home-icon" name="home"></q-icon>
              <q-icon class="icon" name="keyboard_arrow_right"></q-icon>
            </div>
            <div
              class="breadcrumbs-item"
              v-for="(item, index) in breadcrumbs"
              :key="index"
              @click="clickBreadcrumbs(index)"
            >
              <span class="breadcrumbs-text">{{ item.name }}</span>
              <q-icon class="icon" name="keyboard_arrow_right"></q-icon>
            </div>
          </div>
          <q-icon name="create_new_folder" rounded class="btn" @click="addFolder"></q-icon>
        </div>
        <div class="table-template">
          <q-table
            flat
            square
            class="quasar-table"
            :rows="rows"
            :columns="(columns as any)"
            row-key="id"
            rows-per-page-label="每页数量"
            :pagination-label="
              totalRowsNumber => {
                return `共${totalRowsNumber}条数据`;
              }
            "
            :pagination="{ rowsPerPage: 20 }"
          >
            <template v-slot:body="props">
              <q-tr :props="props" @click="nameClick(props.row)">
                <q-td key="index" :props="props" style="padding: 0 10px">
                  <q-icon name="description" size="30px" color="grey" v-if="props.row.isFile"></q-icon>
                  <q-icon name="folder" size="30px" color="primary" v-else></q-icon>
                </q-td>
                <q-td key="name" :props="props" width="100%">
                  {{ props.row.name }}
                </q-td>
                <q-td key="createDate" :props="props">
                  {{ date.formatDate(props.row.createDate, 'YYYY/MM/DD HH:mm:ss') }}
                </q-td>
              </q-tr>
            </template>
            <template v-slot:no-data>
              <empty message="没有子文件夹" />
            </template>
          </q-table>
        </div>
        <div class="bottom-btns">
          <q-btn class="q-mr-sm" @click="copy"
            >复制{{ breadcrumbs.length ? `到 ${breadcrumbs[breadcrumbs.length - 1].name}` : '到 根目录' }}</q-btn
          >
          <q-btn color="primary" @click="move"
            >移动{{ breadcrumbs.length ? `到 ${breadcrumbs[breadcrumbs.length - 1].name}` : '到 根目录' }}</q-btn
          >
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { CloudFileService } from 'src/service';
import Empty from 'src/components/common/Empty.vue';
import { date, useQuasar } from 'quasar';

const emit = defineEmits(['success']);
const $q = useQuasar();
const columns = [
  {
    name: 'index',
    field: 'index',
    width: '40',
  },
  {
    name: 'name',
    required: true,
    field: 'name',
    label: '名称',
    format: (val: any) => `${val}`,
    sortable: true,
    align: 'left',
  },
  { name: 'createDate', label: '创建日期', field: 'createDate', sortable: true, align: 'left' },
];

//面包屑
const breadcrumbs: any = reactive([]);
function clickBreadcrumbs(index: number) {
  if (index == -1) {
    breadcrumbs.length = 0;
  } else {
    breadcrumbs.splice(index + 1);
  }
  getFiles();
}

//需要被操作的文件
const info: any = reactive({});
const rows: any = reactive([]);
//获取文件列表
async function getFiles() {
  let parentId = '';
  if (breadcrumbs.length) {
    parentId = breadcrumbs[breadcrumbs.length - 1].id;
  }
  let tree: any = await CloudFileService.getFiles(parentId, 'directory');
  rows.length = 0;
  rows.push(...tree);
}
getFiles();

//点击名称
function nameClick(row: any) {
  if (!row.isFile) {
    breadcrumbs.push({ name: row.name, id: row.id });
    getFiles();
  }
}
//新建文件夹
async function addFolder() {
  $q.dialog({
    title: '新建文件夹',
    prompt: {
      model: '新建文件夹',
      maxlength: 30,
      type: 'text',
      isValid: (val: string) => {
        if (!val) return false;
        else return true;
      },
    },
    cancel: true,
    persistent: true,
  }).onOk(name => {
    let parentId = '';
    if (breadcrumbs.length) {
      parentId = breadcrumbs[breadcrumbs.length - 1].id;
    }
    CloudFileService.addFile({ name, isDict: true, parentId }).then(() => {
      getFiles();
    });
  });
}
//复制
function copy() {
  let parentId = '';
  if (breadcrumbs.length) {
    parentId = breadcrumbs[breadcrumbs.length - 1].id;
  }
  CloudFileService.copy(info, parentId).then(() => {
    $q.notify({
      message: '复制成功',
      icon: 'check',
    });
    emit('success');
    close();
  });
}
function move() {
  let parentId = '';
  if (breadcrumbs.length) {
    parentId = breadcrumbs[breadcrumbs.length - 1].id;
  }
  CloudFileService.move(info, parentId).then(() => {
    $q.notify({
      message: '移动成功',
      icon: 'check',
    });
    emit('success');
    close();
  });
}
//dialog操作
let dialog_show = ref(false);
const maximized = ref(false);
function open(row: any) {
  Object.assign(info, row);
  dialog_show.value = true;
}
function close() {
  dialog_show.value = false;
}

defineExpose({
  open,
  close,
});
</script>

<style lang="scss" scoped>
.dialog-container {
  background: #fff;
  color: #333;
  width: 700px;
  height: 600px;
  max-width: 100%;
  max-height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.table-container {
  position: relative;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .table-btns {
    padding: 0 10px;
    height: 50px;
    line-height: 50px;
    display: flex;
    flex-direction: row;
    .btn {
      font-size: 40px;
      margin-top: 5px;
      color: #999;
      cursor: pointer;
      margin-left: 10px;
      &:hover {
        color: #333;
      }
    }
    .breadcrumbs-div {
      display: flex;
      overflow: hidden;
      overflow-x: auto;

      .breadcrumbs-item {
        cursor: pointer;
        white-space: nowrap;
        .breadcrumbs-text {
          max-width: 100px;
          min-width: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #999;
          vertical-align: middle;
          display: inline-block;
        }
        .icon {
          font-size: 30px;
          color: #999;
          vertical-align: middle;
        }
        &:hover {
          font-weight: bold;
          .home-icon {
            color: #333;
          }
        }
        &:last-child {
          .text {
            color: #1976d2;
          }
        }
      }
    }
  }
  .table-template {
    flex: 1;
    overflow: hidden;
    .quasar-table {
      max-height: 100%;
      color: #333;
      border-color: #eee;
    }
  }
  .bottom-btns {
    padding: 0 10px;
    height: 50px;
    line-height: 50px;
    text-align: right;
  }
}
</style>
