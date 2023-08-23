<!-- 查看数据弹窗 -->
<template>
  <q-dialog
    v-model="openCodeDialog"
    @update:model-value="close"
    @escape-key="close"
    :maximized="maximized"
    :full-width="maximized"
    class="frosted-glass-dialog"
  >
    <q-card style="min-width: 50vw">
      <q-card-section>
        <div class="text-h6 row text-weight-regular">
          查看数据
          <q-space />
          <q-btn dense flat icon="crop_square" v-if="!maximized" @click="maximized = true">
            <q-tooltip :offset="[8, 8]"> 最大化 </q-tooltip>
          </q-btn>
          <q-btn dense flat icon="minimize" v-else @click="maximized = false">
            <q-tooltip :offset="[8, 8]"> 最小化 </q-tooltip>
          </q-btn>
          <q-btn dense flat icon="close" @click="close">
            <q-tooltip :offset="[8, 8]"> 关闭 </q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-card-section style="max-height: 80vh" class="scroll q-pt-none">
        <json-viewer
          :value="jsonData"
          :expand-depth="5"
          :copyable="{
            copyText: '复制到剪贴板',
            copiedText: '复制成功',
            timeout: 2000,
          }"
          :boxed="true"
          :expanded="true"
          :theme="theme"
          style="background-color: rgba(255, 255, 255, 0.5) !important; border-radius: 16px"
        >
        </json-viewer>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import JsonViewer from 'vue-json-viewer';
import 'vue-json-viewer/style.css';

const props = defineProps({
  data: {
    type: String,
  },
});

// 反序列化json字符串
const jsonData = computed(() => {
  return JSON.parse(props.data as string);
});

const maximized = ref(false);
const openCodeDialog = ref(false);
// 代码块主题
let theme = ref('jv-light');

const open = () => {
  maximized.value = false;
  openCodeDialog.value = true;
};
const close = () => {
  openCodeDialog.value = false;
};

defineExpose({
  open,
});
</script>

<style lang="scss" scoped>
@import url('../FlowDraftEditor.scss');
</style>

<style lang="scss">
.my-dark-json-theme {
  background: #303030;
  white-space: nowrap;
  color: #ffffff;
  font-size: 14px;
  font-family: Consolas, Menlo, Courier, monospace;

  .jv-ellipsis {
    color: #999;
    background-color: #eee;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 4px 2px 4px;
    border-radius: 3px;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }
  .jv-button {
    color: #49b3ff;
  }
  .jv-key {
    color: #ffffff;
  }
  .jv-item {
    &.jv-array {
      color: #ffffff;
    }
    &.jv-boolean {
      color: #fc1e70;
    }
    &.jv-function {
      color: #067bca;
    }
    &.jv-number {
      color: #fc1e70;
    }
    &.jv-number-float {
      color: #fc1e70;
    }
    &.jv-number-integer {
      color: #fc1e70;
    }
    &.jv-object {
      color: #ffffff;
    }
    &.jv-undefined {
      color: #e08331;
    }
    &.jv-string {
      color: #42b983;
      word-break: break-word;
      white-space: normal;
    }
  }
  .jv-code {
    .jv-toggle {
      &:before {
        padding: 0px 2px;
        border-radius: 2px;
      }
      &:hover {
        &:before {
          background: #eee;
        }
      }
    }
  }
}
</style>
