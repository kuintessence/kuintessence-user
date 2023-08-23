<template>
  <div class="text-slot-container">
    <div class="btn-div">
      <q-icon class="add-icon" name="add_circle" @click="add" v-if="isMultiple">
        <q-tooltip>新增一个值</q-tooltip>
      </q-icon>
      <q-icon
        v-if="result && result.length > 1"
        class="down-icon"
        :name="list_show ? 'close' : 'list'"
        @click.stop="toogleListShow"
      >
        <q-tooltip>{{ list_show ? '收起' : '展开' }}{{ result.length }}个值列表</q-tooltip>
      </q-icon>
    </div>
    <div class="input-div" v-if="currentComponent == 'Error'">
      <div class="empty-div">数据类型错误</div>
    </div>
    <div class="input-div" v-else>
      <div class="input-container" :class="{ error: result[0] && (result[0] as any).isError }">
        <div class="input-content">
          <component
            class="input"
            :is="currentComponent"
            :resultValue="result[0] && (result[0] as any).trueValue"
            @value-change="change($event, 0)"
            :expandProps="expandProps"
          ></component>
          <q-icon
            class="remove-icon"
            name="remove_circle"
            @click="remove(0)"
            v-if="isMultiple && result && result.length > 1"
          >
            <q-tooltip>移除</q-tooltip>
          </q-icon>
        </div>
        <div class="error-content" v-if="result[0] && (result[0] as any).isError">
          <span>{{ (result[0] as any).errorMessage || '格式错误' }}</span>
        </div>
      </div>
      <div class="text-list-div" :class="{ show: list_show }" v-if="result && result.length">
        <div
          class="input-container"
          :class="{ error: (item as any).isError }"
          v-for="(item, itemIndex) in result"
          :key="itemIndex"
        >
          <div class="input-content">
            <component
              class="input"
              :is="currentComponent"
              :resultValue="result[itemIndex] && (result[itemIndex] as any).trueValue"
              @value-change="change($event, itemIndex)"
              :expandProps="expandProps"
            ></component>

            <q-icon class="remove-icon" name="remove_circle" @click="remove(itemIndex)">
              <q-tooltip>移除</q-tooltip>
            </q-icon>
          </div>
          <div class="error-content" v-if="(item as any).isError">
            <span>{{ (item as any).errorMessage || '格式错误' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SlotInputText',
};
</script>

<script lang="ts" setup>
import { ref, toRefs } from 'vue';
import { TextSlotDataType } from 'src/service/workflow-slot';

const props = defineProps({
  result: {
    type: Array,
    required: true,
  },
  //是否是高通量
  isMultiple: {
    type: Boolean,
    default: false,
  },
  //文本规则
  rule: {
    type: Object,
    required: true,
  },
});

const { result, isMultiple, rule } = toRefs(props);

const currentComponent = ref('SlotInputString');
const expandProps: any = {};
//解析
function analyData() {
  if (!rule.value) return (currentComponent.value = 'SlotInputString');
  let type = rule.value.type;
  if (!type) return (currentComponent.value = 'SlotInputString');
  switch (type) {
    case TextSlotDataType.String:
      currentComponent.value = 'SlotInputString';
      break;
    case TextSlotDataType.Number:
      currentComponent.value = 'SlotInputNumber';
      break;
    case TextSlotDataType.Regex:
      currentComponent.value = 'SlotInputString';
      expandProps.pattern = rule.value.regex;
      break;
    case TextSlotDataType.Json:
      currentComponent.value = 'SlotInputJson';
      break;
    default:
      currentComponent.value = 'Error';
      break;
  }
}
analyData();

//控制下拉列表的展开
const list_show = ref(false);
function toogleListShow() {
  list_show.value = !list_show.value;
}
function change(resultValue: { trueValue: any; isError?: boolean }, inputIndex: number) {
  if (result.value[inputIndex]) {
    (result.value[inputIndex] as any).trueValue = resultValue.trueValue;
  } else {
    result.value[inputIndex] = { trueValue: resultValue.trueValue };
  }
  (result.value[inputIndex] as any).isError = resultValue.isError;
}
function add() {
  if (result.value && result.value.length) {
    result.value.push({ trueValue: '' });
  } else {
    result.value[0] = { trueValue: '' };
    result.value[1] = { trueValue: '' };
  }
  list_show.value = true;
}
function remove(index: number) {
  result.value.splice(index, 1);
  if (result.value.length <= 1) {
    list_show.value = false;
  }
}
</script>

<style lang="scss" scoped>
.text-slot-container {
  background: #fff;
  min-width: 180px;
  width: 100%;
}
.btn-div {
  padding: 0 5px;
  .add-icon {
    font-size: 25px;
    cursor: pointer;
    color: #999;
  }
  .down-icon {
    margin-left: 10px;
    font-size: 25px;
    cursor: pointer;
    color: #999;
  }
}

.input-div {
  width: 100%;
  position: relative;
  padding: 10px;
}
.empty-div {
  color: red;
  padding: 0 5px;
  font-size: 13px;
}
.text-list-div {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: 0 10px 10px #ddd;
  z-index: 100;
  background: #fff;
  border-radius: 4px;
  padding: 5px;
  &.show {
    display: block;
  }
}
.input-container {
  margin-top: 2px;
  &.error {
    .input-content {
      .input {
        border-color: red;
        &:focus {
          outline: 1px solid red;
        }
      }
    }
  }
  .error-content {
    color: red;
    font-size: 12px;
    line-height: 1;
    padding: 2px;
  }
  .input-content {
    width: 100%;
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    .input {
      width: 0;
      flex: 1;
      height: 100%;
      border: 1px solid #eee;
      border-radius: 4px;
      resize: none;
      padding: 5px;
      &:focus {
        outline: 1px solid #1976d2;
      }
    }
    .remove-icon {
      font-size: 25px;
      color: #999;
      cursor: pointer;
    }
  }
}
</style>
