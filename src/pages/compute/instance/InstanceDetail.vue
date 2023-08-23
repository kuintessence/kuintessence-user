<template>
  <q-page class="page-pt page-px q-pb-md q-col-gutter-md">
    <div class="detail-container frosted-glass-card">
      <div class="title-container full-height">
        <div class="title">
          {{ info.name }}
          <state class="state" :state="info.status" />
          <q-btn flat dense color="primary" class="q-ml-sm" v-if="allInputFileList.length">
            查看全部输入文件
            <q-menu>
              <q-list bordered>
                <q-item clickable v-ripple v-for="file in allInputFileList" :key="file.id">
                  <q-item-section>{{ file.name }}</q-item-section>
                  <q-item-section top side>
                    <div class="text-grey-8 q-gutter-xs">
                      <q-btn class="gt-xs" size="12px" flat dense round icon="cloud" @click="saveYun(file)">
                        <q-tooltip>保存到云文件</q-tooltip>
                      </q-btn>
                      <q-btn class="gt-xs" size="12px" flat dense round icon="file_download" @click="download(file)">
                        <q-tooltip>下载到本地</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn flat dense color="primary" class="q-ml-sm" v-if="allOutFileList.length">
            查看全部输出结果
            <q-menu>
              <q-list bordered>
                <q-item clickable v-ripple v-for="file in allOutFileList" :key="file.id">
                  <q-item-section>{{ file.name }}</q-item-section>
                  <q-item-section top side>
                    <div class="text-grey-8 q-gutter-xs">
                      <q-btn class="gt-xs" size="12px" flat dense round icon="file_download" @click="download(file)">
                        <q-tooltip>下载到本地</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
        <div class="btns">
          <q-btn
            unelevated
            color="white"
            text-color="black"
            label="刷新"
            class="q-mr-sm"
            @click="getInfo"
            :disabled="
              (info as any).status === InstanceState.created.value ||
              (info as any).status === InstanceState.paused.value ||
              (info as any).status === InstanceState.finished.value ||
              (info as any).status === InstanceState.error.value ||
              (info as any).status === InstanceState.stopped.value
            "
          />
          <q-btn unelevated color="secondary" text-color="white" label="修改信息" class="q-mr-sm" @click="editInfo" />
          <q-btn
            unelevated
            color="primary"
            label="开始"
            class="q-mr-sm"
            @click="runInstance"
            v-if="info.status == InstanceState.created.value"
          />
          <q-btn
            unelevated
            color="primary"
            label="暂停"
            class="q-mr-sm"
            @click="pauseInstance"
            v-if="info.status == InstanceState.running.value || info.status == InstanceState.pending.value"
          />
          <q-btn
            unelevated
            color="primary"
            label="继续"
            class="q-mr-sm"
            @click="continueInstance"
            v-if="info.status == InstanceState.paused.value"
          />
          <q-btn
            unelevated
            color="primary"
            label="终止"
            class="q-mr-sm"
            @click="terminateInstance"
            v-if="
              info.status === InstanceState.running.value ||
              info.status === InstanceState.pending.value ||
              info.status === InstanceState.paused.value
            "
          />
          <q-btn
            unelevated
            color="red"
            label="终止并删除"
            @click="terminateAndDelete"
            v-if="
              info.status === InstanceState.running.value ||
              info.status === InstanceState.pending.value ||
              info.status === InstanceState.paused.value
            "
          />
          <q-btn
            unelevated
            color="red"
            label="删除"
            @click="delMy"
            v-if="
              info.status === InstanceState.finished.value ||
              info.status === InstanceState.error.value ||
              info.status === InstanceState.stopped.value
            "
          />
        </div>
      </div>
      <q-separator class="q-my-md" />
      <div class="content-container">
        <div class="left">
          <div class="desc-container" v-if="info.description">描述：{{ info.description }}</div>

          <q-table
            flat
            square
            virtual-scroll
            class="quasar-table"
            :rows="nodeList"
            :columns="(columns as any)"
            row-key="index"
            :pagination="{ rowsPerPage: 20 }"
            rows-per-page-label="每页数量"
            :pagination-label="
              (firstRowIndex, endRowIndex, totalRowsNumber) => {
                return `共${totalRowsNumber}条数据`;
              }
            "
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="status" :props="props">
                  <node-state :state="props.row.status" />
                  <q-icon
                    color="negative"
                    name="expand_more"
                    @click="!props.row.showLog ? (props.row.showLog = true) : (props.row.showLog = false)"
                    size="20px"
                    class="cursor-pointer"
                    :class="[!props.row.showLog ? 'expand-more' : 'expand-less']"
                    v-if="props.row.status === InstanceNodeState.error.value"
                  >
                    <q-tooltip
                      v-model="props.row.showLog"
                      no-parent-event
                      max-width="500px"
                      class="bg-red-2 text-negative"
                      style="pointer-events: all !important"
                    >
                      <div class="text-subtitle1 text-weight-medium row" style="user-select: none">
                        错误日志
                        <q-space />
                        <q-icon
                          color="negative"
                          name="content_copy"
                          size="16px"
                          @click="copyText(props.row.log)"
                          class="cursor-pointer q-mr-xs"
                          style="height: 28px"
                        />
                        <q-icon
                          color="negative"
                          name="close"
                          size="20px"
                          @click="props.row.showLog = false"
                          class="cursor-pointer"
                          style="height: 28px"
                        />
                      </div>
                      <div>{{ props.row.log }}</div>
                    </q-tooltip>
                  </q-icon>
                </q-td>
                <q-td key="queue" :props="props">
                  {{ props.row.queue?.name ? props.row.queue.name : '-' }}
                </q-td>
                <q-td key="cmd" :props="props">
                  <span class="row items-center justify-center" v-if="props.row.cmd">
                    <span class="text-grey ellipsis" style="display: inline-block; max-width: 74px">{{
                      props.row.cmd
                    }}</span>
                    <q-icon
                      color="primary"
                      name="expand_more"
                      @click="!props.row.showCmd ? (props.row.showCmd = true) : (props.row.showCmd = false)"
                      size="20px"
                      class="cursor-pointer"
                      :class="[!props.row.showCmd ? 'expand-more' : 'expand-less']"
                    >
                      <q-tooltip
                        v-model="props.row.showCmd"
                        no-parent-event
                        max-width="500px"
                        class="bg-white text-primary"
                        style="pointer-events: all !important"
                      >
                        <div class="text-subtitle1 text-weight-medium row" style="user-select: none; min-width: 200px">
                          运行命令
                          <q-space />
                          <q-icon
                            color="negative"
                            name="close"
                            size="20px"
                            @click="props.row.showCmd = false"
                            class="cursor-pointer"
                            style="height: 28px"
                          />
                        </div>
                        <div class="text-grey q-mt-md q-mb-sm">
                          {{ props.row.cmd }}
                        </div>
                      </q-tooltip>
                    </q-icon>
                  </span>
                  <div class="text-grey-7" v-else>-</div>
                </q-td>
                <q-td key="time" :props="props">
                  <div class="text-grey-7" v-if="props.row.resource_meter">
                    <div>
                      开始：{{
                        props.row.resource_meter?.start_time
                          ? date.formatDate(props.row.resource_meter.start_time * 1000, 'YYYY/MM/DD HH:mm:ss')
                          : '-'
                      }}
                    </div>
                    <div>
                      结束：{{
                        props.row.resource_meter?.end_time
                          ? date.formatDate(props.row.resource_meter.end_time * 1000, 'YYYY/MM/DD HH:mm:ss')
                          : '-'
                      }}
                    </div>
                  </div>
                  <div class="text-grey-7" v-else>-</div>
                </q-td>
                <q-td key="file" :props="props">
                  <div v-if="props.row.inputFileList && props.row.inputFileList.length">
                    <q-btn dense flat color="primary">
                      查看输入文件
                      <q-menu>
                        <q-list bordered>
                          <q-item clickable v-ripple v-for="file in props.row.inputFileList" :key="file.id">
                            <q-item-section>{{ file.name }}</q-item-section>
                            <q-item-section top side>
                              <div class="text-grey-8 q-gutter-xs">
                                <q-btn class="gt-xs" size="12px" flat dense round icon="cloud" @click="saveYun(file)">
                                  <q-tooltip>保存到云文件</q-tooltip>
                                </q-btn>
                                <q-btn
                                  class="gt-xs"
                                  size="12px"
                                  flat
                                  dense
                                  round
                                  icon="file_download"
                                  @click="download(file)"
                                >
                                  <q-tooltip>下载到本地</q-tooltip>
                                </q-btn>
                              </div>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                  <div v-if="props.row.outFileList && props.row.outFileList.length">
                    <q-btn dense flat color="primary">
                      查看输出结果
                      <q-menu>
                        <q-list bordered>
                          <q-item clickable v-ripple v-for="file in props.row.outFileList" :key="file.id">
                            <q-item-section>{{ file.name }}</q-item-section>
                            <q-item-section top side>
                              <div class="text-grey-8 q-gutter-xs">
                                <q-btn
                                  class="gt-xs"
                                  size="12px"
                                  flat
                                  dense
                                  round
                                  icon="file_download"
                                  @click="download(file)"
                                >
                                  <q-tooltip>下载到本地</q-tooltip>
                                </q-btn>
                              </div>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                </q-td>
                <q-td key="preview" :props="props">
                  <div v-if="props.row.outPreviewList && props.row.outPreviewList.length">
                    <q-btn dense flat color="primary">
                      预览输出文件
                      <q-menu>
                        <q-list bordered>
                          <q-item clickable v-ripple v-for="file in props.row.outPreviewList" :key="file.id">
                            <q-item-section>{{ file.name }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                  <div class="text-grey-7" v-else>-</div>
                </q-td>
              </q-tr>
            </template>
          </q-table>

          <q-card flat class="q-my-md translucent-card shadow" v-if="nodeList.length && nodeList.length > 1">
            <q-card-section class="q-pb-sm">
              <div class="text-subtitle1 text-weight-medium">可视化展示</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <InstanceViewer :json="info" :nodeList="nodeList" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-inner-loading :showing="loading" style="border-radius: 16px">
        <q-spinner-ios size="50px" color="primary" />
      </q-inner-loading>
    </div>
  </q-page>

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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { InstanceService, InstanceState, InstanceNodeState, CloudFileService, UploadService } from 'src/service';
import State from 'components/store/InstanceState.vue';
import NodeState from 'components/store/InstanceNodeState.vue';
import { useQuasar, copyToClipboard } from 'quasar';
import { useRefreshStore } from 'src/stores/refresh';
import InstanceViewer from 'src/components/flow-draft-editor/instance-viewer/InstanceViewer.vue';
import { useKeepAliveStore } from 'src/stores/keep-alive';
import { FileService } from 'src/util/file';
import { date } from 'quasar';

const route = useRoute();
const $q = useQuasar();
const keepAliveStore = useKeepAliveStore();
const refreshStore = useRefreshStore();

// 监听数据变化，自动更新
refreshStore.$onAction(async ({ name }) => {
  if (!loading.value && name == 'refreshInstanceData') getInfo();
});

const loading = ref(false);
/**
 * dialog
 */
const prompt = ref(false);
const promptData = ref({ id: '', name: '', description: '' });
//获取详情
let id: any = route.query.id;
const info: any = ref({});

//下载输出文件
async function download(file: any) {
  let url: string = UploadService.getDownFileUrl(file.id);
  FileService.downLoadFile({ fileName: file.name, url });
}
async function saveYun(file: any) {
  await CloudFileService.addFile({ name: file.name, isDict: false, fileId: file.id });
  $q.notify({
    message: '保存成功',
    type: 'success',
  });
}

const nodeList: any = ref([]);
//获取详情
async function getInfo() {
  if (id) {
    try {
      const res = await InstanceService.getDetail(id);
      if (!res) {
        console.log('error: 任务不存在');
        keepAliveStore.deleteTabByPath('/instance-detail?id=' + id);
      } else {
        keepAliveStore.tabList.forEach(tab => {
          if (tab.fullPath === route.fullPath)
            tab.meta.title = res.name ? res.name + ' - 任务详情' : '未命名任务 - 任务详情';
        });
        info.value = res;
        getNodeList();
      }
    } catch (e) {
      keepAliveStore.deleteTabByPath(route.fullPath);
    }
  } else {
    console.log('error: 缺少参数');
    keepAliveStore.deleteTabByPath(route.fullPath);
  }
}

//获取任务节点
const columns = ref([
  { name: 'name', field: 'name', label: '节点', sortable: true, align: 'left' },
  { name: 'status', label: '状态', field: 'status', sortable: true, align: 'center' },
  { name: 'queue', label: '队列名称', field: 'queue', sortable: true, align: 'center' },
  { name: 'cmd', label: '运行命令', field: 'cmd', sortable: false, align: 'center' },
  { name: 'time', label: '时间', field: 'time', sortable: false, align: 'center' },
  { name: 'file', label: '文件', field: 'file', sortable: false, align: 'center' },
]);
watch(
  () => info.value?.status,
  newStatus => {
    if (!newStatus) return;
    //如果是正在运行和暂停，监听文件状态，实时预览
    if (newStatus == InstanceState.running.value || newStatus == InstanceState.paused.value) {
      let previewColumn = columns.value.find(c => c.name == 'preview');
      if (!previewColumn) {
        columns.value.push({ name: 'preview', label: '预览文件', field: 'preview', sortable: false, align: 'center' });
      }
    }
  }
);

async function getNodeList() {
  let nodes = await InstanceService.getNodesById(id);
  nodeList.value = nodes;
  for (let index = 0; index < nodeList.value.length; index++) {
    const node: any = nodeList.value[index];

    let inode = info.value.spec?.nodeSpecs?.find((inode: any) => inode.id == node.id);
    if (inode) {
      //赋值info的node状态
      inode.status = node.status;

      //获取输入文件列表
      let inputFileList: any = [];
      inode.inputSlots.forEach((inputSlot: any) => {
        inputSlot.contents.forEach((file: any) => {
          inputFileList.push({
            id: file.fileMetadataId,
            name: file.fileMetadataName,
          });
        });
      });
      node.inputFileList = inputFileList;

      //如果是正在运行或暂停状态，获取预览ids
      if (node.status == InstanceNodeState.running.value || node.status == InstanceNodeState.paused.value) {
        //获取预备输出文件id
        let outPreviewList: any = [];
        inode.outputSlots.forEach((outputSlot: any) => {
          outputSlot.allTasksPreparedContentIds.forEach((id: string) => {
            outPreviewList.push({
              id,
              name: outputSlot.description,
            });
          });
        });
        node.outPreviewList = outPreviewList;
      }
    }
    //获取已结束输出文件列表
    InstanceService.getNodeFiles(node.id).then(outFileList => {
      node.outFileList = outFileList;
    });

    //获取node的运行命令
    InstanceService.getRunCmd(node.id).then(cmd => {
      node.cmd = cmd;
    });
  }
}
const allInputFileList = computed(() => {
  let inputFileList: any = [];
  nodeList.value.forEach((node: any) => {
    node.inputFileList && inputFileList.push(...node.inputFileList);
  });
  return inputFileList;
});
const allOutFileList = computed(() => {
  let outFileList: any = [];
  nodeList.value.forEach((node: any) => {
    node.outFileList && outFileList.push(...node.outFileList);
  });
  return outFileList;
});

function runInstance() {
  InstanceService.runInstance(id).then(async () => {
    $q.notify({
      type: 'positive',
      timeout: 1000,
      message: '开始任务成功',
      icon: 'check',
    });
    await getInfo();
  });
}
//删除任务
async function delMy() {
  if (!id) return;
  $q.dialog({
    title: '提示',
    message: '您确定要删除此任务吗?',
    cancel: true,
  }).onOk(() => {
    InstanceService.del(id).then(() => {
      $q.notify({
        type: 'positive',
        timeout: 1000,
        message: '删除任务成功',
        icon: 'check',
      });
      // 关闭tab
      keepAliveStore.deleteTabByPath('/instance-detail?id=' + id);
    });
  });
}

//暂停
function pauseInstance() {
  InstanceService.pauseById(id).then(async () => {
    $q.notify({
      type: 'positive',
      timeout: 1000,
      message: '暂停任务成功',
      icon: 'check',
    });
    await getInfo();
  });
}
function continueInstance() {
  InstanceService.continueById(id).then(async () => {
    $q.notify({
      type: 'positive',
      timeout: 1000,
      message: '继续任务成功',
      icon: 'check',
    });
    await getInfo();
  });
}
function terminateInstance() {
  InstanceService.terminateById(id).then(async () => {
    $q.notify({
      type: 'positive',
      timeout: 1000,
      message: '终止任务成功',
      icon: 'check',
    });
    await getInfo();
  });
}
function terminateAndDelete() {
  InstanceService.terminateById(id).then(() => {
    InstanceService.del(id).then(() => {
      $q.notify({
        type: 'positive',
        timeout: 1000,
        message: '删除任务成功',
        icon: 'check',
      });
      // 关闭tab
      keepAliveStore.deleteTabByPath('/instance-detail?id=' + id);
    });
  });
}

const copyText = (text: string) => {
  copyToClipboard(text)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: '复制成功',
      });
    })
    .catch(() => {
      console.log('error: 复制失败');
    });
};
/**
 * 修改信息
 */
function editInfo() {
  promptData.value = {
    id: info.value.id,
    name: info.value.name,
    description: info.value.description,
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
    await getInfo();
  } else {
    console.log('error: 修改失败');
  }
}

const fullPath = route.fullPath;
onMounted(() => {
  loading.value = true;
  getInfo()
    .then(() => {
      loading.value = false;
      if (info.value.status == InstanceState.created.value)
        $q.notify({
          color: 'primary',
          textColor: 'white',
          message: '任务已创建，是否开始？',
          icon: 'play_circle_fill',
          multiLine: true,
          actions: [
            {
              label: '开始',
              color: 'yellow',
              handler: () => {
                runInstance();
              },
            },
            {
              label: '忽略',
              color: 'white',
              handler: () => {
                /* ... */
              },
            },
          ],
        });
    })
    .catch(() => {
      loading.value = false;
    });

  setInterval(() => {
    if (fullPath === route.fullPath && !loading.value) {
      getInfo()
        .then(() => {
          loading.value = false;
        })
        .catch(() => {
          loading.value = false;
        });
    }
  }, keepAliveStore.timeout);
});
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: calc(100vh - 88px);
  padding: 16px;
}
.title-container {
  display: flex;
  .title {
    flex: 1;
    font-size: 20px;
    font-weight: bolder;
    line-height: 36px;
    .state {
      margin-left: 10px;
    }
  }
  .btns {
    margin-left: 10px;
  }
}
.content-container {
  display: flex;
  flex-direction: row;
  padding: 0 16px;

  .left {
    flex: 1;
    .desc-container {
      padding: 10px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.5);
      margin-bottom: 10px;
    }
  }
  .right {
    width: 300px;
    padding-left: 24px;
  }
  .price-container {
    font-size: 15px;
    margin-bottom: 10px;
    .price {
      font-size: 13px;
      font-weight: bold;
      color: red;
    }
  }
  .template-container {
    .template-title {
      margin-bottom: 20px;
      margin-top: 20px;
      font-weight: bolder;
      font-size: 15px;
    }
    .template-content {
      cursor: pointer;
      background: #fff;
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 4px;
      position: relative;
      padding-right: 20px;
      display: flex;
      align-items: center;
      .img {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        margin-right: 5px;
      }
      .title-box {
        flex: 1;
        width: 0;
      }
      .subtitle {
        font-size: 12px;
        color: #999;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .badge {
        margin-left: 5px;
      }
    }
  }
}
.recommend-container {
  .recommend-title {
    margin-bottom: 16px;
    margin-top: 16px;
    font-weight: bolder;
    font-size: 15px;
  }
  .recommend-item {
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
    position: relative;
    padding-right: 20px;
    .title {
    }
    .subtitle {
      font-size: 12px;
      color: #999;
    }
    .price {
      position: absolute;
      top: 10px;
      right: 10px;
      color: red;
    }
  }
}
.preview-container {
  width: 300px;
  height: 100px;
  background: #fff;
  position: fixed;
  bottom: 0;
  right: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgb(0 0 0 / 30%), 0 1px 1px rgb(0 0 0 / 24%), 0 2px 1px -1px rgb(0 0 0 / 22%) !important;
  &.max {
    width: 100% !important;
    height: 100% !important;
    left: 0 !important;
    bottom: 0 !important;
  }
  .preview-bar {
  }
  .preview-scroll {
    flex: 1;
    padding: 10px;
    overflow: auto;
  }
}
</style>
