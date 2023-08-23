<template>
  <div class="dynamic-nav full-width">
    <div class="row page-px" style="position: relative">
      <!-- LOGO显示区域 -->
      <div id="logo-div" class="logo-div blur shadow">
        <q-img
          src="../../public/img/logo-1.png"
          width="160px"
          alt="算网科技"
          spinner-size="30px"
          spinner-color="primary"
          class="absolute-center big-icon"
        />
        <q-img
          src="../../public/img/logo_icon.png"
          width="28px"
          height="36px"
          alt="算网科技"
          spinner-size="30px"
          spinner-color="primary"
          class="absolute-center small-icon"
        />
      </div>

      <div class="nav-div row">
        <!-- 主导航显示区域 -->
        <div id="nav-capsule" class="nav-capsule row">
          <div class="background blur shadow" />
          <div
            class="q-px-sm common-nav"
            :class="[
              route.fullPath === nav.fullPath
                ? 'current-nav'
                : nav.relatedName
                ? includeRelatedName(nav.relatedName)
                  ? 'current-nav-parent'
                  : 'nav'
                : 'nav',
            ]"
            v-for="(nav, index) in navList"
            :key="index"
          >
            <div class="title">
              <q-icon
                size="sm"
                :name="nav.icon"
                :color="nav.color"
                class="icon cursor-pointer"
                @click="toPage(nav.fullPath, $event)"
              />
              <span class="cursor-pointer" @click="toPage(nav.fullPath, $event)">{{ nav.title }}</span>
              <q-icon
                size="sm"
                :name="nav.isExpanded ? 'expand_more' : 'expand_less'"
                class="more-icon q-pr-none"
                v-if="nav.children ? nav.children.length > 0 : false"
                @mouseenter="if (nav.children) nav.isExpanded = true;"
                @mouseleave="if (nav.children) nav.isExpanded = false;"
              >
                <Transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
                  <div class="expand-menu shadow blur" v-if="nav.isExpanded">
                    <q-list style="min-width: 100px">
                      <q-item
                        clickable
                        v-for="(child, index) in nav.children"
                        :key="child.fullPath"
                        @click="
                          toPage(child.fullPath, $event);
                          if (route.fullPath !== child.fullPath) nav.isExpanded = false;
                        "
                        class="item"
                        :class="[
                          nav.children.length === 1
                            ? 'one-item'
                            : index === 0
                            ? 'first-item'
                            : index === nav.children.length - 1
                            ? 'last-item'
                            : '',
                        ]"
                      >
                        <q-icon
                          size="sm"
                          :name="child.icon"
                          class="q-pr-xs"
                          :class="[route.fullPath === child.fullPath ? 'current-icon' : 'icon']"
                          style="width: 24px; height: 48px"
                        />{{ child.title }}
                      </q-item>
                    </q-list>
                  </div>
                </Transition>
              </q-icon>
            </div>
          </div>
        </div>

        <!-- 标签页管理区域(PC端) -->
        <div class="tab-capsule row" v-if="keepAliveStore.showTabList.length > 0">
          <div
            class="common-arrow-tab blur shadow"
            :class="[page > 0 ? 'arrow-tab-ready hover-transition' : 'arrow-tab']"
            @click="goLeft"
            v-if="keepAliveStore.showTabList.length > rowsPerPage"
          >
            <q-icon size="sm" :name="page > 0 ? 'keyboard_double_arrow_left' : 'first_page'" class="icon" />
          </div>
          <div
            class="common-tab blur shadow hover-transition"
            :class="[!tab.meta.showTab ? 'hidden-tab' : route.fullPath === tab.fullPath ? 'current-tab' : 'tab']"
            @click="toPage(tab.fullPath, $event)"
            v-for="tab in currentTabList"
            :key="tab.fullPath"
          >
            <q-icon size="sm" :name="tab.meta.icon" :color="tab.meta.color" class="icon" />
            <div class="close-btn">
              <q-btn
                dense
                round
                size="sm"
                color="white"
                text-color="black"
                icon="close"
                @click="
                  close(tab);
                  $event.cancelBubble = true;
                "
                style="z-index: 5000"
              />
            </div>
            <q-tooltip :offset="[8, 8]">
              {{ tab.meta.title }}
            </q-tooltip>
          </div>
          <div
            class="common-arrow-tab blur shadow"
            :class="[
              page < keepAliveStore.showTabList.length / rowsPerPage - 1
                ? 'arrow-tab-ready hover-transition'
                : 'arrow-tab',
            ]"
            @click="goRight"
            v-if="keepAliveStore.showTabList.length > rowsPerPage"
          >
            <q-icon
              size="sm"
              :name="
                page < keepAliveStore.showTabList.length / rowsPerPage - 1 ? 'keyboard_double_arrow_right' : 'last_page'
              "
              class="icon"
            />
          </div>
        </div>

        <!-- 标签页管理区域(移动端) -->
        <q-btn-dropdown
          flat
          rounded
          label="标签"
          menu-anchor="bottom middle"
          menu-self="top middle"
          :ripple="false"
          dropdown-icon="expand_more"
          class="tab-btn blur shadow text-black"
          content-class="frosted-glass-card"
          v-if="keepAliveStore.showTabList.length > 0"
        >
          <q-list v-for="tab in keepAliveStore.showTabList" :key="tab.fullPath">
            <q-item clickable v-close-popup @click="toPage(tab.fullPath, $event)">
              <q-item-section side>
                <q-icon size="sm" :name="tab.meta.icon" :color="tab.meta.color" class="icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-center">{{ tab.meta.title }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon size="sm" name="close" @click="close(tab)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <q-space class="space" />

      <!-- 副导航显示区域 -->
      <div id="user-div" class="user-div">
        <div class="user-capsule blur shadow hover-transition">
          <!-- 上传进度 -->
          <div class="common-div cursor-pointer">
            <q-icon size="sm" color="light-blue" name="cloud_upload" class="icon"> </q-icon>
            <span class="upload-num-box" :class="uploadStore.uploadingNum ? 'text-negative' : 'text-grey hidden'">
              [
              <span class="upload-num" :class="{ jump: uploadUnmChange }">{{ uploadStore.uploadingNum }}</span
              >]
            </span>
            <q-tooltip :offset="uploadStore.uploadingNum ? [8, 8] : [19, 19]">
              {{
                uploadStore.uploadingNum ? `当前有${uploadStore.uploadingNum}个文件正在上传` : '现在没有文件正在上传'
              }}</q-tooltip
            >
            <q-popup-proxy :offset="uploadStore.uploadingNum ? [8, 8] : [19, 19]">
              <upload-list />
            </q-popup-proxy>
          </div>
          <!-- 上传进度 -->

          <q-separator vertical inset class="q-ma-sm" />

          <div
            @click="toPage(userNav.fullPath, $event)"
            class="common-div"
            :class="[
              route.fullPath === userNav.fullPath ||
              (userNav.relatedName ? includeRelatedName(userNav.relatedName) : false)
                ? userNav.isFunc
                  ? 'current-func'
                  : 'current-user'
                : userNav.isFunc
                ? 'function'
                : 'user',
            ]"
            v-for="(userNav, index) in userNavList"
            :key="index"
          >
            <q-icon size="sm" :name="userNav.icon" :color="userNav.color" class="icon"> </q-icon>
            <div v-if="!userNav.isFunc" class="ellipsis" style="max-width: 50px">
              {{ authStore.displayName }}
            </div>
            <q-tooltip :offset="[19, 19]" v-if="userNav.isFunc">
              {{ userNav.tooltip }}
            </q-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth';
import { useCommonStore } from 'src/stores/common';
import { useKeepAliveStore } from 'src/stores/keep-alive';
import { useUploadStore } from 'src/stores/upload';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import UploadList from 'src/components/upload/UploadList.vue';

const route = useRoute();
const keepAliveStore = useKeepAliveStore();
const commonStore = useCommonStore();
const authStore = useAuthStore();
const uploadStore = useUploadStore();

const uploadUnmChange = ref(false);
watch(
  () => uploadStore.uploadingNum,
  () => {
    uploadUnmChange.value = true;
    setTimeout(() => {
      uploadUnmChange.value = false;
    }, 500);
  }
);

// 当前分页的标签页
const currentTabList = computed(() => {
  return keepAliveStore.showTabList.slice(page.value * rowsPerPage.value, rowsPerPage.value * (page.value + 1));
});
// 监听窗口大小改变
window.onresize = () => {
  resetPage();
};
// 监听打开页面
watch(route, () => {
  resetPage();
});
// 监听多标签页数据变化
keepAliveStore.$subscribe(() => {
  if (keepAliveStore.showTabList.length > 0) {
    for (let i = 0, len = keepAliveStore.showTabList.length; i < len; i++) {
      if (keepAliveStore.showTabList[i].fullPath === keepAliveStore.openedPath) {
        page.value = Math.trunc(i / rowsPerPage.value);
        break;
      }
    }
    resetPage();
  }
});

// 当前页码
const page = ref(0);
// 分页大小，64-单个tab宽度，2-2个箭头tab
const rowsPerPage = ref(0);
// 其他div宽度
const logoDivWidth = ref(0);
const navCapsuleWidth = ref(0);
const userDivWidth = ref(0);
// 导航数据
const navList = ref<any>([
  { fullPath: '/', icon: 'assessment', color: 'primary', title: '概览' },
  {
    fullPath: '/compute',
    icon: 'calculate',
    color: 'secondary',
    title: '计算',
    relatedName: ['SingleCompute', 'BatchCompute'],
    isExpanded: false,
  },
  {
    fullPath: '/application',
    icon: 'inbox',
    color: 'accent',
    title: '应用',
    isExpanded: false,
  },
  { fullPath: '/file', icon: 'cloud_circle', color: 'positive', title: '文件' },
]);
// 用户导航数据
const userNavList: any = [
  {
    fullPath: '/user',
    icon: 'person',
    color: 'deep-purple',
    isFunc: false,
  },
];

const toPage = (fullPath: string, event: any) => {
  if (route.fullPath !== fullPath) {
    const { x, y } = event;
    commonStore.animate(x, y, fullPath);
  }
};
// 重置分页
const resetPage = () => {
  getRowsPerPage();
  if (route.meta.showTab) {
    for (let i = 0, len = keepAliveStore.showTabList.length; i < len; i++) {
      if (keepAliveStore.showTabList[i].fullPath === keepAliveStore.openedPath) {
        page.value = Math.trunc(i / rowsPerPage.value);
        break;
      }
    }
  } else {
    let maxPage = Math.ceil(keepAliveStore.showTabList.length / rowsPerPage.value) - 1;
    maxPage = maxPage < 0 ? 0 : maxPage;
    if (page.value > maxPage) page.value = maxPage;
  }
};
// 分页页码-1
const goLeft = () => {
  if (page.value > 0) page.value -= 1;
};
// 分页页码+1
const goRight = () => {
  if (page.value < keepAliveStore.showTabList.length / rowsPerPage.value - 1) page.value += 1;
};
// 判断是否关联页面
const includeRelatedName = (relatedName: string[]) => {
  for (let i = 0, len = relatedName.length; i < len; i++) if (relatedName[i] === route.name) return true;
  return false;
};
// 关闭标签页
const close = (item: { fullPath: string }) => {
  keepAliveStore.deleteTabByPath(item.fullPath);
};
// 计算分页页面大小
const getRowsPerPage = () => {
  const otherWidth = logoDivWidth.value + 60 + navCapsuleWidth.value + userDivWidth.value;
  rowsPerPage.value = Math.trunc(
    ((window.innerWidth > 1920 ? 1920 : (window.innerWidth * 9) / 10) - otherWidth) / 68 - 2
  );
};

onMounted(() => {
  // 监听其他div宽度变化
  const logoDivResizeObserver = new ResizeObserver(entries => {
    logoDivWidth.value = entries[0].contentRect.width;
    resetPage();
  });
  logoDivResizeObserver.observe(document.getElementById('logo-div') as HTMLElement);

  const navCapsuleResizeObserver = new ResizeObserver(entries => {
    navCapsuleWidth.value = entries[0].contentRect.width;
    resetPage();
  });
  navCapsuleResizeObserver.observe(document.getElementById('nav-capsule') as HTMLElement);

  const userDivResizeObserver = new ResizeObserver(entries => {
    userDivWidth.value = entries[0].contentRect.width;
    resetPage();
  });
  userDivResizeObserver.observe(document.getElementById('user-div') as HTMLElement);
});
</script>

<style lang="scss" scoped>
// 灵动导航总样式
.dynamic-nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5000;
  height: 72px;
}

// LOGO区域
.logo-div {
  user-select: none;
  height: 48px;
  border-radius: 25px;
  cursor: default;
  margin: 12px 8px 12px 0;
  display: flex;
  width: 200px;
}
.logo-div .big-icon {
  display: flex;
}
.logo-div .small-icon {
  display: none;
}
@media (max-width: 770px) {
  .logo-div {
    display: flex;
    width: 68px;
  }
  .logo-div .big-icon {
    display: none;
  }
  .logo-div .small-icon {
    display: flex;
  }
}
@media (max-width: 640px) {
  .logo-div {
    display: none;
  }
  .logo-div .big-icon {
    display: none;
  }
  .logo-div .small-icon {
    display: none;
  }
}

// 导航区域
.nav-div {
  user-select: none;
  margin-left: 8px;
}
// 导航外侧胶囊
.nav-div .nav-capsule {
  height: 48px;
  line-height: 48px;
  text-align: center;
  font-size: 16px;
  margin: 12px 8px 12px 0;
  padding: 0 10px;
  position: relative;
  transition: transform 0.5s;
}
.nav-div .nav-capsule:hover {
  transform: translate3d(1%, 1%, 0) scale(1.05);
}
.nav-div .nav-capsule .background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 25px;
  transition: box-shadow 0.5s;
  z-index: -1;
}
.nav-div .nav-capsule .background:hover {
  box-shadow: 0 1px 3px rgb(0 0 0 / 30%), 0 1px 1px rgb(0 0 0 / 24%), 0 2px 1px -1px rgb(0 0 0 / 22%) !important;
}
// 导航共用样式
.nav-div .nav-capsule .common-nav {
  align-items: center;
  transition: all 0.5s;
}
.nav-div .nav-capsule .common-nav:hover {
  // padding-right: 0;
}
.nav-div .nav-capsule .common-nav .more-icon {
  width: 0;
  opacity: 0;
  transition: all 0.5s;
  color: #636363;
  margin-left: 0;
  height: 48px;
  position: relative;
}
.nav-div .nav-capsule .common-nav:hover .more-icon {
  width: 24px;
  opacity: 1;
  transition: 0.5s;
  margin-left: 4px;
}
.nav-div .nav-capsule .common-nav .more-icon .expand-menu {
  line-height: 24px;
  position: absolute;
  top: 48px;
  right: 12px;
  z-index: 5000;
  border-radius: 0 0 16px 16px;
  font-size: 16px;
  transform: translateX(50%);
}
.nav-div .nav-capsule .common-nav .more-icon .expand-menu .one-item {
  // border-radius: 16px;
  border-radius: 0 0 16px 16px;
}
.nav-div .nav-capsule .common-nav .more-icon .expand-menu .first-item {
  // border-radius: 16px 16px 0 0;
}
.nav-div .nav-capsule .common-nav .more-icon .expand-menu .last-item {
  border-radius: 0 0 16px 16px;
}
.nav-div .nav-capsule .common-nav .more-icon .expand-menu .item {
  height: 48px;
  line-height: 44px !important;
  min-height: auto;
  padding: 0 16px !important;
  color: #000;
}
.nav-div .nav-capsule .common-nav .more-icon .expand-menu .item .icon {
  color: #636363;
  transition: 0.5s;
}
.nav-div .nav-capsule .common-nav .more-icon .expand-menu .item:hover .icon {
  // color: #000000;
}
.nav-div .nav-capsule .common-nav .more-icon .expand-menu .item .current-icon {
  color: #000000;
  transition: 0.5s;
}
.nav-div .nav-capsule .common-nav .title {
  display: inline-flex;
  align-items: center;
}
// 非当前导航
.nav-div .nav-capsule .nav .icon {
  width: 0;
  opacity: 0;
  transition: all 0.5s;
  color: #636363;
  padding-right: 0;
}
.nav-div .nav-capsule .nav:hover .icon {
  width: 24px;
  opacity: 1;
  color: #636363;
  transition: all 0.5s;
  padding-right: 4px;
}
// 当前导航
.nav-div .nav-capsule .current-nav .icon {
  width: 24px;
  opacity: 1;
  color: #000000;
  transition: all 0.5s;
  padding-right: 4px;
}
.nav-div .nav-capsule .current-nav-parent .icon {
  width: 24px;
  opacity: 1;
  color: #636363;
  transition: all 0.5s;
  padding-right: 4px;
}

// 标签区域
// 标签外侧胶囊
.nav-div .tab-capsule {
  margin: 0 4px;
}
// 标签共用样式
.nav-div .tab-capsule .common-tab {
  display: inline-flex;
  align-items: center;
  height: 48px;
  line-height: 48px;
  border-radius: 25px;
  text-align: center;
  padding: 0 18px;
  margin: 12px 4px 8px 4px;
  cursor: pointer;
}
.nav-div .tab-capsule .common-tab .close-btn {
  position: absolute;
  top: 0;
  right: 0;
  transform: translateX(50%);
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.5s;
}
.nav-div .tab-capsule .common-tab:hover .close-btn {
  opacity: 1;
  transition: opacity 0.5s;
}
.nav-div .tab-capsule .common-tab .icon {
  width: 24px;
  transition: all 0.5s;
}
// 非当前标签
.nav-div .tab-capsule .tab .icon {
  color: #636363;
}
// 当前标签
.nav-div .tab-capsule .current-tab .icon {
  color: #000000;
}
// 切换标签分页-共用
.nav-div .tab-capsule .common-arrow-tab {
  display: inline-flex;
  align-items: center;
  height: 48px;
  line-height: 48px;
  border-radius: 25px;
  text-align: center;
  padding: 0 18px;
  margin: 12px 4px 8px 4px;
}
.nav-div .tab-capsule .common-arrow-tab .icon {
  width: 24px;
  transition: all 0.5s;
}
.nav-div .tab-capsule .arrow-tab {
  cursor: not-allowed !important;
  // opacity: 0.75;
}
.nav-div .tab-capsule .arrow-tab .icon {
  color: #636363;
}
.nav-div .tab-capsule .arrow-tab-ready {
  cursor: pointer;
  // opacity: 1;
}
.nav-div .tab-capsule .arrow-tab-ready .icon {
  color: #000000;
}
// 隐藏标签
.nav-div .tab-capsule .hidden-tab {
  display: none;
}
// 窄屏控制标签的按钮
.tab-btn {
  display: none;
  font-size: 16px;
  font-weight: 400;
  margin: 12px 8px;
}
.tab-btn .q-btn-dropdown__arrow {
  font-size: 24px;
}
@media (max-width: $breakpoint-sm-max) {
  .nav-div .tab-capsule {
    display: none;
  }
  .tab-btn {
    display: flex;
  }
  // .space {
  //   display: none;
  // }
}
@media (max-width: 640px) {
  .tab-btn {
    margin: 12px 0;
  }
}

// 用户功能区域
.user-div {
  user-select: none;
  margin: 12px 0;
  position: absolute;
  right: 5vw;
}
// 用户功能外侧胶囊
.user-div .user-capsule {
  display: inline-flex;
  align-items: center;
  height: 48px;
  line-height: 48px;
  border-radius: 25px;
  text-align: center;
  font-size: 16px;
  padding: 0 14px;
}
// 功能导航共用样式
.user-div .user-capsule .common-div {
  display: inline-flex;
  align-items: center;
  padding: 0 4px;
}
.user-div .user-capsule .common-div .more-icon {
  width: 0;
  opacity: 0;
  transition: all 0.5s;
  color: #636363;
  padding-left: 0;
}
.user-div .user-capsule .common-div:hover .more-icon {
  width: 24px;
  opacity: 1;
  transition: 0.5s;
  padding-left: 4px;
}
// 非当前功能导航
.user-div .user-capsule .function {
  cursor: pointer;
}
.user-div .user-capsule .function .icon {
  color: #636363;
  transition: all 0.5s;
}
.user-div .user-capsule .function:hover .icon {
  // color: #000000;
}
// 当前功能导航
.user-div .user-capsule .current-func {
  cursor: default;
}
.user-div .user-capsule .current-func .icon {
  color: #000000;
  transition: all 0.5s;
}
// 特殊功能导航-用户
.user-div .user-capsule .user {
  cursor: pointer;
}
.user-div .user-capsule .user .icon {
  width: 0;
  opacity: 0;
  transition: all 0.5s;
  color: #636363;
  padding-right: 0;
}
.user-div .user-capsule .user:hover .icon {
  width: 24px;
  opacity: 1;
  transition: all 0.5s;
  color: #636363;
  padding-right: 4px;
}
// 当前特殊功能导航-用户
.user-div .user-capsule .current-user {
  transition: all 0.5s;
  cursor: default;
}
.user-div .user-capsule .current-user .icon {
  width: 24px;
  opacity: 1;
  transition: all 0.5s;
  color: #000000;
  padding-right: 4px;
}
.upload-num-box {
  font-size: 12px;
  margin-left: 2px;
  &.hidden {
    display: none;
  }
  .upload-num {
    display: inline-block;
    font-size: 15px;
    font-weight: bold;
    margin-right: 3px;
    &.jump {
      animation: jump 0.3s linear 3 alternate;
    }
  }
}

@keyframes jump {
  0% {
    transform: translateY(-10%);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
