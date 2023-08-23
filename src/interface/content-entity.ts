import { EntityStatus } from './category';

export interface contentEntityListInterface {
  isFavorite?: boolean;
  favoriteId?: string;
  entityId: string;
  status: EntityStatus;
  favoriteCount: number;
  createUserId: string;
  name: string;
  systemName: string;
  desc: string;
  isFeatured: boolean;
  isOfficial: boolean;
  entityType: string;
  author: string;
  logo: string;
  createDate: string;
  tags: Array<{
    tagId: string;
    tagName: string;
  }>;
  versionList: Array<{
    versionId: string;
    versionTag: string;
    fileId: string;
    fileType: string;
  }>;
  dependVersionList: Array<{
    dependSoftId: string;
    dependSoftName: string;
    dependSoftVersionId: string;
    dependSoftVersion: string;
  }>;
}
