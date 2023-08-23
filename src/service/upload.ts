/* eslint-disable @typescript-eslint/ban-types */
import { Apis, apiRequest } from 'src/boot/axios';
import { useUploadStore } from 'src/stores/upload';
import { FileService, FormatSize } from 'src/util/file';
import { getTime } from 'src/util/time';

export enum UploadState {
  waiting = 'waiting',
  uploading = 'uploading',
  uploaded = 'uploaded',
  stopped = 'stopped',
  canceled = 'canceled',
  error = 'error',
}

//上传进度
export class UploadService {
  //分片上传文件并添加到任务池
  static async uploadFileAndProgress(
    url: string,
    params: { [key: string]: any },
    file: File,
    onProgress?: (progress: { state: UploadState; progress?: number; speed?: string; takeTime?: string }) => void,
    registerCancel?: (cancel: (state: UploadState) => void) => void,
    registerRetry?: (upload: () => void) => void
  ): Promise<string> {
    const uploadStore = useUploadStore();

    const fileUUid = await FileService.readFileToHashByBlake3(file);
    const uploadIndex = uploadStore.list.findIndex(l => l.fileUUid == fileUUid);
    if (uploadIndex != -1) {
      registerCancel && registerCancel(uploadStore.list[uploadIndex].cancel);
      registerRetry && registerRetry(uploadStore.list[uploadIndex].upload);
      onProgress && uploadStore.list[uploadIndex].progressCalls.push(onProgress);
      return uploadStore.list[uploadIndex].uploadPromise;
    }
    let cancel: (state: UploadState) => void;
    const cancelUpload = (state: UploadState) => {
      if (state == UploadState.canceled) {
        uploadProgress.state = UploadState.canceled;
        cancel && cancel(UploadState.canceled);
      } else {
        uploadProgress.state = UploadState.stopped;
        cancel && cancel(UploadState.stopped);
      }
    };

    registerCancel && registerCancel(cancelUpload);

    const progressCall = (progress: { state: UploadState; progress?: number; speed?: string; takeTime?: string }) => {
      //抛出事件
      onProgress && onProgress(progress);
      //更新进度
      progress.progress && (uploadProgress.progress = progress.progress);
      progress.speed && (uploadProgress.speed = progress.speed);
      progress.takeTime && (uploadProgress.takeTime = progress.takeTime);
      //更新状态
      if (progress.state == UploadState.stopped) {
        uploadProgress.state = UploadState.stopped;
      } else if (progress.state == UploadState.canceled) {
        uploadProgress.state = UploadState.canceled;
        uploadStore.delProgress(uploadProgress);
      }
    };
    const upload = () => {
      return this.uploadFileByChunk(
        url,
        params,
        file,
        progress => {
          uploadProgress.progressCalls.forEach(progressCall => {
            progressCall(progress);
          });
        },
        (c: (state: UploadState) => void) => {
          cancel = c;
        }
      );
    };
    const retryUpload = () => {
      uploadProgress.state = UploadState.uploading;
      uploadProgress.speed = '';
      uploadProgress.takeTime = '';
      return (uploadProgress.uploadPromise = upload());
    };
    registerRetry && registerRetry(retryUpload);
    /**
     * 添加到上传进度中
     */
    const uploadProgress = uploadStore.addProgress({
      upload: retryUpload,
      cancel: cancelUpload,
      progressCalls: [progressCall],
      fileName: file.name,
      fileSize: file.size,
      fileUUid: fileUUid,
      progress: 0,
      speed: '',
      takeTime: '',
      state: UploadState.uploading,
      createDate: new Date().toString(),
      uploadPromise: upload(),
    });

    const metadata_id = await uploadProgress.uploadPromise.catch(error => {
      if (error?.message == UploadState.error) {
        uploadProgress.state = UploadState.error;
      }
      throw error;
    });

    uploadProgress.progress = 1;
    uploadProgress.state = UploadState.uploaded;
    return metadata_id;
  }
  /**
   * 分片上传文件
   */
  static async uploadFileByChunk(
    url: string,
    params: { [key: string]: any },
    file: File,
    onProgress?: (progress: { state: UploadState; progress?: number; speed?: string; takeTime?: string }) => void,
    registerCancel?: (cancel: (state: UploadState) => void) => void
  ): Promise<string> {
    return new Promise(async (resolve: (id: string) => void, reject: (reason: any) => void) => {
      //取消上传
      const cancelEvent = (state: UploadState) => {
        if (state == UploadState.canceled) {
          //抛出取消事件
          onProgress && onProgress({ state: UploadState.canceled });
        } else if (state == UploadState.stopped) {
          //抛出暂停事件
          onProgress && onProgress({ state: UploadState.stopped });
          reject({ message: UploadState.canceled, content: '上传取消' });
        }
      };

      registerCancel &&
        registerCancel(() => {
          cancelEvent;
        });

      try {
        //文件参数
        const FileSize: number = file.size; //文件总大小
        const BlockSize = 1024 * 1024 * 5; //每片大小
        const BlockCount = Math.ceil(FileSize / BlockSize); //分片总数
        const FileHash = await FileService.readFileToHashByBlake3(file); //文件Hash

        //判断文件是否存在
        const prepareData = {
          fileName: file.name,
          hash: FileHash,
          size: FileSize,
          count: BlockCount,
          hashAlgorithm: 'blake3', //使用的hash算法
          ...params,
        };
        const prepareRes: any = await apiRequest
          .post(url, prepareData, {
            cancelToken: new apiRequest.CancelToken(function excutor(c) {
              //抛出取消方法
              registerCancel && registerCancel(c);
            }),
          })
          .catch((error: any) => {
            console.error('准备上传接口捕获错误:', error);
            throw error;
          });
        const isExist = prepareRes.result == 'flashUpload';
        const metadata_id = prepareRes.id;

        /**
         * 如果已经上传过了，就不走上传方法了'
         */
        //上传成功
        if (isExist) {
          //返回文件id
          return resolve(metadata_id);
        }

        //上传分片文件
        const uploadChunk = async (chunk: Blob, shard_id: number, progress: Function, cancle: Function) => {
          const formData = new FormData();
          formData.append('file_metadata_id', metadata_id);
          formData.append('nth', shard_id.toString());
          formData.append('bin', chunk);
          return apiRequest
            .post(`${Apis.ApiUrl}/file-storage/PartialUpload`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (res: any) => {
                progress(res.loaded);
              },
              cancelToken: new apiRequest.CancelToken(function excutor(c) {
                cancle && cancle(c);
              }),
            })
            .then(res => {
              return res;
            })
            .catch(error => {
              throw error;
            });
        };

        //获取文件上传分片信息
        let shards = new Array<boolean>(BlockCount).fill(false);
        const uploadInfo: any = await apiRequest
          .get(`${Apis.ApiUrl}/file-storage/PartialUploadInfo/${metadata_id}`, {
            cancelToken: new apiRequest.CancelToken(function excutor(c) {
              //抛出取消方法
              registerCancel && registerCancel(c);
            }),
          })
          .catch(error => {
            console.error('获取分片信息捕获错误:', error);
            throw error;
          });
        if (uploadInfo.is_upload_failed == true) {
          //分片上传完成但是对象存储合并失败
        } else {
          //还没上传完或者上传成功
          shards = uploadInfo.shards as Array<boolean>;
        }

        //同步调用分布上传
        for (let index = 0; index < shards.length; index++) {
          const shard = shards[index];
          //true为已经上传成功
          if (shard) continue;
          //获取分片文件
          const start = index * BlockSize,
            end = start + BlockSize >= FileSize ? FileSize : start + BlockSize;
          const fileChunk = file.slice(start, end);

          //记录开始上传时间
          let startTime = new Date().getTime();
          let startSize = 0;
          await uploadChunk(
            fileChunk,
            index,
            (loaded: number) => {
              //计算总上传数量
              const loadedSize = index * BlockSize + loaded;
              //总上传进度
              const progress = Math.floor((loadedSize / FileSize) * 100) / 100;
              //分片上传进度
              const chunkProgress = Math.floor((loaded / fileChunk.size) * 100) / 100;
              //计算上传速度
              const pertime = (new Date().getTime() - startTime) / 1000; //单位s
              const speedNum = (loaded - startSize) / pertime; //单位B
              const speed = `${FormatSize(speedNum)}/s`;
              //重新赋值起始时间
              startTime = new Date().getTime();
              startSize = loaded;

              //计算还需要多长时间
              const takeSeconds = (FileSize - loadedSize) / speedNum; //还需几秒
              const takeTime = getTime(String(takeSeconds));

              //实时抛出上传进度
              onProgress && onProgress({ state: UploadState.uploading, progress, speed, takeTime });

              console.log('上传进度', progress);
            },
            (c: (state: UploadState) => void) => {
              //抛出取消上传方法
              registerCancel && registerCancel(c);
            }
          ).catch(error => {
            console.error('上传捕获错误:', error);
            throw error;
          });
        }

        /**
         * 所有分片上传完成
         */
        //返回文件id
        return resolve(metadata_id);
      } catch (error: any) {
        if (error?.message == UploadState.stopped) {
          //更新取消方法
          registerCancel && registerCancel(cancelEvent);
          //抛出错误
          onProgress && onProgress({ state: UploadState.stopped });
        } else if (error?.message == UploadState.canceled) {
          //更新取消方法
          registerCancel && registerCancel(cancelEvent);
          //抛出错误
          onProgress && onProgress({ state: UploadState.canceled });
          reject({ message: UploadState.canceled, content: '上传取消' });
        } else {
          //更新取消方法
          registerCancel && registerCancel(cancelEvent);
          //抛出错误
          reject({ message: UploadState.error, error });
        }
      }
    });
  }
  //获取文件下载地址
  static getDownFileUrl(id: string) {
    return `/file-storage/RangelyDownloadFile/${id}`;
  }
}
