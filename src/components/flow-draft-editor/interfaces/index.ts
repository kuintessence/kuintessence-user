/******************** Automatically ********************/
/**
 * 节点类型
 */
export const NodeType = [{ name: 'SoftwareUsecaseComputing', label: '高性能计算' }];

/**
 * 工作流草稿数据
 */
export interface FlowDraft {
  /**
   * 工作流草稿id
   */
  id: string;
  /**
   * 工作流草稿名称
   */
  name?: string;
  /**
   * 工作量草稿描述（不用导出
   */
  description?: string;
  /**
   * 工作流草稿logo
   */
  logo?: string;
  /**
   * 工作流草稿spec
   */
  spec?: FlowDraftSpec;
  /**
   * 用户id（不用导出
   */
  user_id?: string;
  /**
   * 创建时间
   */
  created_time?: string;
  /**
   * 创建时间
   */
  last_modified_time?: string;
  /**
   * 类型：0-工作流，1-单任务，2-多任务
   */
  type?: number;
}

/**
 * 工作流草稿spec
 */
export interface FlowDraftSpec {
  /**
   * 调度策略
   */
  schedulingStrategy:
    | AutoSchedulingStrategy
    | ManualSchedulingStrategy
    | PreferSchedulingStrategy
    | UnknownSchedulingStrategy;
  /**
   * 草稿节点列表
   */
  nodeDrafts: NodeDraft[];
  /**
   * 草稿节点关系列表
   */
  nodeRelations: NodeRelation[];
  /**
   * 附加数据
   */
  additionalData?: any;
}

/**
 * 手动指定一些集群，系统算法必须在这些里面选择
 */
export interface ManualSchedulingStrategy {
  type: 'Manual';
  queues: string[];
}

/**
 * 使用系统算法选择
 */
export interface AutoSchedulingStrategy {
  type: 'Auto';
}

/**
 * 手动指定一些集群，系统算法优先在这些里面选择
 */
export interface PreferSchedulingStrategy {
  type: 'Prefer';
  queues: string[];
}

export interface UnknownSchedulingStrategy {
  type: 'Unknown';
}

/**
 * 草稿节点数据
 */
export interface NodeOriginData {
  additionalDatas?: any;
  requirements: Requirements;
  /**
   * 批量策略
   */
  batchStrategies?: OriginalBatchStrategy | MatchRegexBatchStrategy | UnknownBatchStrategy | null;
  /**
   * 草稿节点描述
   */
  description: string;
  inputSlots: (TextInputSlot | FileInputSlot | UnknownInputSlot)[];
  /**
   * 草稿节点名称
   */
  name: string;
  schedulingStrategy:
    | AutoSchedulingStrategy
    | ManualSchedulingStrategy
    | PreferSchedulingStrategy
    | UnknownSchedulingStrategy;
  outputSlots: (TextOutputSlot | FileOutputSlot | UnknownOutputSlot)[];
  usecaseVersionId: string;
  type: 'SoftwareUsecaseComputing' | 'Unknown';
  softwareVersionId: string;
}

/**
 * 草稿节点
 */
export interface NodeDraft extends NodeOriginData {
  /**
   * 草稿节点外部 id
   */
  externalId: string;
}

/**
 * 本身一批文件就是处理好的，naming pattern 可以提供也可以不提供
 */
export interface OriginalBatchStrategy {
  /**
   * 输入插槽描述符
   */
  inputSlotDescriptor: string;
  renamingPattern: string;
  type: 'OriginalBatch';
}

/**
 * 根据一个文件中的正则以不同填充产生的批量文件
 */
export interface MatchRegexBatchStrategy {
  fillCount: number;
  /**
   * 填充规则
   */
  filler: AutoNumberFiller | EnumerationFiller | UnknownFiller;
  /**
   * 输入插槽描述符
   */
  inputSlotDescriptor: string;
  /**
   * 文件中要应用填充规则的正则表达式
   */
  regexToMatch: string;
  renamingPattern: string;
  type: 'MatchRegex';
}

export interface UnknownBatchStrategy {
  type: 'Unknown';
}

/**
 * 自动化填充
 */
export interface AutoNumberFiller {
  start: number;
  step: number;
  type: 'AutoNumber';
}

/**
 * 枚举类型的填充规则
 */
export interface EnumerationFiller {
  /**
   * 从枚举字符串中随机生成用于填充该占位符的字符串形成列表
   */
  items: string[];
  type: 'Enumeration';
}

export interface UnknownFiller {
  type: 'Unknown';
}

/**
 * 文本类型输入插槽
 */
export interface TextInputSlot {
  contents?: string[] | null;
  description?: string | null;
  descriptor: string;
  optional?: boolean | null;
  rule?: JsonRule | AnyStringRule | NumberRule | RegexRule | UnknownRule | null;
  type: 'Text';
}

/**
 * 文件类型输入插槽
 */
export interface FileInputSlot {
  contents?: InputedFile[] | null;
  description?: string | null;
  descriptor: string;
  /**
   * 文件自动匹配使用的名字 使用 usecase 期望的文件名称
   */
  expectedFileName?: string | null;
  isBatch: boolean;
  optional?: boolean | null;
  type: 'File';
}

export interface UnknownInputSlot {
  type: 'Unknown';
}

export interface JsonRule {
  type: 'Json';
}

export interface AnyStringRule {
  type: 'AnyString';
}

export interface NumberRule {
  type: 'Number';
}

export interface RegexRule {
  regex: string;
  type: 'Regex';
}

export interface UnknownRule {
  type: 'Unknown';
}

/**
 * 输入文件
 */
export interface InputedFile {
  fileMetadataId: string;
  fileMetadataName: string;
  hash: string;
  size: number;
}

/**
 * 文本类型输出插槽
 */
export interface TextOutputSlot {
  description?: string | null;
  descriptor: string;
  optional?: boolean | null;
  type: 'Text';
}

/**
 * 文件类型输出插槽
 */
export interface FileOutputSlot {
  description?: string | null;
  descriptor: string;
  isBatch: boolean;
  optional?: boolean | null;
  /**
   * 输出来源
   */
  origin: string;
  type: 'File';
}

export interface UnknownOutputSlot {
  type: 'Unknown';
}

/**
 * 详细配置
 */
export interface Requirements {
  /**
   * 核心数
   */
  cpuCores?: number | null;
  /**
   * 节点数
   */
  nodeCount?: number | null;
  /**
   * 最长运行时间(h)
   */
  maxWallTime?: number | null;
  /**
   * 最大核时消耗(h)
   */
  maxCpuTime?: number | null;
  /**
   * 定时终止
   */
  stopTime?: string | null;
}

/**
 * 草稿节点依赖关系
 */
export interface NodeRelationData {
  slotRelations: SlotRelation[];
}
export interface NodeRelation extends NodeRelationData {
  fromId: string;
  toId: string;
}

/**
 * 节点依赖关系中的插槽依赖关系
 */
export interface SlotRelation {
  fromSlot: string;
  toSlot: string;
  transferStrategy: NetworkTransferStrategy | DiskTransferStrategy | UnknownTransferStrategy;
}

export interface NetworkTransferStrategy {
  type: 'Network';
}

export interface DiskTransferStrategy {
  type: 'Disk';
}

export interface UnknownTransferStrategy {
  type: 'Unknown';
}

/******************** Other ********************/

/**
 * 节点和连线在工作流中的原始数据
 */

export interface NodeOrigin {
  id?: string;
  data?: {
    requirements?: Requirements;
    /**
     * 批量策略
     */
    batchStrategies?: OriginalBatchStrategy | MatchRegexBatchStrategy | UnknownBatchStrategy | null;
    /**
     * 草稿节点描述
     */
    description?: string;
    inputSlots?: (TextInputSlot | FileInputSlot | UnknownInputSlot)[];
    /**
     * 草稿节点名称
     */
    name?: string;
    schedulingStrategy?:
      | AutoSchedulingStrategy
      | ManualSchedulingStrategy
      | PreferSchedulingStrategy
      | UnknownSchedulingStrategy;
    outputSlots?: (TextOutputSlot | FileOutputSlot | UnknownOutputSlot)[];
    usecaseVersionId?: string;
    type?: 'SoftwareUsecaseComputing' | 'Unknown';
    softwareVersionId?: string;
  };
  shape?: string;
  ports?: any;
}

export interface NodeRelationOrigin {
  id?: string;
  source?: string;
  target?: string;
  data: NodeRelationData;
  shape: string;
  zIndex: number;
}

/**
 * TODO: 工作流JSON-spec-节点-数据插槽
 */
export interface DataSlot {
  description?: string;
  descriptor?: string;
  isBatch?: boolean;
  kind?: string;
  result?: any;
  nodeId?: string;
  slotId?: string;
  isDepend?: boolean;
  dependData?: {
    fromId?: string;
    fromSlot?: string;
    transferStrategy?: {
      type?: string;
    };
  };
}

/**
 * 内容实体
 */
export interface ContentEntity {
  uuid?: string;
  system_name?: string;
  display_name?: string;
  is_featured?: boolean;
  is_official?: boolean;
  entity_dependency?: {
    uuid?: string;
    display_name?: string;
  };
  content_entity_versions?: {
    uuid?: string;
    tag?: string;
  }[];
  /**
   * 临时存储选项等
   */
  dependentVersions?: {
    contentDependencyId?: string;
    version?: string;
  }[];
  selectedVersion?: {
    uuid?: string;
    tag?: string;
  };
  selectedDependentVersion?: {
    contentDependencyId?: string;
    version?: string;
  };
}

/**
 * 内容
 */
export interface ContentRepo {
  uuid?: string;
  system_name?: string;
  display_name?: string;
  description?: string;
  metadata?: JSON;
  content_entitis: ContentEntity[];
  available_users?: string[];
  repo_dependency: ContentRepo[];
  repo_dependency_required: boolean;
}

/**
 * 自定义组件
 */
export interface CustomComponent {
  uuid?: string;
  user_id?: string;
  content_entity_id?: string;
  content_entity_version_id?: string;
  content_entity_dependency_id?: string;
  content_entity_dependency_version_id?: string;
  content_repo_id?: string;
  display_name?: string;
  is_featured?: string;
  is_official?: string;
}

/**
 * 资源(集群)
 */
export interface Resource {
  name?: string;
  usingRate?: number;
  price?: number;
  location?: string;
}

/**
 * 连接桩配置
 */
export const ports = {
  groups: {
    left: {
      position: 'left',
      attrs: {
        circle: {
          r: 4,
          magnet: 'passive',
          stroke: '#c2c8d5',
          strokeWidth: 1.5,
          fill: '#fff',
        },
      },
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#c2c8d5',
          strokeWidth: 1.5,
          fill: '#fff',
        },
      },
    },
  },
  items: [
    {
      group: 'left',
    },
    {
      group: 'right',
    },
  ],
};
export const instancePorts = {
  groups: {
    left: {
      position: 'left',
      attrs: {
        circle: {
          r: 4,
          magnet: false,
          stroke: '#c2c8d5',
          strokeWidth: 1.5,
          fill: '#fff',
        },
      },
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          r: 4,
          magnet: false,
          stroke: '#c2c8d5',
          strokeWidth: 1.5,
          fill: '#fff',
        },
      },
    },
  },
  items: [
    {
      group: 'left',
    },
    {
      group: 'right',
    },
  ],
};

/**
 * 导出时为防止样式丢失，附带样式
 */
export const exportStylesheet = `
.x6-graph-svg {
  background: #dff9ff;
}
.default-node {
  width: 134px;
  height: 80px;
  border-radius: 16px;
  color: #000000;
  padding-left: 8px;
  padding-right: 8px;
  transition: all 0.3s;
  border: 1px solid #c9c9c9;
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 20%), 0 1px 1px rgb(0 0 0 / 14%),
    0 2px 1px -1px rgb(0 0 0 / 12%);
}
.default-node .first-row {
  width: 134px !important;
  display: flex;
  height: 44px;
  line-height: 44px;
  border-bottom: 1px solid #c2c2c2;
}
.default-node .details-row {
  width: 150px !important;
  transform: translate3d(1%, 1%, 0) scale(0.9);
  margin-left: -6.5px;
  margin-right: -6.5px;
  height: 28px;
  line-height: 28px;
}
.default-node .center {
  width: 100%;
  height: 44px;
  font-size: 15px;
  margin-right: 6px;
}
.default-node .right-side {
  display: flex;
  width: 18px;
  height: 44px;
  padding-top: 13px;
  padding-bottom: 13px;
}

.htc-node-1 {
  z-index: -2;
  position: absolute;
  top: -5px;
  left: -5px;
  opacity: 0.66;
  border: 1px solid #c9c9c9;
  box-shadow: 0 1px 3px rgb(0 0 0 / 20%), 0 1px 1px rgb(0 0 0 / 14%),
    0 2px 1px -1px rgb(0 0 0 / 12%);
}
.htc-node-2 {
  position: absolute;
  top: -9px;
  left: -9px;
  z-index: -3;
  opacity: 0.33;
  border: 1px solid #c9c9c9;
  box-shadow: 0 1px 3px rgb(0 0 0 / 20%), 0 1px 1px rgb(0 0 0 / 14%),
    0 2px 1px -1px rgb(0 0 0 / 12%);
}
.scroll-wrap {
  max-width: 100%;
  display: inline-block;
  vertical-align: top;
  overflow: hidden;
  white-space: nowrap;
}
.scroll-item:hover {
  animation: scroll linear 3s alternate infinite;
  float: left;
}
@keyframes scroll {
  0% {
    margin-left: 0;
    transform: translateX(0);
  }
  10% {
    margin-left: 0;
    transform: translateX(0);
  }
  90% {
    margin-left: 100%;
    transform: translateX(-100%);
  }
  100% {
    margin-left: 100%;
    transform: translateX(-100%);
  }
}
`;
