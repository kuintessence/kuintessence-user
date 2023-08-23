<template>
  <div class="full-width q-px-md q-pb-sm template-div q-pt-md">
    <div style="margin: 0 auto" class="q-py-sm row translucent-card q-px-md">
      <div class="row">
        <q-input
          rounded
          outlined
          dense
          bg-color="transparent"
          debounce="300"
          v-model="filter.name"
          :placeholder="'搜索用户模板名称'"
          style="width: 200px"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <div class="sort-option cursor-pointer" @click.prevent="toggleSortBy('name')" v-if="gridMode">
          名称
          <q-icon
            name="arrow_upward"
            :class="pagination.sortBy !== 'name' ? 'hover-up-icon' : pagination.descending ? 'down-icon' : 'up-icon'"
          />
        </div>
        <div class="sort-option cursor-pointer" @click.prevent="toggleSortBy('created_time')" v-if="gridMode">
          创建时间
          <q-icon
            name="arrow_upward"
            :class="
              pagination.sortBy !== 'created_time' ? 'hover-up-icon' : pagination.descending ? 'down-icon' : 'up-icon'
            "
          />
        </div>
      </div>
      <q-space />
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

    <q-table
      flat
      :rows="rows"
      :columns="(columns as any)"
      row-key="id"
      no-data-label="没有可用数据！"
      no-results-label="找不到匹配结果！"
      rows-per-page-label="每页大小"
      :filter="filter.name"
      :rows-per-page-options="[12, 24, 48, 0]"
      v-model:pagination="pagination"
      @request="onRequest"
      :grid="gridMode"
      :class="gridMode ? 'translucent-grid-table' : 'translucent-card'"
      class="q-mt-md"
      :loading="loading"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">{{ props.row.name }}</q-td>
          <q-td key="description" :props="props">
            <div class="ellipsis" style="max-width: 50vw">
              {{ props.row.description ? props.row.description : '-' }}
            </div>
          </q-td>
          <q-td key="created_time" :props="props">
            {{ date.formatDate(props.row.created_time, 'YYYY/MM/DD HH:mm:ss') }}
          </q-td>
          <q-td key="function" :props="props" auto-width class="text-grey">
            <q-btn
              dense
              flat
              color="orange"
              label="收藏"
              class="q-px-sm"
              :loading="loading"
              @click="favor(props.row.id)"
              v-if="!props.row.isFavorite"
            />
            <q-btn
              dense
              flat
              color="orange"
              label="取消收藏"
              class="q-px-sm"
              :loading="loading"
              @click="unfavor(props.row.id)"
              v-else
            />
            <q-btn flat color="primary" label="使用" class="q-px-sm" @click="useTemplate(props.row, $event)" />
            <q-btn flat dense icon="more_horiz" color="grey-7">
              <q-menu auto-close>
                <q-list>
                  <q-item clickable @click="editInfo(props.row)">
                    <q-item-section side> <q-icon name="edit" /> </q-item-section>
                    <q-item-section>修改信息</q-item-section>
                  </q-item>
                  <q-item clickable @click="deleteTemplate(props.row.id)">
                    <q-item-section side> <q-icon name="delete" /> </q-item-section>
                    <q-item-section>删除</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
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
                />
                <q-space />
                <q-btn
                  dense
                  flat
                  round
                  color="orange"
                  icon="star_border"
                  :loading="loading"
                  @click="favor(props.row.id)"
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
                  @click="unfavor(props.row.id)"
                  v-else
                  style="height: 36px"
                >
                  <q-tooltip :offset="[8, 8]"> 取消收藏 </q-tooltip>
                </q-btn>
              </div>
              <div class="ellipsis text-body1 text-weight-medium q-pt-md">{{ props.row.name }}</div>
              <div class="ellipsis-2-lines text-body1 q-pt-xs" style="height: 52px">
                描述：{{ props.row.description ? props.row.description : '-' }}
              </div>
              <div class="text-grey-7 text-body2 q-pt-md">
                {{ date.formatDate(props.row.created_time, 'YYYY/MM/DD HH:mm:ss') }}
              </div>
            </q-card-section>
            <q-card-actions align="center" class="q-pt-none">
              <q-btn
                dense
                unelevated
                color="primary"
                label="使用"
                @click="useTemplate(props.row, $event)"
                class="q-mb-sm"
              />
              <q-btn dense unelevated color="grey-7" label="更多" class="q-mb-sm">
                <q-menu auto-close>
                  <q-list>
                    <q-item clickable @click="editInfo(props.row)">
                      <q-item-section side> <q-icon name="edit" /> </q-item-section>
                      <q-item-section>修改信息</q-item-section>
                    </q-item>
                    <q-item clickable @click="deleteTemplate(props.row.id)">
                      <q-item-section side> <q-icon name="delete" /> </q-item-section>
                      <q-item-section>删除</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
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

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { DraftService, TemplateService, UserFavoriteService } from 'src/service';
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
    if (name == 'refreshUserTemplateData') loadData();
    if (name == 'refreshUserFavoriteData') loadData();
  }
});

const loading = ref(false);
/**
 * 筛选器
 */
const filter = ref({
  name: '',
  tab: ['全部', '全部'],
  tabOptions: [
    ['全部', '天文', '材料', '计算', '生物'],
    ['全部', '免费', '收费'],
  ],
  isIndependent: false,
  byUser: false,
  resource: '全部可用集群',
  resourceOptions: ['全部可用集群', '1', '2', '3'],
  favorite: false,
});
const gridMode = ref(true);
/**
 * dialog
 */
const prompt = ref(false);
const promptData = ref({ id: '', name: '', description: '' });

const columns = [
  {
    name: 'name',
    label: '名称',
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
  rowsPerPage: 12,
  rowsNumber: 0,
});
/**
 * 工作流模板列表
 */
const rows = ref<any>([]);

/**
 * 使用模板
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
    // 获取列表大小并更新rowsNumber
    pagination.value.rowsNumber = await TemplateService.getListNumber(filter.value.name);
    // 获取列表并更新rows
    rows.value = await TemplateService.getList(
      page,
      rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber,
      filter.value.name,
      sortBy,
      descending
    );
    for (let i = 0, len = rows.value.length; i < len; i++) {
      if (rows.value[i].id) {
        const isFavorite = await UserFavoriteService.isFavorite(rows.value[i].id);
        rows.value[i].isFavorite = isFavorite;
      }
    }
  } catch (e) {
    loading.value = true;
  }
  // 更新本地分页对象
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  // 结束加载
  loading.value = false;
};
// 收藏用户模板
const favor = async (id: string) => {
  await UserFavoriteService.favor('0', id, undefined);
};
// 取消收藏用户模板
const unfavor = async (id: string) => {
  await UserFavoriteService.unfavor(id);
};
/**
 * 删除模板
 */
const deleteTemplate = async (id: string) => {
  try {
    await TemplateService.delMyTemplate(id);
    $q.notify({
      type: 'positive',
      message: '删除成功',
    });
    loadData();
  } catch (e) {
    console.log('error: 删除失败');
  }
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
  const result = await TemplateService.updateMyTemplate(promptData.value);
  if (result) {
    $q.notify({
      type: 'positive',
      message: '修改成功',
    });
    loadData();
  } else {
    console.log('error: 修改失败');
  }
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.template-div {
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
