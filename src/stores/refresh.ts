import { defineStore } from 'pinia';

export const useRefreshStore = defineStore('refreshStore', {
  state: () => ({}),
  actions: {
    refreshProjectData() {
      // console.log('Refresh project data.');
    },
    refreshUserTemplateData() {
      // console.log('Refresh userTemplate data.');
    },
    refreshInstanceData() {
      // console.log('Refresh instance data.');
    },
    refreshFlowDraftData() {
      // console.log('Refresh flowDraft data.');
    },
    refreshUserFavoriteData() {
      // console.log('Refresh userFavorite data.');
    },
    refreshUsecaseData() {
      // console.log('Refresh userFavorite data.');
    },
    refreshSoftwareData() {
      // console.log('Refresh userFavorite data.');
    },
  },
});
