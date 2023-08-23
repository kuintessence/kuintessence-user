<template>
  <div class="input-match-container" v-if="isFile">
    <div class="container-title">批量策略</div>
    <div class="input-match-div">
      <div class="input-match-title">重命名名称</div>
      <input class="input-match-text" type="text" v-model="batchRule.renamingPattern" placeholder="字符串" />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SlotInputOrigin',
};
</script>

<script lang="ts" setup>
import { toRefs } from 'vue';

const props = defineProps({
  batchRule: {
    type: Object,
    required: true,
  },
  isFile: {
    type: Boolean,
    defalut: false,
  },
});

const { batchRule, isFile } = toRefs(props);
</script>

<style lang="scss" scoped>
.input-match-container {
  background: #fff;
  padding: 10px;
  .container-title {
    font-size: 14px;
  }
}
.input-match-div {
  margin-top: 10px;
  .input-match-title {
    font-size: 13px;
    color: #999;
    margin-bottom: 2px;
  }
  .input-match-text {
    height: 50px;
    width: 100%;
    border-radius: 4px;
    resize: none;
    border: 1px solid #eee;
    &:focus {
      outline: 1px solid #1976d2;
    }
  }
}
</style>
