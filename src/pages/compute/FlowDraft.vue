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
            placeholder="搜索草稿名称"
            style="width: 200px"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-space />
          <q-btn
            unelevated
            color="primary"
            label="批量删除"
            class="q-ml-sm"
            :disable="selected.length === 0 || loadingBatch"
            :loading="loadingBatch"
          >
            <confirm-popup
              icon="error"
              :label="'确定删除选中的 ' + selected.length + ' 项草稿吗？'"
              @onOk="deleteBatch"
            />
          </q-btn>
          <q-btn unelevated color="primary" label="刷新列表" class="q-ml-sm" @click="loadData" />
          <q-btn unelevated color="secondary" label="新建草稿" class="q-ml-sm" @click="createWorkflow" />
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
            <q-checkbox v-model="selected" :val="props.row.id" @click="clickSelected" />
          </q-td>
          <q-td key="name" :props="props">{{ props.row.name ? props.row.name : '-' }}</q-td>
          <q-td key="created_time" :props="props">
            {{ date.formatDate(props.row.created_time, 'YYYY/MM/DD HH:mm:ss') }}
          </q-td>
          <q-td key="function" :props="props" auto-width class="text-grey">
            <q-btn
              flat
              color="primary"
              label="编辑"
              class="q-px-sm"
              @click="toPage('/draft-editor?id=' + props.row.id, $event)"
            />
            <q-btn flat dense icon="more_horiz" color="grey-7">
              <q-menu auto-close>
                <q-list>
                  <q-item clickable @click="runWorkFlow(props.row.id, $event)">
                    <q-item-section side> <q-icon name="play_arrow" /> </q-item-section>
                    <q-item-section>提交任务</q-item-section>
                  </q-item>
                  <q-item clickable @click="editInfo(props.row)">
                    <q-item-section side> <q-icon name="edit" /> </q-item-section>
                    <q-item-section>修改信息</q-item-section>
                  </q-item>
                  <q-item clickable @click="deleteById(props.row.id)">
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
  </div>

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
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useQuasar, date } from 'quasar';
import ConfirmPopup from 'src/components/common/ConfirmPopup.vue';
import { DraftService, InstanceService } from 'src/service';
import { FlowDraft, FlowDraftSpec } from 'src/components/flow-draft-editor/interfaces';
import { useRoute } from 'vue-router';
import { useCommonStore } from 'src/stores/common';
import { useKeepAliveStore } from 'src/stores/keep-alive';
import { useRefreshStore } from 'src/stores/refresh';

const $q = useQuasar();
const route = useRoute();
const commonStore = useCommonStore();
const keepAliveStore = useKeepAliveStore();
const refreshStore = useRefreshStore();

// 监听数据变化，自动更新
refreshStore.$onAction(async ({ name }) => {
  if (!loading.value && !loadingBatch.value && name == 'refreshFlowDraftData') loadData();
});

const loading = ref(false);
const loadingBatch = ref(false);
/**
 * 搜索草稿名称
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
    label: '草稿名称',
    field: 'name',
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
 * 工作流草稿列表
 */
const rows = ref<FlowDraft[]>([]);
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

// 新建工作流计算
const createWorkflow = async (event: any) => {
  const flowData = DraftService.createFlowData(0);
  const id = await DraftService.saveFlowDraft(flowData, flowData.spec as FlowDraftSpec);
  toPage('/draft-editor?id=' + id, event);
};
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
  const result = await DraftService.updateItem(promptData.value);
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
 * 根据id删除数据
 */
const deleteById = async (id: string) => {
  const result = await DraftService.deleteById(id);
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
    keepAliveStore.deleteTabByPath('/draft-editor?id=' + id);
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
    const result = await DraftService.deleteById(selected.value[i]);
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
    keepAliveStore.deleteTabByPath('/draft-editor?id=' + selected.value[i]);
  }
  // 批量操作成功
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
    pagination.value.rowsNumber = await DraftService.getListNumber(filter);
    // 获取列表并更新rows
    rows.value = await DraftService.getList(
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
  // 结束加载
  loading.value = false;
};
// 提交工作流任务
const runWorkFlow = async (id: string, event: any) => {
  const uuid = await InstanceService.runFlowDraft(id);
  toPage(`/instance-detail?id=${uuid}`, event);
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
