<template>
  <q-page class="page-pt page-px q-pb-md">
    <div class="page-content">
      <div class="page-content-div frosted-glass-card">
        <SoftwareForm :close="close" />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useKeepAliveStore } from 'src/stores/keep-alive';
import { SoftwareForm } from 'ytsw-software-usecase';

const keepAliveStore = useKeepAliveStore();

function close() {
  keepAliveStore.deleteTabByPath('/add-soft');
}
</script>

<style lang="scss" scoped>
.page-content {
  height: calc(100vh - 88px);
  flex: 1;
  padding: 20px 0;
  width: 100%;
  overflow: hidden;
  .page-content-div {
    width: 800px;
    height: 100%;
    overflow: hidden;
    margin: 0 auto;
    border-radius: 4px;
  }
}
</style>
