<template>
  <select @change="change" :value="resultValue">
    <option :value="optionValue" v-for="(optionValue, index) in options" :key="index">{{ optionValue }}</option>
  </select>
</template>

<script lang="ts">
export default {
  name: 'SlotInputSelect',
};
</script>

<script lang="ts" setup>
import { reactive, toRefs } from 'vue';

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

const options: any = reactive([]);
//解析expandProps 获取扩展数据
function analyData() {
  if (!expandProps?.value) return;
  if ('enumeration' in expandProps.value) {
    if (Array.isArray(expandProps.value.enumeration)) {
      options.length = 0;
      options.push(...expandProps.value.enumeration);
    }
  }
}
analyData();
function change($event: any) {
  let _value = $event.target.value;
  emit('value-change', { trueValue: _value });
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
</style>
