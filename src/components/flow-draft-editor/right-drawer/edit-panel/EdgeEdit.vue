<!-- 编辑连线 -->
<template>
  <div class="q-gutter-md q-pl-md q-pr-md q-py-md">
    <q-expansion-item
      expand-separator
      label="数据配置"
      class="full-width q-mb-md"
      header-class="text-weight-medium"
      style="margin-left: 20px"
      dense
      switch-toggle-side
      default-opened
    >
      <q-card
        v-for="(thisInputSlot, index) in clickEdgeBindData.targetNodeData.inputSlots"
        :key="index"
        class="dialog-card q-ml-md q-mt-sm"
        flat
      >
        <q-card-section class="q-px-none q-py-sm">
          <div class="q-pb-xs row">任务输入<q-space /><span class="text-grey-7">目的节点</span></div>
          <div class="text-caption text-grey-7 ellipsis-2-lines q-pt-xs">
            类型：{{ thisInputSlot.kind === 'File' ? '文件' : thisInputSlot.kind === 'Text' ? '文本' : '待定' }}
          </div>
          <div class="text-caption text-grey-7 ellipsis-2-lines q-pt-xs">
            描述：{{ thisInputSlot.description ? thisInputSlot.description : '-' }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-px-none q-py-sm">
          <div class="q-pb-xs row">任务输出<q-space /><span class="text-grey-7">源节点</span></div>
          <div class="q-py-sm q-px-md" style="border-radius: 4px; background-color: rgb(255, 255, 255)">
            <span
              v-if="
                thisInputSlot.isDepend &&
                thisInputSlot.dependData &&
                thisInputSlot.dependData.fromId !== clickEdgeBindData.sourceNode.id
              "
              class="text-orange"
            >
              同层连线已配置依赖
            </span>
            <span v-else-if="thisInputSlot.result.length > 0" class="text-orange"> 目的节点已上传数据 </span>
            <div v-else>
              <q-checkbox
                dense
                v-model="thisInputSlot.isDepend"
                label="是否依赖源节点"
                @update:model-value="updateIsDepend(thisInputSlot)"
              />

              <div v-if="thisInputSlot.isDepend">
                <q-select
                  v-model="thisInputSlot.dependData.fromSlot"
                  :options="clickEdgeBindData.sourceNode.data.outputSlots"
                  option-value="descriptor"
                  emit-value
                  map-options
                  dense
                  outlined
                  @update:model-value="updateDependencies(thisInputSlot)"
                  class="q-my-sm"
                  popup-content-class="frosted-glass-card"
                >
                  <template v-slot:append>
                    <q-icon
                      name="close"
                      @click.stop="thisInputSlot.dependData.fromSlot = null"
                      class="cursor-pointer"
                      v-if="
                        thisInputSlot.isDepend &&
                        thisInputSlot.dependData.fromId === clickEdgeBindData.sourceNode.id &&
                        thisInputSlot.dependData.fromSlot
                      "
                    />
                  </template>
                  <template v-slot:selected-item="scope">
                    <div class="ellipsis">
                      {{ scope.opt.description ? scope.opt.description : '-' }}
                    </div>
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label class="ellipsis">
                          类型：{{ scope.opt.type === 'File' ? '文件' : scope.opt.type === 'Text' ? '文本' : '待定' }}
                        </q-item-label>
                        <q-item-label caption class="ellipsis-2-lines">
                          描述：{{ scope.opt.description ? scope.opt.description : '-' }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon
                          :name="
                            scope.opt.type === 'File'
                              ? 'description'
                              : scope.opt.type === 'Text'
                              ? 'notes'
                              : 'question_mark'
                          "
                          size="30px"
                          style="color: var(--font-color)"
                        />
                      </q-item-section>
                    </q-item>
                  </template>
                  <q-tooltip :offset="[8, 8]"> 选择依赖插槽 </q-tooltip>
                </q-select>

                <q-select
                  v-model="thisInputSlot.dependData.transferStrategy.type"
                  :options="[
                    {
                      label: '网络',
                      value: 'Network',
                    },
                    {
                      label: '本地',
                      value: 'Disk',
                    },
                    {
                      label: '待定',
                      value: 'Unknown',
                    },
                  ]"
                  dense
                  outlined
                  emit-value
                  map-options
                  class="q-mb-sm"
                  popup-content-class="frosted-glass-card"
                  @update:model-value="updateTransferStrategy()"
                  v-if="
                    thisInputSlot.isDepend &&
                    thisInputSlot.dependData.fromId === clickEdgeBindData.sourceNode.id &&
                    thisInputSlot.dependData.fromSlot
                  "
                >
                  <template v-slot:append>
                    <q-icon
                      name="close"
                      @click.stop="
                        thisInputSlot.dependData.transferStrategy.type = 'Unknown';
                        saveEdge();
                      "
                      class="cursor-pointer"
                      v-if="thisInputSlot.dependData.transferStrategy.type !== 'Unknown'"
                    />
                  </template>
                  <template v-slot:selected-item="scope">
                    <div class="ellipsis">
                      {{ scope.opt.label }}
                    </div>
                  </template>
                  <q-tooltip :offset="[8, 8]"> 选择传输策略 </q-tooltip>
                </q-select>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { Edge } from '@antv/x6';
import { SlotData } from 'src/service/workflow-slot';
import { SlotRelation } from '../../interfaces';

const props = defineProps({
  clickEdgeBindData: {
    type: Object,
    default() {
      return {};
    },
  },
  clickEdge: {
    type: Object,
  },
});

// 保存连线
async function saveEdge() {
  let slotRelations: SlotRelation[] = [];
  props.clickEdgeBindData.targetNodeData.inputSlots.forEach((thisInputSlot: SlotData) => {
    if (
      thisInputSlot.isDepend &&
      thisInputSlot.dependData &&
      thisInputSlot.dependData.fromId === props.clickEdgeBindData.sourceNode.id &&
      thisInputSlot.dependData.fromSlot !== null &&
      thisInputSlot.dependData.transferStrategy.type !== null
    ) {
      slotRelations.push({
        fromSlot: thisInputSlot.dependData.fromSlot,
        toSlot: thisInputSlot.slotId,
        transferStrategy: {
          type: thisInputSlot.dependData.transferStrategy.type,
        },
      });
    }
  });
  (props.clickEdge as Edge).setData({ slotRelations: slotRelations }, { overwrite: true });
  props.clickEdgeBindData.targetNode.setData(JSON.parse(JSON.stringify(props.clickEdgeBindData.targetNodeData)), {
    overwrite: true,
  });
}
// 自动勾选流转策略
const updateDependencies = (thisInputSlot: SlotData) => {
  if (thisInputSlot.dependData && !thisInputSlot.dependData.transferStrategy.type)
    thisInputSlot.dependData.transferStrategy.type = 'Network';
  // 选择依赖，保存连线
  if (thisInputSlot.dependData?.fromSlot ?? '' !== '') saveEdge();
};
// 更新流转策略，保存连线
const updateTransferStrategy = () => {
  saveEdge();
};
// 更新是否依赖
const updateIsDepend = (thisInputSlot: any) => {
  thisInputSlot.dependData = {
    fromId: props.clickEdgeBindData.sourceNode.id,
    fromSlot: null,
    transferStrategy: {
      type: null,
    },
  };
  // 关闭选项，保存连线
  if (!thisInputSlot.isDepend) saveEdge();
};
</script>
