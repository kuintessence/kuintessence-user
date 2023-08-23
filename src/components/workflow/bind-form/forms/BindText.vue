<template>
  <div class="node-container">
    <div class="node-list" v-if="nodes.length">
      <div class="node-item" v-for="(node, nodeIndex) in (nodes as any)" :key="nodeIndex">
        <div class="node-title" v-if="node.inputSlots?.length">
          <!-- 批量节点 显示特殊icon -->
          <q-icon v-if="node.isBatch" class="title-icon" name="view_list" color="secondary">
            <q-tooltip>批量节点</q-tooltip>
          </q-icon>
          {{ node.name }}
        </div>
        <div class="node-child-list">
          <div
            class="node-child-item"
            :id="`${node.externalId}_${slot.slotId}`"
            v-for="(slot, slotIndex) in node.inputSlots"
            :key="slotIndex"
          >
            <slot-input-view :draftId="draftId" :slotData="slot" :nodeIsBatch="node.isBatch" />
          </div>
        </div>
      </div>
    </div>
    <div class="node-empty" v-else>您还没选择节点</div>
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue';
import SlotInputView from 'src/components/flow-draft-editor/input-slot/InputView.vue';

const props = defineProps({
  draftId: {
    type: String,
    required: true,
  },
  nodes: {
    type: Array,
    required: true,
  },
});

const { draftId, nodes } = toRefs(props);
</script>

<style lang="scss" scoped>
.node-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  .node-list {
    .node-item {
      margin-right: 10px;
      margin-bottom: 10px;
      .node-title {
        color: #333;
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 10px;
      }
      .title-icon {
        font-size: 20px;
      }
      .node-child-list {
        padding-left: 20px;
        .node-child-item {
          width: 100%;
          margin-right: 10px;
          margin-bottom: 10px;
        }
      }
    }
  }
  .node-empty {
    flex: 1;
    font-size: 20px;
    color: #999;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
