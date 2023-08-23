<template>
  <router-view />
</template>

<script setup lang="ts">
import { EntityService } from './service/content-entity';
import { EntityType } from './interface/category';
import { InitEntity } from 'ytsw-software-usecase';

// 注册添加用例软件service
InitEntity(
  {
    getEntityList: EntityService.getEntityList,
    getEntityInfo: EntityService.getEntityInfo,
    getEntityVersionInfo: EntityService.getEntityVersionInfo,
    getEntityFileDownloadUrl: EntityService.getEntityFileDownloadUrl,
    createContentEntity: EntityService.createContentEntity,
    createContentEntityVersion: EntityService.createContentEntityVersion,
    updateContentEntity: EntityService.updateContentEntity,
    updateContentEntityVersion: EntityService.updateContentEntityVersion,
    getTemplateKeys: EntityService.getTemplateKeys,
  },
  EntityType,
  () => {
    window.close();
  }
);
</script>

<style lang="scss">
body {
  font-size: 16px;
}
</style>
