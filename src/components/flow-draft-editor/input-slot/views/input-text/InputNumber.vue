<template>
  <input
    type="text"
    @input="change"
    :value="resultValue"
    :placeholder="`数字${min ? `，最小${min}` : ''}${max ? `，最大${max}` : ''}`"
    :min="min"
    :max="max"
  />
</template>

<script lang="ts">
export default {
  name: 'SlotInputNumber',
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

//数字限制最大最小
const min: any = ref(null);
const max: any = ref(null);

//解析expandProps 获取扩展数据
function analyData() {
  if (!expandProps?.value) return;
  if ('min' in expandProps.value) {
    min.value = Number(expandProps.value.min);
  }
  if ('max' in expandProps.value) {
    max.value = Number(expandProps.value.max);
  }
}
analyData();

function change($event: any) {
  let _value = $event.target.value;
  let isError = false;
  if (_value) {
    if (!/^-?[1-9]*(\.\d*)?$|^-?0(\.\d*)?$/.test(_value)) {
      isError = true;
    } else {
      if (min.value != null && _value < min.value) {
        isError = true;
      }
      if (max.value != null && _value > max.value) {
        isError = true;
      }
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
    margin-top: 2px;
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
