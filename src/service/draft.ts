import { hasuraRequest } from 'src/boot/axios';
import { useRefreshStore } from 'src/stores/refresh';
import { UploadService, UploadState } from './upload';
import { useAuthStore } from 'src/stores/auth';
import { FlowDraft, FlowDraftSpec } from 'src/components/flow-draft-editor/interfaces';
import { WorkflowSlotService } from './workflow-slot';
import { date } from 'quasar';

export class DraftService {
  /**
   * 获取工作流草稿列表
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
      type: { _eq: 0 },
    };
    if (filter) where.name = { _ilike: `%${filter}%` };

    const orderBy = [];
    if (sortBy) orderBy.push({ [sortBy]: descending ? 'desc' : 'asc' });

    const data = {
      query: `query GetList($where: flow_draft_bool_exp, $orderBy: [flow_draft_order_by!]) {
        flow_draft(
          limit: ${rowsPerPage}
          offset: ${(page - 1) * rowsPerPage}
          where: $where
          order_by: $orderBy
        ) {
          id
          created_time
          description
          last_modified_time
          name
          spec
          user_id
        }
      }`,
      variables: {
        where,
        orderBy,
      },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flow_draft;
  }
  /**
   * 获取工作流草稿列表大小
   */
  static async getListNumber(filter: string | undefined) {
    const where: any = {
      user_id: { _eq: useAuthStore().userId },
      type: { _eq: 0 },
    };
    if (filter) {
      where.name = { _ilike: `%${filter}%` };
    }

    const data = {
      query: `query GetListNumber($where: flow_draft_bool_exp) {
        flow_draft_aggregate(where: $where) {
          aggregate {
            count
          }
        }
      }`,
      variables: {
        where,
      },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flow_draft_aggregate.aggregate.count;
  }
  /**
   * 根据id删除工作流草稿
   */
  static async deleteById(id: string) {
    const data = {
      query: `mutation DeleteById($id: uuid!) {
          delete_flow_draft_by_pk(id: $id) {
              id
            }
          }`,
      variables: {
        id: id,
      },
    };
    const res = await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshFlowDraftData();
    if (res.data && res.data.delete_flow_draft_by_pk) return true;
    else return false;
  }
  /**
   * 更新草稿信息
   */
  static async updateItem(promptData: { id: string; name: string; description: string }) {
    const data = {
      query: `mutation UpdateItem($id: uuid!, $name: String!, $description: String!) {
        update_flow_draft_by_pk(pk_columns: {id: $id}, _set: {name: $name, description: $description}) {
          id
        }
      }`,
      variables: promptData,
    };
    const res = await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshFlowDraftData();
    if (res.data && res.data.update_flow_draft_by_pk.id) return true;
    else return false;
  }
  /**
   * 根据id获取工作流草稿详情
   */
  static async getDetail(id: string) {
    const data = {
      query: `query{
        flow_draft_by_pk(id: "${id}") {
          id
          name
          description
          spec
          user_id
          created_time
          last_modified_time
          type
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    if (!res.data.flow_draft_by_pk) return false;
    return res.data.flow_draft_by_pk;
  }
  static async uploadDraftFile(
    id: string,
    file: File,
    onProgress?: (progress: { state: UploadState; progress?: number; speed?: string; takeTime?: string }) => void,
    registerCancel?: (cancel: (state: UploadState) => void) => void,
    registerRetry?: (retry: () => void) => void
  ) {
    return await UploadService.uploadFileAndProgress(
      '/file-storage/PreparePartialUploadFromFlowEditor',
      { flowDraftUuid: id },
      file,
      onProgress,
      registerCancel,
      registerRetry
    );
  }
  /**
   * 保存成工作流草稿
   */
  static async saveMyDraft(formData: any) {
    const spec = formData.spec || '';
    const createData = {
      query: `mutation create($spec:jsonb){
        insert_flow_draft_one(
          object: {
            description: "${formData.description}",
            name: "${formData.name || ''}",
            spec: $spec
          }) {
            id
        }
      }
      `,
      variables: { spec },
    };
    const res = await hasuraRequest.post('', createData);
    const refreshStore = useRefreshStore();
    refreshStore.refreshFlowDraftData();
    return res.data.insert_flow_draft_one.id;
  }
  // 获取并验证工作流草稿
  static async getAndValidateFlowDraft(draftId: string) {
    const res = await DraftService.getDetail(draftId);
    if (typeof res !== 'object') return null;
    const flowData: FlowDraft = {
      id: draftId,
      name: res.name,
      description: res.description,
      user_id: res.user_id,
      created_time: res.created_time,
      last_modified_time: res.created_time,
      type: res.type,
    };
    if (typeof res.spec !== 'undefined' && res.spec !== null) {
      flowData.spec = {
        schedulingStrategy:
          typeof res.spec.schedulingStrategy === 'undefined'
            ? {
                type: 'Auto',
              }
            : {
                type:
                  typeof res.spec.schedulingStrategy.type === 'undefined' ? 'Auto' : res.spec.schedulingStrategy.type,
                queues:
                  (res.spec.schedulingStrategy.type === 'Manual' || res.spec.schedulingStrategy.type === 'Prefer') &&
                  typeof res.spec.schedulingStrategy.queues === 'undefined'
                    ? []
                    : res.spec.schedulingStrategy.queues,
              },
        nodeDrafts: res.spec.nodeDrafts.map((node: any) => {
          if (
            (node.schedulingStrategy.type === 'Manual' || node.schedulingStrategy.type === 'Prefer') &&
            typeof node.schedulingStrategy.queues === 'undefined'
          ) {
            node.schedulingStrategy.queues = [];
          }
          return node;
        }),
        nodeRelations: res.spec.nodeRelations,
      };
    } else {
      flowData.spec = {
        schedulingStrategy: {
          type: 'Auto',
        },
        nodeDrafts: [],
        nodeRelations: [],
      };
    }
    WorkflowSlotService.analyNode(flowData.spec.nodeDrafts, flowData.spec.nodeRelations);
    return flowData;
  }
  // 验证工作流草稿
  static async validateFlowDraft(flowData: any) {
    WorkflowSlotService.analyNode(flowData.spec.nodeDrafts, flowData.spec.nodeRelations);
    return flowData;
  }
  // 生成草稿数据
  static createFlowData(type: number) {
    const timeStamp = new Date();
    const formattedString = date.formatDate(timeStamp, 'YYYYMMDD');
    const flowData: FlowDraft = {
      id: '',
      name: '新建草稿' + formattedString,
      description: '',
      created_time: String(new Date()),
      spec: {
        schedulingStrategy: {
          type: 'Auto',
        },
        nodeDrafts: [],
        nodeRelations: [],
      },
      type: type,
    };
    return flowData;
  }
  // 新建草稿
  static async createFlowDraft(flowData: FlowDraft, spec: FlowDraftSpec): Promise<string> {
    const data = JSON.stringify({
      query: `mutation createFlowDraft(
                $name: String,
                $spec: jsonb,
                $type: Int
              ) {
                  insert_flow_draft_one(object: {
                  name: $name,
                  description: "",
                  spec: $spec,
                  type: $type
                }) {
                  id
                }
              }`,
      variables: {
        name: flowData.name,
        spec: spec,
        type: flowData.type,
      },
    });
    const res = await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshFlowDraftData();
    return res.data.insert_flow_draft_one.id;
  }
  // 保存草稿
  static async saveFlowDraft(flowData: FlowDraft, spec: FlowDraftSpec) {
    let id = flowData.id;
    if (id === '') {
      id = await this.createFlowDraft(flowData, spec);
    }
    const data = JSON.stringify({
      query: `mutation SaveFlowDraft($id: uuid!, $name: String, $description: String, $spec: jsonb, $type: Int) {
                update_flow_draft_by_pk(pk_columns: {id: $id}, _set: {
                  name: $name,
                  description: $description,
                  spec: $spec
                  type: $type
                }) {
                  id
                }
              }`,
      variables: {
        id: id,
        name: flowData.name,
        description: flowData.description,
        spec: spec,
        type: flowData.type,
      },
    });
    await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshFlowDraftData();
    return id;
  }
  // 获取单/批量计算草稿
  static async getFlowDraftIdByType(type: number) {
    const data = {
      query: `query {
        flow_draft(where: { user_id: { _eq:"${useAuthStore().userId}" }, type: {_eq: ${type}}}) {
          id
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    if (res.data.flow_draft.length === 0) {
      const flowData = this.createFlowData(type);
      const id = await this.saveFlowDraft(flowData, flowData.spec as FlowDraftSpec);
      return id;
    } else {
      return res.data.flow_draft[0].id;
    }
  }
  // 保存草稿为模板
  static async saveFlowDraftAsTemplate(flowData: FlowDraft, spec: FlowDraftSpec) {
    const data = JSON.stringify({
      query: `mutation CreateFlowTemplateItem(
                $name: String,
                $description: String,
                $spec: jsonb
              ) {
                insert_flow_template_one(object: {
                  name: $name,
                  description: $description,
                  spec: $spec
                }) {
                  id
                }
              }`,
      variables: {
        name: flowData.name,
        description: flowData.description,
        spec: spec,
      },
    });
    const res = await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshUserTemplateData();
    return res;
  }
}
