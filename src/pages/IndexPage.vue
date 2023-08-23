<template>
  <q-page class="page-px">
    <div class="index-card">
      <draggable
        v-model="cardList"
        group="cards"
        item-key="name"
        animation="300"
        class="cards row q-col-gutter-md frosted-glass-card q-pr-md q-pb-md row"
        :disabled="!editable"
      >
        <template #header>
          <div class="col-12 row">
            <div class="card user-card items-center">
              <div class="row">
                <q-item class="user-info">
                  <q-item-section top avatar @click="toPage('/user', $event)">
                    <q-avatar size="120px" font-size="60px" color="white" text-color="grey" icon="person" />
                  </q-item-section>
                  <q-item-section class="q-pl-md" @click="toPage('/user', $event)">
                    <q-item-label class="text-h5 q-pb-sm ellipsis">欢迎 {{ authStore.displayName }}</q-item-label>
                    <q-item-label class="q-pb-xs ellipsis">用户权限：普通用户</q-item-label>
                    <q-item-label class="ellipsis">
                      登录时间：{{ date.formatDate(new Date(authStore.authTime * 1000), 'YYYY/MM/DD HH:mm:ss') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </div>
            </div>
            <q-space />
            <div>
              <q-btn
                flat
                round
                dense
                color="grey-7"
                icon="refresh"
                class="q-ml-xs"
                :loading="loadingInstance || loadingFlows || loadingUsecase || loadingSoftware"
                @click="loadData"
              >
                <q-tooltip :offset="[8, 8]"> 刷新 </q-tooltip>
              </q-btn>
            </div>
          </div>
        </template>

        <template #item="{ element, index }">
          <div class="col-4" :class="[editable ? 'editable-card' : '']">
            <div class="close-btn" v-if="editable">
              <q-btn
                dense
                round
                size="12px"
                color="white"
                text-color="black"
                icon="remove"
                @click="
                  removeCard(index);
                  $event.cancelBubble = true;
                "
                style="z-index: 5000"
              />
            </div>
            <div class="card translucent-card q-pa-md" v-if="element.name === 'compute-task'">
              <div class="title text-center q-pb-xs text-h6">计算任务</div>
              <div class="row justify-evenly">
                <div class="content col-4" @click="toPageWithParams('/compute', { type: 'SingleInstance' }, $event)">
                  <div class="text text-center ellipsis text-h4 q-py-sm">{{ singleInstanceLength }}</div>
                  <div class="text text-center ellipsis text-h6 text-primary">单步任务</div>
                </div>
                <div class="content col-4" @click="toPageWithParams('/compute', { type: 'BatchInstance' }, $event)">
                  <div class="text text-center ellipsis text-h4 q-py-sm">{{ batchInstanceLength }}</div>
                  <div class="text text-center ellipsis text-h6 text-primary">批量任务</div>
                </div>
                <div class="content col-4" @click="toPageWithParams('/compute', { type: 'WFInstance' }, $event)">
                  <div class="text text-center ellipsis text-h4 q-py-sm">{{ wfInstanceLength }}</div>
                  <div class="text text-center ellipsis text-h6 text-primary">工作流任务</div>
                </div>
              </div>
              <q-inner-loading class="border-radius-normal" :showing="loadingInstance">
                <q-spinner-ios size="50px" color="primary" />
              </q-inner-loading>
            </div>

            <div class="card translucent-card q-pa-md" v-else-if="element.name === 'machine-hour'">
              <div class="title text-center q-pb-xs text-h6">机时消耗</div>
              <div class="chart row justify-evenly">
                <div class="text-h4 text-primary" style="line-height: 130px">敬请期待</div>
              </div>
            </div>

            <div class="card translucent-card q-pa-md" v-else-if="element.name === 'new-app'">
              <div class="title text-center q-pb-xs text-h6">新增应用</div>
              <div class="row justify-evenly">
                <div class="content col-4" @click="toPageWithParams('/application', { type: '用例' }, $event)">
                  <div class="text text-center ellipsis text-h4 q-py-sm">{{ usecaseLength }}</div>
                  <div class="text text-center ellipsis text-h6 text-primary">用例</div>
                </div>
                <div class="content col-4" @click="toPageWithParams('/application', { type: '软件' }, $event)">
                  <div class="text text-center ellipsis text-h4 q-py-sm">{{ softwareLength }}</div>
                  <div class="text text-center ellipsis text-h6 text-primary">软件</div>
                </div>
                <div class="content col-4" @click="toPageWithParams('/application', { type: '模板' }, $event)">
                  <div class="text text-center ellipsis text-h4 q-py-sm">{{ flowsLength }}</div>
                  <div class="text text-center ellipsis text-h6 text-primary">模板</div>
                </div>
              </div>
              <q-inner-loading
                class="border-radius-normal"
                :showing="loadingFlows || loadingUsecase || loadingSoftware"
              >
                <q-spinner-ios size="50px" color="primary" />
              </q-inner-loading>
            </div>

            <div class="card translucent-card q-pa-md" v-else-if="element.name === 'data-transfer'">
              <div class="title text-center q-pb-xs text-h6">数据流转</div>
              <div class="chart row justify-evenly">
                <div class="text-h4 text-primary" style="line-height: 130px">敬请期待</div>
              </div>
            </div>

            <div class="card translucent-card q-pa-md" v-else-if="element.name === 'balance'">
              <div class="title text-center q-pb-xs text-h6">余额</div>
              <div class="chart row justify-evenly">
                <div class="text-h4 text-primary" style="line-height: 130px">敬请期待</div>
              </div>
            </div>

            <div class="card translucent-card q-pa-md" v-else-if="element.name === 'billing'">
              <div class="title text-center q-pb-xs text-h6">计费</div>
              <div class="chart row justify-evenly">
                <div class="text-h4 text-primary" style="line-height: 130px">敬请期待</div>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { date, useQuasar } from 'quasar';
import { useCommonStore } from 'src/stores/common';
import { InstanceService, ProjectService } from 'src/service';
import { useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useKeepAliveStore } from 'src/stores/keep-alive';
import draggable from 'vuedraggable';
import { useRefreshStore } from 'src/stores/refresh';

const commonStore = useCommonStore();
const authStore = useAuthStore();
const keepAliveStore = useKeepAliveStore();
const $q = useQuasar();
const route = useRoute();
const refreshStore = useRefreshStore();

// 监听数据变化，自动更新
refreshStore.$onAction(async ({ name }) => {
  if (name == 'refreshInstanceData') getInstanceLength();
});

const editable = ref(false);
const cardList = ref([
  {
    name: 'compute-task',
  },
  {
    name: 'new-app',
  },
  {
    name: 'data-transfer',
  },
  {
    name: 'machine-hour',
  },
  {
    name: 'balance',
  },
  {
    name: 'billing',
  },
]);

const toPage = (fullPath: string, event: any) => {
  const { x, y } = event;
  commonStore.animate(x, y, fullPath);
};
const toPageWithParams = (fullPath: string, params: any, event: any) => {
  if (fullPath !== route.fullPath) {
    const { x, y } = event;
    commonStore.lastParams = params;
    commonStore.animate(x, y, fullPath);
  }
};

const localCardList = $q.localStorage.getItem('cardList');
if (localCardList) cardList.value = localCardList as { name: string }[];

// 获取任务总数
const singleInstanceLength = ref(0);
const batchInstanceLength = ref(0);
const wfInstanceLength = ref(0);
async function getInstanceLength() {
  singleInstanceLength.value = await InstanceService.getListNumberWithType(undefined, 1);
  batchInstanceLength.value = await InstanceService.getListNumberWithType(undefined, 2);
  wfInstanceLength.value = await InstanceService.getListNumberWithType(undefined, 0);
}

// 获取业务模板总数
const flowsLength = ref(0);
async function getFlowsLength() {
  flowsLength.value = await ProjectService.getFlowsNumber(undefined, false, false);
}

// 获取用例总数
const usecaseLength = ref(0);
async function getUsecaseLength() {
  usecaseLength.value = await ProjectService.getUsecaseNumber(undefined, false, false);
}

// 获取软件总数
const softwareLength = ref(0);
async function getSoftwareLength() {
  softwareLength.value = await ProjectService.getSoftwareNumber(undefined, false, false);
  loadingSoftware.value = false;
}

// 自定卡片/完成自定
const editCards = () => {
  if (editable.value) $q.localStorage.set('cardList', cardList.value);
  editable.value = !editable.value;
};
// 删除卡片
const removeCard = (index: number) => {
  cardList.value.splice(index, 1);
};

const loadingInstance = ref(false);
const loadingFlows = ref(false);
const loadingUsecase = ref(false);
const loadingSoftware = ref(false);

const fullPath = route.fullPath;
onMounted(() => {
  loadingInstance.value = true;
  loadingFlows.value = true;
  loadingUsecase.value = true;
  loadingSoftware.value = true;
  loadData();
  setInterval(() => {
    if (fullPath === route.fullPath) {
      loadData();
    }
  }, keepAliveStore.timeout);
});
function loadData() {
  getInstanceLength()
    .then(() => {
      loadingInstance.value = false;
    })
    .catch(() => {
      loadingInstance.value = false;
    });
  getFlowsLength()
    .then(() => {
      loadingFlows.value = false;
    })
    .catch(() => {
      loadingFlows.value = false;
    });
  getUsecaseLength()
    .then(() => {
      loadingUsecase.value = false;
    })
    .catch(() => {
      loadingUsecase.value = false;
    });
  getSoftwareLength()
    .then(() => {
      loadingSoftware.value = false;
    })
    .catch(() => {
      loadingSoftware.value = false;
    });
}
</script>

<style lang="scss" scoped>
.index-card {
  padding-top: calc(#{$header-height} + 8px) !important;
  padding-bottom: 16px;
}
.card .title {
  height: 46px;
}
.card .content {
  // width: 138px;
  height: 130px;
  border-radius: 16px;
  padding: 16px;
  transition: background 0.3s ease-in-out;
}
.card .content:hover {
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}
.card .content .caption {
  transform: translate3d(1%, 1%, 0) scale(0.9);
}
.card .content .circle {
  width: 60px;
  height: 60px;
  line-height: 60px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 16px;
  border-radius: 50%;
  color: white;
}
.card .user-info {
  width: 420px;
  height: 160px;
  border-radius: 16px;
  padding: 16px;
  transition: background 0.3s ease-in-out;
}
.card .user-info:hover {
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}
.card .chart {
  width: 100%;
  height: 130px;
  border-radius: 16px;
  transition: background 0.3s ease-in-out;
}
.card .chart .text {
  width: 222px;
  height: 130px;
  padding-right: 16px;
}
.card .chart .text .caption {
  width: 212px;
  margin-left: -10.6px;
  transform: translate3d(1%, 1%, 0) scale(0.9);
}
.card .chart .container {
  width: 182px;
  height: 160px;
}
.card .chart:hover {
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}
.cards {
  margin-top: 0 !important;
  margin-left: 0 !important;
}
.cards > i {
  content: '';
  width: calc(30vw - 16px);
  min-width: 446px;
  margin-left: 16px;
}
@media (max-width: 1008px) {
  .user-card {
    width: calc(30vw - 16px);
    min-width: 446px;
  }
  .card .message {
    display: none;
  }
}
.editable-card {
  cursor: move;
  animation-name: shake;
  animation-timing-function: ease-in-out;
  animation-direction: alternate;
  animation-iteration-count: infinite;
  animation-duration: 150ms;
  animation-delay: 200ms;
  will-change: transform;
  transform-origin: center;
}
.editable-btn {
  background: rgba(255, 255, 255, 0.8);
  color: #636363;
}
.editable-btn-active {
  background: #000;
  color: #fff;
}
.close-btn {
  position: absolute;
  top: 16px;
  left: 0;
  transform: translateX(50%);
  transform: translateY(-50%);
  z-index: 9000;
}
</style>

<style lang="scss">
@keyframes shake {
  0% {
    -webkit-transform: rotate(-0.5deg);
    transform: rotate(-0.5deg);
  }

  to {
    -webkit-transform: rotate(0.5deg);
    transform: rotate(0.5deg);
  }
}
</style>
