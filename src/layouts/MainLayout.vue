<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">
    <dynamic-nav />
    <q-page-container>
      <router-view v-slot="{ Component }">
        <me-keep-alive :includeKey="tabPathList">
          <component :is="Component" :key="route.fullPath" />
        </me-keep-alive>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useCommonStore } from 'src/stores/common';
import { useKeepAliveStore } from 'src/stores/keep-alive';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DynamicNav from './DynamicNav.vue';
import { default as MeKeepAlive } from 'src/components/common/me-keep-alive';

const route = useRoute();
const router = useRouter();
const keepAliveStore = useKeepAliveStore();
const commonStore = useCommonStore();
/**
 * 动画起始坐标
 */
const transformOrigin = ref({ x: '0px', y: '0px' });
/**
 * 动画直径
 */
const animationWidth = ref('0px');
/**
 * 是否正在执行动画
 */
const isAnimating = ref(false);

/**
 * 从store中取出需要换成的Path，利用keep-alive的includea缓存需要的页面
 */
let tabPathList = computed(() => {
  return keepAliveStore.tabList.map(tab => tab.fullPath);
});

/**
 * 监听store变化，开始创建动画元素
 */
watch(commonStore, () => {
  if (!isAnimating.value) {
    isAnimating.value = true;
    transformOrigin.value = {
      x: String(commonStore.transformOrigin.x) + 'px',
      y: String(commonStore.transformOrigin.y) + 'px',
    };
    const a =
      commonStore.transformOrigin.x < innerWidth / 2
        ? innerWidth - commonStore.transformOrigin.x
        : commonStore.transformOrigin.x;
    const b =
      commonStore.transformOrigin.y < innerHeight / 2
        ? innerHeight - commonStore.transformOrigin.y
        : commonStore.transformOrigin.y;
    animationWidth.value = parseInt(String(Math.sqrt(a * a + b * b) * 2 + 1)) + 'px';
    createAnimation();
  }
});

/**
 * 监听路由变化，开始渐隐动画
 */
watch(route, () => {
  if (isAnimating.value) {
    const animation = document.getElementById('animation') as Element;
    animation?.setAttribute('class', 'animation-pop2');
  }
});

/**
 * 监听动画结束：展开动画结束，跳转路由；渐隐动画结束，删除动画元素
 */
document.addEventListener('animationend', (e: { animationName: string }) => {
  if (e.animationName === 'pop1') {
    router.push(commonStore.lastFullPath);
  } else if (e.animationName === 'pop2') {
    isAnimating.value = false;
    const animation = document.getElementById('animation');
    animation?.parentNode?.removeChild(animation as Node);
  }
});

/**
 * 创建动画元素，开始展开动画
 */
const createAnimation = () => {
  const animation = document.createElement('animation');
  animation.setAttribute('id', 'animation');
  animation.setAttribute('class', 'animation-pop1');
  const mainLayout = document.getElementsByClassName('main-layout')[0];
  mainLayout?.appendChild(animation);
};
</script>

<style lang="scss" scoped>
.main-layout {
  background-image: url(../../public/img/background.webp);
  background-position: center center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;
}
.fade-enter-active {
  transition: all 0.3s ease-in-out;
}
.fade-enter-from {
  opacity: 0;
}
</style>

<style lang="scss">
.animation-pop1 {
  animation: pop1 0.3s cubic-bezier(0, 0, 0, 1) forwards;
}
.animation-pop2 {
  animation: pop2 0.3s cubic-bezier(0, 0, 0, 1);
}
@keyframes pop1 {
  0% {
    background-color: #fff;
    height: 0;
    width: 0;
  }
  100% {
    background-color: #30b5f2;
    height: v-bind('animationWidth');
    width: v-bind('animationWidth');
  }
  0%,
  100% {
    position: fixed;
    left: v-bind('transformOrigin.x');
    top: v-bind('transformOrigin.y');
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}
@keyframes pop2 {
  0% {
    background-color: #30b5f2;
    height: v-bind('animationWidth');
    width: v-bind('animationWidth');
  }
  100% {
    background-color: transparent;
    height: v-bind('animationWidth');
    width: v-bind('animationWidth');
  }
  0%,
  100% {
    position: fixed;
    left: v-bind('transformOrigin.x');
    top: v-bind('transformOrigin.y');
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
