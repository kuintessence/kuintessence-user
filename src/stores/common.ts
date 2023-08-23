import { defineStore } from 'pinia';

export const useCommonStore = defineStore('common', {
  state: () => ({
    transformOrigin: { x: 0, y: 0 },
    lastFullPath: null as any,
    lastParams: null as any,
  }),
  actions: {
    animate(x: number, y: number, fullPath: string) {
      this.transformOrigin = { x: x, y: y };
      this.lastFullPath = fullPath;
    },
  },
});
