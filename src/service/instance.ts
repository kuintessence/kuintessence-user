/* eslint-disable quotes */
import { Apis, apiRequest, hasuraRequest } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';
import { useRefreshStore } from 'src/stores/refresh';

export const InstanceState: any = {
  created: { name: 'created', value: 0, label: '已创建' },
  pending: { name: 'pending', value: 1, label: '等待中' },
  running: { name: 'running', value: 2, label: '进行中' },
  finished: { name: 'finished', value: 3, label: '已结束' },
  error: { name: 'error', value: 4, label: '出错' },
  stopping: { name: 'stopping', value: 5, label: '正在终止' },
  stopped: { name: 'stopped', value: 6, label: '已终止' },
  pausing: { name: 'pausing', value: 7, label: '正在暂停' },
  paused: { name: 'paused', value: 8, label: '已暂停' },
  recovering: { name: 'recovering', value: 9, label: '正在恢复' },
};

export const InstanceNodeState: any = {
  created: { name: 'created', value: 0, label: '已创建' },
  pending: { name: 'pending', value: 1, label: '等待中' },
  running: { name: 'running', value: 2, label: '进行中' },
  finished: { name: 'finished', value: 3, label: '已结束' },
  error: { name: 'error', value: 4, label: '出错' },
  stopping: { name: 'stopping', value: 5, label: '正在终止' },
  stopped: { name: 'stopped', value: 6, label: '已终止' },
  standby: { name: 'standby', value: 7, label: '待命中' },
  pausing: { name: 'pausing', value: 8, label: '正在暂停' },
  paused: { name: 'pausing', value: 9, label: '已暂停' },
  recovering: { name: 'recovering', value: 10, label: '正在恢复' },
};

export class InstanceService {
  /**
   * 获取全部实例列表(历史记录)
   */
  static async getList(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean
  ) {
    const where: any = {
      user_id: { _eq: useAuthStore().userId },
      spec: { _cast: { String: { _regex: `"ompType": ` } } },
    };
    if (filter) {
      where.name = { _ilike: `%${filter}%` };
    }

    const orderBy = [];
    if (sortBy) orderBy.push({ [sortBy]: descending ? 'desc' : 'asc' });

    const data = {
      query: `query GetList($where: flow_instance_bool_exp, $orderBy: [flow_instance_order_by!]) {
				flow_instance(
					limit: ${rowsPerPage}
					offset: ${(page - 1) * rowsPerPage}
					where: $where
					order_by: $orderBy
				) {
					id
					created_time
					description
					name
					status
					spec
				}
			}`,
      variables: {
        where,
        orderBy,
      },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flow_instance;
  }
  static async getListWithType(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean,
    ompType: number
  ) {
    const where: any = {
      user_id: { _eq: useAuthStore().userId },
      spec: { _cast: { String: { _regex: `"ompType": ${ompType}` } } },
    };
    if (filter) where.name = { _ilike: `%${filter}%` };

    const orderBy = [];
    if (sortBy) orderBy.push({ [sortBy]: descending ? 'desc' : 'asc' });

    const data = {
      query: `query GetListWithType($where: flow_instance_bool_exp, $orderBy: [flow_instance_order_by!]) {
        flow_instance(
          limit: ${rowsPerPage}
          offset: ${(page - 1) * rowsPerPage}
          where: $where
          order_by: $orderBy
        ) {
          id
          created_time
          description
          name
          status
          spec
        }
      }`,
      variables: {
        where,
        orderBy,
      },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flow_instance;
  }
  /**
   * 不分页获取全部实例列表(历史记录)
   */
  static async getAllList() {
    const where: any = {
      user_id: { _eq: useAuthStore().userId },
      spec: { _cast: { String: { _regex: `"ompType": ` } } },
    };

    const data = {
      query: `query GetAllList($where: flow_instance_bool_exp) {
        flow_instance(where: $where, order_by: {created_time: desc}) {
          id
          created_time
          description
          name
          status
          spec
        }
      }`,
      variables: {
        where,
      },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flow_instance;
  }
  /**
   * 获取全部实例列表大小(历史记录)
   */
  static async getListNumber(filter: string | undefined) {
    const where: any = {
      user_id: { _eq: useAuthStore().userId },
      spec: { _cast: { String: { _regex: `"ompType": ` } } },
    };
    if (filter) {
      where.name = { _ilike: `%${filter}%` };
    }

    const data = {
      query: `query GetListNumber($where: flow_instance_bool_exp) {
        flow_instance_aggregate(where: $where) {
          aggregate {
            count
          }
        }
      }`,
      variables: { where },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flow_instance_aggregate.aggregate.count;
  }
  static async getListNumberWithType(filter: string | undefined, ompType: number) {
    const where: any = {
      user_id: { _eq: useAuthStore().userId },
      spec: { _cast: { String: { _regex: `"ompType": ${ompType}` } } },
    };
    if (filter) where.name = { _ilike: `%${filter}%` };

    const data = {
      query: `query GetListNumberWithType($where: flow_instance_bool_exp) {
        flow_instance_aggregate(where: $where) {
          aggregate {
            count
          }
        }
      }`,
      variables: { where },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flow_instance_aggregate.aggregate.count;
  }
  /**
   * 获取特定状态的实例列表
   * status: 0-已创建, 1-等待中, 2-进行中, 3-已结束, 4-出错, 5-正在终止
   *         6-已终止, 7-正在暂停, 8-已暂停, 9-正在恢复
   */
  static async getListByStatus(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean,
    status: number[]
  ) {
    const where: any = {
      user_id: { _eq: useAuthStore().userId },
      spec: { _cast: { String: { _regex: `"ompType": ` } } },
    };
    if (filter) {
      where.name = { _ilike: `%${filter}%` };
    }
    if (status.length) {
      where.status = { _in: status };
    }

    const orderBy = [];
    if (sortBy) orderBy.push({ [sortBy]: descending ? 'desc' : 'asc' });

    const data = {
      query: `query GetListByStatus($where: flow_instance_bool_exp, $orderBy: [flow_instance_order_by!]) {
        flow_instance(
          limit: ${rowsPerPage}
          offset: ${(page - 1) * rowsPerPage}
          where: $where
          order_by: $orderBy
        ) {
          id
          created_time
          description
          name
          status
          spec
        }
      }`,
      variables: { where, orderBy },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flow_instance;
  }
  static async getListWithTypeByStatus(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean,
    status: number[],
    ompType: number
  ) {
    const where: any = {
      user_id: { _eq: useAuthStore().userId },
      spec: { _cast: { String: { _regex: `"ompType": ${ompType}` } } },
    };
    if (filter) where.name = { _ilike: `%${filter}%` };
    if (status.length) {
      where.status = { _in: status };
    }

    const orderBy = [];
    if (sortBy) orderBy.push({ [sortBy]: descending ? 'desc' : 'asc' });

    const data = {
      query: `query GetListWithTypeByStatus($where: flow_instance_bool_exp, $orderBy: [flow_instance_order_by!]) {
        flow_instance(
          limit: ${rowsPerPage}
          offset: ${(page - 1) * rowsPerPage}
          where: $where
          order_by: $orderBy
        ) {
          id
          created_time
          description
          name
          status
          spec
        }
      }`,
      variables: { where, orderBy },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flow_instance;
  }
  /**
   * 获取特定状态的实例列表大小
   */
  static async getListNumberByStatus(filter: string | undefined, status: number[]) {
    const where: any = {
      user_id: { _eq: useAuthStore().userId },
      spec: { _cast: { String: { _regex: `"ompType": ` } } },
    };
    if (filter) {
      where.name = { _ilike: `%${filter}%` };
    }
    if (status.length) {
      where.status = { _in: status };
    }

    const data = {
      query: `query GetListNumberByStatus($where: flow_instance_bool_exp) {
        flow_instance_aggregate(where: $where) {
          aggregate {
            count
          }
        }
      }`,
      variables: { where },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flow_instance_aggregate.aggregate.count;
  }
  static async getListNumberWithTypeByStatus(filter: string | undefined, status: number[], ompType: number) {
    const where: any = {
      user_id: { _eq: useAuthStore().userId },
      spec: { _cast: { String: { _regex: `"ompType": ${ompType}` } } },
    };
    if (filter) {
      where.name = { _ilike: `%${filter}%` };
    }
    if (status.length) {
      where.status = { _in: status };
    }

    const data = {
      query: `query GetListNumberWithTypeByStatus($where: flow_instance_bool_exp) {
        flow_instance_aggregate(where: $where) {
          aggregate {
            count
          }
        }
      }`,
      variables: { where },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flow_instance_aggregate.aggregate.count;
  }
  /**
   * 获取正在运行的实例列表及大小
   */
  static async getRunningList(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean
  ) {
    return await this.getListByStatus(page, rowsPerPage, filter, sortBy, descending, [1, 2, 5, 7]);
  }
  static async getRunningListWithType(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean,
    ompType: number
  ) {
    return await this.getListWithTypeByStatus(page, rowsPerPage, filter, sortBy, descending, [1, 2, 5, 7], ompType);
  }
  static async getRunningNumber(filter: string | undefined) {
    return await this.getListNumberByStatus(filter, [1, 2, 5, 7]);
  }
  static async getRunningNumberWithType(filter: string | undefined, ompType: number) {
    return await this.getListNumberWithTypeByStatus(filter, [1, 2, 5, 7], ompType);
  }
  /**
   * 获取已经完成的实例列表及大小
   */
  static async getFinishedList(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean
  ) {
    return await this.getListByStatus(page, rowsPerPage, filter, sortBy, descending, [3]);
  }
  static async getFinishedListWithType(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean,
    ompType: number
  ) {
    return await this.getListWithTypeByStatus(page, rowsPerPage, filter, sortBy, descending, [3], ompType);
  }
  static async getFinishedNumber(filter: string | undefined) {
    return await this.getListNumberByStatus(filter, [3]);
  }
  static async getFinishedNumberWithType(filter: string | undefined, ompType: number) {
    return await this.getListNumberWithTypeByStatus(filter, [3], ompType);
  }
  /**
   * 获取需要注意的实例列表及大小
   */
  static async getWarningList(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean
  ) {
    return await this.getListByStatus(page, rowsPerPage, filter, sortBy, descending, [0, 4, 6, 8, 9]);
  }
  static async getWarningListWithType(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean,
    ompType: number
  ) {
    return await this.getListWithTypeByStatus(page, rowsPerPage, filter, sortBy, descending, [0, 4, 6, 8, 9], ompType);
  }
  static async getWarningNumber(filter: string | undefined) {
    return await this.getListNumberByStatus(filter, [0, 4, 6, 8, 9]);
  }
  static async getWarningNumberWithType(filter: string | undefined, ompType: number) {
    return await this.getListNumberWithTypeByStatus(filter, [0, 4, 6, 8, 9], ompType);
  }
  /**
   * 根据id暂停工作流任务
   */
  static async pauseById(id: string) {
    const res = await apiRequest.get(`${Apis.ApiUrl}/workflow-engine/PauseWorkflow/` + id);
    const refreshStore = useRefreshStore();
    refreshStore.refreshInstanceData();
    return res;
  }
  /**
   * 根据id继续工作流任务
   */
  static async continueById(id: string) {
    const res = await apiRequest.get(`${Apis.ApiUrl}/workflow-engine/ContinueWorkflow/` + id);
    const refreshStore = useRefreshStore();
    refreshStore.refreshInstanceData();
    return res;
  }
  /**
   * 根据id终止工作流任务
   */
  static async terminateById(id: string) {
    const res = await apiRequest.get(`${Apis.ApiUrl}/workflow-engine/TerminateWorkflow/` + id);
    const refreshStore = useRefreshStore();
    refreshStore.refreshInstanceData();
    return res;
  }
  /**
   * 根据id删除工作流实例
   */
  static async deleteById(id: string) {
    const data = {
      query: `mutation DeleteById ($id: uuid!) {
          delete_flow_instance_by_pk(id: $id) {
              id
            }
          }`,
      variables: {
        id: id,
      },
    };
    const res = await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshInstanceData();
    if (res.data && res.data.delete_flow_instance_by_pk) return true;
    else return false;
  }
  /**
   * 更新实例信息
   */
  static async updateItem(promptData: { id: string; name: string; description: string }) {
    const data = {
      query: `mutation UpdateItem($id: uuid!, $name: String!, $description: String!) {
        update_flow_instance_by_pk(pk_columns: {id: $id}, _set: {name: $name, description: $description}) {
          id
        }
      }`,
      variables: promptData,
    };
    const res = await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshInstanceData();
    if (res.data && res.data.update_flow_instance_by_pk.id) return true;
    else return false;
  }
  /**
   * 根据id获取工作流任务详情
   */
  static async getDetail(id: string) {
    const data = {
      query: `query MyQuery {
        flow_instance_by_pk(id: "${id}") {
          created_time
          description
          spec
          id
          name
          status
        }
      }
      `,
    };
    const res = await hasuraRequest.post('', data);
    if (!res.data.flow_instance_by_pk) return false;
    return res.data.flow_instance_by_pk;
  }
  /**
   * 根据节点id获取上传的文件
   */
  static async getNodeFiles(nodeId: string) {
    const data = {
      query: `query MyQuery ($spec:jsonb){
        file_system(where: {meta: {_contains: $spec}, is_dict: {_eq: false}}) {
          file_metadata_id
          name
        }
      }
      `,
      variables: { spec: { nodeInstanceId: nodeId } },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.file_system.map((item: any) => {
      return {
        id: item.file_metadata_id,
        name: item.name,
      };
    });
  }
  static async del(id: string) {
    const data = {
      query: `mutation MyMutation {
        delete_flow_instance_by_pk(id: "${id}") {
          id
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshInstanceData();
    return res;
  }
  /**
   * 根据id获取节点列表
   */
  static async getNodesById(id: string) {
    const data = {
      query: `query MyQuery {
        node_instance(where: {flow_instance_id: {_eq: "${id}"}}) {
          id
          name
          status
          log
          resource_meter
          queue {
            id
            name
          }
        }
      }
      `,
    };
    const res = await hasuraRequest.post('', data);
    return res.data.node_instance.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        status: item.status,
        log: item.log,
        showLog: false,
        resource_meter: item.resource_meter,
        queue: item.queue,
      };
    });
  }
  // 开始运行实例
  static async runInstance(id: string) {
    const res = await apiRequest.get(`${Apis.ApiUrl}/workflow-engine/StartWorkflow/` + id);
    const refreshStore = useRefreshStore();
    refreshStore.refreshInstanceData();
    return res;
  }
  //获取节点运行命令行
  static async getRunCmd(id: string) {
    const res = await apiRequest.get(`${Apis.ApiUrl}/workflow-engine/NodeCmd/` + id);
    return res;
  }
  // 运行工作流
  static async runFlowDraft(draftId: string) {
    const res = await apiRequest.get(`${Apis.ApiUrl}/workflow-engine/SubmitWorkflow/` + draftId);
    return res;
  }
}
