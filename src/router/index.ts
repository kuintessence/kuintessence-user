import { useKeepAliveStore } from 'src/stores/keep-alive';
import { route } from 'quasar/wrappers';
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import routes from './routes';
import { LocalStorage } from 'quasar';
import { $mgr } from 'src/boot/oidc';
import { useAuthStore } from 'src/stores/auth';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE),
  });

  // 路由前调用
  Router.beforeEach(async (to, from, next) => {
    if (to.name === 'call-back' || to.name === 'silent-renew' || to.name === 'access-denied') {
      next(true);
    } else {
      if (to.meta.title) document.title = (to.meta.title as string) + ' - Kuintessence';
      else document.title = 'Kuintessence';
      // 判断是否需要登录
      // 验证localstorage中的token信息
      if (
        LocalStorage.getItem('token') &&
        (LocalStorage.getItem('expires_at') ? (LocalStorage.getItem('expires_at') as number) : 0) >
          Math.round(new Date().getTime() / 1000)
      ) {
        // 存在token，存入user信息
        await useAuthStore().setUser();
        //静默登录
        await $mgr.signInSilent();
        // 这里的逻辑是为了在打开页面前将路由route的fullPath存入store中，方便管理
        const keepAliveStore = useKeepAliveStore();
        keepAliveStore.addTab({
          fullPath: to.fullPath,
          name: to.name as string,
          meta: {
            title: to.meta.title as string,
            showTab: to.meta.showTab as boolean,
            icon: to.meta.icon as string,
            color: to.meta.color as string,
          },
        });
        keepAliveStore.openedPath = to.fullPath;
        next(true);
      } else {
        // token不存在&token过期，跳转登录
        await $mgr.signIn();
      }
    }
  });

  return Router;
});
