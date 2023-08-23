<template>
  <q-page class="page-pt page-px q-pb-md">
    <div class="full-width frosted-glass-card q-px-md q-pb-sm app-list-div">
      <div class="text-h5 q-py-md row">
        应用仓库
        <q-space />
        <q-input
          rounded
          outlined
          dense
          bg-color="transparent"
          debounce="300"
          v-model="filter.name"
          :placeholder="'搜索' + filter.type + '名称'"
          class="my-input"
        >
          <template v-slot:append>
            <q-separator spaced inset vertical />
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn
          class="q-ml-md q-pl-md q-pr-sm my-btn"
          dense
          rounded
          flat
          icon-right="add"
          label="自定义"
          style="border: 1px solid rgba(0, 0, 0, 0.24)"
        >
          <q-menu fit>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="toPage('add-soft', $event)">
                <q-item-section class="text-center">添加软件</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="toPage('add-usecase', $event)">
                <q-item-section class="text-center">添加用例</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <div class="q-mb-md row justify-between">
        <div class="col-auto">
          <q-tabs
            v-model="filter.type"
            indicator-color="transparent"
            class="text-black"
            active-color="primary"
            active-bg-color="white"
          >
            <q-tab
              :name="item"
              :label="item"
              v-for="(item, index) in filter.tabOptions"
              :key="index"
              @click="toggleChildType"
              style="border-radius: 8px"
            />
          </q-tabs>
        </div>
        <div
          class="col-auto translucent-card q-px-md"
          style="height: 48px; line-height: 48px; border-radius: 8px !important"
        >
          <q-btn flat dense color="primary" icon="grid_view" @click="gridMode = true" />
          <q-btn flat dense color="primary" icon="format_list_bulleted" @click="gridMode = false" class="q-ml-xs" />
          <q-btn
            flat
            dense
            color="primary"
            icon-right="refresh"
            label="刷新"
            @click="loadData"
            class="q-ml-xs q-pl-sm my-btn"
          />
        </div>
      </div>

      <div style="margin: 0 auto" class="q-py-sm row translucent-card q-px-md">
        <div class="row">
          <q-checkbox v-model="filter.isOfficial" label="官方" class="q-px-xs" @click="toggleChildType" />
          <q-checkbox v-model="filter.isFeatured" label="推荐" class="q-px-xs" @click="toggleChildType" />
        </div>
        <q-space />
        <div class="sort-option cursor-pointer" @click.prevent="toggleSortBy('date_created')" v-if="gridMode">
          发布时间
          <q-icon
            name="arrow_upward"
            :class="
              pagination.sortBy !== 'date_created' ? 'hover-up-icon' : pagination.descending ? 'down-icon' : 'up-icon'
            "
          />
        </div>
      </div>

      <q-table
        flat
        :rows="rows"
        :columns="(columns as any)"
        row-key="uuid"
        no-data-label="没有可用数据！"
        no-results-label="找不到匹配结果！"
        rows-per-page-label="每页大小"
        :rows-per-page-options="[6, 12, 24, 48, 0]"
        :filter="filter.name"
        v-model:pagination="pagination"
        @request="onRequest"
        :grid="gridMode"
        :class="gridMode ? 'translucent-grid-table' : 'translucent-card'"
        class="q-mt-md"
        :loading="loading"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="display_name" :props="props">
              <div class="ellipsis" style="max-width: 20vw">{{ props.row.display_name }}</div>
            </q-td>
            <q-td key="description" :props="props">
              <div class="ellipsis" style="max-width: 20vw">
                {{ props.row.description ? props.row.description : '-' }}
              </div>
            </q-td>
            <q-td key="date_created" :props="props">
              {{ props.row.date_created ? date.formatDate(props.row.date_created, 'YYYY/MM/DD HH:mm:ss') : '-' }}
            </q-td>
            <q-td key="function" :props="props" auto-width class="text-grey">
              <q-btn
                dense
                flat
                color="orange"
                label="收藏"
                class="q-px-sm"
                :loading="loading"
                @click="favor(props.row.uuid, props.row?.content_repo_obj?.uuid)"
                v-if="!props.row.isFavorite"
              />
              <q-btn
                dense
                flat
                color="orange"
                label="取消收藏"
                class="q-px-sm"
                :loading="loading"
                @click="unfavor(props.row.uuid)"
                v-else
              />
              <q-btn
                flat
                color="primary"
                label="使用"
                class="q-px-sm"
                @click="useFlow(props.row, $event)"
                v-if="filter.type === '模板'"
              />
              <q-btn
                flat
                color="grey-7"
                label="详情"
                class="q-px-sm"
                @click="
                  toPage(
                    (filter.type === '模板'
                      ? '/official-template?id='
                      : filter.type === '用例'
                      ? '/usecase-detail?id='
                      : '/software-detail?id=') + props.row.uuid,
                    $event
                  )
                "
              />
            </q-td>
          </q-tr>
        </template>

        <template v-slot:item="props">
          <div class="col-xs-6 col-sm-4 col-md-2">
            <q-card class="translucent-grid-card template-card">
              <q-card-section>
                <div class="row">
                  <q-icon
                    name="r_api"
                    size="30px"
                    class="bg-white text-primary"
                    style="height: 50px; width: 50px; border-radius: 4px"
                  />
                  <q-space />
                  <q-btn
                    dense
                    flat
                    round
                    color="orange"
                    icon="star_border"
                    :loading="loading"
                    @click="favor(props.row.uuid, props.row?.content_repo_obj?.uuid)"
                    v-if="!props.row.isFavorite"
                    style="height: 36px"
                  >
                    <q-tooltip :offset="[8, 8]"> 加入收藏 </q-tooltip>
                  </q-btn>
                  <q-btn
                    dense
                    flat
                    round
                    color="orange"
                    icon="star"
                    :loading="loading"
                    @click="unfavor(props.row.uuid)"
                    v-else
                    style="height: 36px"
                  >
                    <q-tooltip :offset="[8, 8]"> 取消收藏 </q-tooltip>
                  </q-btn>
                </div>
                <div class="text-body1 text-weight-medium ellipsis q-pt-md">{{ props.row.display_name }}</div>
                <div class="text-caption ellipsis-2-lines q-pt-sm" style="height: 48px">
                  描述：{{ props.row.description ? props.row.description : '-' }}
                </div>
                <div class="text-grey-7 text-body2 q-pt-md">
                  <span v-if="props.row.date_created">
                    发布于 {{ date.formatDate(props.row.date_created, 'YYYY/MM/DD') }}
                  </span>
                  <span v-else> - </span>
                </div>
              </q-card-section>
              <q-card-actions align="center" class="q-pt-none">
                <q-btn
                  dense
                  unelevated
                  color="primary"
                  label="使用"
                  @click="useFlow(props.row, $event)"
                  v-if="filter.type === '模板'"
                  class="q-mb-sm"
                />
                <q-btn
                  dense
                  unelevated
                  color="grey-7"
                  label="详情"
                  @click="
                    toPage(
                      (filter.type === '模板'
                        ? '/official-template?id='
                        : filter.type === '用例'
                        ? '/usecase-detail?id='
                        : '/software-detail?id=') + props.row.uuid,
                      $event
                    )
                  "
                  class="q-mb-sm"
                />
              </q-card-actions>
            </q-card>
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue';
import { DraftService, ProjectService, UserFavoriteService } from 'src/service';
import { useQuasar, date } from 'quasar';
import { useCommonStore } from 'src/stores/common';
import { useRoute } from 'vue-router';
import { useRefreshStore } from 'src/stores/refresh';

const $q = useQuasar();
const route = useRoute();
const commonStore = useCommonStore();
const refreshStore = useRefreshStore();

// 监听数据变化，自动更新
refreshStore.$onAction(async ({ name }) => {
  if (!loading.value) {
    if (name == 'refreshUserFavoriteData') loadData();
    if (name == 'refreshUsecaseData' && filter.value.type === '用例') loadData();
    if (name == 'refreshSoftwareData' && filter.value.type === '软件') loadData();
  }
});

const loading = ref(false);
/**
 * 筛选器
 */
const filter = ref({
  name: '',
  type: '用例',
  tabOptions: ['用例', '软件', '模板'],
  isOfficial: false,
  isFeatured: false,
});
const gridMode = ref(true);

const columns = [
  {
    name: 'display_name',
    label: '名称',
    field: 'display_name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'description',
    label: '描述',
    field: 'description',
    align: 'left',
  },
  {
    name: 'date_created',
    label: '发布时间',
    field: 'date_created',
    align: 'left',
    sortable: true,
  },
  { name: 'function', label: '操作', field: 'function', align: 'right' },
];
/**
 * 分页配置
 */
const pagination = ref({
  sortBy: 'date_created',
  descending: true,
  page: 1,
  rowsPerPage: 12,
  rowsNumber: 0,
});
/**
 * 列表
 */
const rows = ref<any>([]);

/**
 * 使用模板
 */
async function useFlow(template: any, event: any) {
  $q.loading.show();
  try {
    let draftId = await DraftService.saveMyDraft({
      templateId: template.uuid,
      name: template.display_name
        ? template.display_name
        : template.system_name
        ? template.system_name
        : '新建草稿' + date.formatDate(new Date(), 'YYYYMMDD'),
      description: template.description ? template.description : '',
      spec: template.spec,
    });
    $q.notify({
      type: 'positive',
      message: '草稿创建成功',
    });
    $q.loading.hide();
    toPage('/draft-editor?id=' + draftId, event);
  } catch (e) {
    $q.loading.hide();
  }
}
/**
 * 点击排序项
 */
const toggleSortBy = (columnName: string) => {
  if (!pagination.value.sortBy || pagination.value.sortBy !== columnName) {
    pagination.value.sortBy = columnName;
    pagination.value.descending = false;
  } else {
    if (!pagination.value.descending) {
      pagination.value.descending = true;
    } else {
      (pagination.value as any).sortBy = undefined;
    }
  }
  loadData();
};
/**
 * 点击排序项
 */
const toggleChildType = () => {
  pagination.value.page = 1;
  loadData();
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
// 收藏用户模板
const favor = async (id: string, content_repo_id: string | undefined) => {
  await UserFavoriteService.favor(
    filter.value.type === '模板' ? '1' : filter.value.type === '用例' ? '2' : '3',
    id,
    content_repo_id
  );
};
// 取消收藏用户模板
const unfavor = async (id: string) => {
  await UserFavoriteService.unfavor(id);
};
/**
 * 刷新列表数据
 */
const loadData = () => {
  onRequest({
    pagination: pagination.value,
    filter: filter.value.name,
  });
};
/**
 * 获取列表数据
 */
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  loading.value = true;
  try {
    if (filter.value.type === '模板') {
      pagination.value.rowsNumber = await ProjectService.getFlowsNumber(
        filter.value.name,
        filter.value.isOfficial,
        filter.value.isFeatured
      );
      rows.value = await ProjectService.getFlowsList(
        page,
        rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber,
        filter.value.name,
        sortBy,
        descending,
        filter.value.isOfficial,
        filter.value.isFeatured
      );
    } else if (filter.value.type === '用例') {
      pagination.value.rowsNumber = await ProjectService.getUsecaseNumber(
        filter.value.name,
        filter.value.isOfficial,
        filter.value.isFeatured
      );
      rows.value = await ProjectService.getUsecaseList(
        page,
        rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber,
        filter.value.name,
        sortBy,
        descending,
        filter.value.isOfficial,
        filter.value.isFeatured
      );
    } else {
      pagination.value.rowsNumber = await ProjectService.getSoftwareNumber(
        filter.value.name,
        filter.value.isOfficial,
        filter.value.isFeatured
      );
      rows.value = await ProjectService.getSoftwareList(
        page,
        rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber,
        filter.value.name,
        sortBy,
        descending,
        filter.value.isOfficial,
        filter.value.isFeatured
      );
    }
    for (let i = 0, len = rows.value.length; i < len; i++) {
      if (rows.value[i].uuid) {
        const isFavorite = await UserFavoriteService.isFavorite(rows.value[i].uuid);
        rows.value[i].isFavorite = isFavorite;
      }
    }
  } catch (e) {
    loading.value = true;
  }
  // 切换页码,则重置选择
  // if (pagination.value.page !== page) resetSelect();
  // 更新本地分页对象
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  // 结束加载
  loading.value = false;
};

onMounted(() => {
  if (commonStore.lastParams && commonStore.lastParams.type) {
    if (filter.value.type !== commonStore.lastParams.type) filter.value.type = commonStore.lastParams.type;
    if (filter.value.name !== commonStore.lastParams.name) filter.value.name = commonStore.lastParams.name;
    commonStore.lastParams = null;
  }
  loadData();
});

onUpdated(() => {
  if (commonStore.lastParams && commonStore.lastParams.type) {
    if (filter.value.type !== commonStore.lastParams.type) filter.value.type = commonStore.lastParams.type;
    if (filter.value.name !== commonStore.lastParams.name) filter.value.name = commonStore.lastParams.name;
    commonStore.lastParams = null;
  }
  loadData();
});
</script>

<style lang="scss" scoped>
.app-list-div {
  min-height: calc(100vh - 88px);
}
.filter-tab {
  height: 40px;
  line-height: 40px;
  width: 110px;
  padding: 0 12px;
  margin: 0 4px;
  border-radius: 8px;
  text-align: center;
  user-select: none;
  transition: all 0.5s;
}
.current-filter-tab {
  height: 40px;
  line-height: 40px;
  width: 110px;
  padding: 0 12px;
  margin: 0 4px;
  border-radius: 8px;
  text-align: center;
  user-select: none;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.5s;
}
.translucent-grid-table {
  margin-top: 0;
}
.filter-option {
  height: 40px;
  line-height: 40px;
  padding: 0 12px;
  margin: 0 4px;
  text-align: center;
  user-select: none;
}
.sort-option {
  height: 40px;
  line-height: 40px;
  padding: 0 12px;
  margin: 0 4px;
  text-align: center;
  width: 110px;
  user-select: none;
}
.sort-option .hover-up-icon {
  opacity: 0;
}
.sort-option:hover .hover-up-icon {
  opacity: 1;
  color: grey;
}
.sort-option .up-icon {
  color: black;
  transition: all 0.3s;
}
.sort-option .down-icon {
  color: black;
  transform: rotate(180deg);
  transition: all 0.3s;
}
.template-card .caption {
  height: 20px;
  opacity: 1;
  margin-top: 24px;
  transition: all 0.3s;
}
.template-card:hover .caption {
  height: 0;
  opacity: 0;
  margin-top: 0;
}
.template-card .btn {
  height: 0;
  opacity: 0;
  margin-top: 0;
  transition: all 0.3s;
}
.template-card:hover .btn {
  height: 36px;
  opacity: 1;
  margin-top: 8px;
}
.my-table .quasar-table tr:first-child,
.quasar-table td:first-child,
.quasar-table .q-td:first-child {
  border-image: none;
}
.my-input {
  height: 33.6px;
  :deep(.q-field__control) {
    height: 33.6px;
  }
  :deep(.q-field__append) {
    height: 33.6px;
  }
  :deep(.q-field__native) {
    text-align: right;
  }
}
.my-btn {
  :deep(.block) {
    color: rgba(0, 0, 0, 0.64);
    font-weight: 400;
  }
  :deep(.on-right) {
    color: $primary;
  }
}
</style>

<style lang="scss">
.translucent-grid-table .q-table__grid-content {
  margin: 0 -8px;
}
</style>
