<template>
  <textarea
    @input="change"
    :value="(resultValue as any)"
    :placeholder="`字符串${pattern ? `，符合${pattern}` : ''}${maxlength ? `,最长${maxlength}个` : ''}`"
    :maxlength="maxlength"
  ></textarea>
</template>

<script lang="ts">
export default {
  name: 'SlotInputString',
};
</script>

<script lang="ts" setup>
import { ref, toRefs } from 'vue';

const props = defineProps({
  resultValue: {
    required: true,
  },
  expandProps: {
    type: Object,
  },
});
const emit = defineEmits(['value-change']);

const { resultValue, expandProps } = toRefs(props);

const pattern = ref(null);
const maxlength: any = ref(null);
//解析expandProps 获取扩展数据
function analyData() {
  if (!expandProps?.value) return;
  if ('pattern' in expandProps.value) {
    pattern.value = expandProps.value.pattern;
  }
  if ('maxlength' in expandProps.value) {
    maxlength.value = expandProps.value.maxlength;
  }
}
analyData();
function change($event: any) {
  let _value = $event.target.value;
  let isError = false;
  if (_value) {
    if (!isError && pattern.value) {
      isError = !new RegExp(pattern.value).test(_value);
    }
    if (maxlength.value && _value.length > maxlength.value) {
      isError = true;
    }
  }
  emit('value-change', { trueValue: _value, isError });
}
</script>

<style lang="scss" scoped>
.text-slot-container {
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
  padding: 5px;
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
