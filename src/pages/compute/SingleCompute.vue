<template>
  <q-page class="page-pt page-px q-pb-md">
    <div class="full-width frosted-glass-card">
      <div class="text-h5 q-pt-md q-px-md row">
        单任务计算
        <q-btn flat round dense icon="restart_alt" class="q-ml-xs text-grey-7" @click="reset">
          <q-tooltip> 重置 </q-tooltip>
        </q-btn>
      </div>
      <q-stepper
        flat
        v-model="step"
        vertical
        keep-alive
        color="primary"
        animated
        class="q-pt-none"
        style="background: transparent; border-radius: 16px"
      >
        <q-step :name="1" title="软件配置" icon="archive" :done="step > 1">
          <q-card flat class="translucent-card">
            <StoreTable ref="storeTable" @selected="selected" />
          </q-card>
          <q-stepper-navigation>
            <q-btn
              @click="step = 2"
              color="primary"
              label="下一步"
              :disable="!selectedNodeData || !flowData"
              unelevated
            />
          </q-stepper-navigation>
        </q-step>

        <q-step :name="2" title="数据配置" icon="tune" :done="step > 2">
          <div v-if="selectedNodeData && flowData">
            <div>
              <div class="q-mt-sm text-weight-medium row">任务输入</div>
              <div class="row q-gutter-md q-mt-none">
                <InputView
                  class="q-mt-md col-auto"
                  style="width: 300px"
                  :draftId="flowData.id"
                  :autoUpload="true"
                  :nodeIsBatch="selectedNodeData.isBatch"
                  :slotData="item"
                  v-for="(item, itemIndex) in selectedNodeData.inputSlots"
                  :key="itemIndex"
                />
              </div>
              <div class="text-grey-7" v-if="selectedNodeData.inputSlots.length === 0">
                <div>任务输入为空</div>
              </div>
            </div>
            <div>
              <div class="q-mt-md text-weight-medium row">任务输出</div>
              <div class="row q-gutter-md q-mt-none">
                <div
                  v-for="(slot, index) in selectedNodeData.outputSlots"
                  :key="index"
                  class="dialog-card q-mt-md col-auto"
                  style="border-radius: 8px !important; width: 300px"
                >
                  <q-item class="q-px-none q-py-sm">
                    <q-item-section>
                      <q-item-label class="text-body2 ellipsis">
                        文件：{{ slot.fileName ? slot.fileName : '-' }}
                      </q-item-label>
                      <q-item-label class="text-body2 ellipsis-2-lines text-grey q-pt-xs" v-if="slot.description">
                        描述：{{ slot.description }}
                      </q-item-label>
                      <q-item-label class="text-body2 ellipsis text-grey q-pt-xs">
                        类型：{{ slot.type === 'File' ? '文件' : slot.type === 'Text' ? '文本' : '待定' }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon
                        :name="slot.type === 'File' ? 'description' : slot.type === 'Text' ? 'notes' : 'question_mark'"
                        size="30px"
                        class="text-grey"
                      />
                    </q-item-section>
                  </q-item>
                </div>
              </div>
              <div class="text-grey-7" v-if="selectedNodeData.outputSlots.length === 0">
                <div>任务输出为空</div>
              </div>
            </div>
          </div>
          <q-stepper-navigation>
            <q-btn @click="step = 3" color="primary" label="下一步" unelevated />
            <q-btn flat @click="step = 1" color="primary" label="返回" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>

        <q-step :name="3" title="资源配置" icon="more_horiz">
          <div class="row q-col-gutter-lg" v-if="selectedNodeData && flowData">
            <div style="width: 300px">
              <div class="text-weight-medium">名称</div>
              <q-input
                v-model="flowData.name"
                class="q-mt-xs"
                dense
                outlined
                :debounce="300"
                @blur="checkNull"
                style="max-width: 250px"
              />
              <div class="text-weight-medium q-mt-sm">描述</div>
              <q-input
                v-model="flowData.description"
                autogrow
                class="q-mt-xs"
                dense
                outlined
                :debounce="300"
                style="width: 250px"
              />
              <div class="text-weight-medium q-mt-sm">调度策略</div>
              <div class="row q-mt-xs" style="max-width: 250px">
                <NodeStrategySelect
                  :schedulingStrategy="flowData.spec.schedulingStrategy?.type"
                  :queues="flowData.spec.schedulingStrategy?.queues"
                  @changeStrategy="changeStrategy"
                  @changeClusters="changeClusters"
                  class="full-width"
                />
              </div>
            </div>
            <div style="width: 300px">
              <div class="q-pl-xs text-weight-medium row">
                <div class="col-6 q-pr-xs">核心数</div>
                <div class="col-6 q-pl-xs">节点数</div>
              </div>
              <div class="row q-mt-xs">
                <div class="col-6 q-pr-xs">
                  <q-input
                    type="number"
                    v-model.number="selectedNodeData.requirements.cpuCores"
                    @update:model-value="checkNum"
                    class="q-mt-xs"
                    dense
                    outlined
                    :debounce="300"
                  />
                </div>
                <div class="col-6 q-pl-xs">
                  <q-input
                    type="number"
                    v-model.number="selectedNodeData.requirements.nodeCount"
                    @update:model-value="checkNum"
                    class="q-mt-xs"
                    dense
                    outlined
                    :debounce="300"
                  />
                </div>
              </div>
              <div class="q-mt-sm q-pl-xs text-weight-medium row">
                <div class="col-6 q-pr-xs">最长运行时间(h)</div>
                <div class="col-6 q-pl-xs">最大核时消耗(h)</div>
              </div>
              <div class="row q-mt-xs">
                <div class="col-6 q-pr-xs">
                  <q-input
                    type="number"
                    v-model.number="selectedNodeData.requirements.maxWallTime"
                    @update:model-value="checkNum"
                    class="q-mt-xs"
                    dense
                    outlined
                    :debounce="300"
                  />
                </div>
                <div class="col-6 q-pl-xs">
                  <q-input
                    type="number"
                    v-model.number="selectedNodeData.requirements.maxCpuTime"
                    @update:model-value="checkNum"
                    class="q-mt-xs"
                    dense
                    outlined
                    :debounce="300"
                  />
                </div>
              </div>
            </div>
          </div>
          <q-stepper-navigation>
            <q-btn color="primary" label="提交任务" @click="run" unelevated />
            <q-btn flat @click="step = 2" color="primary" label="返回" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import StoreTable from 'src/components/compute/StoreTable.vue';
import NodeStrategySelect from 'src/components/workflow/NodeStrategySelect.vue';
import { DraftService, InstanceService, WorkflowSlotService } from 'src/service';
import { date } from 'quasar';
import InputView from 'src/components/flow-draft-editor/input-slot/InputView.vue';
import { FileSlotDataResult, InputSlotKind, SlotData } from 'src/service/workflow-slot';
import { UploadState } from 'src/service/upload';
import { useRoute } from 'vue-router';
import { useCommonStore } from 'src/stores/common';

const route = useRoute();
const commonStore = useCommonStore();

const step = ref(1);
const selectedNodeData = ref();
const flowData = ref();
const storeTable = ref();

const selected = (data: any) => {
  selectedNodeData.value = data;
};
// 检查输入不能为空
const checkNull = () => {
  if (!flowData.value.name) {
    const timeStamp = new Date();
    const formattedString = date.formatDate(timeStamp, 'YYYYMMDD');
    flowData.value.name = '新建草稿' + formattedString;
  }
};
// 修改资源调度策略
const changeStrategy = (newType: 'Manual' | 'Auto' | 'Prefer' | 'Unknown') => {
  let object = flowData.value.spec;
  if (object) {
    if (newType === 'Auto' || newType === 'Unknown') {
      // 类型为自动或待定，赋值类型的同时删除clusters
      object.schedulingStrategy = { type: newType };
    } else {
      // 类型为优先或手动，赋值类型并判断clusters是否存在，不存在则初始化
      object.schedulingStrategy.type = newType;
      const { type } = object.schedulingStrategy;
      if (type === 'Manual' || type === 'Prefer') {
        if (typeof object.schedulingStrategy.queues === 'undefined') {
          object.schedulingStrategy.queues = [];
        }
      }
    }
  }
};
// 修改选择的集群
const changeClusters = (newClusters: string[]) => {
  let object = flowData.value.spec;
  if (object) {
    if (object.schedulingStrategy.type === 'Manual' || object.schedulingStrategy.type === 'Prefer') {
      object.schedulingStrategy.queues = newClusters;
    }
  }
};
// 省略小数
const roundDown = (num: number) => {
  if (String(num).indexOf('.') < 1) return num;
  else return Number(String(num).slice(0, String(num).indexOf('.')));
};
// 检查输入框数据
const checkNum = () => {
  if (selectedNodeData.value.requirements.cpuCores < 0) selectedNodeData.value.requirements.cpuCores = 0;
  if (selectedNodeData.value.requirements.nodeCount < -1) selectedNodeData.value.requirements.nodeCount = -1;
  if (selectedNodeData.value.requirements.maxWallTime < 0) selectedNodeData.value.requirements.maxWallTime = 0;
  if (selectedNodeData.value.requirements.maxCpuTime < 0) selectedNodeData.value.requirements.maxCpuTime = 0;

  const { cpuCores, nodeCount, maxWallTime, maxCpuTime } = selectedNodeData.value.requirements;
  selectedNodeData.value.requirements = {
    cpuCores: roundDown(cpuCores),
    nodeCount: roundDown(nodeCount),
    maxWallTime: roundDown(maxWallTime),
    maxCpuTime: roundDown(maxCpuTime),
  };
};
const reset = async () => {
  step.value = 1;
  selectedNodeData.value = undefined;
  const id = await DraftService.getFlowDraftIdByType(1);
  flowData.value = await DraftService.getAndValidateFlowDraft(id);
  storeTable.value.reset();
};

// 上传全部文件
async function uploadAllFiles() {
  let promiseArr = [];
  for (let y = 0; y < selectedNodeData.value.inputSlots.length; y++) {
    const inputSlot: SlotData = selectedNodeData.value.inputSlots[y];
    if (inputSlot.kind == InputSlotKind.File) {
      for (let z = 0; z < inputSlot.result.length; z++) {
        const fileItem = <FileSlotDataResult>inputSlot.result[z];
        if (!fileItem.id) {
          if (!fileItem.fileEntry) return;
          fileItem.uploadStatus = UploadState.uploading; // 1 ：正在上传 2：上传成功 3：上传失败
          fileItem.progress = { progress: 0, speed: '', takeTime: '' };
          let promise = new Promise((resolve: any, reject: any) => {
            if (!fileItem.fileEntry) return reject('没有文件');
            DraftService.uploadDraftFile(
              flowData.value.id,
              fileItem.fileEntry,
              (progress: { state: UploadState; progress?: number; speed?: string; takeTime?: string }) => {
                //更新状态
                if (progress.state == UploadState.stopped) {
                  fileItem.uploadStatus = UploadState.stopped;
                  return reject({ state: UploadState.stopped });
                } else if (progress.state == UploadState.canceled) {
                  fileItem.uploadStatus = UploadState.canceled;
                  let fileIndex = inputSlot.result.findIndex((r: any) => r.hash && r.hash == fileItem.hash);
                  inputSlot.result.splice(fileIndex, 1);
                  return reject({ state: UploadState.canceled });
                } else if (progress.state == UploadState.uploading) {
                  //更新进度
                  fileItem.uploadStatus = UploadState.uploading;
                  if (fileItem.progress) {
                    progress.progress && (fileItem.progress.progress = progress.progress);
                    progress.speed && (fileItem.progress.speed = progress.speed);
                    progress.takeTime && (fileItem.progress.takeTime = progress.takeTime);
                  } else {
                    fileItem.progress = {
                      progress: progress.progress || 0,
                      speed: progress.speed || '',
                      takeTime: progress.takeTime || '',
                    };
                  }
                }
              },
              (cancel: (state: UploadState) => void) => {
                //中断执行
                fileItem.cancel = cancel;
              },
              (_retry: () => void) => {
                fileItem.retry = _retry;
              }
            )
              .then((fileId: string) => {
                //上传成功
                fileItem.id = fileId;
                fileItem.progress = { progress: 1, speed: '', takeTime: '' };
                fileItem.uploadStatus = UploadState.uploaded;
                resolve();
              })
              .catch(error => {
                //上传失败
                if (error?.message == UploadState.error) {
                  fileItem.uploadStatus = UploadState.error;
                }
                reject(error);
              });
          });
          promiseArr.push(promise);
        }
      }
    }
  }
  await Promise.all(promiseArr).catch(err => {
    throw err;
  });
}
const toPage = (fullPath: string, event: any) => {
  if (fullPath !== route.fullPath) {
    const { x, y } = event;
    commonStore.animate(x, y, fullPath);
  }
};
// 提交任务
const run = async () => {
  try {
    // 先上传所有数据
    await uploadAllFiles();
    // 重构nodeDrafts并保存草稿数据
    flowData.value.spec.nodeDrafts.length = 0;
    flowData.value.spec.nodeDrafts.push(selectedNodeData.value);
    flowData.value.spec.nodeDrafts = WorkflowSlotService.generateNodeData(flowData.value.spec.nodeDrafts);
    flowData.value.spec.additionalData = {
      ompType: 1,
    };
    await DraftService.saveFlowDraft(flowData.value, flowData.value.spec);
    // 提交任务
    const uuid = await InstanceService.runFlowDraft(flowData.value.id);
    // 删除原先的草稿
    await DraftService.deleteById(flowData.value.id);
    // 新建草稿并重置
    const id = await DraftService.getFlowDraftIdByType(1);
    flowData.value = await DraftService.getAndValidateFlowDraft(id);
    // 跳转到提交的任务详情
    toPage(`/instance-detail?id=${uuid}`, event);
    reset();
  } catch (e: any) {
    console.log(e);
  }
};

onMounted(async () => {
  const id = await DraftService.getFlowDraftIdByType(1);
  flowData.value = await DraftService.getAndValidateFlowDraft(id);
});
</script>
