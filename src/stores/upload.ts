import { defineStore } from 'pinia';
import { UploadState } from 'src/service/upload';
export interface UploadProgressInterface {
  upload: () => void;
  cancel: (state: UploadState) => void;
  progressCalls: Array<
    (progress: { state: UploadState; progress?: number; speed?: string; takeTime?: string }) => void
  >;
  fileName: string;
  fileSize: string | number;
  fileUUid: string;
  progress: number;
  speed: string;
  takeTime: string;
  state: UploadState;
  createDate: string;
  uploadPromise: Promise<string>;
  chunkList?: Array<{
    progress: number;
  }>;
}

export const useUploadStore = defineStore('uploadStore', {
  state: () => ({
    list: [] as Array<UploadProgressInterface>,
  }),
  getters: {
    uploadingNum(state) {
      const list = state.list.filter(upload => {
        if (upload.state == UploadState.uploading) {
          return upload;
        }
      });
      return list.length;
    },
  },
  actions: {
    //添加进度列表
    addProgress(progress: UploadProgressInterface): UploadProgressInterface {
      const pIndex = this.list.findIndex(f => f.fileUUid == progress.fileUUid);
      if (pIndex != -1) {
        return this.list[pIndex];
      } else {
        this.list.push(progress);
        return this.list[this.list.length - 1];
      }
    },
    //删除
    delProgress(progress: UploadProgressInterface) {
      const pIndex = this.list.findIndex(f => f.fileUUid == progress.fileUUid);
      if (pIndex != -1) {
        this.list.splice(pIndex, 1);
      }
    },
  },
});
