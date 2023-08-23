<template>
  <div class="table-content">
    <div class="table-btns">
      <div class="breadcrumbs-div">
        <div class="breadcrumbs-item" @click="clickBreadcrumbs(-1)">
          <span class="home-text">文件管理</span>
          <q-icon class="icon" name="keyboard_arrow_right" v-if="breadcrumbs.length"></q-icon>
        </div>
        <div
          class="breadcrumbs-item"
          v-for="(item, index) in breadcrumbs"
          :key="index"
          @click="clickBreadcrumbs(index)"
        >
          <span class="breadcrumbs-text">{{ item.name }}</span>
          <q-icon class="icon" name="keyboard_arrow_right" v-if="index != breadcrumbs.length - 1"></q-icon>
        </div>
      </div>
      <div class="btns-div">
        <q-icon name="add" class="btn-icon shadow">
          <drop-menu :menus="addMenus"></drop-menu>
          <input type="file" ref="uploadFile" @change="fileUpload" style="display: none" />
        </q-icon>
      </div>
      <div class="progress-div" v-if="fileUploading">
        <q-linear-progress
          rounded
          size="18px"
          :value="progress.progress"
          class="q-mt-sm progress"
          :query="fileUploading == UploadState.uploading && progress.progress == 0 ? true : false"
          :color="fileUploading == UploadState.error ? 'negative' : 'primary'"
        />
        <div class="progress-text" v-if="fileUploading == UploadState.uploading">
          <span v-if="progress.progress == 0">正在准备上传..</span>
          <span v-else-if="progress.progress > 0 && progress.progress < 1">
            <span v-if="uploadFile?.files && uploadFile?.files[0]">共{{ FormatSize(uploadFile?.files[0]?.size) }}</span>
            <span v-if="progress.speed">，{{ progress.speed }}</span>
            <span v-if="progress.takeTime">，还剩{{ progress.takeTime }}</span>
          </span>
          <span v-else-if="progress.progress == 1">上传成功，正在保存...</span>
        </div>
        <div class="progress-text" v-if="fileUploading == UploadState.stopped">
          <span>上传已暂停</span>
        </div>
        <div class="progress-text" v-if="fileUploading == UploadState.canceled">
          <span>上传正在取消...</span>
        </div>
        <div class="progress-text error" v-if="fileUploading == UploadState.error">
          <span>上传失败了</span>
        </div>
      </div>

      <div>
        <q-btn
          flat
          dense
          color="primary"
          icon="pause"
          class="q-ml-sm"
          @click="pauseUpload"
          v-if="fileUploading == UploadState.uploading"
        >
          <q-tooltip>暂停上传</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          color="primary"
          icon="play_arrow"
          class="q-ml-sm"
          @click="retryUpload"
          v-if="fileUploading == UploadState.stopped"
        >
          <q-tooltip>开始上传</q-tooltip>
        </q-btn>
        <q-btn flat dense icon="refresh" class="q-ml-sm" @click="retryUpload" v-if="fileUploading == UploadState.error">
          <q-tooltip>重新上传</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          color="grey"
          icon="close"
          class="q-ml-sm"
          @click="cancelUpload"
          v-if="fileUploading && fileUploading != UploadState.canceled && fileUploading != UploadState.uploaded"
        >
          <q-tooltip>取消</q-tooltip>
        </q-btn>
      </div>
    </div>
    <div class="table-list">
      <q-table
        flat
        square
        virtual-scroll
        class="quasar-table"
        :rows="rows"
        :columns="(columns as any)"
        row-key="id"
        selection="multiple"
        v-model:selected="selected"
        :selected-rows-label="
          () => {
            return `已选：${selected.length}条`;
          }
        "
        rows-per-page-label="每页数量"
        :pagination-label="
          (firstRowIndex, endRowIndex, totalRowsNumber) => {
            return `共${totalRowsNumber}条数据`;
          }
        "
        :pagination="{ rowsPerPage: 20 }"
      >
        <template v-slot:header-cell-name>
          <q-th align="left">
            <span v-if="!selected.length">名称</span>
            <q-btn label="操作" color="primary" v-else>
              <drop-menu :menus="selectedMenus"></drop-menu>
            </q-btn>
          </q-th>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td align="center">
              <q-checkbox v-model="props.selected" />
            </q-td>
            <q-td key="index" :props="props" style="padding: 0">
              <q-icon name="description" size="30px" color="grey" v-if="props.row.isFile"></q-icon>
              <q-icon name="folder" size="30px" color="primary" v-else></q-icon>
            </q-td>
            <q-td
              key="name"
              :props="props"
              width="100%"
              style="cursor: pointer"
              @click.stop="nameClick(props.row, props.rowIndex)"
            >
              {{ props.row.name }}
              <span class="more-span" @click.stop="">
                <q-icon class="icon" size="20px" name="more_horiz" />
                <drop-menu :menus="rowMenus(props.row, props.rowIndex)"></drop-menu>
              </span>
            </q-td>
            <q-td key="fileSize" :props="props">
              {{ props.row.isFile ? FormatSize(props.row.fileSize) : '-' }}
            </q-td>
            <q-td key="createDate" :props="props">
              {{ date.formatDate(props.row.createDate, 'YYYY/MM/DD HH:mm:ss') }}
            </q-td>
            <q-td key="location" :props="props">
              <q-spinner-facebook color="primary" size="2em" v-if="props.row.locationLoading" />
              <q-btn
                v-if="props.row.location && props.row.location.length"
                size="sm"
                class="q-ml-sm"
                label="展开"
                outline
                color="primary"
                @click="locationClick(props.row)"
              ></q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data>
          <empty style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)" />
        </template>
      </q-table>
      <div class="info-div" :class="{ show: info }">
        <template v-if="info">
          <div class="top-div">
            <div class="info">
              <q-icon class="img" name="description" size="50px" color="primary"></q-icon>
              <div class="content">
                <div class="title">{{ info.name }}</div>
              </div>
            </div>
            <q-icon class="icon" name="close" size="30px" @click.stop="hideLocation()"></q-icon>
          </div>
          <q-scroll-area class="list-div">
            <div class="list-item" v-for="address in info.location" :key="address.id">
              <div class="title active">
                {{ address.name }}
              </div>
              <div class="btns">
                <q-btn size="xs" unelevated color="red" label="一键清空" />
              </div>
            </div>
          </q-scroll-area>
        </template>
      </div>
    </div>
    <select-folder ref="selectFolder" @success="getFiles"></select-folder>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { CloudFileService } from 'src/service';
import Empty from 'src/components/common/Empty.vue';
import DropMenu from 'src/components/common/DropMenu.vue';
import { FileService, FormatSize } from 'src/util/file';
import { date, useQuasar } from 'quasar';
import SelectFolder from 'src/components/setting/my-file/SelectFolder.vue';
import { UploadService, UploadState } from 'src/service/upload';

const $q = useQuasar();
const columns = [
  { name: 'index', field: 'index', width: '40' },
  { name: 'name', xfield: 'name', label: '名称', sortable: true, align: 'left' },
  { name: 'fileSize', label: '大小', field: 'fileSize', sortable: true, align: 'left' },
  { name: 'createDate', label: '创建日期', field: 'createDate', sortable: true, align: 'left' },
  { name: 'location', label: '存储位置', field: 'location', align: 'center' },
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

const rows: any = ref([]);
//获取文件列表
async function getFiles() {
  let parentId = '';
  if (breadcrumbs.length) {
    parentId = breadcrumbs[breadcrumbs.length - 1].id;
  }
  let tree: any = await CloudFileService.getFiles(parentId);
  rows.value = tree;
  rows.value.forEach((row: any) => {
    if (row.isFile) {
      getLocation(row);
    } else {
      row.locationLoading = false;
      row.address = '';
    }
  });
}
getFiles();
//获取存储位置
async function getLocation(row: any) {
  if (row.locationLoading) return;
  row.locationLoading = true;
  let res = await CloudFileService.getLocation(row.fileId);
  let address = '暂无';
  if (res.length) {
    address = res[0].name;
  }
  row.locationLoading = false;
  row.location = res;
  row.address = address;
}
//点击名称
function nameClick(row: any, index: number) {
  if (!row.isFile) {
    breadcrumbs.push({ name: row.name, id: row.id });
    getFiles();
  }
}
//上传文件菜单
const addMenus = [
  {
    label: '上传文件',
    icon: 'file_upload',
    func: upload,
  },
  {
    label: '新建文件夹',
    icon: 'folder',
    func: addFolder,
  },
];

//上传进度
const fileUploading = ref(); //0：默认值 ， 1：上传进行中 ，2：上传失败，
const progress = ref({ progress: 0, speed: '', takeTime: '' });
let cancel: (state: UploadState) => void;
let retry: () => void;
//上传文件
const uploadFile: any = ref(null);
function upload() {
  if (fileUploading.value == UploadState.uploading) {
    return $q.notify({ message: '当前有文件正在上传中...' });
  }
  uploadFile.value.click();
}

async function fileUpload() {
  fileUploading.value = UploadState.uploading;

  let parentId = '';
  if (breadcrumbs.length) {
    parentId = breadcrumbs[breadcrumbs.length - 1].id;
  }

  let files: any = uploadFile.value?.files;
  if (!files && !files.length) return;
  let file = files[0];

  CloudFileService.uploadCloudFile(
    file,
    parentId,
    (_progress: { state: UploadState; progress?: number; speed?: string; takeTime?: string }) => {
      //更新进度
      fileUploading.value = UploadState.uploading;
      _progress.progress && (progress.value.progress = _progress.progress);
      _progress.speed && (progress.value.speed = _progress.speed);
      _progress.takeTime && (progress.value.takeTime = _progress.takeTime);

      //更新状态
      if (_progress.state == UploadState.stopped) {
        fileUploading.value = UploadState.stopped;
      } else if (_progress.state == UploadState.canceled) {
        uploadFile.value.value = '';
        fileUploading.value = null;
        progress.value = { progress: 0, speed: '', takeTime: '' };
      }
      console.log('进度', _progress);
    },
    (_cancel: (state: UploadState) => void) => {
      cancel = _cancel;
    },
    (_retry: () => void) => {
      retry = _retry;
    }
  )
    .then(res => {
      uploadFile.value.value = '';
      fileUploading.value = null;
      progress.value = { progress: 0, speed: '', takeTime: '' };
      if (res) {
        getFiles();
        $q.notify({
          message: '上传成功',
          icon: 'check',
        });
      } else {
        console.log('error: 上传失败');
      }
    })
    .catch(error => {
      if (error?.message == UploadState.error) {
        console.log('上传失败', error);
        fileUploading.value = UploadState.error;
      }
      console.log('error: ' + error?.content || '上传失败');
    });
}
function pauseUpload() {
  fileUploading.value = UploadState.stopped;
  cancel && cancel(UploadState.stopped);
}
function cancelUpload() {
  uploadFile.value.value = '';
  fileUploading.value = null;
  progress.value = { progress: 0, speed: '', takeTime: '' };
  cancel && cancel(UploadState.canceled);
}
function retryUpload() {
  fileUploading.value = UploadState.uploading;
  progress.value.speed = '';
  progress.value.takeTime = '';
  retry && retry();
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
//文件多选
const selectedMenus = [
  {
    label: '下载',
    icon: 'file_download',
    func: downloadMultiple,
  },
  {
    label: '删除所选',
    icon: 'delete',
    func: delMultiple,
  },
];
const selected: any = ref([]);
function delMultiple() {
  let ids = selected.value.map((_row: any) => {
    return _row.id;
  });
  del(ids).then(() => {
    selected.value.length = 0;
  });
}
function downloadMultiple() {
  selected.value.map((_row: any) => {
    download(_row);
  });
}
//显示右边文件描述
const info = ref<any>(null);

function showLocation(row: any) {
  info.value = row;
}
function hideLocation() {
  info.value = null;
}

function locationClick(row: any) {
  if (info.value) {
    hideLocation();
  } else {
    showLocation(row);
  }
}
//选择文件夹
const selectFolder: any = ref(null);
//行菜单
function rowMenus(row: any, index: number) {
  let menus = [
    {
      label: '重命名',
      icon: 'edit',
      func: () => {
        rename(row);
      },
    },
    {
      label: '复制或移动',
      icon: 'content_copy',
      func: () => {
        copy(row);
      },
    },
    {
      label: row.isFile ? '删除文件' : '删除文件夹',
      icon: 'delete',
      func: () => {
        del([row.id]);
      },
    },
  ];
  if (row.isFile) {
    menus.unshift({
      label: '下载',
      icon: 'file_download',
      func: () => {
        download(row);
      },
    });
  }
  return menus;
}

async function download(row: any) {
  if (!row.isFile) return;
  let res: any = await UploadService.getDownFileUrl(row.fileId);
  FileService.downLoadFile({ fileName: row.fileName, url: res });
}
async function rename(row: any) {
  $q.dialog({
    title: '重命名',
    prompt: {
      model: row.name,
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
    CloudFileService.rename(row.id, name).then(() => {
      $q.notify({
        icon: 'check',
        message: '修改成功',
      });
      row.name = name;
    });
  });
}
function copy(row: any) {
  selectFolder.value.open(row);
}
async function del(ids: any) {
  $q.dialog({
    title: '提示',
    message: '确定要删除吗？',
    cancel: {
      flat: true,
      color: 'grey-7',
    },
  }).onOk(async () => {
    let res = await CloudFileService.del(ids);
    if (res) {
      $q.notify({
        icon: 'check',
        message: '删除成功',
      });
      getFiles();
    } else {
      $q.notify({
        icon: 'error',
        message: '该文件夹下有子文件，无法删除',
      });
    }
  });
}
</script>

<style lang="scss" scoped>
.table-content {
  position: relative;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
  .table-btns {
    border-radius: 2px;
    // padding: 0 10px;
    height: 50px;
    line-height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;

    .progress-div {
      width: 250px;
      margin-left: 10px;
      .progress {
        background: #ddd;
      }
      .progress-text {
        color: #999;
        font-size: 12px;
        line-height: 1;
        margin-top: 2px;
        &.error {
          color: #f57c00;
        }
      }
    }
    .breadcrumbs-div {
      flex: 1;
      display: flex;
      overflow: hidden;
      overflow-x: auto;

      .breadcrumbs-item {
        cursor: pointer;
        white-space: nowrap;
        .home-text {
          font-weight: 400;
        }
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
        }
        &:hover {
          font-weight: bold;
        }
        &:last-child {
          .breadcrumbs-text {
            color: #1976d2;
          }
        }
      }
    }
    .btns-div {
      .btn-icon {
        cursor: pointer;
        font-size: 25px;
        padding: 5px;
        color: #333;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.5);
      }
    }
  }
  .more-span {
    position: relative;
    float: right;
    color: #999;
    padding: 0 10px;
    &:hover {
      color: #333;
    }
  }
  .table-list {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    .quasar-table {
      flex: 1;
      height: 100%;
      min-width: 250px;
    }
    .info-div {
      width: 0;
      transition: all 0.5s;

      &.show {
        width: 300px;
        border-left: 1px solid rgba(0, 0, 0, 0.12);
      }
      .top-div {
        line-height: 40px;
        display: flex;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
        .info {
          flex: 1;
          display: flex;
          flex-direction: row;
          padding: 0 10px;
          .img {
            margin-right: 10px;
          }
          .content {
            flex: 1;
            .title {
              line-height: 30px;
              font-size: 18px;
              font-weight: bold;
            }
            .desc {
              font-size: 12px;
              line-height: 20px;
            }
          }
        }

        .icon {
          cursor: pointer;
          vertical-align: middle;
        }
      }
      .list-div {
        height: 100%;
      }
      .list-item {
        display: flex;
        flex-direction: row;
        line-height: 50px;
        padding: 0 10px;
        .title {
          flex: 1;
          &.active {
            color: #1976d2;
          }
        }
      }
    }
  }
}
</style>
