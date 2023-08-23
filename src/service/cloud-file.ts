import { hasuraRequest } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';
import { UploadService, UploadState } from './upload';

export class CloudFileService {
  static async getFiles(parentId?: string, type?: 'directory' | 'file') {
    const authStore = useAuthStore();
    const where: any = {};
    if (parentId) {
      where.parent_id = { _eq: parentId };
    } else {
      where.parent_id = { _eq: authStore.userId };
    }
    if (type) {
      if (type == 'directory') {
        where.is_dict = { _eq: true };
      } else if (type == 'file') {
        where.is_dict = { _eq: false };
      }
    }
    const data = {
      query: `query MyQuery($where: file_system_bool_exp) {
        file_system(where:$where) {
          id
          is_dict
          kind
          name
          owner_id
          parent_id
          created_time
          file_metadatum {
            id
            name
            size
            hash
            hash_algorithm
          }
        }
      }
      `,
      variables: { where },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.file_system.map((_file: any) => {
      return {
        id: _file.id,
        name: _file.name,
        isFile: !_file.is_dict,
        type: _file.kind,
        fileId: _file.file_metadatum && _file.file_metadatum.id,
        fileName: _file.file_metadatum && _file.file_metadatum.name,
        fileSize: _file.file_metadatum && _file.file_metadatum.size,
        fileHash: _file.file_metadatum && _file.file_metadatum.hash,
        createDate: _file.created_time,
      };
    });
  }
  static async getLocation(fileId: string) {
    const data = {
      query: `query MyQuery {
        file_storage(where: {file_metadata_id: {_eq: "${fileId}"}}) {
          id
          server_url
          storage_server {
            capacity
            id
            name
            options
          }
        }
      }
      `,
    };
    const res = await hasuraRequest.post('', data);
    return res.data.file_storage.map((_file: any) => {
      return {
        name: _file.storage_server.name,
      };
    });
  }
  static async addFile(formData: { name: string; isDict: boolean; fileId?: string; parentId?: string }) {
    const authStore = useAuthStore();

    const form: any = {
      name: formData.name,
      is_dict: formData.isDict,
      kind: 1,
      owner_id: authStore.userId,
    };
    formData.fileId && (form.file_metadata_id = formData.fileId);

    if (formData.parentId) {
      form.parent_id = formData.parentId;
    } else {
      form.parent_id = authStore.userId;
      //先查询是否有当前文件夹
      const searchQuery = {
        query: `query MyQuery {
            file_system_by_pk(id: "${authStore.userId}") {
              id
            }
          }
          `,
      };
      const searchData = await hasuraRequest.post('', searchQuery);
      //如果没有这个文件夹，先创建文件夹
      if (!searchData.data.file_system_by_pk) {
        const insertData = {
          query: `mutation MyMutation($form:file_system_insert_input!) {
            insert_file_system_one(object: $form){
              id
            }
          }
          `,
          variables: {
            form: {
              id: authStore.userId,
              name: authStore.userId,
              is_dict: true,
              kind: 1,
              owner_id: authStore.userId,
            },
          },
        };
        await hasuraRequest.post('', insertData);
      }
    }

    const data = {
      query: `mutation MyMutation($form:file_system_insert_input!) {
        insert_file_system_one(object: $form){
          id
        }
      }
      `,
      variables: { form },
    };
    return await hasuraRequest.post('', data);
  }
  static async del(ids: [string]) {
    const data = {
      query: `mutation del($ids:[uuid!]) {
        delete_file_system(where: {id: {_in: $ids}}) {
          returning {
            id
          }
        }
      }`,
      variables: { ids },
    };
    const res: any = await hasuraRequest.post('', data);
    if (res.errors) {
      return false;
    } else {
      return true;
    }
  }
  static async rename(id: string, name: string) {
    const data = {
      query: `mutation MyMutation {
        update_file_system_by_pk(pk_columns: {id: "${id}"}, _set: {name: "${name}"}) {
          id
        }
      }`,
    };
    await hasuraRequest.post('', data);
    return true;
  }
  static async copy(info: any, parentId: string) {
    const form = {
      name: info.name,
      fileId: info.fileId,
      isDict: info.fileId ? false : true,
      parentId,
    };
    return await CloudFileService.addFile(form);
  }
  static async move(info: any, parentId: string) {
    try {
      const data = {
        query: `mutation MyMutation {
          update_file_system_by_pk(pk_columns: {id: "${info.id}"}, _set: {parent_id: "${parentId}"}) {
            id
          }
        }`,
      };
      await hasuraRequest.post('', data);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async uploadCloudFile(
    file: any,
    parentId: string,
    onProgress?: (progress: { state: UploadState; progress?: number; speed?: string; takeTime?: string }) => void,
    registerCancel?: (cancel: (state: UploadState) => void) => void,
    registerRetry?: (retry: () => void) => void
  ) {
    //上传文件,后台自动在文件管理里面新建条目
    const params: any = {};
    const authStore = useAuthStore();
    parentId ? (params.parentId = parentId) : (params.parentId = authStore.userId);
    const metadata_id = await UploadService.uploadFileAndProgress(
      '/file-storage/PreparePartialUploadFromNetDisk',
      params,
      file,
      onProgress,
      registerCancel,
      registerRetry
    );
    return metadata_id;
  }
}
