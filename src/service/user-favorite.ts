import { hasuraRequest } from 'src/boot/axios';
import { useRefreshStore } from 'src/stores/refresh';

export class UserFavoriteService {
  /**
   * 根据类型和分页、筛选获取收藏列表
   * @param type 0-用户模板, 1-模板, 2-用例, 3-软件
   */
  static async getList(
    type: string,
    page: number,
    rowsPerPage: number,
    sortBy: string | undefined,
    descending: boolean
  ) {
    let orderBy = '[]';
    if (sortBy) orderBy = `[{ ${sortBy}: ${descending ? 'desc' : 'asc'} }]`;
    const data = {
      query: `query {
        user_favorite(
          limit: ${rowsPerPage}
          offset: ${(page - 1) * rowsPerPage}
          where: {type: {_eq: ${type}}}
          order_by: ${orderBy}
        ) {
          id
          favorite_id
          type
          created_at
          content_repo_id
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    if (res.data.user_favorite.length === 0) return [];
    else return res.data.user_favorite;
  }
  /**
   * 根据类型获取收藏列表大小
   * @param type 0-用户模板, 1-模板, 2-用例, 3-软件
   */
  static async getListNumber(type: string) {
    const data = {
      query: `query {
        user_favorite_aggregate(where: {type: {_eq: ${type}}}) {
          aggregate {
            count
          }
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    return res.data.user_favorite_aggregate.aggregate.count;
  }
  /**
   * 判断是否收藏
   */
  static async isFavorite(id: string) {
    const data = {
      query: `query IsFavorite {
        user_favorite(where: {favorite_id: {_eq: "${id}"}}) {
          id
          type
          created_at
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    if (!res.data.user_favorite[0]) return false;
    else return true;
  }
  /**
   * 根据类型和id收藏
   * @param type 0-用户模板, 1-模板, 2-用例, 3-软件
   */
  static async favor(type: string, id: string, content_repo_id: string | undefined) {
    const insertContentRepoId = content_repo_id
      ? `
      content_repo_id: "${content_repo_id}"
    `
      : '';
    const data = {
      query: `mutation FavorUserTemplate {
        insert_user_favorite_one(
          object: {
            favorite_id: "${id}",
            type: ${type},${insertContentRepoId}
          }) {
            id
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshUserFavoriteData();
    if (!res.data.insert_user_favorite_one) return false;
    else return true;
  }
  /**
   * 根据类型和id取消收藏
   * @param type 0-用户模板, 1-模板, 2-用例, 3-软件
   */
  static async unfavor(id: string) {
    const data = {
      query: `mutation UnfavorUserTemplate {
        delete_user_favorite(where: {favorite_id: {_eq: "${id}"}}) {
          returning {
            id
          }
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    const refreshStore = useRefreshStore();
    refreshStore.refreshUserFavoriteData();
    return res;
  }
  /**
   * 根据类型和分页、筛选获取收藏列表（用例&软件）
   */
  static async getListEntities(
    page: number,
    rowsPerPage: number,
    sortBy: string | undefined,
    descending: boolean,
    content_repo_id: string | undefined
  ) {
    let orderBy = '[]';
    if (sortBy) orderBy = `[{ ${sortBy}: ${descending ? 'desc' : 'asc'} }]`;
    let queryContentRepoId;
    if (content_repo_id) queryContentRepoId = `, content_repo_id: {_eq: "${content_repo_id}"}`;
    else queryContentRepoId = '';
    const data = {
      query: `query {
        user_favorite(
          limit: ${rowsPerPage}
          offset: ${(page - 1) * rowsPerPage}
          where: {type: {_in: ["2", "3"]}${queryContentRepoId}}
          order_by: ${orderBy}
        ) {
          id
          favorite_id
          type
          created_at
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    if (res.data.user_favorite.length === 0) return [];
    else return res.data.user_favorite;
  }
  /**
   * 根据类型获取收藏列表大小（用例&软件）
   */
  static async getListNumberEntities(content_repo_id: string | undefined) {
    let queryContentRepoId;
    if (content_repo_id) queryContentRepoId = `, content_repo_id: {_eq: "${content_repo_id}"}`;
    else queryContentRepoId = '';
    const data = {
      query: `query {
        user_favorite_aggregate(where: {type: {_in: ["2", "3"]}${queryContentRepoId}}) {
          aggregate {
            count
          }
        }
      }`,
    };
    const res = await hasuraRequest.post('', data);
    return res.data.user_favorite_aggregate.aggregate.count;
  }
}
