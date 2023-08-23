<template>
  <div class="input-slot-container">
    <div class="slot-title-div">
      <div class="slot-title">
        <span class="required-icon" v-if="slotData.isRequired">*</span>
        <span>{{ slotData.name || '文件：' + slotData.dataName }}</span>
        <!-- 高通量插槽 显示特殊icon -->
        <q-icon class="flag-icon" name="flag" color="secondary" v-if="slotData.isBatch">
          <q-tooltip>批量插槽</q-tooltip>
        </q-icon>
        <!-- 高通量插槽 显示特殊icon -->
      </div>
      <div class="slot-subtitle" v-if="slotData.description">描述：{{ slotData.description }}</div>
      <div class="slot-subtitle" v-if="slotData.name">文件：{{ slotData.dataName }}</div>
    </div>
    <div class="slot-content" v-if="slotData.isDepend">
      <div class="depend-div">已选择依赖上层节点输出</div>
    </div>
    <div class="slot-content" v-else-if="currentComponent == 'Error'">
      <div class="empty-div">数据类型错误</div>
    </div>
    <div class="slot-content" v-else>
      <div class="slot-error" v-if="slotData.isError">
        <span>请完善插槽数据</span>
      </div>
      <slot-input-file
        ref="slotInputFile"
        :draft-id="draftId"
        :isMultiple="slotData.isMultiple"
        :result="slotData.result"
        :autoUpload="autoUpload"
        @hover-file="hoverFile"
        @drop="drop"
        v-if="currentComponent === 'SlotInputFile'"
      />
      <slot-input-text
        ref="slotInputText"
        :autoUpload="autoUpload"
        :draftId="draftId"
        :isMultiple="slotData.isMultiple"
        :result="slotData.result"
        :rule="slotData.rule"
        @hover-file="hoverFile"
        @drop="drop"
        v-else
      />
    </div>
    <!-- 指定批量策略 -->
    <slot-input-batch
      :batch-rule="slotData.batchRule"
      :is-file="slotData.kind == InputSlotKind.File"
      v-if="nodeIsBatch"
      @change="batchRuleChange"
    />
    <!-- 指定批量策略 -->
  </div>
</template>

<script lang="ts">
export default {
  name: 'SlotInputView',
};
</script>

<script lang="ts" setup>
import { ref, toRefs, watch, onMounted } from 'vue';
import SlotInputFile from './views/InputFile.vue';
import SlotInputText from './views/InputText.vue';
import SlotInputBatch from './views/InputBatch.vue';
import {
  InputSlotKind,
  BatchRuleEnum,
  BatchRuleOrigin,
  BatchRuleMatch,
  BatchRuleFillerTypeEnum,
  WorkflowSlotService,
} from 'src/service/workflow-slot';

const props = defineProps({
  //草稿ID
  draftId: {
    type: String,
    required: true,
  },
  slotData: {
    type: Object,
    required: true,
  },

  //节点是否是高通量节点
  nodeIsBatch: {
    type: Boolean,
    default: false,
  },
  //是否开启自动上传
  autoUpload: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['hover-file', 'drop']);

const { draftId, slotData, autoUpload, nodeIsBatch } = toRefs(props);

const currentComponent: any = ref('');

function analyComponent() {
  switch (slotData.value.kind) {
    case InputSlotKind.File:
      currentComponent.value = 'SlotInputFile';
      break;
    case InputSlotKind.Text:
      currentComponent.value = 'SlotInputText';
      break;
    default:
      currentComponent.value = 'Error';
      break;
  }
}

function batchRuleChange(name: string) {
  if (name == 'origin') {
    let batchRule: BatchRuleOrigin = {
      type: BatchRuleEnum.Original,
    };
    if (slotData.value.kind == InputSlotKind.File) {
      batchRule.renamingPattern = '';
    }
    slotData.value.batchRule = batchRule;
  } else if (name == 'match') {
    let batchRule: BatchRuleMatch = {
      type: BatchRuleEnum.Match,
      regexToMatch: '',
      fillCount: '',
      filler: {
        type: BatchRuleFillerTypeEnum.AutoNumber,
        start: '',
        step: '',
      },
    };
    if (slotData.value.kind == InputSlotKind.File) {
      batchRule.renamingPattern = '';
    }
    slotData.value.batchRule = batchRule;
  } else if (name == 'none') {
    slotData.value.batchRule = null;
  }
}
watch(
  () => slotData.value,
  () => {
    saveJSON();
  },
  { deep: true }
);
//实时更新到JSON数据
let timer: any;
function saveJSON() {
  //节流
  if (!timer) {
    timer = setTimeout(() => {
      timer = null;
      updateJson();
    }, 1000);
  }
  let updateJson = () => {
    //实时保存
    WorkflowSlotService.updateSlot(draftId.value, slotData.value as any);
  };
}

function hoverFile(file: any, isLeave: boolean | undefined) {
  emit('hover-file', file, isLeave);
}
function drop(ev: any) {
  emit('drop', ev);
}

onMounted(() => {
  //初始化节点
  analyComponent();
});
</script>

<style lang="scss" scoped>
.input-slot-container {
  width: 100%;
  height: auto;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 10px;
  color: #333;
}
.slot-title-div {
  .slot-title {
    font-size: 14px;
    overflow: hidden;
    .flag-icon {
      font-size: 20px;
      margin-left: 5px;
    }
    .required-icon {
      color: red;
      font-size: 20px;
      margin-right: 10px;
    }
  }
  .slot-subtitle {
    font-size: 12px;
    color: #999;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-top: 5px;
  }
}
.slot-content {
  background: #fff;
  margin-top: 5px;
  .slot-error {
    color: red;
    padding: 0 5px;
    font-size: 13px;
  }
  .depend-div {
    background: #fff;
    height: 50px;
    line-height: 50px;
    padding: 0 10px;
    color: orange;
    white-space: nowrap;
    overflow: hidden;
  }
  .empty-div {
    background: #fff;
    height: 50px;
    line-height: 50px;
    padding: 0 10px;
    color: red;
  }
}
</style>
