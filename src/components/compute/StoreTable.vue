<!-- 选择用例&软件 组件 -->
<template>
  <q-table
    flat
    :rows="rows"
    :columns="!favorite ? (columns as any) : (favoriteColumns as any)"
    row-key="uuid"
    :loading="loading"
    no-data-label="没有可用数据！"
    no-results-label="找不到匹配结果！"
    loading-label="正在加载..."
    rows-per-page-label="每页大小"
    :filter="filter"
    v-model:pagination="pagination"
    @request="onRequest"
    style="background: transparent"
  >
    <template v-slot:top-left>
      <q-input rounded outlined dense debounce="300" v-model="filter" placeholder="搜索用例" :disable="favorite">
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template v-slot:top-right>
      <q-checkbox v-model="favorite" color="orange" label="已收藏" class="q-mr-md" @click="shOption" />
      <q-btn
        unelevated
        color="primary"
        label="刷新列表"
        @click="
          resetSelect();
          loadData();
        "
      />
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="radio" :props="props" auto-width>
          <q-radio v-model="selected" :val="props.row" @update:model-value="updateRadio(props)" />
        </q-td>
        <q-td key="display_name" :props="props">
          <div class="ellipsis" style="max-width: 20vw">
            <q-icon name="star" color="orange" size="xs" class="q-pr-sm" v-if="favorite || props.row.isFavorite">
              <q-tooltip class="text-white bg-orange" :offset="[8, 8]"> 已收藏 </q-tooltip> </q-icon
            >{{ props.row.display_name ? props.row.display_name : props.row.name ? props.row.name : '未命名' }}
          </div>
        </q-td>
        <q-td key="software_display_name" :props="props">
          <div class="ellipsis" style="max-width: 20vw">
            {{
              props.row.entity_dependency_obj?.display_name ? props.row.entity_dependency_obj?.display_name : '未命名'
            }}
          </div>
        </q-td>
        <q-td key="description" :props="props">
          <div class="ellipsis" style="max-width: 20vw">
            {{ props.row.description ? props.row.description : '-' }}
          </div>
        </q-td>
        <q-td key="date_created" :props="props" v-if="!favorite">
          {{ date.formatDate(props.row.date_created, 'YYYY/MM/DD HH:mm:ss') }}
        </q-td>
        <q-td key="created_at" :props="props" v-else>
          {{ date.formatDate(props.row.created_at, 'YYYY/MM/DD HH:mm:ss') }}
        </q-td>
        <q-td key="function" :props="props" auto-width>
          <q-btn
            flat
            color="grey-7"
            label="详情"
            class="q-px-sm"
            @click="detailDialog.open(props.row.uuid ? props.row.uuid : props.row.id)"
          />
        </q-td>
      </q-tr>
      <q-tr v-show="selected === props.row" :props="props">
        <q-td colspan="100%">
          <div class="row justify-end full-width" style="line-height: 40px">
            <span class="text-weight-medium">功能版本:</span>
            <q-select
              dense
              v-model="props.row.selectedVersion"
              :options="props.row.content_entity_versions"
              option-label="tag"
              outlined
              class="q-pl-sm q-pr-md"
              style="width: 120px"
              @update:model-value="saveSelected"
            />
            <div v-if="props.row.selectedVersion" class="row">
              <span class="text-weight-medium">软件名称:</span>
              <span class="q-pl-sm q-pr-md">
                {{ props.row.entity_dependency_obj?.display_name }}
              </span>
              <span class="text-weight-medium">软件版本:</span>
              <q-select
                dense
                v-model="props.row.selectedDependentVersion"
                :options="props.row.dependentVersions"
                option-label="version"
                outlined
                class="q-pl-sm"
                style="width: 120px"
                :loading="loadingDependentVersions"
                @update:model-value="saveSelected"
              />
            </div>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>

  <DetailDialog ref="detailDialog" />
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { date } from 'quasar';
import { NodeOriginData } from '../flow-draft-editor/interfaces';
import { ProjectService, UserFavoriteService, WorkflowSlotService } from 'src/service';
import DetailDialog from 'src/components/flow-draft-editor/dialog/DetailDialog.vue';

const emit = defineEmits(['selected']);

// 表格数据
const rows = ref<any>([]);
// 表格筛选器
const filter = ref('');
// 已选择行数据
const selected = ref<any>();
// 正在加载表格
const loading = ref(false);
// 正在加载依赖版本
const loadingDependentVersions = ref(false);
// 查看详情dialog
const detailDialog = ref();
// 表格属性
const columns = [
  {
    name: 'radio',
    field: 'radio',
    label: '',
    align: 'left',
  },
  {
    name: 'display_name',
    field: 'display_name',
    label: '用例',
    align: 'left',
    sortable: true,
  },
  {
    name: 'software_display_name',
    field: 'software_display_name',
    label: '软件',
    align: 'left',
  },
  {
    name: 'description',
    label: '描述',
    field: 'description',
    align: 'left',
  },
  {
    name: 'date_created',
    field: 'date_created',
    label: '创建时间',
    align: 'left',
    sortable: true,
  },
  { name: 'function', label: '操作', field: 'function', align: 'right' },
];
const favoriteColumns = [
  {
    name: 'radio',
    field: 'radio',
    label: '',
    align: 'left',
  },
  {
    name: 'display_name',
    field: 'display_name',
    label: '用例',
    align: 'left',
  },
  {
    name: 'software_display_name',
    field: 'software_display_name',
    label: '软件',
    align: 'left',
  },
  {
    name: 'description',
    label: '描述',
    field: 'description',
    align: 'left',
  },
  {
    name: 'created_at',
    field: 'created_at',
    label: '收藏时间',
    align: 'left',
    sortable: true,
  },
  { name: 'function', label: '操作', field: 'function', align: 'right' },
];
/**
 * 分页配置
 */
const pagination = ref({
  sortBy: 'date_updated',
  descending: true,
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
});
// 是否只看已收藏
const favorite = ref(false);

watch(selected, newVal => {
  if (!newVal || !newVal.selectedVersion || !newVal.selectedDependentVersion) emit('selected', undefined);
});

// 选择功能版本后加载软件版本
const updateRadio = async (props: any) => {
  props.row.selectedVersion = props.row.content_entity_versions[0];
  loadingDependentVersions.value = true;
  try {
    const res = await ProjectService.getContentVersionDependentContentVersionList(
      props.row.uuid ? props.row.uuid : props.row.id,
      props.row.selectedVersion.uuid,
      props.row.entity_dependency_obj.uuid
    );
    props.row.dependentVersions = res;
    props.row.selectedDependentVersion = res[0];
    saveSelected();
    loadingDependentVersions.value = false;
  } catch (e) {
    selected.value = undefined;
    loadingDependentVersions.value = false;
  }
};
// 保存选择的行数据
const saveSelected = async () => {
  let res;
  try {
    res = (await ProjectService.getGeneralContentToNodeById(
      selected.value?.selectedVersion?.uuid as string,
      selected.value?.selectedDependentVersion?.contentDependencyId as string
    )) as unknown as NodeOriginData;
    if (res === null || typeof res === 'undefined') {
      console.log('error: 组件不存在');
    } else {
      if (!res.requirements) res.requirements = { cpuCores: 56 };
      let nodeOriginData = WorkflowSlotService.analyTheNode(res, []) as unknown as NodeOriginData;
      // 更新节点data
      emit('selected', nodeOriginData);
    }
  } catch (e) {
    selected.value = undefined;
  }
};
// 重置选择
const resetSelect = () => {
  selected.value = undefined;
};
/**
 * 获取列表数据
 */
const onRequest = async (props: any) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  loading.value = true;
  try {
    if (!favorite.value) {
      const res = await ProjectService.getEntitiesNumber('d3a6c90e-29d0-4d50-b5f4-f6b67643864a', filter.value);
      pagination.value.rowsNumber = res;
      rows.value = await ProjectService.getEntitiesList(
        'd3a6c90e-29d0-4d50-b5f4-f6b67643864a',
        page,
        rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber,
        filter.value,
        sortBy,
        descending
      );
      for (let i = 0, len = rows.value.length; i < len; i++) {
        if (rows.value[i].uuid || rows.value[i].id) {
          const isFavorite = await UserFavoriteService.isFavorite(
            rows.value[i].uuid ? rows.value[i].uuid : rows.value[i].id
          );
          rows.value[i].isFavorite = isFavorite;
        }
      }
    } else {
      // 获取列表大小并更新rowsNumber
      pagination.value.rowsNumber = await UserFavoriteService.getListNumberEntities(
        'd3a6c90e-29d0-4d50-b5f4-f6b67643864a'
      );
      // 获取列表并更新rows
      const res = await UserFavoriteService.getListEntities(
        page,
        rowsPerPage !== 0 ? rowsPerPage : pagination.value.rowsNumber,
        sortBy,
        descending,
        'd3a6c90e-29d0-4d50-b5f4-f6b67643864a'
      );
      rows.value.length = 0;
      res.forEach(async (item: { favorite_id: string; created_at: string }) => {
        const detail = await ProjectService.getEntityDetail(item.favorite_id);
        if (detail) {
          (rows.value as any).push({
            created_at: item.created_at,
            ...detail,
          });
        }
      });
    }
  } catch (e) {
    loading.value = false;
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
// 加载表格数据
const loadData = () => {
  onRequest({
    pagination: pagination.value,
    filter: filter.value,
  });
};
// 重置配置
const resetOptions = () => {
  pagination.value = {
    sortBy: !favorite.value ? 'date_updated' : 'created_at',
    descending: true,
    page: 1,
    rowsPerPage: 5,
    rowsNumber: 0,
  };
  filter.value = '';
};
// 开关筛选项
const shOption = () => {
  resetOptions();
  resetSelect();
  loadData();
};

const reset = () => {
  favorite.value = false;
  resetOptions();
  resetSelect();
  loadData();
};

onMounted(() => {
  favorite.value = false;
  resetOptions();
  resetSelect();
  loadData();
});

defineExpose({
  loadData,
  reset,
});
</script>
