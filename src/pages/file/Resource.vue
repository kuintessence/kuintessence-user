<template>
  <div class="flow-content">
    <div class="tab-content">
      <q-tabs dense align="left" v-model="currentTab">
        <q-tab
          class="tab-item rounded-borders"
          :class="{ active: currentTab == ti }"
          :name="ti"
          :label="tab.label"
          @click.stop="tab.fun()"
          v-for="(tab, ti) in tabs"
          :key="ti"
        />
      </q-tabs>
    </div>
    <div class="list-content">
      <q-table
        flat
        square
        virtual-scroll
        class="quasar-table"
        :rows="rows"
        :columns="(columns as any)"
        row-key="index"
        rows-per-page-label="每页数量"
        :pagination-label="
          totalRowsNumber => {
            return `共${totalRowsNumber}条数据`;
          }
        "
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="fileName" :props="props" width="100%" style="cursor: pointer">
              {{ props.row.fileName }}
              <span style="float: right; position: relative" @click.stop="clickDropIcon(props.rowIndex)">
                <span class="more-span" @click.stop="">
                  <q-icon class="icon" size="20px" name="more_horiz" />
                  <drop-menu :menus="menus"></drop-menu>
                </span>
              </span>
            </q-td>
            <q-td key="flowName" :props="props">
              {{ props.row.flowName }}
            </q-td>
            <q-td key="fileSize" :props="props">
              {{ props.row.fileSize }}
            </q-td>
            <q-td key="state" :props="props">
              <state :state="props.row.state" :progress="props.row.progress" />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'FileResource',
};
</script>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import State from 'src/components/store/InstanceState.vue';
import { ResourceService } from 'src/service';
import DropMenu from 'src/components/common/DropMenu.vue';

const columns = [
  { name: 'fileName', label: '名称', field: 'fileName', sortable: true, align: 'left' },
  { name: 'flowName', label: '所属作业', field: 'flowName', sortable: true, align: 'left' },
  { name: 'fileSize', label: '数据大小', field: 'fileSize', sortable: true, align: 'left' },
  { name: 'state', label: '状态', field: 'state', sortable: true, align: 'left' },
];

const rows: any = reactive([]);
function getList(is: boolean) {
  let list = ResourceService.getList(is);
  rows.length = 0;
  rows.push(...list);
}
getList(true);

const tabs = reactive([
  {
    label: '平台数据',
    num: 3,
    fun: () => {
      getList(true);
    },
  },
  {
    label: '计算环境数据',
    num: 3,
    fun: () => {
      getList(false);
    },
  },
]);
const currentTab = ref(0);
function hideAllMenu(index = -1) {
  rows.forEach((row: any, _index: number) => {
    if (_index != index) row.menu_show = false;
  });
}
function clickDropIcon(index: number) {
  hideAllMenu(index);
  rows[index].menu_show = !rows[index].menu_show;
}
const menus = [
  { label: '下载', icon: 'file_download' },
  { label: '重命名', icon: 'edit' },
];
</script>

<style lang="scss" scoped>
.flow-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  color: #333;
  padding: 8px 16px;
  .tab-content {
    margin-bottom: 10px;
    .tab-item {
      height: 50px;
      min-width: 50px;
      margin-right: 20px;
      &.active {
        color: #1976d2;
      }
    }
  }
  .list-content {
    flex: 1;
    overflow: auto;
  }

  .more-span {
    position: relative;
    float: right;
    color: #999;
    padding: 0 10px;
    &:hover {
      color: #333;
    }
  }
}

.name-content {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: row;
  align-items: center;
  vertical-align: middle;
  max-width: unset;
  .desc {
    margin-left: 5px;
    font-size: 12px;
    color: #999;
  }
}
</style>
