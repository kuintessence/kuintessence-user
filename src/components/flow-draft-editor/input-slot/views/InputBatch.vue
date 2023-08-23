<template>
  <div class="q-mt-sm">
    <div>指定批量策略</div>
    <q-option-group
      inline
      :options="batchRuleOptions"
      type="radio"
      v-model="batchRuleName"
      @update:model-value="change"
    />
    <slot-input-origin :batch-rule="batchRule" :is-file="isFile" v-if="batchRuleName == 'origin' && batchRule" />
    <slot-input-match :batch-rule="batchRule" :is-file="isFile" v-else-if="batchRuleName == 'match' && batchRule" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'SlotInputBatch',
};
</script>

<script lang="ts" setup>
import { ref, toRefs } from 'vue';
import SlotInputOrigin from './input-batch/InputOrigin.vue';
import SlotInputMatch from './input-batch/InputMatch.vue';
import { BatchRuleEnum } from 'src/service/workflow-slot';

const props = defineProps({
  batchRule: {},
  isFile: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['change']);

const { batchRule, isFile } = toRefs(props);
const batchRuleOptions = [
  {
    value: 'none',
    label: '不指定',
  },
  {
    value: 'origin',
    label: '随机子任务',
  },
  {
    value: 'match',
    label: '规则子任务',
  },
];
const batchRuleName = ref('none');
function initBatchRuleName() {
  if (batchRule?.value) {
    if ((batchRule.value as any).type == BatchRuleEnum.Original) {
      batchRuleName.value = 'origin';
    } else if ((batchRule.value as any).type == BatchRuleEnum.Match) {
      batchRuleName.value = 'match';
    }
  }
}
initBatchRuleName();
function change() {
  emit('change', batchRuleName.value);
}
</script>
