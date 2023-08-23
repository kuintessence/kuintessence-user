<template>
  <div class="state-content" :class="`color-${state}`">
    <span class="state">{{ stateLable }}</span>
  </div>
</template>

<script lang="ts">
export default {
  name: 'InstanceNodeState',
};
</script>

<script lang="ts" setup>
import { toRefs, computed } from 'vue';
import { InstanceNodeState } from 'src/service/instance';

const props = defineProps({
  state: {
    type: [String, Number],
    default: '',
  },
});

const { state } = toRefs(props);
const stateLable = computed(() => {
  for (const key in InstanceNodeState) {
    const _state = InstanceNodeState[key];
    if (_state.value == state.value) {
      return _state.label;
    }
  }
  return '未知状态';
});
</script>

<style lang="scss" scoped>
.state-content {
  color: #333;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  width: 50px;
  height: 30px;
  .state {
    font-size: 12px;
  }
  &.color-0,
  &.color-1,
  &.color-6,
  &.color-7,
  &.color-created,
  &.color-pending,
  &.color-standby {
    background: #eee;
    color: #999;
  }
  &.color-2,
  &.color-3,
  &.color-5 &.color-running {
    background: rgb(63, 140, 255, 0.12);
    color: #3f8cff;
  }
  &.color-finished,
  &.color-skipped {
    background: #e0f9f2;
    color: #00d097;
  }
  &.color-4,
  &.color-5,
  &.color-6,
  &.color-error,
  &.color-stopping,
  &.color-stopped {
    background: rgb(227, 77, 89, 0.12);
    color: #e34d59;
  }
}
</style>
