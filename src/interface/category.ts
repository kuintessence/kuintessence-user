export const EntityType = {
  template: 'template',
  soft: 'softwares',
  usecase: 'features',
};
export enum EntityStatus {
  published = 'published',
  draft = 'draft',
  archived = 'archived',
}

export const FavoriteType = {
  [EntityType.template]: 1,
  [EntityType.usecase]: 2,
  [EntityType.soft]: 3,
};
