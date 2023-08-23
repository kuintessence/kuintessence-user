<template>
  <div class="q-px-md q-pb-sm q-pt-lg">
    <div class="translucent-card q-py-sm q-mb-md q-px-md">
      <div class="row items-center">
        <div class="filter-tab text-weight-medium text-grey-8">类型</div>
        <div
          :class="[item.type == filter.type ? 'current-filter-tab' : 'filter-tab']"
          class="cursor-pointer"
          v-for="(item, index) in filter.tabOptions"
          :key="index"
          @click="
            pagination.page = 1;
            filter.type = item.type;
            loadData();
          "
        >
          {{ item.label }}
        </div>
      </div>
    </div>

    <div style="margin: 0 auto" class="q-px-md q-py-sm row translucent-card">
      <div class="row" v-if="gridMode">
        <div class="sort-option text-weight-medium text-grey-8">综合排序</div>
        <div class="sort-option cursor-pointer" @click.prevent="toggleSortBy('created_at')">
          收藏时间
          <q-icon
            name="arrow_upward"
            :class="
              pagination.sortBy !== 'created_at' ? 'hover-up-icon' : pagination.descending ? 'down-icon' : 'up-icon'
            "
          />
        </div>
      </div>
      <q-space />
      <q-checkbox v-model="gridMode" label="网格视图" class="q-pr-md" />
      <q-btn unelevated color="primary" label="刷新列表" @click="loadData" />
    </div>

    <q-table
      flat
      :rows="rows"
      :columns="(columns as any)"
      row-key="user_favorite_id"
      no-data-label="没有可用数据！"
      no-results-label="找不到匹配结果！"
      rows-per-page-label="每页大小"
      :rows-per-page-options="[6, 12, 24, 48, 0]"
      v-model:pagination="pagination"
      @request="onRequest"
      :grid="gridMode"
      :class="gridMode ? 'translucent-grid-table' : 'translucent-card'"
      class="q-mt-md"
      :loading="loading"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">
            <div class="ellipsis" style="max-width: 20vw">
              {{ props.row.name }}
            </div>
          </q-td>
          <q-td key="description" :props="props">
            <div class="ellipsis" style="max-width: 20vw">
              {{ props.row.description ? props.row.description : '-' }}
            </div>
          </q-td>
          <q-td key="created_at" :props="props">
            {{ date.formatDate(props.row.created_at, 'YYYY/MM/DD HH:mm:ss') }}
          </q-td>
          <q-td key="function" :props="props" auto-width class="text-grey">
            <q-btn
              dense
              flat
              color="orange"
              label="取消收藏"
              class="q-px-sm"
              @click="unfavor(props.row.uuid ? props.row.uuid : props.row.id)"
            />
            <q-btn
              flat
              color="primary"
              label="使用"
              class="q-px-sm"
              @click="useTemplate(props.row, $event)"
              v-if="props.row.type == '0' || props.row.type == '1'"
            />
            <q-btn
              flat
              color="grey-7"
              label="详情"
              class="q-px-sm"
              @click="
                toPage(
                  (props.row.type == '1'
                    ? '/official-template?id='
                    : props.row.type == '2'
                    ? '/usecase-detail?id='
                    : '/software-detail?id=') + props.row.id,
                  $event
                )
              "
              v-if="props.row.type != '0'"
            />
          </q-td>
        </q-tr>
      </template>

      <template v-slot:item="props">
        <div class="col-xs-6 col-sm-4 col-md-3">
          <q-card class="translucent-grid-card template-card">
            <q-card-section>
              <div class="row">
                <q-icon
                  name="r_draw"
                  size="30px"
                  class="bg-white text-primary"
                  style="height: 50px; width: 50px; border-radius: 4px"
                  v-if="props.row.type == '0'"
                />
                <q-icon
                  name="r_api"
                  size="30px"
                  class="bg-white text-primary"
                  style="height: 50px; width: 50px; border-radius: 4px"
                  v-else
                />
                <q-space />
                <q-btn
                  dense
                  flat
                  round
                  color="orange"
                  icon="star"
                  @click="unfavor(props.row.uuid ? props.row.uuid : props.row.id)"
                  style="height: 36px"
                >
                  <q-tooltip :offset="[8, 8]"> 取消收藏 </q-tooltip>
                </q-btn>
              </div>
              <div class="text-body1 text-weight-medium ellipsis q-pt-md">{{ props.row.name }}</div>
              <div class="text-caption ellipsis-2-lines q-pt-sm" style="height: 48px">
                描述：{{ props.row.description ? props.row.description : '-' }}
              </div>
              <div class="text-grey-7 text-body2 q-pt-md">
                收藏于 {{ date.formatDate(props.row.created_at, 'YYYY/MM/DD') }}
              </div>
            </q-card-section>
            <q-card-actions align="center" class="q-pt-none">
              <q-btn
                dense
                unelevated
                color="primary"
                label="使用"
                @click="useTemplate(props.row, $event)"
                v-if="props.row.type == '0' || props.row.type == '1'"
                class="q-mb-sm"
              />
              <q-btn
                dense
                unelevated
                color="grey-7"
                label="详情"
                @click="
                  toPage(
                    (props.row.type == '1'
                      ? '/official-template?id='
                      : props.row.type == '2'
                      ? '/usecase-detail?id='
                      : '/software-detail?id=') + props.row.id,
                    $event
                  )
                "
                v-if="props.row.type != '0'"
                class="q-mb-sm"
              />
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { DraftService, ProjectService, TemplateService, UserFavoriteService } from 'src/service';
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
  if (!loading.value && name == 'refreshUserFavoriteData') loadData();
});

const loading = ref(false);
const gridMode = ref(true);
/**
 * 筛选器
 */
const filter = ref({
  type: '0',
  tabOptions: [
    { type: '0', label: '用户模板' },
    { type: '1', label: '模板' },
    { type: '2', label: '用例' },
    { type: '3', label: '软件' },
  ],
});
const columns = [
  {
    name: 'name',
    label: '模板名称',
    field: 'name',
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
    name: 'created_at',
    label: '收藏时间',
    field: 'created_at',
    align: 'left',
    sortable: true,
  },
  { name: 'function', label: '操作', field: 'function', align: 'right' },
];
/**
 * 分页配置
 */
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 12,
  rowsNumber: 0,
});
/**
 * 工作流模板列表
 */
const rows = ref<any>([]);

/**
 * 使用用户/模板
 */
async function useTemplate(template: any, event: any) {
  $q.loading.show();
  try {
    let draftId = await DraftService.saveMyDraft({
      templateId: template.id,
      name: template.name,
      description: template.description,
      spec: template.spec,
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
// 取消收藏
const unfavor = async (id: string) => {
  await UserFavoriteService.unfavor(id);
};
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
 * 跳转路由
 */
const toPage = (fullPath: string, event: any) => {
  if (fullPath !== route.fullPath) {
    const { x, y } = event;
    commonStore.animate(x, y, fullPath);
  }
};
/**
 * 刷新列表数据
 */
const loadData = () => {
  onRequest({
    pagination: pagination.value,
  });
};
/**
 * 获取列表数据
 */
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  loading.value = true;
  try {
    // 获取列表大小并更新rowsNumber
    pagination.value.rowsNumber = await UserFavoriteService.getListNumber(filter.value.type);
    // 获取列表并更新rows
    const res = await UserFavoriteService.getList(
      filter.value.type,
      page,
      rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber,
      sortBy,
      descending
    );
    rows.value = [];
    if (filter.value.type === '0') {
      for (let i = 0, len = res.length; i < len; i++) {
        const detail = await TemplateService.getDetail(res[i].favorite_id);
        if (detail) {
          rows.value.push({
            user_favorite_id: res[i].id,
            created_at: res[i].created_at,
            type: res[i].type,
            ...detail,
          });
        }
      }
    } else if (filter.value.type === '1') {
      for (let i = 0, len = res.length; i < len; i++) {
        const detail = await ProjectService.getTemplateDetail(res[i].favorite_id);
        if (detail) {
          rows.value.push({
            user_favorite_id: res[i].id,
            created_at: res[i].created_at,
            type: res[i].type,
            ...detail,
          });
        }
      }
    } else {
      for (let i = 0, len = res.length; i < len; i++) {
        const detail = await ProjectService.getEntityDetail(res[i].favorite_id);
        if (detail) {
          rows.value.push({
            user_favorite_id: res[i].id,
            created_at: res[i].created_at,
            type: res[i].type,
            ...detail,
          });
        }
      }
    }
  } catch (e) {
    loading.value = false;
  }
  // 更新本地分页对象
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  // 结束加载
  loading.value = false;
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
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
</style>

<style lang="scss">
.translucent-grid-table .q-table__grid-content {
  margin: 0 -8px;
}
</style>
