import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { Notify, LocalStorage } from 'quasar';
import { $mgr } from './oidc';

const { env } = window as any;
// 读取域名配置
const Apis = {
  CoRepoUrl: env.CoRepoUrl,
  HasuraUrl: env.HasuraUrl,
  ApiUrl: env.ApiUrl,
  OidcUrl: env.OIDC_AUTHORITY,
};

/**
 * graghql 接口封装
 * 正常返回格式为{data:any}
 * 错误返回格式为{errors:[{extensions:any,message:string}]}
 */
function graghqlInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use(
    function (config) {
      return config;
    },
    function (error) {
      return Promise.reject({ message: '请求错误', errors: error });
    }
  );
  instance.interceptors.response.use(
    function (response) {
      const data: { data?: any; errors?: any } = response.data;
      if (data.errors) {
        if (data.errors[0]?.extensions?.code === 'invalid-jwt') {
          Notify.create({
            type: 'warning',
            message: '未授权，请重新登录',
          });
          $mgr.signOut();
          return Promise.reject({
            message: '未授权，请重新登录',
            errors: data.errors,
          });
        } else {
          console.log('error: GraphQL 返回错误');
          return Promise.reject({
            message: 'GraphQL 返回错误',
            errors: data.errors,
          });
        }
      }
      return Promise.resolve(data);
    },
    function (error) {
      if (error?.response?.status == 401) {
        Notify.create({
          type: 'warning',
          message: '未授权，请重新登录',
        });
        return $mgr.signOut();
      } else {
        console.log('error: ' + error);
        return Promise.reject({ message: '捕获错误', errors: error.response });
      }
    }
  );
}
const request = axios.create({
  baseURL: `${Apis.CoRepoUrl}/graphql`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 1000 * 60 * 2,
});
graghqlInterceptors(request);

const hasuraRequest = axios.create({
  baseURL: `${Apis.HasuraUrl}/graphql`,
  headers: {
    Authorization: 'Bearer ' + LocalStorage.getItem('token'),
    'Content-Type': 'application/json',
  },
  timeout: 1000 * 60 * 2,
});
graghqlInterceptors(hasuraRequest);

/**
 * 普通接口封装
 * 返回格式：{content：any，message：string，status：number}
 * status为200代表正常，status为400代表后端逻辑错误，status为500代表后端报错
 */
const apiRequest = axios;
apiRequest.interceptors.request.use(
  function (config) {
    config.headers.Authorization = 'Bearer ' + LocalStorage.getItem('token');
    return config;
  },
  function (error) {
    return Promise.reject({ message: '请求错误', errors: error });
  }
);
apiRequest.interceptors.response.use(
  function (response) {
    const data: { content: any; message: string; status: number } = response.data;
    if (data.status != 200 && data.status) {
      console.log('error: ' + data.message || '接口错误');
      return Promise.reject({ message: '接口返回错误', errors: data });
    }
    return Promise.resolve(data.content ? data.content : data);
  },
  function (error) {
    if (error?.response?.status == 401) {
      Notify.create({
        type: 'warning',
        message: '未授权，请重新登录',
      });
      return $mgr.signOut();
    } else {
      console.log('error: ' + error);
      return Promise.reject(error);
    }
  }
);

export default boot(({ app }) => {
  // 注册全局变量
  app.config.globalProperties.$axios = axios;
});

export { Apis, axios, request, hasuraRequest, apiRequest };
