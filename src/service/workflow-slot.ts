import { UploadState } from './upload';

export interface NodeDraft {
  requirements: any;
  /**
   * 批量策略
   */
  isBatch: boolean;
  /**
   * 草稿节点描述
   */
  description: string;
  inputSlots: SlotData[];
  /**
   * 草稿节点名称
   */
  name: string;
  externalId: string;
  schedulingStrategy: any;
  outputSlots: any;
  usecaseVersionId: string;
  type: 'SoftwareUsecaseComputing';
  softwareVersionId: string;
}

export enum BatchRuleEnum {
  Original = 'OriginalBatch',
  Match = 'MatchRegex',
}
export interface BatchRuleOrigin {
  type: BatchRuleEnum.Original;
  renamingPattern?: string; //只有文件需要这个
}
export interface BatchRuleMatch {
  type: BatchRuleEnum.Match;
  renamingPattern?: string; //只有文件需要这个
  regexToMatch: ''; //文件中要应用填充规则的正则表达式,
  fillCount: ''; //填充个数
  filler: BatchRulehAuto | BatchRulehEnum;
}
export interface BatchRulehAuto {
  type: BatchRuleFillerTypeEnum.AutoNumber;
  start: number | string;
  step: number | string;
}
export interface BatchRulehEnum {
  type: BatchRuleFillerTypeEnum.Enumeration;
  items: any[];
}

export enum BatchRuleFillerTypeEnum {
  AutoNumber = 'AutoNumber',
  Enumeration = 'Enumeration',
}
export interface SlotData {
  isDepend: boolean;
  dependData: DependData | null;
  isBatch: boolean;
  name: string;
  description: string;
  kind: InputSlotKind;
  rule?: any;
  result: Array<FileSlotDataResult> | Array<TextSlotDataResult>;
  nodeId: string;
  slotId: string;
  isRequired: boolean;
  isMultiple: boolean;
  batchRule: null | BatchRuleOrigin | BatchRuleMatch;
  isError?: boolean;
}

export interface DependData {
  fromId: string;
  fromSlot: string;
  fromSlotData: any;
  transferStrategy: any;
}

export enum InputSlotKind {
  File = 'File',
  Text = 'Text',
}

export interface FileSlotData extends SlotData {
  dataName?: string;
  result: Array<FileSlotDataResult>;
}
export interface FileSlotDataResult {
  name: string;
  size: string | number;
  hash: string;
  id?: string;
  fileEntry?: File;
  progress?: {
    progress: number;
    speed: string;
    takeTime: string;
  };
  uploadStatus?: UploadState;
  cancel?: (state: UploadState) => void;
  retry?: () => void;
  isError?: boolean;
}
export interface TextSlotData extends SlotData {
  result: Array<TextSlotDataResult>;
  rule: TextSlotDataRule;
}

export enum TextSlotDataType {
  Json = 'Json',
  String = 'AnyString',
  Number = 'Number',
  Regex = 'Regex',
}

export interface TextSlotDataRule {
  type: TextSlotDataType;
}
export interface TextSlotDataRuleRegex extends TextSlotDataRule {
  regex?: string;
}

export interface TextSlotDataResult {
  trueValue: any;
  isError?: boolean;
}

export class WorkflowSlotService {
  //将前端node数据，重构回接口数据
  static generateNodeData(nodes: NodeDraft[]) {
    const nodesData = nodes.map((node: NodeDraft, nindex: number) => {
      return WorkflowSlotService.generateTheNodeData(node);
    });
    return nodesData;
  }
  //将前端单个node数据，重构回接口数据
  static generateTheNodeData(node: NodeDraft) {
    const batchStrategies: any = node.isBatch ? [] : null;
    const inputSlots = node.inputSlots.map((slot: SlotData) => {
      const slotData: any = {
        type: slot.kind,
        name: slot.name,
        description: slot.description,
        descriptor: slot.slotId,
        optional: slot.isRequired ? false : true,
        rule: slot.rule,
        isBatch: slot.isBatch,
      };

      switch (slot.kind) {
        case InputSlotKind.File:
          const fileResult: FileSlotDataResult[] = <FileSlotDataResult[]>slot.result;
          slotData.expectedFileName = (<FileSlotData>slot).dataName;
          slotData.contents = fileResult.map((slotResult: FileSlotDataResult) => {
            return {
              fileMetadataId: slotResult.id,
              fileMetadataName: slotResult.name,
              hash: slotResult.hash,
              size: slotResult.size,
            };
          });
          break;
        case InputSlotKind.Text:
          const textResult: TextSlotDataResult[] = <TextSlotDataResult[]>slot.result;
          slotData.contents = textResult.map((slotResult: TextSlotDataResult) => {
            return slotResult.trueValue;
          });
          break;
      }
      if (node.isBatch && slot.batchRule) {
        const batchRule: any = slot.batchRule;
        batchRule.inputSlotDescriptor = slot.slotId;
        batchStrategies.push(batchRule);
      }
      return slotData;
    });
    const nodeData = {
      name: node.name,
      description: node.description,
      requirements: node.requirements,
      inputSlots: inputSlots,
      outputSlots: node.outputSlots,
      batchStrategies,
      externalId: node.externalId,
      schedulingStrategy: node.schedulingStrategy,
      usecaseVersionId: node.usecaseVersionId,
      type: node.type,
      softwareVersionId: node.softwareVersionId,
    };
    return nodeData;
  }
  //将接口返回的node数据 改造成前端的结构
  static analyNode(nodes: any[], relations: any[]): NodeDraft[] {
    nodes.forEach((node: any, nindex: number) => {
      nodes[nindex] = WorkflowSlotService.analyTheNode(node, relations);
    });
    return nodes;
  }
  //将接口数据单个node改造成前端数据
  static analyTheNode(node: any, relations: any[]): NodeDraft {
    const nodeData: NodeDraft = {
      name: node.name || '',
      description: node.description || '',
      requirements: node.requirements,
      inputSlots: WorkflowSlotService.analyNodeToSlot(node, relations),
      outputSlots: node.outputSlots,
      isBatch: node.batchStrategies ? true : false,
      externalId: node.externalId,
      schedulingStrategy: node.schedulingStrategy,
      usecaseVersionId: node.usecaseVersionId,
      type: node.type,
      softwareVersionId: node.softwareVersionId,
    };
    return nodeData;
  }
  //根据node生成插槽数据
  static analyNodeToSlot(node: any, relations?: any[]): SlotData[] {
    const batch = node.batchStrategies;
    const inputSlots = node.inputSlots;

    const slotList: SlotData[] = [];
    inputSlots.forEach((inputSlot: any) => {
      const slotData: SlotData = {
        name: inputSlot.name || '',
        description: inputSlot.description || '',
        isBatch: inputSlot.isBatch || false,
        isMultiple: inputSlot.isBatch || false,
        kind: inputSlot.type,
        rule: inputSlot.rule,
        result: [],
        nodeId: node.externalId,
        slotId: inputSlot.descriptor,
        isDepend: false,
        dependData: null,
        isRequired: inputSlot.optional != undefined ? !inputSlot.optional : true,
        batchRule: null,
      };
      if (relations) {
        //分析依赖关系
        const nodeRelations = relations.filter((r: any) => {
          return r.toId == slotData.nodeId;
        });
        nodeRelations.forEach((relation: any) => {
          const slotRelation = relation.slotRelations.find((pr: any) => {
            return pr.toSlot == slotData.slotId;
          });
          if (slotRelation) {
            slotData.isDepend = true;
            const fromSlotData =
              node.outputSlots && node.outputSlots.find((op: any) => op.descriptor == slotRelation.fromSlot);
            slotData.dependData = {
              fromId: relation.fromId,
              fromSlot: slotRelation.fromSlot,
              fromSlotData,
              transferStrategy: slotRelation.transferStrategy,
            };
          }
        });
      }
      //分析高通量
      if (batch) {
        const inputBatch = batch.find((b: any) => {
          return b.inputSlotDescriptor == slotData.slotId;
        });
        if (inputBatch) {
          if (inputBatch.type == BatchRuleEnum.Original) {
            const batchRule: BatchRuleOrigin = {
              type: BatchRuleEnum.Original,
              renamingPattern: inputBatch.renamingPattern || '',
            };
            slotData.batchRule = batchRule;
          } else if (inputBatch.type == BatchRuleEnum.Match) {
            const batchRule: BatchRuleMatch = {
              type: BatchRuleEnum.Match,
              regexToMatch: inputBatch.regexToMatch || '',
              renamingPattern: inputBatch.renamingPattern || '',
              fillCount: inputBatch.fillCount || '',
              filler: inputBatch.filler || {
                type: BatchRuleFillerTypeEnum.AutoNumber,
                start: '',
                step: '',
              },
            };
            slotData.batchRule = batchRule;
          }
        }
      }
      //分析插槽类型
      switch (inputSlot.type) {
        case InputSlotKind.File:
          inputSlot.contents?.forEach((content: any) => {
            (<FileSlotData>slotData).result.push({
              id: content.fileMetadataId,
              name: content.fileMetadataName,
              size: content.size,
              hash: content.hash,
            });
          });
          (<FileSlotData>slotData).dataName = inputSlot.expectedFileName;
          break;
        case InputSlotKind.Text:
          inputSlot.contents?.forEach((content: any) => {
            (<TextSlotData>slotData).result.push({
              trueValue: content,
            });
          });
          break;
      }
      slotList.push(slotData);
    });
    return slotList;
  }
  //将result的数据更新到JSON中
  static updateSlot(draftId: string, slotData: SlotData) {
    // console.log(
    //   '实时更新数据',
    //   'draftID:' + draftId,
    //   'nodeId:' + slotData.nodeId,
    //   'slotId:' + slotData.slotId,
    //   'result:',
    //   slotData
    // );
  }
}
