<template>
  <q-page class="page-pt page-px q-pb-md row q-col-gutter-md">
    <div class="drawer-card col-2 q-pl-none">
      <div class="frosted-glass-card fit column justify-between">
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
            <q-tab name="Info" label="基本信息" content-class="full-width q-px-md text-h6" :ripple="false" />
            <q-tab name="Star" label="我的收藏" content-class="full-width q-px-md" :ripple="false" />
          </q-tabs>
        </div>
        <div
          class="text-negative cursor-pointer"
          style="padding: 0 8px; margin: 16px; user-select: none"
          @click="signOut"
        >
          <q-item class="q-pa-none">
            <q-item-section side>
              <q-icon name="logout" color="negative" />
            </q-item-section>
            <q-item-section>
              <q-item-label style="line-height: 48px !important">退出登录</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
    </div>

    <div class="list-card col-10">
      <q-tab-panels v-model="type" keep-alive animated vertical class="frosted-glass-card fit">
        <q-tab-panel name="Info" class="q-pa-none">
          <BasicInfo />
        </q-tab-panel>
        <q-tab-panel name="Resource" class="q-pa-none">
          <ResourceList />
        </q-tab-panel>
        <q-tab-panel name="Star" class="q-pa-none">
          <StarList />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onUpdated, ref } from 'vue';
import BasicInfo from 'src/pages/user/BasicInfo.vue';
import ResourceList from 'src/pages/user/ResourceList.vue';
import StarList from 'src/pages/user/StarList.vue';
import { useCommonStore } from 'src/stores/common';
import { $mgr } from 'src/boot/oidc';

const commonStore = useCommonStore();

const type = ref('Info');

if (commonStore.lastParams && commonStore.lastParams.type)
  if (type.value !== commonStore.lastParams.type) {
    type.value = commonStore.lastParams.type;
    commonStore.lastParams = null;
  }

const signOut = () => {
  $mgr.signOut();
};

onUpdated(() => {
  if (commonStore.lastParams && commonStore.lastParams.type)
    if (type.value !== commonStore.lastParams.type) {
      type.value = commonStore.lastParams.type;
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
.my-tabs :deep(.q-tab__label) {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.75rem;
  letter-spacing: 0.00937em;
}
.my-tabs :deep(.q-focus-helper) {
  display: none;
}
</style>
