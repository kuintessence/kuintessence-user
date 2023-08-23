import { hasuraRequest } from 'src/boot/axios';
import { useRefreshStore } from 'src/stores/refresh';

export class TemplateService {
  /**
   * 获取工作流模板列表
   */
  static async getList(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean
  ) {
    const where: any = {};
    if (filter) where.name = { _ilike: `%${filter}%` };

    const orderBy = [];
    if (sortBy) orderBy.push({ [sortBy]: descending ? 'desc' : 'asc' });

    const data = {
      query: `query GetList($where: flow_template_bool_exp, $orderBy: [flow_template_order_by!]) {
        flow_template(
          limit: ${rowsPerPage}
          offset: ${(page - 1) * rowsPerPage}
          where: $where
          order_by: $orderBy
        ) {
          created_time
          description
          id
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
    return res.data.flow_template;
  }
  /**
   * 获取工作流模板列表大小
   */
  static async getListNumber(filter: string | undefined) {
    const where: any = {};
    if (filter) where.name = { _ilike: `%${filter}%` };

    const data = {
      query: `query GetListNumber($where: flow_template_bool_exp) {
        flow_template_aggregate(where: $where) {
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
    return res.data.flow_template_aggregate.aggregate.count;
  }
  /**
   * 根据id获取用户模板详情
   */
  static async getDetail(id: string) {
    const data = {
      query: `query{
        flow_template_by_pk(id: "${id}") {
          created_time
          description
          id
          name
          spec
          user_id
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    if (!res.data.flow_template_by_pk) return false;
    return res.data.flow_template_by_pk;
  }
  /**
   * 根据id更新用户模板
   */
  static async updateMyTemplate(formData: any) {
    const data = {
      query: `mutation MyMutation {
        update_flow_template(
          where: {id: {_eq: "${formData.id}"}},
          _set: {
            name: "${formData.name}",
            description: "${formData.description}"
          }) {
          returning {
            id
          }
        }
      }

      `,
    };
    const res = await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshUserTemplateData();
    if (res.data && res.data.update_flow_template?.returning[0]?.id) return true;
    else return false;
  }
  /**
   * 根据id删除用户模板
   */
  static async delMyTemplate(templateId: string) {
    // 删除用户模板
    let data = {
      query: `mutation {
        delete_flow_template_by_pk(id: "${templateId}") {
          id
        }
      }`,
    };
    await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshUserTemplateData();
    // 删除收藏
    data = {
      query: `query IsUserTemplateFavorite {
        user_favorite(where: {favorite_id: {_eq: "${templateId}"}, type: {_eq: 0}}) {
          id
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    if (!res.data.user_favorite[0]) {
      return true;
    } else {
      data = {
        query: `mutation UnfavorUserTemplate {
          delete_user_favorite(where: {favorite_id: {_eq: "${templateId}"}, type: {_eq: 0}}) {
            returning {
              id
            }
          }
        }`,
      };
      await hasuraRequest.post('', data);
      const refreshStore = useRefreshStore();
      refreshStore.refreshUserFavoriteData();
      return true;
    }
  }
}
