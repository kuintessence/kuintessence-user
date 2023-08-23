<template>
  <div class="file-slot-container" @dragover.prevent="" @drop.prevent.stop="drop">
    <input type="file" :multiple="isMultiple" class="upload-input" ref="uploadInput" @change="fileChange" />
    <div class="btn-div">
      <q-icon class="add-icon" name="cloud_upload" @click="pick">
        <q-tooltip>点击选择文件</q-tooltip>
      </q-icon>
      <q-icon
        v-if="isMultiple && result && result.length > 1"
        class="down-icon"
        :name="list_show ? 'close' : 'list'"
        @click.stop="toogleListShow"
      >
        <q-tooltip>{{ list_show ? '收起' : '展开' }}{{ result.length }}个文件列表</q-tooltip>
      </q-icon>
    </div>
    <div class="file-div" v-if="result && result.length">
      <div class="file-container">
        <div
          class="file-content"
          @mouseenter="hoverFile(result[0], undefined)"
          @mouseleave="hoverFile(result[0], true)"
        >
          <div
            class="content-div"
            :class="{
              sparkle: expandProps.currentHoverFile && expandProps.currentHoverFile.name == result[0].name,
            }"
          >
            <q-icon class="left-icon" name="description"></q-icon>
            <div class="file-title">
              <div class="file-name">{{ result[0].name }}</div>
              <div class="file-size">{{ FormatSize(result[0].size) }}</div>
            </div>
            <q-icon class="right-icon" color="red" name="error" v-if="result[0].uploadStatus == UploadState.error">
              <q-tooltip>上传失败，请重新上传</q-tooltip>
            </q-icon>
            <q-icon class="right-icon" color="green" name="check_circle" v-if="result[0].id">
              <q-tooltip>上传成功</q-tooltip>
            </q-icon>
            <q-linear-progress
              stripe
              rounded
              size="5px"
              :value="result[result.length - 1].progress.progress"
              color="primary"
              class="q-mt-sm progress"
              :query="result[result.length - 1].progress.progress == 0 ? true : false"
              v-if="
                result[result.length - 1].uploadStatus != UploadState.uploaded && result[result.length - 1].progress
              "
            />
          </div>
          <div class="btns-div">
            <q-btn
              icon="pause"
              dense
              flat
              color="primary"
              @click="pause(result[result.length - 1])"
              v-if="result[result.length - 1].uploadStatus == UploadState.uploading"
            >
              <q-tooltip>暂停上传</q-tooltip>
            </q-btn>

            <q-btn
              icon="play_arrow"
              dense
              flat
              color="primary"
              @click="retry(result[result.length - 1])"
              v-if="result[result.length - 1].uploadStatus == UploadState.stopped"
            >
              <q-tooltip>开始上传</q-tooltip>
            </q-btn>
            <q-btn
              icon="refresh"
              dense
              flat
              color="primary"
              @click="retry(result[result.length - 1])"
              v-if="result[result.length - 1].uploadStatus == UploadState.error"
            >
              <q-tooltip>重新上传</q-tooltip>
            </q-btn>
            <q-btn
              icon="close"
              dense
              flat
              color="grey"
              @click="cancel(result[result.length - 1])"
              v-if="
                result[result.length - 1].uploadStatus &&
                result[result.length - 1].uploadStatus != UploadState.uploaded &&
                !result[result.length - 1].id
              "
            >
              <q-tooltip>取消上传</q-tooltip>
            </q-btn>
            <q-btn icon="delete" dense flat color="grey" @click="del(result.length - 1)" v-else>
              <q-tooltip>删除文件</q-tooltip>
            </q-btn>
          </div>
        </div>
        <div class="error-content" v-if="result[0] && result[0].isError">
          <span>{{ result[0].errorMessage || '格式错误' }}</span>
        </div>
      </div>
      <div class="file-list-div" :class="{ show: list_show }">
        <div class="file-container" v-for="(fileItem, fileIndex) in result" :key="fileIndex">
          <div
            :id="`file_${fileIndex}`"
            class="file-content"
            @mouseenter="hoverFile(fileItem, undefined)"
            @mouseleave="hoverFile(fileItem, true)"
            :key="fileIndex"
          >
            <div
              class="content-div"
              :class="{
                sparkle: expandProps.currentHoverFile && expandProps.currentHoverFile.name == fileItem.name,
              }"
            >
              <q-icon class="left-icon" name="description"></q-icon>
              <div class="file-title">
                <div class="file-name">{{ fileItem.name }}</div>
                <div class="file-size">{{ FormatSize(fileItem.size) }}</div>
              </div>
              <q-icon class="right-icon" color="red" name="error" v-if="fileItem.uploadStatus == UploadState.error">
                <q-tooltip>上传失败，请重新上传</q-tooltip>
              </q-icon>
              <q-icon class="right-icon" color="green" name="check_circle" v-if="fileItem.id">
                <q-tooltip>上传成功</q-tooltip>
              </q-icon>
              <q-linear-progress
                stripe
                rounded
                size="5px"
                :value="fileItem.progress.progress"
                color="primary"
                class="q-mt-sm progress"
                :query="
                  fileItem.uploadStatus == UploadState.uploading && fileItem.progress.progress == 0 ? true : false
                "
                v-if="fileItem.uploadStatus != UploadState.uploaded && fileItem.progress"
              />
            </div>
            <div class="btns-div">
              <q-btn
                icon="pause"
                dense
                flat
                color="primary"
                @click="pause(result[fileIndex])"
                v-if="result[fileIndex].uploadStatus == UploadState.uploading"
              >
                <q-tooltip>暂停上传</q-tooltip>
              </q-btn>

              <q-btn
                icon="play_arrow"
                dense
                flat
                color="primary"
                @click="retry(result[fileIndex])"
                v-if="result[fileIndex].uploadStatus == UploadState.stopped"
              >
                <q-tooltip>开始上传</q-tooltip>
              </q-btn>
              <q-btn
                icon="refresh"
                dense
                flat
                color="primary"
                @click="retry(result[fileIndex])"
                v-if="result[fileIndex].uploadStatus == UploadState.error"
              >
                <q-tooltip>重新上传</q-tooltip>
              </q-btn>
              <q-btn
                icon="close"
                dense
                flat
                color="grey"
                @click="cancel(result[fileIndex])"
                v-if="
                  result[fileIndex].uploadStatus &&
                  result[fileIndex].uploadStatus != UploadState.uploaded &&
                  !result[fileIndex].id
                "
              >
                <q-tooltip>取消上传</q-tooltip>
              </q-btn>
              <q-btn icon="delete" dense flat color="grey" @click="del(fileIndex)" v-else>
                <q-tooltip>删除文件</q-tooltip>
              </q-btn>
            </div>
          </div>
          <div class="error-content" v-if="fileItem.isError">
            <span>{{ fileItem.errorMessage || '格式错误' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="file-empty" v-else>拖拽到此或点击上传</div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SlotInputFile',
};
</script>

<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue';
import { FormatSize, FileService, readDirectoryAllFilesReturn } from 'src/util/file';
import { DraftService } from 'src/service';
import { UploadState } from 'src/service/upload';
import { FileSlotDataResult } from 'src/service/workflow-slot';
import { useQuasar } from 'quasar';

const props = defineProps({
  //草稿ID
  draftId: {
    type: String,
    required: true,
  },
  //是否开启自动上传
  autoUpload: {
    type: Boolean,
    default: false,
  },
  result: {
    type: Array,
    required: true,
  },
  //是否是高通量
  isMultiple: {
    type: Boolean,
    default: false,
  },
  //扩展字段
  expandProps: {
    type: Object,
    default: () => {
      return {};
    },
  },
});
const emit = defineEmits(['hover-file', 'drop']);

const $q = useQuasar();

const { draftId, autoUpload, result, isMultiple, expandProps }: any = toRefs(props);
//文件列表显示控制
const list_show = ref(false);

//鼠标悬浮在文件上，显示文件列表
function toogleListShow($event: any) {
  list_show.value = !list_show.value;
}
//是否显示文件列表,这里是批量上传定制功能，批量上传悬浮文件的时候，文件要高亮显示
watch(expandProps, (newValue: any) => {
  list_show.value = false;
  if (newValue.currentHoverFile) {
    for (let index = 0; index < result.value.length; index++) {
      const _f = result.value[index];
      if (
        newValue.currentHoverFile &&
        _f.name == newValue.currentHoverFile.name &&
        _f.hash == newValue.currentHoverFile.hash
      ) {
        return (list_show.value = true);
      }
    }
  }
});

//悬浮在某一个文件上
function hoverFile(file: FileSlotDataResult, isLeave: boolean | undefined) {
  emit('hover-file', file, isLeave);
}

//点击文件框选择文件
const uploadInput: any = ref(null);
function pick() {
  uploadInput.value.click();
}
function fileChange($event: any) {
  let files: File[] = $event.target && $event.target.files;
  if (isMultiple.value) {
    [].forEach.call(files, (_file: File) => {
      let newFile: FileSlotDataResult = {
        fileEntry: _file,
        name: _file.name,
        size: _file.size,
        hash: '',
      };
      FileService.readFileToHashByBlake3(_file).then((hash: string) => {
        newFile.hash = hash;
        let ff = result.value.find((_f: FileSlotDataResult) => _f.name == newFile.name && _f.hash == newFile.hash);
        if (!ff) {
          result.value.push(newFile);
          if (result.value.length > 1) {
            list_show.value = true;
          }
          uploadFile(result.value.length - 1);
        } else {
          $q.notify({ message: '文件已存在' });
        }
      });
    });
  } else {
    FileService.readFileToHashByBlake3(files[0]).then((hash: string) => {
      if (result.value.length && files[0].name == result.value[0].name && hash == result.value[0].hash)
        return $q.notify({ message: '文件已存在' });
      result.value[0] = {
        fileEntry: files[0],
        name: files[0].name,
        hash: hash,
        size: files[0].size,
        id: '',
      };

      uploadFile(0);
    });
  }
  setTimeout(() => {
    uploadInput.value.value = null;
  }, 200);
}
//拖拽文件到文件框上
function drop($event: any) {
  let items = $event.dataTransfer.items;
  if (items.length) {
    [].forEach.call(items, (item: DataTransferItem) => {
      if (item.kind != 'file') return emit('drop', $event);
      let entry = item.webkitGetAsEntry();
      if (!entry) return;
      FileService.readDirectoryAllFiles(entry).then((file_list: readDirectoryAllFilesReturn[]) => {
        if (isMultiple.value) {
          [].forEach.call(file_list, (_file: readDirectoryAllFilesReturn) => {
            let newFile: FileSlotDataResult = {
              fileEntry: _file.fileEntry,
              name: _file.name,
              size: _file.size,
              hash: '',
            };
            FileService.readFileToHashByBlake3(_file.fileEntry).then((hash: string) => {
              newFile.hash = hash;
              let ff = result.value.find(
                (_f: FileSlotDataResult) => _f.name == newFile.name && _f.hash == newFile.hash
              );
              if (!ff) {
                result.value.push(newFile);
                if (result.value.length > 1) {
                  list_show.value = true;
                }
                uploadFile(result.value.length - 1);
              } else {
                $q.notify({ message: '文件已存在' });
              }
            });
          });
        } else {
          FileService.readFileToHashByBlake3(file_list[0].fileEntry).then((hash: string) => {
            if (result.value.length && file_list[0].name == result.value[0].name && hash == result.value[0].hash)
              return $q.notify({ message: '文件已存在' });
            result.value[0] = {
              fileEntry: file_list[0].fileEntry,
              name: file_list[0].name,
              hash: hash,
              size: file_list[0].size,
              type: file_list[0].type,
              id: '',
            };

            uploadFile(0);
          });
        }
      });
    });
  } else {
    emit('drop', $event);
  }
}
async function uploadFile(fileIndex: number) {
  if (autoUpload.value && autoUpload.value) {
    //如果是自动上传，就直接上传文件
    await upload(result.value[fileIndex]);
    //上传成功后保存对应文件关系
  }
}

//文件上传
async function upload(fileItem: FileSlotDataResult) {
  if (!fileItem.fileEntry) return;
  fileItem.uploadStatus = UploadState.uploading;
  fileItem.progress = { progress: 0, speed: '', takeTime: '' };
  return DraftService.uploadDraftFile(
    draftId.value,
    fileItem.fileEntry,
    (progress: { state: UploadState; progress?: number; speed?: string; takeTime?: string }) => {
      //更新状态
      if (progress.state == UploadState.stopped) {
        fileItem.uploadStatus = UploadState.stopped;
      } else if (progress.state == UploadState.canceled) {
        fileItem.uploadStatus = UploadState.canceled;
        let fileIndex = result.value.findIndex((r: FileSlotDataResult) => r.hash && r.hash == fileItem.hash);
        result.value.splice(fileIndex, 1);
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
      }
    },
    (cancel: (state: UploadState) => void) => {
      //中断执行
      fileItem.cancel = cancel;
    },
    (retry: () => void) => {
      fileItem.retry = retry;
    }
  )
    .then((fileId: string) => {
      //上传成功
      fileItem.id = fileId;
      fileItem.progress = { progress: 1, speed: '', takeTime: '' };
      fileItem.uploadStatus = UploadState.uploaded;

      return fileId;
    })
    .catch(error => {
      //上传失败
      if (error?.message == UploadState.error) {
        fileItem.uploadStatus = UploadState.error;
      }
      console.log('error: ' + error?.content || '上传失败');
      throw error;
    });
}
//暂停
function pause(fileItem: FileSlotDataResult) {
  fileItem.cancel && fileItem.cancel(UploadState.stopped);
}
function retry(fileItem: FileSlotDataResult) {
  fileItem.uploadStatus = UploadState.uploading;
  fileItem.progress?.speed && (fileItem.progress.speed = '');
  fileItem.progress?.takeTime && (fileItem.progress.takeTime = '');
  fileItem.retry && fileItem.retry();
}
//取消
function cancel(fileItem: FileSlotDataResult) {
  fileItem.cancel && fileItem.cancel(UploadState.canceled);
}

//删除文件
function del(fileIndex: number) {
  result.value.splice(fileIndex, 1);
}
</script>

<style lang="scss" scoped>
.file-slot-container {
  width: 100%;
  min-width: 180px;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
}
.upload-input {
  display: none;
}
.btn-div {
  padding: 0 5px;
  .add-icon {
    font-size: 25px;
    cursor: pointer;
    color: #999;
  }
  .down-icon {
    margin-left: 10px;
    font-size: 25px;
    cursor: pointer;
    color: #999;
  }
}

.file-div {
  position: relative;
  width: 100%;
  padding: 10px;
  .down-icon {
    font-size: 20px;
    position: absolute;
    right: 0;
    bottom: 0;
  }
  .file-container {
    margin-top: 5px;
  }
  .file-content {
    width: 100%;
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    .content-div {
      flex: 1;
      border: 1px solid #eee;
      border-radius: 4px;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 5px;
      position: relative;
      &.sparkle,
      &:hover {
        color: #279c10;
        font-weight: bold;
      }
      .left-icon {
        font-size: 30px;
        margin: 2px 5px;
      }
      .right-icon {
        font-size: 20px;
        padding-left: 5px;
        position: absolute;
        top: 0;
        right: 0;
      }
      .progress {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
      }
      .file-title {
        flex: 1;
        width: 0;
        .file-name {
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .file-size {
          font-size: 12px;
          color: #999;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    .remove-icon {
      font-size: 25px;
      color: #999;
      cursor: pointer;
      margin-left: 5px;
    }
  }
  .error-content {
    color: red;
    font-size: 12px;
    line-height: 1;
    padding: 2px;
  }
}
.file-empty {
  width: 100%;
  height: 60px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  color: #999;
}
.file-list-div {
  display: none;
  border-radius: 4px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  box-shadow: 0 10px 10px #ddd;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 300px;
  background: #fff;
  box-sizing: border-box;
  padding: 5px;
  &.show {
    display: block;
  }
}
</style>
