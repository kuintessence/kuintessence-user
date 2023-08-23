<template>
  <div class="input-match-container" v-if="batchRule">
    <div class="container-title">批量策略</div>
    <div class="input-match-div" v-if="isFile">
      <div class="input-match-title">重命名名称</div>
      <input class="input-match-text" type="text" v-model="batchRule.renamingPattern" placeholder="字符串" />
    </div>
    <div class="input-match-div">
      <div class="input-match-title">生成个数</div>
      <input class="input-match-text" type="number" v-model="batchRule.fillCount" placeholder="数字" />
    </div>
    <div class="input-match-div">
      <div class="input-match-title">应用规则</div>
      <input class="input-match-text" type="text" v-model="batchRule.regexToMatch" placeholder="正则表达式" />
    </div>
    <div class="input-match-div">
      <div class="input-match-title">填充规则</div>
      <div class="input-match-radio-div">
        <q-radio
          v-model="batchRule.filler.type"
          :val="BatchRuleFillerTypeEnum.AutoNumber"
          label="数字自增"
          @click="changeFiller(BatchRuleFillerTypeEnum.AutoNumber)"
        />
        <q-radio
          v-model="batchRule.filler.type"
          :val="BatchRuleFillerTypeEnum.Enumeration"
          label="枚举"
          @click="changeFiller(BatchRuleFillerTypeEnum.Enumeration)"
        />
      </div>
    </div>
    <template v-if="batchRule.filler.type == BatchRuleFillerTypeEnum.AutoNumber">
      <div class="input-match-div">
        <div class="input-match-title">起始数字</div>
        <input class="input-match-text" type="number" placeholder="数字" v-model="batchRule.filler.start" />
      </div>
      <div class="input-match-div">
        <div class="input-match-title">间隔步长</div>
        <input class="input-match-text" type="number" placeholder="数字" v-model="batchRule.filler.step" />
      </div>
    </template>
    <template v-if="batchRule.filler.type == BatchRuleFillerTypeEnum.Enumeration">
      <div class="input-match-div">
        <div class="input-match-title">枚举数据</div>
        <div class="input-match-btn-div">
          <q-icon class="add-icon" name="add_circle" @click="addItem">
            <q-tooltip>新增一个枚举值</q-tooltip>
          </q-icon>
          <q-icon
            v-if="batchRule.filler.items && batchRule.filler.items.length > 1"
            class="down-icon"
            :name="list_show ? 'close' : 'list'"
            @click.stop="toogleListShow"
          >
            <q-tooltip>{{ list_show ? '收起' : '展开' }}{{ batchRule.filler.items.length }}个值列表</q-tooltip>
          </q-icon>
        </div>
        <div class="input-match-content">
          <div class="input-match-item">
            <input
              class="input-match-item-text"
              type="text"
              placeholder="枚举值"
              @input="itemChange($event, 0)"
              :value="batchRule.filler.items && batchRule.filler.items[0]"
            />
            <q-icon
              class="remove-icon"
              name="remove_circle"
              @click="removeItem(0)"
              v-if="batchRule.filler.items && batchRule.filler.items.length > 1"
            >
              <q-tooltip>移除</q-tooltip>
            </q-icon>
          </div>
          <div
            class="text-list-div"
            :class="{ show: list_show }"
            v-if="batchRule.filler.items && batchRule.filler.items.length"
          >
            <div class="input-match-item" v-for="(item, itemIndex) in batchRule.filler.items" :key="itemIndex">
              <input
                class="input-match-item-text"
                type="text"
                placeholder="枚举值"
                @input="itemChange($event, itemIndex)"
                :value="item"
              />
              <q-icon class="remove-icon" name="remove_circle" @click="removeItem(itemIndex)">
                <q-tooltip>移除</q-tooltip>
              </q-icon>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SlotInputMatch',
};
</script>

<script lang="ts" setup>
import { toRefs, ref } from 'vue';
import { BatchRuleFillerTypeEnum } from 'src/service/workflow-slot';

const props = defineProps({
  isFile: {
    type: Boolean,
    default: false,
  },
  batchRule: {
    type: Object,
    default: () => {
      return {
        renamingPattern: '',
        fillCount: '',
        regexToMatch: '',
        filler: {
          type: BatchRuleFillerTypeEnum.AutoNumber,
          start: '',
          step: '',
        },
      };
    },
  },
});

const { isFile, batchRule } = toRefs(props);
function changeFiller(type: string) {
  if (type == BatchRuleFillerTypeEnum.AutoNumber) {
    batchRule.value.filler = {
      type: BatchRuleFillerTypeEnum.AutoNumber,
      start: '',
      step: '',
    };
  } else if (type == BatchRuleFillerTypeEnum.Enumeration) {
    batchRule.value.filler = {
      type: BatchRuleFillerTypeEnum.Enumeration,
      items: [],
    };
  }
}
const list_show = ref(false);

function toogleListShow() {
  list_show.value = !list_show.value;
}

function addItem() {
  batchRule.value.filler.items.push('');
  list_show.value = true;
}
function removeItem(index: number) {
  batchRule.value.filler.items.splice(index, 1);
}
function itemChange($event: any, itemIndex: number) {
  let _value = $event.target.value;
  batchRule.value.filler.items[itemIndex] = _value;
}
</script>

<style lang="scss" scoped>
.input-match-container {
  background: #fff;
  padding: 10px;
  .container-title {
    font-size: 14px;
  }
}
.input-match-div {
  margin-top: 10px;
  .input-match-title {
    font-size: 13px;
    color: #999;
    margin-bottom: 2px;
  }
  .input-match-text {
    height: 50px;
    width: 100%;
    border-radius: 4px;
    resize: none;
    border: 1px solid #eee;
    padding: 5px;
    &:focus {
      outline: 1px solid #1976d2;
    }
  }
}
.input-match-radio-div {
}
.input-match-btn-div {
  margin-bottom: 2px;
  .add-icon {
    font-size: 25px;
    cursor: pointer;
    color: #999;
  }
  .down-icon {
    margin-left: 10px;
    font-size: 25px;
    cursor: pointer;
    color: #999;
  }
}
.input-match-content {
  position: relative;
  .text-list-div {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    max-height: 300px;
    overflow-x: hidden;
    overflow-y: auto;
    box-shadow: 0 10px 10px #ddd;
    z-index: 100;
    background: #fff;
    border-radius: 4px;
    padding: 5px;
    &.show {
      display: block;
    }
  }
  .input-match-item {
    width: 100%;
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 5px;
    .input-match-item-text {
      width: 0;
      flex: 1;
      height: 100%;
      border: 1px solid #eee;
      border-radius: 4px;
      resize: none;
      padding: 5px;
      &:focus {
        outline: 1px solid #1976d2;
      }
    }
    .remove-icon {
      font-size: 25px;
      color: #999;
      cursor: pointer;
    }
  }
}
</style>
