<template>
  <q-page class="page-pt page-px q-pb-md">
    <div class="full-width frosted-glass-card software-detail-div">
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
            <span class="text-grey-7">软件 > </span>
            <span class="q-pr-sm">{{ data.name ? data.name : '未命名软件' }}</span>
            <q-chip
              square
              :ripple="false"
              size="sm"
              color="primary"
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
              label="收藏"
              :loading="loading"
              @click="favor"
              v-if="!isFavorite"
            />
            <q-btn
              unelevated
              color="orange"
              text-color="white"
              icon="star"
              label="取消收藏"
              :loading="loading"
              @click="unfavor"
              v-else
            />
          </q-item-label>
        </q-item-section>
      </q-item>

      <div class="row">
        <div class="col">
          <div class="q-px-lg">
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
          <div
            class="translucent-card q-my-md q-mr-md q-pa-md"
            style="width: 300px"
            v-if="data.content_entity_versions?.length > 0"
          >
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
                      {{ version.date_created ? date.formatDate(version.date_created, 'YYYY/MM/DD HH:mm:ss') : '-' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator v-if="index !== data.content_entity_versions.length - 1" />
              </div>
            </q-list>
          </div>
        </div>
      </div>

      <q-inner-loading :showing="loading" style="border-radius: 16px">
        <q-spinner-ios size="50px" color="primary" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { date } from 'quasar';
import { ProjectService, UserFavoriteService } from 'src/service';
import { useKeepAliveStore } from 'src/stores/keep-alive';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRefreshStore } from 'src/stores/refresh';

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

/**
 * 判断是否已收藏
 */
const judgeIsFavorite = async () => {
  isFavorite.value = await UserFavoriteService.isFavorite(id.value);
};
// 收藏
const favor = async () => {
  await UserFavoriteService.favor('1', id.value, undefined);
};
// 取消收藏
const unfavor = async () => {
  await UserFavoriteService.unfavor(id.value);
};
/**
 * 加载数据
 */
const loadData = async () => {
  loading.value = true;
  if (route.query.id) {
    id.value = route.query.id as string;
    try {
      data.value = await ProjectService.getEntityDetail(id.value);
      judgeIsFavorite();
      keepAliveStore.tabList.forEach(tab => {
        if (tab.fullPath === route.fullPath)
          tab.meta.title = data.value.name ? data.value.name + ' - 软件详情' : '未命名软件 - 软件详情';
      });
      loading.value = false;
    } catch (e) {
      loading.value = false;
      keepAliveStore.deleteTabByPath(route.fullPath);
    }
  } else {
    console.log('error: 缺少参数');
    loading.value = false;
    keepAliveStore.deleteTabByPath(route.fullPath);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.software-detail-div {
  min-height: calc(100vh - 88px);
}
.more-info {
  display: flex;
}
@media (max-width: $breakpoint-sm-max) {
  .more-info {
    display: none;
  }
}
</style>
