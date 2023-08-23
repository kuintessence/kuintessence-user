import { boot } from 'quasar/wrappers';
// 预览组件以及样式
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
// 主题以及样式
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
// highlightjs 核心代码
import hljs from 'highlight.js/lib/core';
// 按需引入语言包
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('json', json);

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});

export default boot(async ({ app }) => {
  app.use(VMdPreview);
});
