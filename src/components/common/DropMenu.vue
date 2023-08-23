<template>
  <q-menu class="q-menu" auto-close transition-show="jump-down" transition-hide="jump-up">
    <q-list :style="{ 'min-width': `${width}px` }">
      <q-item clickable v-for="(item, index) in menus" :key="index" @click="clickMenu(item)">
        <q-item-section avatar>
          <q-icon :name="(item as any).icon" v-if="(item as any).icon" />
        </q-item-section>
        <q-item-section>{{ (item as any).label }}</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
export default {
  name: 'DropMenu',
};
</script>

<script lang="ts" setup>
import { toRefs } from 'vue';

const props = defineProps({
  width: {
    type: Number,
    default: 100,
  },
  menus: {
    type: Array,
    default() {
      return [];
    },
  },
});
const emit = defineEmits(['click']);

const { width, menus } = toRefs(props);
function clickMenu(item: any) {
  emit('click', item);
  if (item.func) item.func();
}
</script>

<style lang="scss" scoped>
.q-menu {
  overflow: visible;
}
.arrow {
  width: 0;
  height: 0;
  border-top: 10px solid #fff;
  border-right: 10px solid #fff;
  display: inline-block;
  border-bottom: 10px solid transparent;
  border-left: 10px solid transparent;
  transform: rotate(-45deg);
}
</style>
