<template>
  <v-ace-editor class="json-editor" v-model:value="jsonData" lang="json" :options="aceConfig" @input="inputChange" />
</template>

<script lang="ts" setup>
import { toRefs, ref } from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/ext-language_tools';

const props = defineProps({
  resultValue: {
    required: true,
  },
  expandProps: {
    type: Object,
  },
});
const emit = defineEmits(['value-change']);

const { resultValue } = toRefs(props);
const jsonData = ref<any>(resultValue.value || '');

function inputChange() {
  try {
    jsonData.value && JSON.parse(jsonData.value);
    emit('value-change', { trueValue: jsonData.value, isError: false });
  } catch (error) {
    emit('value-change', { trueValue: jsonData.value, isError: true });
  }
}
//ace编辑器配置
const aceConfig = {
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: true,
  tabSize: 2,
  showPrintMargin: false,
  fontSize: 13,
  useWorker: true,
};
</script>

<style lang="scss" scoped>
.json-editor {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}
</style>
