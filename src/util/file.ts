/* eslint-disable @typescript-eslint/ban-types */
import SparkMD5 from 'spark-md5';
import { blake3 } from '@noble/hashes/blake3';
import { bytesToHex as toHex } from '@noble/hashes/utils';
import * as streamSaver from 'streamsaver';

//获取文件夹下所有文件返回类型
export interface readDirectoryAllFilesReturn {
  fileEntry: File;
  name: string;
  size: number;
  hash: string;
  type?: string;
  path?: string;
}

export function FormatSize(size: number | string): string {
  size = Number(size);
  if (!size) return '0B';
  const kb = 1024;
  const unit = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(size) / Math.log(kb));
  return (size / Math.pow(kb, i)).toFixed(2) + ' ' + unit[i];
}
export class FileService {
  //将文件转为entry
  static entryFile(entry: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve: Function, reject: Function) => {
      const successCallback = (file: File) => {
        resolve(file);
      };
      const errorCallback = (error: any) => {
        console.error(error);
        reject(error);
      };
      entry.file(successCallback, errorCallback);
    });
  }
  //解析文件夹所有子文件夹并获取所有文件
  static async readDirectoryAllFiles(entry: FileSystemEntry): Promise<readDirectoryAllFilesReturn[]> {
    const files: readDirectoryAllFilesReturn[] = [];

    const read = async (entry: FileSystemEntry) => {
      //如果是文件夹，读取文件夹下的内容
      if (entry.isDirectory) {
        const entries = await FileService.readDirectory(<FileSystemDirectoryEntry>entry);
        const promiseArr = [];
        for (let index = 0; index < entries.length; index++) {
          const child = entries[index];
          promiseArr.push(read(child));
        }
        await Promise.all(promiseArr);
      } else if (entry.isFile) {
        const file = await FileService.entryFile(<FileSystemFileEntry>entry);
        const hash = await FileService.readFileToHashByBlake3(file);
        files.push({ fileEntry: file, name: entry.name, size: file.size, hash: hash.toString(), path: entry.fullPath });
      }
    };
    await read(entry);
    return files;
  }
  //读取文件夹
  static async readDirectory(directory: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
    return new Promise((resolve: Function, reject: Function) => {
      const dirReader = directory.createReader();
      const entries: FileSystemEntry[] = [];
      dirReader.readEntries(
        (results: FileSystemEntry[]) => {
          if (results.length) {
            [].forEach.call(results, (_file: FileSystemEntry) => {
              entries.push(_file);
            });
            resolve(entries);
          }
        },
        (error: any) => {
          console.error('读取文件夹错误：', error);
          reject(error);
        }
      );
    });
  }
  //读取文件流，可用作上传
  static async readFileToArrayBuffer(file: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve: Function, reject: Function) => {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        console.error('读取文件出错：', reader.error);
        reject(reader.error);
      };
      reader.readAsArrayBuffer(file);
    });
  }
  //读取文件流，可用作上传
  static async readFileToUrl(file: Blob): Promise<string> {
    return new Promise((resolve: Function, reject: Function) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        resolve(e.target?.result);
      };
      reader.onerror = function () {
        console.error('读取文件出错：', reader.error);
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  }
  //分片读取文件hash,分片大小默认5MB
  static async readFileToHashChunkByBlake3(file: File, chunkSize: number = 1024 * 1024 * 5) {
    const FileSize: number = file.size;

    const promiseArr: any = [];
    const chunks = Math.ceil(FileSize / chunkSize),
      chunksFile: any = [];
    let currentChunk = 0;

    function loadNext() {
      const start = currentChunk * chunkSize,
        end = start + chunkSize >= FileSize ? FileSize : start + chunkSize;
      //获取分片文件
      const fileChunk = file.slice(start, end);
      //获取分片hash值
      const _p1 = FileService.readFileToHashByBlake3(fileChunk).then((_hash: any) => {
        chunksFile.push({ file: fileChunk, hash: _hash });
      });
      promiseArr.push(_p1);

      currentChunk++;
      if (currentChunk < chunks) {
        loadNext();
      }
    }
    loadNext();

    await Promise.all(promiseArr);

    const fileHash = await FileService.readFileToHashByBlake3(file);

    return {
      size: FileSize,
      hash: fileHash,
      chunks,
      chunksFile,
    };
  }
  //读取整个文件hash
  static async readFileToHashByBlake3(file: Blob): Promise<string> {
    const hash = blake3.create({});
    const reader = file.stream().getReader();
    while (true) {
      const x = await reader.read();
      if (x.done) {
        break;
      }
      if (x.value) {
        hash.update(x.value);
      }
    }
    reader.releaseLock();
    return toHex(hash.digest()).toUpperCase();
  }

  //读取整个文件hash
  static async readFileToHashByMd5(file: Blob): Promise<string> {
    return new Promise((resolve: Function, reject: Function) => {
      const reader = new FileReader();

      reader.onload = function () {
        const blob = reader.result;
        const hash: string = SparkMD5.hashBinary(blob);
        resolve(hash);
      };
      reader.onerror = function () {
        console.error('读取文件出错：', reader.error);
        reject(reader.error);
      };
      reader.readAsBinaryString(file);
    });
  }

  //下载图片
  static downloadIamge(imgsrc: string, name: string) {
    const image = new Image();
    // 解决跨域 Canvas 污染问题
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context && context.drawImage(image, 0, 0, image.width, image.height);
      const url = canvas.toDataURL('image/png'); //得到图片的base64编码数据

      const a = document.createElement('a'); // 生成一个a元素
      const event = new MouseEvent('click'); // 创建一个单击事件
      a.download = name || 'photo'; // 设置图片名称
      a.href = url; // 将生成的URL设置为a.href属性
      a.dispatchEvent(event); // 触发a的单击事件
    };
    image.src = imgsrc;
  }
  // 下载文件并重命名
  static downLoadFile(file: { fileName: string; url: string }) {
    const fileStream = streamSaver.createWriteStream(file.fileName);
    const writer = fileStream.getWriter();
    fetch(file.url, {
      method: 'GET',
      mode: 'cors',
    }).then(res => {
      const readableStream = res.body;

      const reader = readableStream?.getReader();
      const pump: any = () =>
        reader?.read().then(res => (res.done ? writer.close() : writer.write(res.value).then(pump)));

      pump();
    });
  }
}

export const getContentFromFileUrl = (url: string, callback: (val: string) => void) => {
  const xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  xhr.responseType = 'blob';
  xhr.onload = () => {
    if (xhr.status === 200) {
      const reader = new FileReader();
      // console.log(xhr.response)

      callback && callback(xhr.response);

      // reader.readAsText(xhr.response);
      // reader.onload = () => {
      //   callback && callback(reader.result as string);
      // };
    }
  };
  xhr.send();
};
