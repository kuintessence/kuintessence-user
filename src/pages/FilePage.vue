<template>
  <q-page class="page-pt page-px q-pb-md row">
    <div class="list-card col">
      <MyFile class="frosted-glass-card fit" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import MyFile from './file/MyFile.vue';
</script>

<style lang="scss" scoped>
.drawer-card {
  height: calc(100vh - 88px);
  padding-top: 0;
}
.list-card {
  height: calc(100vh - 88px);
  padding-top: 0;
}
.my-tabs :deep(.q-tab__content) {
  align-items: start;
}
.my-tabs :deep(.q-tab__label) {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.75rem;
  letter-spacing: 0.00937em;
}
.my-tabs :deep(.q-focus-helper) {
  display: none;
}
</style>
