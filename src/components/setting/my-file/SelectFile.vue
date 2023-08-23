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
        选择文件
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
              <span class="text">{{ item.name }}</span>
              <q-icon class="icon" name="keyboard_arrow_right"></q-icon>
            </div>
          </div>
        </div>
        <div class="table-template">
          <q-table
            flat
            square
            class="quasar-table"
            :rows="rows"
            :columns="(columns as any)"
            row-key="id"
            selection="multiple"
            v-model:selected="selected"
            :selected-rows-label="selectedString"
            rows-per-page-label="每页数量"
            :pagination-label="
              totalRowsNumber => {
                return `共${totalRowsNumber}条数据`;
              }
            "
            :pagination="{ rowsPerPage: 20 }"
          >
            <template v-slot:body="props">
              <q-tr :props="props" @click="nameClick(props.row, props.rowIndex)">
                <q-td align="center">
                  <q-checkbox dense v-model="props.selected" />
                </q-td>
                <q-td key="index" :props="props" style="padding: 0 10px">
                  <q-icon name="description" size="30px" color="grey" v-if="props.row.isFile"></q-icon>
                  <q-icon name="folder" size="30px" color="primary" v-else></q-icon>
                </q-td>
                <q-td key="name" :props="props" width="100%">
                  {{ props.row.name || props.row.fileName }}
                </q-td>
                <q-td key="createDate" :props="props">
                  {{ date.formatDate(props.row.createDate, 'YYYY/MM/DD HH:mm:ss') }}
                </q-td>
                <q-td key="oprate" :props="props">
                  <template v-if="props.row.isFile">
                    <q-icon
                      class="cursor-pointer"
                      size="30px"
                      name="check_box"
                      v-if="isSelected(props.row)"
                      @click="remove(props.row)"
                    ></q-icon>
                    <q-icon
                      class="cursor-pointer"
                      size="30px"
                      name="check_box_outline_blank"
                      v-else
                      @click="choose(props.row)"
                    ></q-icon>
                  </template>
                </q-td>
              </q-tr>
            </template>
            <template v-slot:no-data>
              <empty message="没有子文件" />
            </template>
          </q-table>
        </div>
        <div class="bottom-btns">
          <q-btn class="btn" color="primary" @click="submit">确定</q-btn>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { CloudFileService } from 'src/service';
import Empty from 'src/components/common/Empty.vue';
import { date } from 'quasar';

const emit = defineEmits(['success']);
const columns = [
  { name: 'index', field: 'index', width: '40' },
  { name: 'name', field: 'name', label: '名称', sortable: true, align: 'left' },
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

//获取文件列表
const selected: any = ref([]);

const rows: any = reactive([]);
async function getFiles() {
  selected.value.length = 0;
  let parentId = '';
  if (breadcrumbs.length) {
    parentId = breadcrumbs[breadcrumbs.length - 1].id;
  }
  let tree: any = await CloudFileService.getFiles(parentId, 'file');
  rows.length = 0;
  rows.push(...tree);
}
//文件多选
function isSelected(row: any) {
  let selectRow = selected.value.find((_s: any) => _s.id == row.id);
  if (selectRow) return true;
  else return false;
}
function choose(row: any) {
  selected.value.push(row);
}
function remove(row: any) {
  let selectRowIndex = selected.value.findIndex((_s: any) => _s.id == row.id);
  selected.value.splice(selectRowIndex, 1);
}
function submit() {
  emit('success', selected.value);
  close();
  selected.value.length = 0;
}
function selectedString() {
  if (!selected.value.length) return '';
  let folderNum = 0;
  let fileNum = 0;
  selected.value.forEach((row: any) => {
    if (row.isFile) fileNum++;
    else folderNum++;
  });
  return '已选' + (folderNum ? `${folderNum}个文件夹，` : '') + (fileNum ? `${fileNum}个文件` : '');
}

//点击名称
function nameClick(row: any, index: number) {
  if (!row.isFile) {
    breadcrumbs.push({ name: row.name, id: row.id });
    getFiles();
  }
}

//dialog操作
let dialog_show = ref(false);
const maximized = ref(false);
function open() {
  getFiles();
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
        .text {
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
    line-height: 35px;
    .text {
      float: left;
    }
    .btn {
      float: right;
    }
  }
}
</style>
