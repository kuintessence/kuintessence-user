<template>
  <div class="q-px-md q-py-sm">
    <!-- 顶栏 -->
    <q-card square flat style="background: transparent">
      <q-card-section class="q-px-none q-py-sm">
        <div class="row" style="height: 40px; line-height: 40px">
          <q-input
            rounded
            outlined
            dense
            debounce="300"
            v-model="filter"
            placeholder="搜索任务名称"
            class="q-mr-sm"
            style="width: 200px"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-tabs
            dense
            v-model="tab"
            indicator-color="transparent"
            class="text-black"
            active-bg-color="white"
            @click="loadData"
          >
            <q-tab name="全部" class="q-pr-sm" style="border-radius: 8px">
              <div class="row" style="font-size: 14px">
                全部
                <q-chip dense color="secondary" text-color="white" :label="instanceLength" style="margin-top: 9.5px" />
              </div>
            </q-tab>
            <q-tab name="需要注意" class="q-pr-sm" style="border-radius: 8px">
              <div class="row" style="font-size: 14px">
                需要注意
                <q-chip
                  dense
                  color="orange"
                  text-color="white"
                  :label="warningInstanceLength"
                  style="margin-top: 9.5px"
                />
              </div>
            </q-tab>
            <q-tab name="最新完成" class="q-pr-sm" style="border-radius: 8px">
              <div class="row" style="font-size: 14px">
                最新完成
                <q-chip
                  dense
                  color="positive"
                  text-color="white"
                  :label="finishedInstanceLength"
                  style="margin-top: 9.5px"
                />
              </div>
            </q-tab>
            <q-tab name="正在运行" class="q-pr-sm" style="border-radius: 8px">
              <div class="row" style="font-size: 14px">
                正在运行
                <q-chip
                  dense
                  color="primary"
                  text-color="white"
                  :label="runningInstanceLength"
                  style="margin-top: 9.5px"
                />
              </div>
            </q-tab>
          </q-tabs>

          <q-space />

          <q-btn
            unelevated
            color="primary"
            label="批量删除"
            class="q-ml-md"
            :disable="selected.length === 0 || loadingBatch"
            :loading="loadingBatch"
          >
            <confirm-popup
              icon="error"
              :label="'确定删除选中的 ' + selected.length + ' 项任务吗？'"
              @onOk="deleteBatch"
            />
          </q-btn>
          <q-btn unelevated color="primary" label="刷新列表" class="q-ml-sm" @click="loadData" />
        </div>
      </q-card-section>
    </q-card>

    <!-- 内容 -->
    <q-table
      square
      flat
      :rows="rows"
      :columns="(columns as any)"
      row-key="id"
      no-data-label="没有可用数据！"
      no-results-label="找不到匹配结果！"
      rows-per-page-label="每页大小"
      :filter="filter"
      v-model:pagination="pagination"
      @request="onRequest"
      class="my-table"
      :loading="loading"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
            <span v-if="col.name === 'radio'">
              <q-checkbox v-model="isSelectedAll" @click="clickSelectedAll" />
            </span>
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="radio" :props="props" auto-width>
            <q-checkbox
              v-model="selected"
              :val="props.row.id"
              @click="clickSelected"
              :disable="
                props.row.status !== InstanceState.finished.value &&
                props.row.status !== InstanceState.error.value &&
                props.row.status !== InstanceState.stopped.value &&
                props.row.status !== InstanceState.created.value
              "
            >
              <q-tooltip
                :offset="[0, 0]"
                v-if="
                  props.row.status !== InstanceState.finished.value &&
                  props.row.status !== InstanceState.error.value &&
                  props.row.status !== InstanceState.stopped.value &&
                  props.row.status !== InstanceState.created.value
                "
              >
                请先终止任务
              </q-tooltip>
            </q-checkbox>
          </q-td>
          <q-td key="name" :props="props">{{ props.row.name ? props.row.name : '-' }}</q-td>
          <q-td key="status" :props="props">
            <state class="state" :state="props.row.status" />
          </q-td>
          <q-td key="created_time" :props="props">
            {{ date.formatDate(props.row.created_time, 'YYYY/MM/DD HH:mm:ss') }}
          </q-td>
          <q-td key="omp_type" :props="props">
            {{
              props.row.spec?.additionalData?.ompType === 1
                ? '单步任务'
                : props.row.spec?.additionalData?.ompType === 2
                ? '批量任务'
                : props.row.spec?.additionalData?.ompType === 0
                ? '工作流任务'
                : '-'
            }}
          </q-td>
          <q-td key="function" :props="props" auto-width class="text-grey">
            <q-btn
              flat
              color="primary"
              label="查看"
              class="q-px-sm"
              @click="toPage('/instance-detail?id=' + props.row.id, $event)"
            />
            <q-btn flat dense icon="more_horiz" color="grey-7">
              <q-menu auto-close>
                <q-list>
                  <q-item clickable @click="editInfo(props.row)">
                    <q-item-section side> <q-icon name="edit" /> </q-item-section>
                    <q-item-section>修改信息</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    @click="runById(props.row.id)"
                    v-if="props.row.status === InstanceState.created.value"
                  >
                    <q-item-section side> <q-icon name="play_arrow" /> </q-item-section>
                    <q-item-section>运行</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    @click="pauseById(props.row.id)"
                    v-if="
                      props.row.status === InstanceState.running.value ||
                      props.row.status === InstanceState.pending.value
                    "
                  >
                    <q-item-section side> <q-icon name="pause" /> </q-item-section>
                    <q-item-section>暂停</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    @click="continueById(props.row.id)"
                    v-if="props.row.status === InstanceState.paused.value"
                  >
                    <q-item-section side> <q-icon name="play_arrow" /> </q-item-section>
                    <q-item-section>继续</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    @click="terminateById(props.row.id)"
                    v-if="
                      props.row.status === InstanceState.running.value ||
                      props.row.status === InstanceState.pending.value ||
                      props.row.status === InstanceState.paused.value
                    "
                  >
                    <q-item-section side> <q-icon name="stop" /> </q-item-section>
                    <q-item-section>终止</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    @click="terminateAndDelete(props.row.id)"
                    v-if="
                      props.row.status === InstanceState.running.value ||
                      props.row.status === InstanceState.pending.value ||
                      props.row.status === InstanceState.paused.value
                    "
                  >
                    <q-item-section side> <q-icon name="delete" /> </q-item-section>
                    <q-item-section>终止并删除</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    @click="deleteById(props.row.id)"
                    v-if="
                      props.row.status === InstanceState.finished.value ||
                      props.row.status === InstanceState.error.value ||
                      props.row.status === InstanceState.stopped.value ||
                      props.row.status === InstanceState.created.value
                    "
                  >
                    <q-item-section side> <q-icon name="delete" /> </q-item-section>
                    <q-item-section>删除</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="prompt" persistent class="frosted-glass-dialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">修改信息</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-body1">名称</div>
          <q-input dense outlined v-model="promptData.name" class="q-pt-xs" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-body1">描述</div>
          <q-input dense outlined v-model="promptData.description" type="textarea" class="q-pt-xs" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup class="text-grey-7" />
          <q-btn flat label="保存" @click="saveInfo" v-close-popup class="text-primary" :disable="!promptData.name" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useQuasar, date } from 'quasar';
import ConfirmPopup from 'src/components/common/ConfirmPopup.vue';
import { InstanceService, InstanceState } from 'src/service';
import { useRoute } from 'vue-router';
import { useCommonStore } from 'src/stores/common';
import State from 'components/store/InstanceState.vue';
import { useKeepAliveStore } from 'src/stores/keep-alive';
import { useRefreshStore } from 'src/stores/refresh';

const $q = useQuasar();
const route = useRoute();
const commonStore = useCommonStore();
const keepAliveStore = useKeepAliveStore();
const refreshStore = useRefreshStore();

// 监听数据变化，自动更新
refreshStore.$onAction(async ({ name }) => {
  if (!loading.value && !loadingBatch.value && name == 'refreshInstanceData') loadData();
});

const loading = ref(false);
const loadingBatch = ref(false);
const tab = ref('全部');
/**
 * 搜索任务名称
 */
const filter = ref('');
const columns = [
  {
    name: 'radio',
    field: 'radio',
    label: '',
    align: 'left',
  },
  {
    name: 'name',
    label: '任务名称',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: '状态',
    field: 'status',
    align: 'left',
    sortable: true,
  },
  {
    name: 'created_time',
    label: '创建时间',
    field: 'created_time',
    align: 'left',
    sortable: true,
  },
  {
    name: 'omp_type',
    label: '任务类型',
    field: 'omp_type',
    align: 'left',
    sortable: true,
  },
  { name: 'function', label: '操作', field: 'function', align: 'right' },
];
/**
 * 分页配置
 */
const pagination = ref({
  sortBy: 'created_time',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});
/**
 * 工作流任务列表
 */
const rows = ref<any[]>([]);
/**
 * 选择框
 */
const selected = ref([]);
const isSelectedAll = ref(false);
let selectedAllResult: string[] = [];
/**
 * dialog
 */
const prompt = ref(false);
const promptData = ref({ id: '', name: '', description: '' });

/**
 * 跳转路由
 */
const toPage = (fullPath: string, event: any) => {
  if (fullPath !== route.fullPath) {
    const { x, y } = event;
    commonStore.animate(x, y, fullPath);
  }
};
/**
 * 点击选择全部
 */
const clickSelectedAll = () => {
  if (isSelectedAll.value) {
    selected.value = [];
    for (let i = 0; i < rows.value.length; i++) {
      if (
        rows.value[i].status === InstanceState.finished.value ||
        rows.value[i].status === InstanceState.error.value ||
        rows.value[i].status === InstanceState.stopped.value ||
        rows.value[i].status === InstanceState.created.value
      )
        (selected.value as string[]).push(rows.value[i].id);
    }
  } else {
    selected.value = [];
  }
};
/**
 * 点击选择
 */
const clickSelected = () => {
  if (selectedAllResult.length === 0) {
    for (let i = 0; i < rows.value.length; i++) {
      if (
        rows.value[i].status === InstanceState.finished.value ||
        rows.value[i].status === InstanceState.error.value ||
        rows.value[i].status === InstanceState.stopped.value ||
        rows.value[i].status === InstanceState.created.value
      )
        selectedAllResult.push(rows.value[i].id);
    }
  }
  for (let i = 0; i < selectedAllResult.length; i++) {
    if (!(selected.value as string[]).includes(selectedAllResult[i])) {
      isSelectedAll.value = false;
      return;
    }
  }
  isSelectedAll.value = true;
};
/**
 * 修改信息
 */
function editInfo(info: any) {
  promptData.value = {
    id: info.id,
    name: info.name,
    description: info.description,
  };
  prompt.value = true;
}
/**
 * 保存信息
 */
async function saveInfo() {
  const result = await InstanceService.updateItem(promptData.value);
  if (result) {
    $q.notify({
      type: 'positive',
      message: '修改成功',
    });
  } else {
    console.log('error: 修改失败');
  }
}
/**
 * 根据id开始任务
 */
const runById = async (id: string) => {
  const result = await InstanceService.runInstance(id);
  if (result) {
    $q.notify({
      type: 'positive',
      message: '运行成功',
    });
    // 刷新列表数据
    onRequest({
      pagination: pagination.value,
      filter: filter.value,
    });
  } else {
    console.log('error: 运行失败');
  }
};
/**
 * 根据id暂停任务
 */
const pauseById = async (id: string) => {
  const result = await InstanceService.pauseById(id);
  if (result) {
    $q.notify({
      type: 'positive',
      message: '暂停成功',
    });
    // 刷新列表数据
    onRequest({
      pagination: pagination.value,
      filter: filter.value,
    });
  } else {
    console.log('error: 暂停失败');
  }
};
/**
 * 根据id继续任务
 */
const continueById = async (id: string) => {
  const result = await InstanceService.continueById(id);
  if (result) {
    $q.notify({
      type: 'positive',
      message: '继续成功',
    });
    // 刷新列表数据
    onRequest({
      pagination: pagination.value,
      filter: filter.value,
    });
  } else {
    console.log('error: 继续失败');
  }
};
/**
 * 根据id终止任务
 */
const terminateById = async (id: string) => {
  const result = await InstanceService.terminateById(id);
  if (result) {
    $q.notify({
      type: 'positive',
      message: '终止成功',
    });
    // 刷新列表数据
    onRequest({
      pagination: pagination.value,
      filter: filter.value,
    });
  } else {
    console.log('error: 终止失败');
  }
};
/**
 * 根据id终止并删除任务
 */
const terminateAndDelete = async (id: string) => {
  const result = await InstanceService.terminateById(id);
  if (result) {
    $q.notify({
      type: 'positive',
      message: '终止成功',
    });
    // 删除任务
    deleteById(id);
  } else {
    console.log('error: 终止失败');
  }
};
/**
 * 根据id删除数据
 */
const deleteById = async (id: string) => {
  const result = await InstanceService.deleteById(id);
  if (result) {
    $q.notify({
      type: 'positive',
      message: '删除成功',
    });
    // 如果是当前页最后一条数据，页数-1
    const resultRowsNumber = pagination.value.rowsNumber - 1;
    if (resultRowsNumber > 0 && resultRowsNumber === pagination.value.page * pagination.value.rowsPerPage) {
      resetSelect(); // 重置选择
      pagination.value.page -= 1;
    } else {
      // 若选择了删除项,则从已选择id中筛选掉其id
      selected.value.filter(item => item !== id);
    }
    // 关闭tab
    keepAliveStore.deleteTabByPath('/instance-detail?id=' + id);
    // 刷新列表数据
    onRequest({
      pagination: pagination.value,
      filter: filter.value,
    });
  } else {
    console.log('error: 删除失败');
  }
};
/**
 * 批量删除
 */
const deleteBatch = async () => {
  loadingBatch.value = true;
  // 执行批量操作
  for (let i = 0; i < selected.value.length; i++) {
    const result = await InstanceService.deleteById(selected.value[i]);
    if (!result) {
      // 执行过程中出错
      console.log('error: 批量删除失败');
      loadingBatch.value = false;
      // 重置选择
      resetSelect();
      // 重置页码并刷新列表
      pagination.value.page = 1;
      loadData();
      // 结束批量操作
      return;
    }
    // 关闭tab
    keepAliveStore.deleteTabByPath('/instance-detail?id=' + selected.value[i]);
  }
  // 批量操作任务成功
  $q.notify({
    type: 'positive',
    message: '批量删除成功',
  });
  loadingBatch.value = false;
  // 重置选择
  resetSelect();
  // 重置页码并刷新列表
  pagination.value.page = 1;
  loadData();
};
/**
 * 重置选择
 */
const resetSelect = () => {
  selected.value = [];
  isSelectedAll.value = false;
  selectedAllResult = [];
};
// 获取任务总数
const instanceLength = ref(0);
const runningInstanceLength = ref(0);
const finishedInstanceLength = ref(0);
const warningInstanceLength = ref(0);
async function getInstanceLength() {
  instanceLength.value = await InstanceService.getListNumber(undefined);
  runningInstanceLength.value = await InstanceService.getRunningNumber(undefined);
  finishedInstanceLength.value = await InstanceService.getFinishedNumber(undefined);
  warningInstanceLength.value = await InstanceService.getWarningNumber(undefined);
}
/**
 * 刷新列表数据
 */
const loadData = () => {
  resetSelect();
  onRequest({
    pagination: pagination.value,
    filter: filter.value,
  });
};
/**
 * 获取列表数据
 */
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  const filter = props.filter;
  loading.value = true;
  try {
    // 获取列表大小并更新rowsNumber
    pagination.value.rowsNumber =
      tab.value === '正在运行'
        ? await InstanceService.getRunningNumber(filter)
        : tab.value === '最新完成'
        ? await InstanceService.getFinishedNumber(filter)
        : tab.value === '需要注意'
        ? await InstanceService.getWarningNumber(filter)
        : await InstanceService.getListNumber(filter);
    // 获取列表并更新rows
    rows.value =
      tab.value === '正在运行'
        ? await InstanceService.getRunningList(
            page,
            rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber,
            filter,
            sortBy,
            descending
          )
        : tab.value === '最新完成'
        ? await InstanceService.getFinishedList(
            page,
            rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber,
            filter,
            sortBy,
            descending
          )
        : tab.value === '需要注意'
        ? await InstanceService.getWarningList(
            page,
            rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber,
            filter,
            sortBy,
            descending
          )
        : await InstanceService.getList(
            page,
            rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber,
            filter,
            sortBy,
            descending
          );
  } catch (e) {
    console.log(`error: ${String(e)}`);
  }
  // 切换页码,则重置选择
  if (pagination.value.page !== page) resetSelect();
  // 更新本地分页对象
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  getInstanceLength();
  // 结束加载
  loading.value = false;
};

onMounted(() => {
  onRequest({
    pagination: pagination.value,
    filter: undefined,
  });
});
</script>

<style lang="scss" scoped>
.my-table {
  height: calc(100vh - 160px);
  background: transparent;
}
</style>
