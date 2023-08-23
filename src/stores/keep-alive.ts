import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';

export const useKeepAliveStore = defineStore('keepAlive', {
  state: () => ({
    openedPath: '/',
    tabList: (LocalStorage.getItem('tabList') || []) as {
      fullPath: string;
      name: string;
      meta: {
        title: string;
        showTab: boolean;
        icon?: string;
        color?: string;
      };
    }[], // 存放打开的路由标签页
    timeout: 30000, // 刷新数据间隔
  }),
  getters: {
    showTabList(state) {
      const showTabList = [] as {
        fullPath: string;
        name: string;
        meta: {
          title: string;
          showTab: boolean;
          icon?: string;
          color?: string;
        };
      }[];
      state.tabList.forEach(tab => {
        if (tab.meta.showTab) showTabList.push(tab);
      });
      return showTabList;
    },
  },
  actions: {
    // 打开新的页面的时候将页面的信息存到store里面
    addTab(newTab: {
      fullPath: string;
      name: string;
      meta: {
        title: string;
        showTab: boolean;
        icon?: string;
        color?: string;
      };
    }) {
      const findTab = this.tabList.find((tab: { fullPath: string }) => {
        return tab.fullPath == newTab.fullPath;
      });
      if (!findTab) {
        this.tabList.push({
          fullPath: newTab.fullPath,
          name: newTab.name as string,
          meta: {
            title: newTab.meta.title as string,
            showTab: newTab.meta.showTab as boolean,
            icon: newTab.meta.icon as string,
            color: newTab.meta.color as string,
          },
        });
        LocalStorage.set('tabList', this.tabList);
      }
    },
    // 删除指定fullPath的数据
    deleteTabByPath(fullPath: string) {
      for (let i = 0, len = this.tabList.length; i < len; i++)
        if (this.tabList[i].fullPath === fullPath) {
          if (fullPath === this.openedPath) {
            let finded = false;
            for (let j = 0, len = this.showTabList.length; j < len; j++)
              if (this.showTabList[j].fullPath === fullPath) {
                if (this.showTabList[j - 1]) {
                  this.router.push(this.showTabList[j - 1].fullPath);
                  finded = true;
                }
                break;
              }
            if (!finded) this.router.push('/');
          }
          this.tabList.splice(i, 1);
          break;
        }
      LocalStorage.set('tabList', this.tabList);
    },
  },
});
