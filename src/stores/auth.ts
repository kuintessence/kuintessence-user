import { defineStore } from 'pinia';
import { mgr } from 'src/boot/oidc';
import { UserService } from 'src/service';

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    userId: '',
    userName: '',
    token: '',
    lastName: '',
    firstName: '',
    email: '',
    authTime: +new Date(),

    nickName: '',
    userPhone: '',

    displayName: '',
  }),
  actions: {
    // 获取用户信息
    async setUser() {
      const oidcUser = await mgr.getUser();
      const profile = oidcUser?.profile;
      //默认字段，不允许修改
      this.token = oidcUser?.access_token || '';
      this.userId = profile?.sub || '';
      this.userName = profile?.preferred_username || '';
      this.email = profile?.email || '';
      this.authTime = profile?.auth_time ? profile.auth_time : +new Date();

      //自定义字段允许修改
      const userInfo = await UserService.getOidcUserInfo();
      this.lastName = userInfo?.lastName || '';
      this.firstName = userInfo?.firstName || '';
      this.nickName = userInfo.attributes.nickName || '';
      this.userPhone = userInfo.attributes.userPhone;

      //显示名称
      this.displayName = this.nickName || `${this.lastName}${this.firstName}` || this.userName || '';
    },
  },
});
