<template>
  <q-page class="page-pt page-px q-pb-md row q-col-gutter-md">
    <div class="drawer-card col-2 q-pl-none column">
      <div class="col frosted-glass-card full-width column justify-between">
        <div>
          <q-tabs
            v-model="type"
            vertical
            indicator-color="transparent"
            active-bg-color="white"
            :ripple="false"
            class="q-py-md my-tabs"
            style="border-radius: 0"
          >
            <q-tab
              name="DashboardPage"
              label="计算管理"
              content-class="full-width q-px-md"
              class="level-1"
              :ripple="false"
            />
            <q-tab
              name="AllInstance"
              label="我的任务 >"
              content-class="full-width q-px-md"
              class="level-2"
              :ripple="false"
            />
            <q-tab
              name="SingleInstance"
              label="单步任务"
              content-class="full-width q-px-md"
              class="level-3"
              :ripple="false"
            />
            <q-tab
              name="BatchInstance"
              label="批量任务"
              content-class="full-width q-px-md"
              class="level-3"
              :ripple="false"
            />
            <q-tab
              name="WFInstance"
              label="工作流任务"
              content-class="full-width q-px-md"
              class="level-3"
              :ripple="false"
            />
            <q-tab
              name="FlowDraft"
              label="工作流草稿"
              content-class="full-width q-px-md"
              class="level-3"
              :ripple="false"
            />
            <q-tab
              name="OfficialTemplateList"
              label="模板工作台 >"
              content-class="full-width q-px-md"
              class="level-2"
              :ripple="false"
            />
            <q-tab
              name="TemplatePage"
              label="我的模板"
              content-class="full-width q-px-md"
              class="level-3"
              :ripple="false"
            />
          </q-tabs>
        </div>
      </div>
    </div>

    <div class="list-card col-10">
      <q-tab-panels v-model="type" keep-alive animated vertical class="frosted-glass-card fit">
        <q-tab-panel name="DashboardPage" class="q-pa-none">
          <DashboardPage @setType="setType" />
        </q-tab-panel>
        <q-tab-panel name="AllInstance" class="q-pa-none">
          <AllInstance />
        </q-tab-panel>
        <q-tab-panel name="SingleInstance" class="q-pa-none">
          <SingleInstance />
        </q-tab-panel>
        <q-tab-panel name="BatchInstance" class="q-pa-none">
          <BatchInstance />
        </q-tab-panel>
        <q-tab-panel name="WFInstance" class="q-pa-none">
          <WFInstance />
        </q-tab-panel>
        <q-tab-panel name="FlowDraft" class="q-pa-none">
          <FlowDraft />
        </q-tab-panel>
        <q-tab-panel name="OfficialTemplateList" class="q-pa-none">
          <OfficialTemplateList />
        </q-tab-panel>
        <q-tab-panel name="TemplatePage" class="q-pa-none">
          <TemplatePage />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useCommonStore } from 'src/stores/common';
import { onUpdated, ref } from 'vue';
import DashboardPage from './compute/DashboardPage.vue';
import AllInstance from './compute/AllInstance.vue';
import SingleInstance from './compute/SingleInstance.vue';
import BatchInstance from './compute/BatchInstance.vue';
import WFInstance from './compute/WFInstance.vue';
import OfficialTemplateList from './compute/OfficialTemplateList.vue';
import TemplatePage from './compute/TemplatePage.vue';
import FlowDraft from './compute/FlowDraft.vue';

const commonStore = useCommonStore();
const type = ref('DashboardPage');

const setType = (newType: string) => {
  type.value = newType;
};

if (commonStore.lastParams && commonStore.lastParams.type)
  if (type.value !== commonStore.lastParams.type) {
    setType(commonStore.lastParams.type);
    commonStore.lastParams = null;
  }

onUpdated(() => {
  if (commonStore.lastParams && commonStore.lastParams.type)
    if (type.value !== commonStore.lastParams.type) {
      setType(commonStore.lastParams.type);
      commonStore.lastParams = null;
    }
});
</script>

<style lang="scss" scoped>
.drawer-card {
  height: calc(100vh - 88px);
  padding-top: 0;
}
.list-card {
  height: calc(100vh - 88px);
  padding-top: 0;
}
.my-tabs :deep(.q-tab__content) {
  align-items: start;
}
.my-tabs .badge {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}
.my-tabs :deep(.q-focus-helper) {
  display: none;
}
.my-tabs .level-1 :deep(.q-tab__label) {
  font-size: 18px;
  font-weight: 400;
}
.my-tabs .level-2 :deep(.q-tab__label) {
  font-size: 16px;
  font-weight: 400;
  padding-left: 12px;
}
.my-tabs .level-3 :deep(.q-tab__label) {
  font-size: 16px;
  font-weight: 400;
  padding-left: 24px;
}
.data-type .hover-content {
  cursor: pointer;
  user-select: none;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  line-height: 56px;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 1), transparent);
  width: 100%;
  opacity: 0;
  transition: all 0.3s;
}
.data-type:hover .hover-content {
  opacity: 1;
}
</style>
