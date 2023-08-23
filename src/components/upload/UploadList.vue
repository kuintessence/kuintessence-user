<template>
  <div class="progress-container">
    <div class="title-container q-pa-sm">上传列表</div>
    <q-separator />

    <div class="list-container">
      <div class="list">
        <div class="list-item" v-for="(file, index) in uploadStore.list" :key="index">
          <div class="item-section" style="width: 30px">
            <q-icon color="grey" name="access_time" size="20px" v-if="file.state == UploadState.waiting"> </q-icon>
            <q-spinner-oval color="primary" size="17px" v-if="file.state == UploadState.uploading" />
            <q-icon size="20px" name="pause" color="warning" v-if="file.state == UploadState.stopped"> </q-icon>
            <q-icon size="20px" name="check_circle" color="green" v-if="file.state == UploadState.uploaded"> </q-icon>
            <q-icon size="20px" name="error" color="negative" v-if="file.state == UploadState.error"> </q-icon>
          </div>
          <div class="item-section col overflow-hidden q-pr-sm">
            <div class="text-subtitle2 ellipsis">{{ file.fileName }}</div>
            <div class="text-subtitle2 text-grey ellipsis" style="font-weight: normal">
              {{ date.formatDate(file.createDate, 'YYYY-MM-DD HH:mm:ss') }}
            </div>
          </div>
          <div class="item-section" style="width: 250px">
            <div class="text-subtitle2">
              <span>共{{ FormatSize(file.fileSize) }}</span>
              <span>
                <span v-if="file.state == UploadState.waiting">，等待上传</span>
                <span v-if="file.state == UploadState.uploading">
                  <span v-if="file.progress == 0">，正在准备上传..</span>
                  <span v-else-if="file.progress > 0 && file.progress < 1">
                    <span v-if="file.speed">，{{ file.speed }}</span>
                    <span v-if="file.takeTime">，还剩{{ file.takeTime }}</span>
                  </span>
                  <span v-else-if="file.progress == 1">，上传成功，正在保存...</span>
                </span>
                <span v-if="file.state == UploadState.stopped"> ，上传已暂停 </span>
                <span v-if="file.state == UploadState.uploaded">， 已上传成功 </span>
                <span v-if="file.state == UploadState.canceled"> ，上传正在取消... </span>
                <span v-if="file.state == UploadState.error"> ，上传失败了 </span>
              </span>
            </div>
            <div v-if="file.state != UploadState.uploaded">
              <q-linear-progress
                rounded
                size="3px"
                :value="file.progress"
                :query="file.state == UploadState.uploading && file.progress == 0 ? true : false"
                color="primary"
              />
            </div>
          </div>
          <div class="item-section text-right" style="width: 80px">
            <q-btn
              icon="pause"
              dense
              flat
              color="primary"
              @click="file.cancel(UploadState.stopped)"
              v-if="file.state == UploadState.uploading"
            >
              <q-tooltip>暂停上传</q-tooltip>
            </q-btn>
            <q-btn icon="delete" dense flat color="grey" @click="del(file)" v-if="file.state == UploadState.uploaded">
              <q-tooltip>从列表删除</q-tooltip>
            </q-btn>
            <q-btn
              icon="play_arrow"
              dense
              flat
              color="primary"
              @click="file.upload()"
              v-if="file.state == UploadState.stopped"
            >
              <q-tooltip>开始上传</q-tooltip>
            </q-btn>
            <q-btn
              icon="refresh"
              dense
              flat
              color="primary"
              @click="file.upload()"
              v-if="file.state == UploadState.error"
            >
              <q-tooltip>重新上传</q-tooltip>
            </q-btn>

            <q-btn
              icon="close"
              dense
              flat
              color="grey"
              @click="cancel(file)"
              v-if="file.state != UploadState.uploaded && file.state != UploadState.canceled"
            >
              <q-tooltip>取消上传</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>
    <empty class="center" v-if="!uploadStore.list.length" message="现在没有在上传的文件" />
  </div>
</template>

<script lang="ts" setup>
import { UploadState } from 'src/service/upload';
import { FormatSize } from 'src/util/file';
import Empty from 'src/components/common/Empty.vue';
import { UploadProgressInterface, useUploadStore } from 'src/stores/upload';
import { date } from 'quasar';

const uploadStore = useUploadStore();

function del(file: UploadProgressInterface) {
  uploadStore.delProgress(file);
}
function cancel(file: UploadProgressInterface) {
  file.cancel(UploadState.canceled);
}
</script>

<style lang="scss" scoped>
.progress-container {
  width: 600px;
  height: 500px;
  display: flex;
  flex-direction: column;
  .title-container {
  }
  .list-container {
    flex: 1;
    overflow: auto;
  }
}
.list {
  padding: 0 10px;
  .list-item {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ddd;
    padding: 10px 0;
    .item-section {
    }
  }
}
</style>
