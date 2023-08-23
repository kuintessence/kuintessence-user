import Oidc from 'oidc-client';
import { LocalStorage } from 'quasar';

const { env } = window as any;
const OIDC_AUTHORITY = `${env.OIDC_AUTHORITY}/.well-known/openid-configuration`;
const OIDC_CLIENTID = env.OIDC_CLIENTID;
const OIDC_CLIENTSECRET = env.OIDC_CLIENTSECRET;

const mgr = new Oidc.UserManager({
  // *OIDC/OAuth2提供程序的URL
  authority: OIDC_AUTHORITY,
  // *在OIDC/OAuth2中注册的客户端应用程序标识符
  client_id: OIDC_CLIENTID,
  client_secret: OIDC_CLIENTSECRET,
  // *希望从OIDC/OAuth2提供程序获得的响应类型（默认值：“id_token”）
  response_type: 'code',
  // *从OIDC/OAuth2提供程序请求的范围（默认值：“openid”）
  scope: 'openid profile',
  // *客户端应用程序的重定向URI，用于接收来自OIDC/OAuth2提供程序的响应
  redirect_uri: `${window.location.origin}/#/oidc/call-back`,
  // OIDC/OAuth2注销后重定向URI
  post_logout_redirect_uri: `${window.location}`,
  // 包含处理静默续订的代码的页面的URL
  silent_redirect_uri: `${window.location.origin}/#/oidc/silent-renew`,
  // 指示在访问令牌到期之前是否应自动尝试续订该令牌的标志（默认值：false）
  automaticSilentRenew: true,
  // 将在用户在OP上执行注销时引发事件（默认值：true）
  monitorSession: true,
  // 检查用户会话的间隔（毫秒）（默认值：2000）
  checkSessionInterval: 2000,
  // 如果用户有访问令牌，将在注销时调用吊销端点（默认值：false）
  revokeAccessTokenOnSignout: true,
  // 用于为当前经过身份验证的用户持久化用户的存储对象（默认：session storage）
  userStore: new Oidc.WebStorageStateStore({ store: window.localStorage }),
});

mgr.startSilentRenew();

// 在建立(或重新建立)用户会话时触发
mgr.events.addUserLoaded(async function (user) {
  LocalStorage.set('token', user.access_token);
  LocalStorage.set('expires_at', user.expires_at);
});

// 在访问令牌到期之前触发
mgr.events.addAccessTokenExpiring(function () {
  mgr.signinSilentCallback().then(() => {
    mgr.signinSilent();
  });
});

// 在访问令牌过期后触发
mgr.events.addAccessTokenExpired(function () {
  $mgr.signOut();
});

// 当自动静默更新失败时触发
mgr.events.addSilentRenewError(function () {
  $mgr.signOut();
});

const $mgr = {
  removeLocalstorage: () => {
    LocalStorage.remove('token');
    LocalStorage.remove('expires_at');
    LocalStorage.remove('tabList');
  },
  signIn: () => {
    $mgr.removeLocalstorage();
    return mgr.signinRedirect({ state: window.location.href });
  },
  signInSilent: () => {
    return mgr.signinSilent();
  },
  signOut: async () => {
    await mgr.clearStaleState();
    await mgr.signoutRedirect();
    $mgr.removeLocalstorage();
  },
  callBack: () => {
    return mgr.signinCallback().then(() => {
      window.location.href = '/';
    });
  },
};

export { mgr, $mgr };
