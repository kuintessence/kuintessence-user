import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'IndexPage',
        meta: { showTab: false },
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'compute',
        name: 'ComputePage',
        meta: { title: '计算', showTab: false },
        component: () => import('pages/ComputePage.vue'),
      },
      {
        path: 'single-compute',
        name: 'SingleCompute',
        meta: { title: '单任务计算', showTab: false },
        component: () => import('pages/compute/SingleCompute.vue'),
      },
      {
        path: 'batch-compute',
        name: 'BatchCompute',
        meta: { title: '批量任务计算', showTab: false },
        component: () => import('pages/compute/BatchCompute.vue'),
      },
      {
        path: 'instance-detail',
        name: 'InstanceDetail',
        meta: { title: '任务详情', showTab: true, icon: 'task', color: 'primary' },
        component: () => import('src/pages/compute/instance/InstanceDetail.vue'),
      },
      {
        path: 'application',
        name: 'ApplicationPage',
        meta: { title: '应用仓库', showTab: false },
        component: () => import('pages/ApplicationPage.vue'),
      },
      {
        path: 'add-soft',
        name: 'AddSoft',
        meta: { title: '添加软件', showTab: true, icon: 'move_to_inbox', color: 'secondary' },
        component: () => import('pages/application/AddSoft.vue'),
      },
      {
        path: 'add-usecase',
        name: 'AddUsecase',
        meta: { title: '添加用例', showTab: true, icon: 'move_to_inbox', color: 'accent' },
        component: () => import('pages/application/AddUsecase.vue'),
      },
      {
        path: 'official-template',
        name: 'OfficialTemplate',
        meta: { title: '模板详情', showTab: true, icon: 'draw', color: 'positive' },
        component: () => import('src/pages/application/OfficialTemplate.vue'),
      },
      {
        path: 'usecase-detail',
        name: 'UsecaseDetail',
        meta: { title: '用例详情', showTab: true, icon: 'inbox', color: 'cyan-7' },
        component: () => import('src/pages/application/UsecaseDetail.vue'),
      },
      {
        path: 'software-detail',
        name: 'SoftwareDetail',
        meta: { title: '软件详情', showTab: true, icon: 'inbox', color: 'pink' },
        component: () => import('src/pages/application/SoftwareDetail.vue'),
      },
      {
        path: 'file',
        name: 'FilePage',
        meta: { title: '文件', showTab: false },
        component: () => import('pages/FilePage.vue'),
      },
      {
        path: 'user',
        name: 'UserPage',
        meta: { title: '用户', showTab: false },
        component: () => import('pages/UserPage.vue'),
      },
      {
        path: 'draft-editor',
        name: 'DraftEditor',
        meta: {
          title: '草稿编辑器',
          showTab: true,
          icon: 'r_account_tree',
          color: 'indigo',
        },
        component: () => import('pages/DraftEditor.vue'),
      },
    ],
  },
  {
    path: '/oidc',
    component: () => import('src/layouts/OidcLayout.vue'),
    children: [
      {
        name: 'call-back',
        path: 'call-back',
        component: () => import('src/pages/oidc/CallBack.vue'),
      },
      {
        name: 'access-denied',
        path: 'access-denied',
        component: () => import('src/pages/oidc/AccessDenied.vue'),
      },
      {
        name: 'silent-renew',
        path: 'silent-renew',
        component: () => import('src/pages/oidc/SilentRenew.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
