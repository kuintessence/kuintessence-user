<template>
  <q-page class="page-pt page-px q-pb-md">
    <div class="page-content">
      <div class="page-content-div frosted-glass-card">
        <UsecaseForm :close="close" />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useKeepAliveStore } from 'src/stores/keep-alive';
import { UsecaseForm } from 'ytsw-software-usecase';

const keepAliveStore = useKeepAliveStore();

function close() {
  keepAliveStore.deleteTabByPath('/add-usecase');
}
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  height: calc(100vh - 88px);
  overflow: hidden;
  padding: 20px;
  .page-content-div {
    width: 800px;
    height: 100%;
    overflow: hidden;
    margin: 0 auto;
    border-radius: 4px;
  }
}
</style>
