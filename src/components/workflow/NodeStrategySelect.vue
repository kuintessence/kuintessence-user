<template>
  <q-select
    dense
    outlined
    v-model="selectedStrategy"
    :options="[
      {
        label: '自动',
        value: 'Auto',
      },
      {
        label: '优先',
        value: 'Prefer',
      },
      {
        label: '手动',
        value: 'Manual',
      },
      {
        label: '待定',
        value: 'Unknown',
      },
    ]"
    class="col q-ml-none"
    emit-value
    map-options
    @update:model-value="changeStrategy"
  />
  <q-btn
    dense
    color="primary"
    label="选择"
    @click="openResourceDialog = true"
    class="col-3 q-ml-sm"
    v-if="selectedStrategy === 'Prefer' || selectedStrategy === 'Manual'"
    style="height: 36px; margin-top: 2px"
  />

  <q-dialog
    v-model="openResourceDialog"
    @update:model-value="close"
    @escape-key="close"
    :maximized="maximized"
    :full-width="maximized"
  >
    <q-card class="frosted-glass-card" style="min-width: 60vw">
      <q-card-section style="max-height: 80vh" class="scroll q-pa-none">
        <q-table
          flat
          title="选择资源"
          :rows="rows"
          :columns="(columns as any)"
          row-key="id"
          :loading="loading"
          no-data-label="没有可用数据！"
          no-results-label="找不到匹配结果！"
          loading-label="正在加载..."
          rows-per-page-label="每页大小"
          :filter="filter"
          style="background: transparent"
        >
          <template v-slot:top-right>
            <div class="text-grey-7 q-pr-md">已选择 {{ queues?.length }} 项</div>
            <q-input dense filled debounce="300" v-model="filter" placeholder="搜索..." class="q-pr-md">
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn dense flat icon="crop_square" v-if="!maximized" @click="maximized = true">
              <q-tooltip :offset="[8, 8]"> 最大化 </q-tooltip>
            </q-btn>
            <q-btn dense flat icon="minimize" v-else @click="maximized = false">
              <q-tooltip :offset="[8, 8]"> 最小化 </q-tooltip>
            </q-btn>
            <q-btn dense flat icon="close" @click="close">
              <q-tooltip :offset="[8, 8]"> 关闭 </q-tooltip>
            </q-btn>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="radio" :props="props">
                <q-checkbox v-model="selected" :val="props.row.id" @update:model-value="changeClusters" />
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.name ? props.row.name : '-' }}
              </q-td>
              <q-td key="cluster_name" :props="props">
                {{ props.row?.cluster?.name ? props.row.cluster.name : '-' }}
              </q-td>
              <q-td key="scheduler_tech" :props="props">
                {{ props.row.scheduler_tech === 0 ? 'Slurm' : props.row.scheduler_tech === 1 ? 'Pbs' : '-' }}
              </q-td>
              <q-td key="node_count" :props="props">
                {{ props.row.node_count ? props.row.node_count : '-' }}
              </q-td>
              <q-td key="core_number" :props="props">
                {{ props.row.core_number ? props.row.core_number : '-' }}
              </q-td>
              <q-td key="memory" :props="props">
                {{ props.row.memory ? dynamicUnit(props.row.memory)[0] + ' ' + dynamicUnit(props.row.memory)[1] : '-' }}
              </q-td>
              <q-td key="storage_capacity" :props="props">
                {{
                  props.row.storage_capacity
                    ? dynamicUnit(props.row.storage_capacity)[0] + ' ' + dynamicUnit(props.row.storage_capacity)[1]
                    : '-'
                }}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, onUpdated, ref } from 'vue';
import { ResourceService } from 'src/service';

const props = defineProps({
  schedulingStrategy: {
    type: String,
    default: 'Auto',
  },
  queues: {
    type: Array,
    default: undefined,
  },
});
const emit = defineEmits(['changeStrategy', 'changeClusters']);

const maximized = ref(false);
const selectedStrategy = ref('');
const selected = ref<any>([]);
const columns = [
  {
    name: 'radio',
    field: 'radio',
    label: '',
    align: 'left',
  },
  {
    name: 'name',
    field: 'name',
    label: '队列名称',
    align: 'left',
  },
  {
    name: 'cluster_name',
    field: 'cluster_name',
    label: '集群名称',
    align: 'left',
  },
  {
    name: 'scheduler_tech',
    field: 'scheduler_tech',
    label: '调度系统',
    align: 'left',
  },
  {
    name: 'node_count',
    field: 'node_count',
    label: '节点数',
    align: 'left',
  },
  {
    name: 'core_number',
    field: 'core_number',
    label: '核心数',
    align: 'left',
  },
  {
    name: 'memory',
    field: 'memory',
    label: '内存',
    align: 'left',
  },
  {
    name: 'storage_capacity',
    field: 'storage_capacity',
    label: '存储',
    align: 'left',
  },
];
const rows = ref([]);
const openResourceDialog = ref(false);
const loading = ref(false);
const filter = ref('');

const close = () => {
  openResourceDialog.value = false;
  maximized.value = false;
};

const changeStrategy = () => {
  emit('changeStrategy', selectedStrategy.value);
};
const changeClusters = () => {
  emit('changeClusters', selected.value);
};

// 读取本地数据
const loadData = async () => {
  loading.value = true;
  selectedStrategy.value = props.schedulingStrategy;
  selected.value = props.queues;
  try {
    rows.value = await ResourceService.getQueueList();
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};

const dynamicUnit = (number: number) => {
  const units = [
    { unit: 'B', value: 1 },
    { unit: 'KB', value: 1024 },
    { unit: 'MB', value: 1024 ** 2 },
    { unit: 'GB', value: 1024 ** 3 },
    { unit: 'TB', value: 1024 ** 4 },
    { unit: 'PB', value: 1024 ** 5 },
    { unit: 'EB', value: 1024 ** 6 },
    { unit: 'ZB', value: 1024 ** 7 },
    { unit: 'YB', value: 1024 ** 8 },
  ];
  let result = number;
  let unit = 'B';

  for (let i = units.length - 1; i >= 0; i--) {
    const { unit: currentUnit, value } = units[i];
    if (number >= value) {
      result = number / value;
      unit = currentUnit;
      break;
    }
  }

  return [result.toFixed(2), unit];
};

onMounted(() => {
  loadData();
});

onUpdated(() => {
  loadData();
});
</script>

<style scoped></style>
