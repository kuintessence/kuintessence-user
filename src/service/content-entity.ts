import { date } from 'quasar';
import { request, axios, Apis, hasuraRequest } from 'src/boot/axios';
import { EntityStatus, EntityType, FavoriteType } from 'src/interface/category';
import { useAuthStore } from 'src/stores/auth';
import { contentEntityListInterface } from 'src/interface/content-entity';

//获取软件或者用例列表
export async function getSearchEntityList(page = 1, pageSize = 15, filter: any) {
  const query = {
    query: `query($filter:content_entities_filter){
      content_entities(
        sort: ["-date_created"],
        filter: $filter,
        limit:${pageSize},
        page:${page},
      ) {
        uuid
        status
        display_name
        system_name
        date_created
        description
        content_repo{
          system_name
        }
        img_logo{
          id
        }
        logo
        is_featured
        is_official
        favorite_count
        create_user
        content_entity_versions {
          uuid
          tag
          data{
            id
            type
          }
        }
        tags{
          tags_id{
            id
            name
          }
        }
        entity_dependency_versions{
          content_entity_versions_uuid{
            tag
            uuid
            content_entity{
              uuid
              display_name
              system_name
            }
          }
        }
      }
      content_entities_aggregated (
        filter: $filter
      ){
        group
      }
    }
  `,
    variables: {
      filter,
    },
  };
  const data = await request.post('', query);

  const list: Array<contentEntityListInterface> = data.data.content_entities.map((entity: any) => {
    return {
      entityId: entity.uuid,
      status: entity.status,
      favoriteCount: entity.favorite_count,
      createUserId: entity.create_user,
      name: entity.display_name,
      systemName: entity.system_name,
      desc: entity.description,
      createDate: date.formatDate(entity.date_created, 'YYYY-MM-DD HH:mm:ss'),
      isFeatured: entity.is_featured,
      isOfficial: entity.is_official,
      entityType: entity.content_repo?.system_name || '',
      author: '官方',
      logo: entity.logo || (entity?.img_logo?.id ? `${Apis.CoRepoUrl}/assets/${entity.img_logo.id}` : ''),
      tags: entity.tags.map((tag: any) => {
        return {
          tagId: tag.tags_id?.id,
          tagName: tag.tags_id?.name,
        };
      }),
      versionList: entity.content_entity_versions.map((version: any) => {
        return {
          versionId: version.uuid,
          versionTag: version.tag,
          fileId: version.data?.id,
          fileType: version.data?.type,
        };
      }),
      dependVersionList: entity.entity_dependency_versions.map((version: any) => {
        return {
          dependSoftId: version.content_entity_versions_uuid?.content_entity?.uuid,
          dependSoftName: version.content_entity_versions_uuid?.content_entity?.display_name,
          dependSoftVersionId: version.content_entity_versions_uuid?.uuid,
          dependSoftVersion: version.content_entity_versions_uuid?.tag,
        };
      }),
    };
  });
  const count: number = data?.data?.content_entities_aggregated?.length || 0;
  return { list, count };
}
getSearchEntityList(1, 15, { is_official: { _eq: false } });
export class EntityService {
  //获取软件或者用例列表
  static async getEntityList(
    page = 1,
    keywords?: string,
    pageSize = 15,
    entityType = EntityType.soft,
    tags?: string[],
    isFeatured?: boolean,
    isOfficial?: boolean,
    user?: string
  ) {
    const filter: any = {
      status: { _eq: EntityStatus.published },
      content_repo: { system_name: { _eq: entityType } },
    };
    if (keywords) {
      filter.display_name = { _contains: keywords };
    }
    if (tags?.length) {
      filter.tags = {
        tags_id: {
          id: {
            _in: tags,
          },
        },
      };
    }
    if (isFeatured) {
      filter.is_featured = { _eq: isFeatured };
    }
    if (isOfficial) {
      filter.is_official = { _eq: isOfficial };
    }
    if (user) {
      filter.create_user = { _eq: user };
    }
    const data = await getSearchEntityList(page, pageSize, filter);

    //如果用户登录，查询当前列表是否在收藏内
    const authStore = useAuthStore();
    if (authStore.userId) {
      const type = FavoriteType[entityType];
      if (type) {
        const favoriteQuery = {
          query: `query MyQuery($ids:[uuid!]) {
          user_favorite(
            where: {type: {_eq: "${type}"},favorite_id: {_in:$ids}}
          ) {
            id
            favorite_id
            type
            created_at
          }
        }`,
          variables: {
            ids: data.list.map(item => {
              return item.entityId;
            }),
          },
        };
        const favoriteData = await hasuraRequest.post('', favoriteQuery);

        data.list.forEach(entity => {
          const favorite = favoriteData?.data?.user_favorite?.find(
            (favorite: any) => entity.entityId == favorite.favorite_id
          );
          if (favorite) {
            entity.isFavorite = true;
            entity.favoriteId = favorite.id;
          } else {
            entity.isFavorite = false;
          }
        });
      }
    }
    return data;
  }
  //获取我创建的列表
  static async getMyEntityList(
    page = 1,
    keywords?: string,
    pageSize = 15,
    entityType?: string,
    tags?: string[],
    isFeatured?: boolean,
    isOfficial?: boolean
  ) {
    const authStore = useAuthStore();
    const filter: any = {
      create_user: {
        _eq: authStore.userId,
      },
    };
    if (entityType) {
      filter.content_repo = { system_name: { _eq: entityType } };
    }
    if (keywords) {
      filter.display_name = { _contains: keywords };
    }
    if (tags?.length) {
      filter.tags = {
        tags_id: {
          id: {
            _in: tags,
          },
        },
      };
    }
    if (isFeatured) {
      filter.is_featured = { _eq: isFeatured };
    }
    if (isOfficial) {
      filter.is_official = { _eq: isOfficial };
    }
    return await getSearchEntityList(page, pageSize, filter);
  }

  //获取entity信息
  static async getEntityInfo(entityId: string) {
    const query = {
      query: `query {
        content_entities_by_id(id:"${entityId}") {
          uuid
          status
          display_name
          system_name
          date_created
          description
          content_repo{
            system_name
          }
          img_logo{
            id
          }
          logo
          is_featured
          is_official
          favorite_count
          create_user
          content_entity_versions {
            uuid
            tag
            status
            data{
              id
              type
            }
            content_entity{
              uuid
              display_name
              system_name
            }
          }
          tags{
            tags_id{
              id
              name
            }
          }
          entity_dependency_versions{
            content_entity_versions_uuid{
              tag
              uuid
              content_entity{
                uuid
                display_name
                system_name
              }
            }
          }
        }
      }
    `,
    };
    const data = await request.post('', query);
    const entity = data?.data?.content_entities_by_id;

    const infoData: contentEntityListInterface = {
      entityId: entity.uuid,
      status: entity.status,
      favoriteCount: Number(entity.favorite_count),
      createUserId: entity.create_user,
      name: entity.display_name,
      systemName: entity.system_name,
      desc: entity.description,
      isOfficial: entity.is_official,
      isFeatured: entity.is_featured,
      entityType: entity.content_repo?.system_name || '',
      author: '官方',
      createDate: date.formatDate(entity.date_created, 'YYYY-MM-DD HH:mm:ss'),
      logo: entity?.img_logo?.id ? `${Apis.CoRepoUrl}/assets/${entity.img_logo.id}` : entity.logo,
      tags: entity.tags.map((tag: any) => {
        return {
          tagId: tag.tags_id?.id,
          tagName: tag.tags_id?.name,
        };
      }),
      versionList: entity.content_entity_versions?.map((_version: any) => {
        return {
          versionId: _version.uuid,
          versionTag: _version.tag,
          fileId: _version.data?.id,
          fileType: _version.data?.type,
          status: _version.status,
        };
      }),
      dependVersionList: entity.entity_dependency_versions.map((version: any) => {
        return {
          dependSoftId: version.content_entity_versions_uuid?.content_entity?.uuid,
          dependSoftName: version.content_entity_versions_uuid?.content_entity?.display_name,
          dependSoftVersionId: version.content_entity_versions_uuid?.uuid,
          dependSoftVersion: version.content_entity_versions_uuid?.tag,
        };
      }),
    };
    //判断是否收藏过了
    const authStore = useAuthStore();
    if (authStore.userId) {
      const type = FavoriteType[infoData.entityType];
      if (type) {
        const favoriteQuery = {
          query: `query {
            user_favorite(
              where: {type: {_eq: ${type}},favorite_id: {_eq:"${infoData.entityId}"}}
            ) {
              id
              favorite_id
              type
              created_at
            }
          }`,
        };
        const favoriteData = await hasuraRequest.post('', favoriteQuery);
        if (favoriteData?.data?.user_favorite?.length) {
          infoData.isFavorite = true;
          infoData.favoriteId = favoriteData.data.user_favorite[0].id;
        } else {
          infoData.isFavorite = false;
        }
      }
    }
    return infoData;
  }
  //获取entity的version信息
  static async getEntityVersionInfo(versionId: string) {
    const query = {
      query: `query {
        content_entity_versions_by_id(id: "${versionId}") {
          uuid
          date_created
          data{
            id
            type
          }
          create_user
          content_entity {
            uuid
            status
            system_name
            display_name
            logo
            img_logo{
              id
            }
            description
          }
          tag
        }
      }
      `,
    };
    const data = await request.post('', query);
    const info = data?.data?.content_entity_versions_by_id;
    return {
      versionId: info.uuid,
      createUserId: info.create_user,
      fileId: info.data?.id,
      fileType: info.data?.type,
      entityId: info.content_entity?.uuid,
      status: info.content_entity?.status,
      entityName: info.content_entity?.display_name,
      entitySystemName: info.content_entity?.system_name,
      entityLogo: info.content_entity?.img_logo?.id
        ? `${Apis.CoRepoUrl}/assets/${info.content_entity?.img_logo?.id}`
        : info.content_entity.logo,
      entityDescription: info.content_entity?.description,
      version: info.tag,
    };
  }

  //获取entity的file链接
  static getEntityFileDownloadUrl(fileId: string): string {
    return `${Apis.CoRepoUrl}/assets/${fileId}?download`;
  }

  //新建一个entity
  static async createContentEntity(formData: any, repoType: string) {
    const repoQuery = {
      query: `query {
        content_repos (filter:{system_name:{_eq:"${repoType}"}}){
          uuid
          system_name
        }
      }
      `,
    };
    const res = await request.post('', repoQuery);

    const repoId = res?.data?.content_repos[0]?.uuid || '';
    if (!repoId) throw '保存类型错误';

    //先将logo上传到对象存储
    let fileData;
    if (formData.logo) {
      const logoForm = new FormData();
      logoForm.append('title', formData.logo.name || 'logo');
      logoForm.append('file', formData.logo);
      fileData = await request.post(`${Apis.CoRepoUrl}/files`, logoForm);
    }

    const authStore = useAuthStore();

    const query = {
      query: `mutation {
        create_content_entities_item(
          data:{
            status:"${EntityStatus.draft}",
            content_repo :{
              uuid:"${repoId}"
            },
            system_name:"${formData.systemName || ''}",
            display_name:"${formData.name || ''}",
            description:"${formData.description || ''}",
            img_logo:{
              id:"${fileData?.data?.id || ''}",
              storage:"${fileData?.data?.storage || ''}",
              filename_download:"${fileData?.data?.filename_download || ''}",
              uploaded_on:"${fileData?.data?.uploaded_on || ''}",
              modified_on:"${fileData?.data?.modified_on || ''}"
            },
            create_user:"${authStore.userId}"
          }
        ) {
          uuid
        }
      }`,
    };
    const returnData = await request.post('', query);
    const entityId: string = returnData?.data?.create_content_entities_item?.uuid;
    //新增软件依赖
    if (formData.dependSoftVersionId) {
      const versionQuery = {
        query: `mutation {
        create_content_entities_content_entity_versions_item(data: {
          content_entities_uuid:{
            uuid:"${entityId}"
          },
          content_entity_versions_uuid:{
            uuid:"${formData.dependSoftVersionId}",
            status:"",
            tag:"${formData.dependSoftVersion}"
          }
        }) {
          id
          }
      }
      `,
      };
      await request.post('', versionQuery);
    }
    //新增标签依赖
    if (formData.tags && formData.tags.length) {
      const tagQuery = {
        query: `mutation($tags:[create_content_entities_tags_input!]) {
          create_content_entities_tags_items(
            data: $tags
          ) {
            id
          }
        }
      `,
        variables: {
          tags: formData.tags.map((tag: any) => {
            return {
              content_entities_uuid: { uuid: entityId },
              tags_id: { id: tag.value, name: tag.label },
            };
          }),
        },
      };
      await request.post('', tagQuery);
    }
    return entityId;
  }
  //新建一个entity的version
  static async createContentEntityVersion(entityId: string, file: File, data: any) {
    //先将文件上传到对象存储
    const formData = new FormData();
    formData.append('title', file.name || '压缩包文件');
    formData.append('file', file);
    const fileData = await request.post(`${Apis.CoRepoUrl}/files`, formData);
    const authStore = useAuthStore();

    const versionData = {
      query: `mutation{
        create_content_entity_versions_item(
          data: {
            create_user:"${authStore.userId}",
            status: "${EntityStatus.draft}",
            tag: "${data.version || ''}",
            content_entity:{uuid:"${entityId || ''}"},
            data:{
              id:"${fileData?.data?.id || ''}",
              storage:"${fileData?.data?.storage || ''}",
              filename_download:"${fileData?.data?.filename_download || ''}",
              uploaded_on:"${fileData?.data?.uploaded_on || ''}",
              modified_on:"${fileData?.data?.modified_on || ''}"
            },
            tag_dependency:"${data.dependencyVersionRange || ''}"
          }
        ) {
          uuid
        }
      }
      `,
    };
    const returnData = await request.post('', versionData);
    return returnData.data.create_content_entity_versions_item.uuid as string;
  }
  //更新entity
  static async updateContentEntity(entityId: string, formData: any) {
    //先将logo上传到对象存储
    let fileData: any = null;
    if (formData.logo) {
      const logoForm = new FormData();
      logoForm.append('title', 'logo');
      logoForm.append('file', formData.logo);
      fileData = await request.post(`${Apis.CoRepoUrl}/files`, logoForm);
    }

    const query = {
      query: `mutation {
        update_content_entities_item(
          id:"${entityId}",
          data:{
            system_name:"${formData.systemName || ''}",
            display_name:"${formData.name || ''}",
            description:"${formData.description || ''}",
            ${
              fileData &&
              `img_logo:{
              id:"${fileData?.data?.id || ''}",
              storage:"${fileData?.data?.storage || ''}",
              filename_download:"${fileData?.data?.filename_download || ''}",
              uploaded_on:"${fileData?.data?.uploaded_on || ''}",
              modified_on:"${fileData?.data?.modified_on || ''}"
            }`
            }
          }
        ) {
          uuid
        }
      }`,
    };
    const returnData = await request.post('', query);
    return returnData?.data?.update_content_entities_item?.uuid as string;
  }
  //更新entity的version
  static async updateContentEntityVersion(versionId: string, file: File, data: any) {
    //先将文件上传到对象存储
    const formData = new FormData();
    formData.append('title', file.name || '压缩包文件');
    formData.append('file', file);
    const fileData = await request.post(`${Apis.CoRepoUrl}/files`, formData);
    const versionData = {
      query: `mutation{
        update_content_entity_versions_item(
          id:"${versionId}",
          data: {
            data:{
              id:"${fileData?.data?.id || ''}",
              storage:"${fileData?.data?.storage || ''}",
              filename_download:"${fileData?.data?.filename_download || ''}",
              uploaded_on:"${fileData?.data?.uploaded_on || ''}",
              modified_on:"${fileData?.data?.modified_on || ''}"
            },
            tag_dependency:"${data.dependencyVersionRange || ''}"
          }
        ) {
          uuid
        }
      }
      `,
    };
    const returnData = await request.post('', versionData);
    return returnData.data.update_content_entity_versions_item.uuid as string;
  }

  static async getTemplateKeys(fileContent: string): Promise<Array<string> | null> {
    if (!fileContent) return null;
    return axios
      .get('/usecase-editor/GetTemplateKeys?source=' + encodeURIComponent(fileContent))
      .then((content: any) => {
        return content;
      })
      .catch((error: any) => {
        throw error;
      });
  }
  //删除实例
  static async delEntity(id: string) {
    const query = {
      query: `mutation {
        delete_content_entities_item(id: "${id}") {
          id
        }
      }`,
    };
    return await request.post('', query);
  }
  //删除实例版本
  static async delEntityVersion(id: string) {
    const query = {
      query: `mutation {
        delete_content_entity_versions_item(id: "${id}") {
          id
        }
      }`,
    };
    return await request.post('', query);
  }

  //发布entity
  static async publishEntity(entityId: string, tags: { id: string; name: string }[]) {
    const info = await this.getEntityInfo(entityId);
    const query = {
      query: `mutation($versionIds:[ID]!,$tags:[update_content_entities_tags_input!]) {
        update_content_entities_item(
          id:"${entityId}",
          data:{
            status:"${EntityStatus.published}",
            tags:$tags
          }
        ) {
          uuid
        }
        update_content_entity_versions_items(
          ids: $versionIds
          data: {
            status:"${EntityStatus.published}"
          }
        ) {
          uuid
        }
      }`,
      variables: {
        versionIds: info.versionList.map((version: { versionId: any }) => {
          return version.versionId;
        }),
        tags: tags.map(tag => {
          return {
            content_entities_uuid: { uuid: entityId },
            tags_id: { id: tag.id },
          };
        }),
      },
    };
    return await request.post('', query);
  }
  //发布entity
  static async publishEntityVersion(entityId: string, versionId: string, tags: { id: string; name: string }[]) {
    const query = {
      query: `mutation ($tags:[update_content_entities_tags_input!]){
        update_content_entities_item(
          id:"${entityId}",
          data:{
            status:"${EntityStatus.published}"
            tags:$tags
          }
        ) {
          uuid
        }
        update_content_entity_versions_item(
          id:"${versionId}",
          data:{
            status:"${EntityStatus.published}"
          }
        ) {
          uuid
        }
      }`,
      variables: {
        tags: tags.map(tag => {
          return {
            content_entities_uuid: { uuid: entityId },
            tags_id: { id: tag.id },
          };
        }),
      },
    };
    return await request.post('', query);
  }
}
