<template>
  <div class="full-width">
    <div class="text-h5 q-pa-md row">
      我的任务
      <q-space /><q-btn
        flat
        round
        dense
        color="grey-7"
        icon="refresh"
        class="q-ml-xs"
        :loading="loadingCompute"
        @click="refreshCompute"
      >
        <q-tooltip :offset="[8, 8]"> 刷新 </q-tooltip>
      </q-btn>
    </div>
    <div class="row q-col-gutter-md q-px-md q-pb-md">
      <div
        class="job-card col-4 row"
        v-for="(job, index) in jobs"
        :key="index"
        @click="job.title !== '工作流计算' && job.path ? toPage(job.path, $event) : createWorkflow($event)"
      >
        <div flat class="fit translucent-card column justify-center">
          <q-item class="full-height title">
            <q-item-section>
              <q-item-label lines="1">
                <q-avatar rounded color="blue-2" text-color="blue-8" :icon="job.icon" class="icon" />{{ job.title }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="full-height hover">
            <q-item-section>
              <q-icon name="keyboard_double_arrow_right" />
            </q-item-section>
          </q-item>
        </div>
      </div>
      <div class="chart-card col-8">
        <div flat class="fit translucent-card q-pa-md row full-height items-center">
          <div class="col-6 center-card column justify-center" @click="emit('setType', 'AllInstance')">
            <div class="title">计算任务</div>
            <div class="content q-px-xl">
              <q-list class="column full-height">
                <q-item :v-ripple="false" class="col-4 item">
                  <q-item-section>
                    <q-item-label>总计</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ instanceLength }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item :v-ripple="false" class="col-4 item">
                  <q-item-section>
                    <q-item-label>成功任务</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ finishedInstanceLength }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item :v-ripple="false" class="col-4 item">
                  <q-item-section>
                    <q-item-label>异常任务</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>{{ warningInstanceLength }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
          <div class="col-6 center-card">
            <compute-chart ref="computeChart" class="fit" />
          </div>
        </div>
      </div>
      <div class="job-card col-4 row" @click="emit('setType', 'FlowDraft')">
        <div flat class="fit translucent-card column justify-center">
          <q-item class="full-height title">
            <q-item-section>
              <q-item-label lines="1">
                继续编辑
                <q-avatar color="blue-grey-2" text-color="blue-grey-8" font-size="20px" class="avatar q-ml-md">
                  {{ draftLength }}
                </q-avatar>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="full-height hover">
            <q-item-section>
              <q-icon name="keyboard_double_arrow_right" />
            </q-item-section>
          </q-item>
        </div>
      </div>
      <div class="job-card col-4 row" @click="emit('setType', 'SingleInstance')">
        <div flat class="fit translucent-card column justify-center">
          <q-item class="full-height title">
            <q-item-section>
              <q-item-label lines="1">
                单步任务
                <q-avatar color="blue-2" text-color="blue-8" font-size="20px" class="avatar q-ml-md">
                  {{ singleInstanceLength }}
                </q-avatar>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="full-height hover">
            <q-item-section>
              <q-icon name="keyboard_double_arrow_right" />
            </q-item-section>
          </q-item>
        </div>
      </div>
      <div class="job-card col-4 row" @click="emit('setType', 'BatchInstance')">
        <div flat class="fit translucent-card column justify-center">
          <q-item class="full-height title">
            <q-item-section>
              <q-item-label lines="1">
                批量任务
                <q-avatar color="blue-2" text-color="blue-8" font-size="20px" class="avatar q-ml-md">
                  {{ batchInstanceLength }}
                </q-avatar>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="full-height hover">
            <q-item-section>
              <q-icon name="keyboard_double_arrow_right" />
            </q-item-section>
          </q-item>
        </div>
      </div>
      <div class="job-card col-4 row" @click="emit('setType', 'WFInstance')">
        <div flat class="fit translucent-card column justify-center">
          <q-item class="full-height title">
            <q-item-section>
              <q-item-label lines="1">
                工作流任务
                <q-avatar color="blue-2" text-color="blue-8" font-size="20px" class="avatar q-ml-md">
                  {{ wfInstanceLength }}
                </q-avatar>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="full-height hover">
            <q-item-section>
              <q-icon name="keyboard_double_arrow_right" />
            </q-item-section>
          </q-item>
        </div>
      </div>
    </div>
  </div>

  <div class="full-width">
    <div class="text-h5 q-pa-md row">
      我的模板
      <q-space /><q-btn
        flat
        round
        dense
        color="grey-7"
        icon="refresh"
        class="q-ml-xs"
        :loading="loadingTemplate"
        @click="refreshTemplate"
      >
        <q-tooltip :offset="[8, 8]"> 刷新 </q-tooltip>
      </q-btn>
    </div>
    <div class="row q-col-gutter-md q-px-md q-pb-md">
      <div class="template-card col-12">
        <q-card flat class="fit translucent-card q-px-md">
          <div class="row text-h5 q-py-md">全部模板</div>
          <div class="templates row q-col-gutter-x-md q-pb-md">
            <div class="col-2 full-height template" v-for="template in templateList" :key="template.id">
              <q-card flat class="fit translucent-card cursor-pointer" @click="useTemplate(template, $event)">
                <q-card-section>
                  <div class="ellipsis text-body1 text-weight-medium">{{ template.name }}</div>
                  <div class="ellipsis-2-lines text-body1 q-pt-xs" style="height: 52px">
                    描述：{{ template.description ? template.description : '-' }}
                  </div>
                  <div class="ellipsis text-grey-7 text-body2 q-pt-md">
                    {{ date.formatDate(template.created_time, 'YYYY-MM-DD HH:mm:ss') }}
                  </div>
                  <div class="hover-content text-center text-weight-medium text-primary">
                    <q-icon name="open_in_browser" /> 使用模板
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <q-item class="hover cursor-pointer" v-if="templateList.length >= 6">
              <q-item-section @click="emit('setType', 'TemplatePage')">
                <q-icon name="keyboard_double_arrow_right" />
              </q-item-section>
            </q-item>
            <div class="absolute-center text-center" style="line-height: normal" v-if="templateList.length == 0">
              <div><q-icon name="inbox" color="grey" size="50px" /></div>
              <div class="text-grey q-pt-xs">没有模板</div>
            </div>
          </div>
        </q-card>
      </div>
      <div class="template-card col-12">
        <q-card flat class="fit translucent-card q-px-md">
          <div class="row text-h5 q-py-md">收藏模板</div>
          <div class="templates row q-col-gutter-x-md q-pb-md">
            <div class="col-2 full-height template" v-for="template in templateFavoriteList" :key="template.id">
              <q-card flat class="fit translucent-card cursor-pointer" @click="useTemplate(template, $event)">
                <q-card-section>
                  <div class="ellipsis text-body1 text-weight-medium">{{ template.name }}</div>
                  <div class="ellipsis-2-lines text-body1 q-pt-xs" style="height: 52px">
                    描述：{{ template.description ? template.description : '-' }}
                  </div>
                  <div class="ellipsis text-grey-7 text-body2 q-pt-md">
                    {{ date.formatDate(template.created_time, 'YYYY-MM-DD HH:mm:ss') }}
                  </div>
                  <div class="hover-content text-center text-weight-medium text-primary">
                    <q-icon name="open_in_browser" /> 使用模板
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <q-item class="hover cursor-pointer" v-if="templateFavoriteList.length >= 6">
              <q-item-section @click="toPageWithParams('/user', { type: 'Star' }, $event)">
                <q-icon name="keyboard_double_arrow_right" />
              </q-item-section>
            </q-item>
            <div
              class="absolute-center text-center"
              style="line-height: normal"
              v-if="templateFavoriteList.length == 0"
            >
              <div><q-icon name="inbox" color="grey" size="50px" /></div>
              <div class="text-grey q-pt-xs">没有收藏的模板</div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCommonStore } from 'src/stores/common';
import ComputeChart from 'src/components/compute/ComputeChart.vue';
import { onMounted, reactive, ref, onActivated, nextTick } from 'vue';
import { date, useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { DraftService, InstanceService, TemplateService, UserFavoriteService } from 'src/service';
import { FlowDraftSpec } from 'src/components/flow-draft-editor/interfaces';
import { useKeepAliveStore } from 'src/stores/keep-alive';
import { DataResort } from 'src/util/chart';
import { useRefreshStore } from 'src/stores/refresh';

const $q = useQuasar();
const commonStore = useCommonStore();
const keepAliveStore = useKeepAliveStore();
const route = useRoute();
const refreshStore = useRefreshStore();

const emit = defineEmits(['setType']);

// 监听数据变化，自动更新
refreshStore.$onAction(async ({ name }) => {
  if (!loadingCompute.value) {
    if (name == 'refreshFlowDraftData') refreshCompute();
    if (name == 'refreshInstanceData') refreshCompute();
  }
  if (!loadingTemplate.value) {
    if (name == 'refreshUserTemplateData') refreshTemplate();
    if (name == 'refreshUserFavoriteData') refreshTemplate();
  }
});

const jobs = [
  {
    icon: 'insert_drive_file',
    title: '单任务计算',
    path: '/single-compute',
  },
  {
    icon: 'folder',
    title: '批量任务计算',
    path: '/batch-compute',
  },
  {
    icon: 'r_account_tree',
    title: '工作流计算',
  },
];

const toPage = (fullPath: string, event: any) => {
  if (fullPath !== route.fullPath) {
    const { x, y } = event;
    commonStore.animate(x, y, fullPath);
  }
};
const toPageWithParams = (fullPath: string, params: any, event: any) => {
  if (fullPath !== route.fullPath) {
    const { x, y } = event;
    commonStore.lastParams = params;
    commonStore.animate(x, y, fullPath);
  }
};
// 新建工作流计算
const createWorkflow = async (event: any) => {
  const flowData = DraftService.createFlowData(0);
  const id = await DraftService.saveFlowDraft(flowData, flowData.spec as FlowDraftSpec);
  toPage('/draft-editor?id=' + id, event);
};
// 获取任务总数
const instanceLength = ref(0);
const runningInstanceLength = ref(0);
const finishedInstanceLength = ref(0);
const warningInstanceLength = ref(0);
const singleInstanceLength = ref(0);
const batchInstanceLength = ref(0);
const wfInstanceLength = ref(0);
async function getInstanceLength() {
  instanceLength.value = await InstanceService.getListNumber(undefined);
  runningInstanceLength.value = await InstanceService.getRunningNumber(undefined);
  finishedInstanceLength.value = await InstanceService.getFinishedNumber(undefined);
  warningInstanceLength.value = await InstanceService.getWarningNumber(undefined);
  singleInstanceLength.value = await InstanceService.getListNumberWithType(undefined, 1);
  batchInstanceLength.value = await InstanceService.getListNumberWithType(undefined, 2);
  wfInstanceLength.value = await InstanceService.getListNumberWithType(undefined, 0);
}

// 获取草稿总数
const draftLength = ref(0);
async function getDraftLength() {
  let res = await DraftService.getListNumber(undefined);
  draftLength.value = res;
}

// 获取模板列表
const templateList: any = reactive([]);
async function getTemplateList() {
  let res = await TemplateService.getList(1, 6, undefined, 'created_time', true);
  templateList.length = 0;
  templateList.push(...res);
}

// 获取收藏的模板列表
let templateFavoriteList: any = reactive([]);
async function getTemplateFavoriteList() {
  let res = await UserFavoriteService.getList('0', 1, 6, 'created_at', true);
  templateFavoriteList.length = 0;
  res.forEach(async (item: { favorite_id: string }) => {
    const detail = await TemplateService.getDetail(item.favorite_id);
    if (detail) {
      templateFavoriteList.push(detail);
    }
  });
}

// 获取计算任务图表
const computeChart = ref();
const initChart = async () => {
  const result = await InstanceService.getAllList();
  nextTick(() => {
    if (computeChart.value) computeChart.value.initChart(DataResort(result));
  });
};

const refreshCompute = async () => {
  getInstanceLength();
  getDraftLength();
  initChart();
};
const refreshTemplate = async () => {
  getTemplateList();
  getTemplateFavoriteList();
};
/**
 * 使用模板
 */
async function useTemplate(data: { id: string; name: string; description: string; spec: string }, event: any) {
  $q.loading.show();
  try {
    let draftId = await DraftService.saveMyDraft({
      templateId: data.id,
      name: data.name,
      description: data.description,
      spec: data.spec,
    });
    $q.notify({
      type: 'positive',
      message: '生成草稿成功',
    });
    $q.loading.hide();
    toPage('/draft-editor?id=' + draftId, event);
  } catch (e) {
    $q.loading.hide();
  }
}

const loadingCompute = ref(false);
const loadingTemplate = ref(false);

const loadData = () => {
  refreshCompute()
    .then(() => {
      loadingCompute.value = false;
    })
    .catch(() => {
      loadingCompute.value = false;
    });
  refreshTemplate()
    .then(() => {
      loadingTemplate.value = false;
    })
    .catch(() => {
      loadingTemplate.value = false;
    });
};

const fullPath = route.fullPath;
onMounted(() => {
  loadingCompute.value = true;
  loadingTemplate.value = true;
  loadData();
  setInterval(() => {
    if (fullPath === route.fullPath) loadData();
  }, keepAliveStore.timeout);
});
onActivated(async () => {
  initChart();
});
</script>

<style lang="scss" scoped>
.job-card {
  height: 222px;
  cursor: pointer;
}
.job-card .title {
  width: 100%;
  font-size: 30px;
  text-align: center;
  transition: all 0.3s;
}
.job-card .title .icon {
  width: 50px;
  height: 50px;
  font-size: 60px;
  margin-right: 16px;
  transition: all 0.3s;
  margin-bottom: 7px;
}
.job-card .title .avatar {
  width: 50px;
  height: 50px;
  margin-right: 16px;
  transition: all 0.3s;
  margin-bottom: 7px;
}
.job-card:hover .title {
  width: 80%;
  font-size: 30px;
  text-align: center;
}
.job-card:hover .title .icon {
  width: 50px;
  height: 50px;
  font-size: 60px;
}
.job-card:hover .title .avatar {
  width: 50px;
  height: 50px;
}
.job-card .hover {
  width: 0;
  padding: 0;
  font-size: 0;
  opacity: 0;
  transition: all 0.3s;
  background-image: linear-gradient(to right, rgba(79, 129, 255, 0), rgba(79, 129, 255, 0.5), rgba(79, 129, 255, 1));
  color: white;
  text-align: center;
  height: 206px;
  line-height: 206px;
}
.job-card:hover .hover {
  width: 20%;
  font-size: 60px;
  border-radius: 0 16px 16px 0;
  opacity: 1;
  z-index: 1;
}
.job-card .hover .q-icon {
  left: 50%;
  transform: translateX(-50%);
}

.chart-card {
  height: 222px;
}
.chart-card .title {
  height: 30px;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
}
.chart-card .content {
  padding-top: 8px;
  height: 106px;
}

.chart-card .center-card {
  height: 100%;
  border-radius: 16px;
  cursor: pointer !important;
  transition: all 0.5s;
}
.chart-card .center-card:hover {
  background-color: rgba(255, 255, 255, 0.5) !important;
}
.chart-card .content .running {
  margin-left: auto;
  margin-right: auto;
}

.status-card {
  height: 222px;
}

.template-card .templates {
  height: 160px;
}
.template-card .templates .template .img {
  height: 80px;
  border-radius: 16px 16px 0 0;
}
.template-card .templates .template .content {
  height: 46px;
  line-height: 46px;
  opacity: 1;
  padding-left: 16px;
  padding-right: 16px;
  transition: all 0.3s;
}
.template-card .templates .template:hover .content {
  height: 0;
  opacity: 0;
  padding: 0;
}
.template-card .templates .template {
  position: relative;
}
.template-card .templates .template .hover-content {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  line-height: 144px;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 1), transparent);
  width: 100%;
  opacity: 0;
  transition: all 0.3s;
}
.template-card .templates .template:hover .hover-content {
  opacity: 1;
}

.template-card .templates .hover {
  position: absolute;
  right: 16px;
  height: 144px;
  width: 100px;
  padding: 0;
  margin-left: 0px;
  opacity: 1;
  z-index: 1;
  transition: all 0.3s;
  background-image: linear-gradient(to right, rgba(79, 129, 255, 0), rgba(79, 129, 255, 0.8), rgba(79, 129, 255, 1));
  color: white;
  text-align: center;
  font-size: 60px;
  border-radius: 0 16px 16px 0;
}
.template-card .templates:hover .hover {
  opacity: 1;
}
.template-card .templates .hover .q-icon {
  left: 50%;
  transform: translateX(-50%);
}

@keyframes show {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
