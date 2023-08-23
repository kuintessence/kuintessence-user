import { Apis, apiRequest, hasuraRequest } from 'src/boot/axios';

export class ProjectService {
  /**
   * 获取业务模板列表
   */
  static async getFlowsList(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean,
    isOfficial: boolean,
    isFeatured: boolean
  ) {
    const where: any = {
      status: { _eq: 'published' },
    };
    if (filter) {
      where.display_name = { _ilike: `%${filter}%` };
    }
    if (isOfficial) {
      where.is_official = { _eq: true };
    }
    if (isFeatured) {
      where.is_featured = { _eq: true };
    }

    const orderBy = [];
    if (sortBy) orderBy.push({ [sortBy]: descending ? 'desc' : 'asc' });

    const data = {
      query: `query GetFlowsList($where: flows_bool_exp, $orderBy: [flows_order_by!]) {
        flows(
          limit: ${rowsPerPage}
          offset: ${(page - 1) * rowsPerPage}
          where: $where
          order_by: $orderBy
        ) {
          uuid
          display_name
          system_name
          description
          spec
          date_created
          date_updated
        }
      }`,
      variables: {
        where,
        orderBy,
      },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.flows;
  }
  /**
   * 获取业务模板列表大小
   */
  static async getFlowsNumber(filter: string | undefined, isOfficial: boolean, isFeatured: boolean) {
    const where: any = {
      status: { _eq: 'published' },
    };
    if (filter) {
      where.display_name = { _ilike: `%${filter}%` };
    }
    if (isOfficial) {
      where.is_official = { _eq: true };
    }
    if (isFeatured) {
      where.is_featured = { _eq: true };
    }

    const data = {
      query: `query GetFlowsNumber($where: flows_bool_exp) {
        flows_aggregate(where: $where) {
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
    return res.data.flows_aggregate.aggregate.count;
  }
  /**
   * 获取内容列表
   */
  static async getUsecaseList(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean,
    isOfficial: boolean,
    isFeatured: boolean
  ) {
    return this.getEntitiesListWithType(
      'd3a6c90e-29d0-4d50-b5f4-f6b67643864a',
      page,
      rowsPerPage,
      filter,
      sortBy,
      descending,
      isOfficial,
      isFeatured
    );
  }
  static async getSoftwareList(
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean,
    isOfficial: boolean,
    isFeatured: boolean
  ) {
    return this.getEntitiesListWithType(
      '881aa1d5-e0de-4bcd-8e47-051d2471b5a9',
      page,
      rowsPerPage,
      filter,
      sortBy,
      descending,
      isOfficial,
      isFeatured
    );
  }
  static async getEntitiesListWithType(
    repoUuid: string | undefined,
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean,
    isOfficial: boolean,
    isFeatured: boolean
  ) {
    const where: any = {
      status: { _eq: 'published' },
    };
    if (repoUuid) {
      where.content_repo = { _eq: `${repoUuid}` };
    }
    if (filter) {
      where.display_name = { _ilike: `%${filter}%` };
    }
    if (isOfficial) {
      where.is_official = { _eq: true };
    }
    if (isFeatured) {
      where.is_featured = { _eq: true };
    }

    const orderBy = [];
    if (sortBy) orderBy.push({ [sortBy]: descending ? 'desc' : 'asc' });

    const data = {
      query: `query GetEntitiesListWithType($where: content_entities_bool_exp, $orderBy: [content_entities_order_by!]) {
        content_entities(
          limit: ${rowsPerPage}
          offset: ${(page - 1) * rowsPerPage}
          where: $where
          order_by: $orderBy
        ) {
          uuid
          display_name
          description
          is_featured
          date_created
          date_updated
          entity_dependency_obj {
            uuid
            display_name
          }
          content_entity_versions(where: {status: {_eq: "published"}}, order_by: {date_created: desc}) {
            uuid
            tag
          }
          content_repo_obj {
            uuid
          }
        }
      }`,
      variables: {
        where,
        orderBy,
      },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.content_entities;
  }
  static async getEntitiesList(
    repoUuid: string | undefined,
    page: number,
    rowsPerPage: number,
    filter: string | undefined,
    sortBy: string | undefined,
    descending: boolean
  ) {
    const where: any = {
      status: { _eq: 'published' },
    };
    if (repoUuid) {
      where.content_repo = { _eq: `${repoUuid}` };
    }
    if (filter) {
      where.display_name = { _ilike: `%${filter}%` };
    }

    const orderBy = [];
    if (sortBy) orderBy.push({ [sortBy]: descending ? 'desc' : 'asc' });

    const data = {
      query: `query GetEntitiesList($where: content_entities_bool_exp, $orderBy: [content_entities_order_by!]) {
        content_entities(
          limit: ${rowsPerPage}
          offset: ${(page - 1) * rowsPerPage}
          where: $where
          order_by: $orderBy
        ) {
          uuid
          display_name
          description
          is_featured
          date_created
          date_updated
          entity_dependency_obj {
            uuid
            display_name
          }
          content_entity_versions(where: {status: {_eq: "published"}}, order_by: {date_created: desc}) {
            uuid
            tag
          }
          content_repo_obj {
            uuid
          }
        }
      }`,
      variables: {
        where,
        orderBy,
      },
    };
    const res = await hasuraRequest.post('', data);
    return res.data.content_entities;
  }
  /**
   * 获取内容列表大小
   */
  static async getUsecaseNumber(filter: string | undefined, isOfficial: boolean, isFeatured: boolean) {
    return this.getEntitiesNumberWithType('d3a6c90e-29d0-4d50-b5f4-f6b67643864a', filter, isOfficial, isFeatured);
  }
  static async getSoftwareNumber(filter: string | undefined, isOfficial: boolean, isFeatured: boolean) {
    return this.getEntitiesNumberWithType('881aa1d5-e0de-4bcd-8e47-051d2471b5a9', filter, isOfficial, isFeatured);
  }
  static async getEntitiesNumberWithType(
    repoUuid: string | undefined,
    filter: string | undefined,
    isOfficial: boolean,
    isFeatured: boolean
  ) {
    const where: any = {
      status: { _eq: 'published' },
    };
    if (repoUuid) {
      where.content_repo = { _eq: `${repoUuid}` };
    }
    if (filter) {
      where.display_name = { _ilike: `%${filter}%` };
    }
    if (isOfficial) {
      where.is_official = { _eq: true };
    }
    if (isFeatured) {
      where.is_featured = { _eq: true };
    }

    const data = {
      query: `query GetEntitiesNumberWithType($where: content_entities_bool_exp) {
        content_entities_aggregate(where: $where) {
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
    return res.data.content_entities_aggregate.aggregate.count;
  }
  static async getEntitiesNumber(repoUuid: string | undefined, filter: string | undefined) {
    const where: any = {
      status: { _eq: 'published' },
    };
    if (repoUuid) {
      where.content_repo = { _eq: `${repoUuid}` };
    }
    if (filter) {
      where.display_name = { _ilike: `%${filter}%` };
    }

    const data = {
      query: `query GetEntitiesNumber($where: content_entities_bool_exp) {
        content_entities_aggregate(where: $where) {
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
    return res.data.content_entities_aggregate.aggregate.count;
  }
  /**
   * 根据id获取模板详情
   */
  static async getTemplateDetail(id: string) {
    const data = {
      query: `query {
        flows(where: { uuid:{ _eq: "${id}" }, status: { _eq: "published" } }) {
          uuid
          display_name
          description
          spec
          readme
          flows_tags {
            id
            tag {
              id
              name
            }
          }
          is_featured
          is_official
          favorite_count
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    if (!res.data.flows.length) return false;

    const _info: any = res.data.flows[0];
    const info = {
      id: _info.uuid,
      name: _info.display_name,
      description: _info.description,
      spec: _info.spec,
      readme: _info.readme,
      tags: _info.flows_tags,
      is_featured: _info.is_featured,
      is_official: _info.is_official,
      favorite_count: _info.favorite_count,
    };
    return info;
  }
  /**
   * 根据id获取内容详情
   */
  static async getEntityDetail(id: string) {
    const data = {
      query: `query {
        content_entities(where: { uuid: { _eq:"${id}" }, status: { _eq: "published" } }) {
          uuid
          display_name
          description
          is_featured
          is_official
          readme
          content_entities_tags {
            id
            tag {
              id
              name
            }
          }
          date_created
          date_updated
          entity_dependency_obj {
            uuid
            display_name
          }
          content_entity_versions(where: {status: {_eq: "published"}}, order_by: {date_created: desc}) {
            uuid
            status
            date_created
            tag
          }
          status
          content_repo_obj {
            uuid
          }
          favorite_count
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    if (!res.data.content_entities.length) return false;
    const _info = res.data.content_entities[0];
    return {
      id: _info.uuid,
      name: _info.display_name,
      description: _info.description,
      readme: _info.readme,
      tags: _info.content_entities_tags,
      date_created: _info.date_created,
      date_updated: _info.date_updated,
      entity_dependency_obj: _info.entity_dependency_obj,
      content_entity_versions: _info.content_entity_versions,
      status: _info.status,
      content_repo_obj: _info.content_repo_obj,
      is_featured: _info.is_featured,
      is_official: _info.is_official,
      favorite_count: _info.favorite_count,
    };
  }
  // 通用组件转节点(通用组件点确定形成节点)
  static async getGeneralContentToNodeById(contentEntityVersion: string, contentEntityDependencyVersion: string) {
    const res = await apiRequest.get(
      `${Apis.ApiUrl}/workflow-editor/GetNodeDraft?usecase_version_id=` +
        contentEntityVersion +
        '&software_version_id=' +
        contentEntityDependencyVersion
    );
    return res;
  }
  // 获取软件版本
  static async getContentVersionDependentContentVersionList(
    contentEntityId: string,
    contentEntityVersion: string,
    contentDependencyId: string
  ) {
    // 获取版本范围
    const data1 = {
      query: `query GetContentVersionDependentContentVersion($contentEntityId: uuid!, $contentEntityVersion: uuid) {
        content_entities_by_pk(uuid: $contentEntityId) {
          content_entity_versions(order_by: {date_created: desc}, where: {status: {_eq: "published"}, uuid: {_eq: $contentEntityVersion}}) {
            tag_dependency
          }
        }
      }`,
      variables: {
        contentEntityId,
        contentEntityVersion,
      },
    };
    const res1 = await hasuraRequest.post('', data1);
    const tagDependency = res1.data.content_entities_by_pk.content_entity_versions[0].tag_dependency;
    // 获取版本列表
    const data2 = {
      query: `query GetContentDependentVersion($contentDependencyId: uuid!) {
        content_entities_by_pk(uuid: $contentDependencyId) {
          content_entity_versions(where: {status: {_eq: "published"}}, order_by: {date_created: desc}) {
            uuid
            tag
            date_created
          }
        }
      }`,
      variables: {
        contentDependencyId,
      },
    };
    const res2 = await hasuraRequest.post('', data2);
    const versions = res2.data.content_entities_by_pk.content_entity_versions;
    // 筛选版本列表
    const semver = require('semver');
    const returnVersions = [];
    versions.forEach((version: { tag: string }) => {
      if (semver.satisfies(version.tag, tagDependency)) returnVersions.push(version);
    });
    return versions.map((item: { uuid: string; tag: string; date_created: string }) => {
      return {
        contentDependencyId: item.uuid,
        version: item.tag,
        date_created: item.date_created,
      };
    });
  }
  /**
   * 获取组件类型列表
   * 获取计算编排系统支持的组件类型列表
   */
  static async getComponentCategories() {
    const res = await apiRequest.get(`${Apis.ApiUrl}/workflow-editor/GetComponentCategories?lang=zh-Hans`);
    return res;
  }
}
