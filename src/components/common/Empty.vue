<template>
  <div class="empty-container">
    <q-icon class="icon" :name="icon"></q-icon>
    <div class="text" v-if="message">{{ message }}</div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'EmptyVue',
};
</script>

<script lang="ts" setup>
import { toRefs } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    default: 'error',
  },
  message: {
    type: String,
    default: '暂无内容',
  },
});

const { icon, message } = toRefs(props);
</script>

<style lang="scss" scoped>
.empty-container {
  margin: 20px auto;
  text-align: center;
  &.center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
  }
  .icon {
    font-size: 50px;
    color: #999;
  }
  .text {
    margin-top: 20px;
    font-size: 15px;
    color: #999;
  }
}
</style>
