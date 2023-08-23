<!-- 组件库抽屉 -->
<template>
  <q-drawer class="left-drawer" v-model="showLeftDrawer" :width="240" behavior="desktop" side="left" bordered>
    <div class="x6-drawer-title absolute-top">
      <div class="q-pl-md text-weight-medium">组件库</div>
      <q-separator />
    </div>

    <q-scroll-area class="left-drawer-scroll absolute-top q-px-sm full-width">
      <q-input outlined dense v-model="filter" placeholder="搜索..." class="q-px-sm q-pt-sm">
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append>
          <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
        </template>
      </q-input>

      <q-tree
        :nodes="nodeList"
        node-key="id"
        :filter="filter"
        :filter-method="filterMethod"
        class="q-pt-sm q-pb-xl left-drawer-tree"
        no-connectors
        @lazy-load="onLazyLoad"
      >
        <template v-slot:default-header="prop">
          <div
            class="node q-my-none full-width"
            v-if="prop.node.lazy"
            @mousedown="startDrag($event, prop)"
            @touchstart.stop="startDrag($event, prop)"
          >
            <div class="title ellipsis">
              {{ prop.node.display_name }}
            </div>
          </div>

          <div
            class="node custom-node"
            v-else
            @mousedown="startDrag($event, prop)"
            @touchstart.stop="startDrag($event, prop)"
            :ripple="true"
          >
            <div class="title ellipsis">
              {{ prop.node.name }}
            </div>
          </div>
        </template>
      </q-tree>
      <q-btn
        flat
        dense
        color="primary"
        icon="refresh"
        label="刷新列表"
        @click="loadData"
        class="full-width"
        v-if="nodeList.length === 0"
      />
    </q-scroll-area>
  </q-drawer>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue';
import { ProjectService } from 'src/service';

const props = defineProps({
  showLeftDrawer: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(['startDrag']);
const { showLeftDrawer } = toRefs(props);

// 组件列表数据
const nodeList = ref<
  {
    disabled: undefined | boolean;
    display_name: string;
    id: string;
    is_active: boolean;
    lazy: undefined | boolean;
    name: string;
  }[]
>([]);
// 筛选器
const filter = ref('');

// 开始拖动组件响应
const startDrag = (e: any, prop: any) => {
  emit('startDrag', e, prop);
};
// 搜索过滤器
const filterMethod = (node: { display_name: string }, filter: string) => {
  return node.display_name.indexOf(filter) !== -1;
};
// 重置过滤器
const resetFilter = () => {
  filter.value = '';
};
// 延迟加载子项
const onLazyLoad = async (prop: any) => {
  const { done } = prop;
  done([]);
};
// 加载组件列表
const loadData = async () => {
  const res = (await ProjectService.getComponentCategories()) as unknown as {
    disabled: undefined | boolean;
    display_name: string;
    id: string;
    is_active: boolean;
    lazy: undefined | boolean;
    name: string;
  }[];
  res.forEach(node => {
    node.lazy = true;
    node.disabled = !node.is_active;
  });
  nodeList.value = res;
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
@import '../FlowDraftEditor.scss';

.left-drawer-tree {
  padding-bottom: 8px !important;
}
.left-drawer-tree .q-tree__node--child {
  padding-bottom: 0px;
  transition: background 0.3s;
}
.left-drawer-tree .q-tree__node--child:hover {
  background-color: rgb(224, 231, 244);
  border-radius: 4px;
  transition: all 0.3s;
}
.left-drawer-tree .node {
  height: 28px;
  line-height: 28px;
  cursor: move;
  display: flex;
}
.left-drawer-tree .custom-node {
  width: calc(100% + 27px);
  margin-left: -27px !important;
}
.left-drawer-tree .node .title {
  display: flex;
  line-height: 28px;
}
.left-drawer-scroll {
  height: calc(100% - 40px);
  top: 40px;
  margin-bottom: 36px;
}
.left-drawer-btn {
  background-color: #000000;
  height: 40px;
  border-top: 1px solid #c2c2c2;
}
</style>

<style lang="scss">
.left-drawer {
  background-color: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(10px) !important;
}
</style>
