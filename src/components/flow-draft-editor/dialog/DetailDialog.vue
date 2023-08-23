<!-- 查看用例详情弹窗 -->
<template>
  <q-dialog v-model="openDetailDialog" :maximized="maximized" :full-width="maximized">
    <q-card style="min-width: 80vw; min-height: 75vh">
      <q-card-section>
        <div class="text-h6 row text-weight-regular">
          查看详情
          <q-space />
          <q-btn dense flat icon="crop_square" v-if="!maximized" @click="maximized = true">
            <q-tooltip :offset="[8, 8]"> 最大化 </q-tooltip>
          </q-btn>
          <q-btn dense flat icon="minimize" v-else @click="maximized = false">
            <q-tooltip :offset="[8, 8]"> 最小化 </q-tooltip>
          </q-btn>
          <q-btn dense flat icon="close" @click="close">
            <q-tooltip :offset="[8, 8]"> 关闭 </q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-card-section style="max-height: 80vh" class="scroll q-pa-none">
        <div class="fit">
          <q-item class="q-pa-lg" style="background: rgba(255, 255, 255, 0.5); border-radius: 16px 16px 0 0">
            <q-item-section side top>
              <q-icon
                name="r_api"
                size="100px"
                class="bg-white text-primary"
                style="width: 300px; height: 180px; border-radius: 16px"
              />
            </q-item-section>
            <q-item-section class="q-pl-md">
              <q-item-label lines="1" class="text-h5 text-weight-medium" style="line-height: 30px">
                <span class="text-grey-7">用例 > </span>
                <span class="q-pr-sm">{{ data.name ? data.name : '未命名用例' }}</span>
                <q-chip
                  square
                  :ripple="false"
                  size="sm"
                  color="green"
                  text-color="white"
                  class="q-mr-none"
                  v-if="data.is_official"
                >
                  官方
                </q-chip>
                <q-chip
                  square
                  :ripple="false"
                  size="sm"
                  color="orange"
                  text-color="white"
                  class="q-mr-none"
                  v-if="data.is_featured"
                >
                  推荐
                </q-chip>
              </q-item-label>
              <q-item-label lines="5" class="q-pt-sm">
                <div class="text-body1 ellipsis-3-lines text-grey-8">
                  {{ data.description ? data.description : '未提供描述。' }}
                </div>
              </q-item-label>
              <q-space />
              <q-item-label class="q-pt-md">
                <q-btn
                  unelevated
                  color="white"
                  text-color="black"
                  icon="star_border"
                  label="未收藏"
                  :loading="loading"
                  v-if="!isFavorite"
                  disable
                />
                <q-btn
                  unelevated
                  color="orange"
                  text-color="white"
                  icon="star"
                  label="已收藏"
                  :loading="loading"
                  v-else
                  disable
                />
              </q-item-label>
            </q-item-section>
          </q-item>

          <div class="row">
            <div class="col">
              <div class="q-px-lg">
                <div v-if="nodeOriginData !== null">
                  <div class="text-weight-medium text-h6 q-pt-md">数据配置</div>
                  <div class="text-weight-medium q-pt-sm">任务输入</div>
                  <div class="row q-gutter-sm q-mt-none">
                    <div
                      v-for="(slot, index) in nodeOriginData.inputSlots"
                      :key="index"
                      class="dialog-card q-mt-sm col-auto"
                      style="border-radius: 8px !important; width: 300px"
                    >
                      <q-item class="q-px-none q-py-sm">
                        <q-item-section>
                          <q-item-label class="text-body2 ellipsis">
                            文件：{{ slot.expectedFileName ? slot.expectedFileName : '-' }}
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
                            :name="
                              slot.type === 'File' ? 'description' : slot.type === 'Text' ? 'notes' : 'question_mark'
                            "
                            size="30px"
                            class="text-grey"
                          />
                        </q-item-section>
                      </q-item>
                    </div>
                  </div>
                  <div class="text-grey-7" v-if="nodeOriginData?.outputSlots?.length === 0">
                    <div>任务输入为空</div>
                  </div>
                  <div class="text-weight-medium q-pt-sm">任务输出</div>
                  <div class="row q-gutter-sm q-mt-none">
                    <div
                      v-for="(slot, index) in nodeOriginData.outputSlots"
                      :key="index"
                      class="dialog-card q-mt-sm col-auto"
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
                            :name="
                              slot.type === 'File' ? 'description' : slot.type === 'Text' ? 'notes' : 'question_mark'
                            "
                            size="30px"
                            class="text-grey"
                          />
                        </q-item-section>
                      </q-item>
                    </div>
                  </div>
                  <div class="text-grey-7" v-if="nodeOriginData?.outputSlots?.length === 0">
                    <div>任务输出为空</div>
                  </div>
                </div>
                <div class="text-weight-medium text-h6 q-pt-md">说明文档</div>
                <v-md-preview :text="data.readme" class="md-preview" v-if="data.readme"></v-md-preview>
                <div class="q-pt-sm q-pb-md text-body1 text-grey-8" v-else>未提供说明文档。</div>
              </div>
            </div>
            <div class="col-auto">
              <div class="translucent-card q-mt-md q-mr-md q-pa-md" style="width: 300px">
                <div class="text-weight-medium text-grey-7">发布时间</div>
                <div>{{ data.date_created ? date.formatDate(data.date_created, 'YYYY/MM/DD HH:mm:ss') : '-' }}</div>
                <div class="text-weight-medium text-grey-7 q-pt-sm">标签</div>
                <div>
                  {{ data.tags?.length === 0 ? '-' : '' }}
                  <q-chip
                    square
                    :ripple="false"
                    size="sm"
                    color="primary"
                    text-color="white"
                    class="q-ml-none q-my-none"
                    v-for="tag in data.tags"
                    :key="tag.id"
                  >
                    {{ tag.tag.name }}
                  </q-chip>
                </div>
                <div class="text-weight-medium text-grey-7 q-pt-sm">作者</div>
                <div>-</div>
              </div>
              <div class="translucent-card q-mt-md q-mr-md q-pa-md" style="width: 300px">
                <div class="text-weight-medium text-grey-7">版本列表</div>
                <q-list class="q-mt-sm">
                  <div v-for="(version, index) in data.content_entity_versions" :key="version.id">
                    <q-item class="q-px-none">
                      <q-item-section>
                        <q-item-label class="text-weight-medium">
                          {{ version.tag }}
                          <q-chip
                            square
                            :ripple="false"
                            size="sm"
                            color="primary"
                            text-color="white"
                            class="q-mr-none q-my-none"
                            v-if="index === 0"
                          >
                            新
                          </q-chip>
                        </q-item-label>
                        <q-item-label>
                          {{
                            version.date_created ? date.formatDate(version.date_created, 'YYYY/MM/DD HH:mm:ss') : '-'
                          }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator v-if="index !== data.content_entity_versions.length - 1" />
                  </div>
                </q-list>
              </div>
              <div class="translucent-card q-my-md q-mr-md q-pa-md" style="width: 300px">
                <div class="text-weight-medium text-grey-7">关联软件</div>
                {{ data.dependentVersions }}
                <q-list class="q-mt-sm">
                  <div v-for="(item, index) in dependentVersions" :key="item.contentDependencyId">
                    <q-item class="q-px-none">
                      <q-item-section>
                        <q-item-label class="text-weight-medium">
                          {{ data.entity_dependency_obj.display_name }} {{ item.version }}
                          <q-chip
                            square
                            :ripple="false"
                            size="sm"
                            color="primary"
                            text-color="white"
                            class="q-mr-none q-my-none"
                            v-if="index === 0"
                          >
                            新
                          </q-chip>
                        </q-item-label>
                        <q-item-label>
                          {{ item.date_created ? date.formatDate(item.date_created, 'YYYY/MM/DD HH:mm:ss') : '-' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator v-if="index !== dependentVersions.length - 1" />
                  </div>
                </q-list>
              </div>
            </div>
          </div>

          <q-inner-loading :showing="loading" style="border-radius: 16px">
            <q-spinner-ios size="50px" color="primary" />
          </q-inner-loading>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { date } from 'quasar';
import { ProjectService, UserFavoriteService } from 'src/service';
import { useKeepAliveStore } from 'src/stores/keep-alive';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRefreshStore } from 'src/stores/refresh';
import { NodeOriginData } from '../interfaces';

const maximized = ref(false);
const openDetailDialog = ref(false);
const route = useRoute();
const keepAliveStore = useKeepAliveStore();
const refreshStore = useRefreshStore();

// 监听数据变化，自动更新
refreshStore.$onAction(async ({ name }) => {
  if (!loading.value && name == 'refreshUserFavoriteData') {
    loading.value = true;
    await judgeIsFavorite();
    loading.value = false;
  }
});

const loading = ref(false);
const data = ref({} as any);
const isFavorite = ref(false);
const id = ref();
const dependentVersions = ref<any>([]);
const nodeOriginData = ref<any>([]);

/**
 * 判断是否已收藏
 */
const judgeIsFavorite = async () => {
  isFavorite.value = await UserFavoriteService.isFavorite(id.value);
};
// 获取关联软件
const getRelatedSoftware = async () => {
  await ProjectService.getContentVersionDependentContentVersionList(
    data.value.id,
    data.value.content_entity_versions[0].uuid,
    data.value.entity_dependency_obj.uuid
  ).then(res => {
    dependentVersions.value = res;
    getGeneralContentToNode(res[0].contentDependencyId);
  });
};
const getGeneralContentToNode = async (contentDependencyId: string) => {
  nodeOriginData.value = (await ProjectService.getGeneralContentToNodeById(
    data.value.content_entity_versions[0].uuid,
    contentDependencyId
  )) as unknown as NodeOriginData;
};
/**
 * 加载数据
 */
const loadData = async (newId: string) => {
  loading.value = true;
  try {
    id.value = newId;
    data.value = await ProjectService.getEntityDetail(id.value);
    judgeIsFavorite();
    getRelatedSoftware();
    keepAliveStore.tabList.forEach(tab => {
      if (tab.fullPath === route.fullPath)
        tab.meta.title = data.value.name ? data.value.name + ' - 用例详情' : '未命名用例 - 用例详情';
    });
    loading.value = false;
  } catch (e) {
    loading.value = false;
    keepAliveStore.deleteTabByPath(route.fullPath);
  }
};

const open = (id: string) => {
  loadData(id);
  maximized.value = false;
  openDetailDialog.value = true;
};
const close = () => {
  openDetailDialog.value = false;
};

defineExpose({
  open,
});
</script>

<style lang="scss" scoped>
@import url('../FlowDraftEditor.scss');
</style>
