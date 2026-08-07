export type DocumentCommandType = 'add-block'
  | 'remove-block'
  | 'reorder-blocks'
  | 'update-block'
  | 'add-morality-pair'
  | 'delete-morality-pair'
  | 'update-morality-pair';

export interface DocumentCommand {
  commandId: string;
  commandTimestamp: number;
  commandType: DocumentCommandType;
  dataKey: string;
  acknowledged: boolean;
}

export interface AddBlockToDocument extends DocumentCommand {
  blockId: string;
  data: string;
  position: number;
}

export class AddBlockToDocumentCmd implements AddBlockToDocument {
  commandId: string = crypto.randomUUID();
  commandTimestamp: number = new Date().getTime();
  commandType: DocumentCommandType = 'add-block';
  dataKey: string;
  acknowledged: boolean = false;
  blockId: string;
  data: string;
  position: number;

  constructor(dataKey: string, blockId: string, data: string, position: number) {
    this.dataKey = dataKey;
    this.blockId = blockId;
    this.data = data;
    this.position = position;
  }
}

export interface RemoveBlockFromDocument extends DocumentCommand {
  blockId: string;
  deletedData: string;
}

export class RemoveBlockFromDocumentCmd implements RemoveBlockFromDocument {
  commandId: string = crypto.randomUUID();
  commandTimestamp: number = new Date().getTime();
  commandType: DocumentCommandType = 'remove-block';
  dataKey: string;
  acknowledged: boolean = false;
  blockId: string;
  deletedData: string;
  removedFromPosition: number;

  constructor(dataKey: string, blockId: string, deletedData: string, removedFromPosition: number) {
    this.dataKey = dataKey;
    this.blockId = blockId;
    this.deletedData = deletedData;
    this.removedFromPosition = removedFromPosition;
  }
}

export interface ReorderBlocksInDocument extends DocumentCommand {
  updatedOrder: string[];
  previousOrder: string[];
}

export class ReorderBlocksInDocumentCmd implements ReorderBlocksInDocument {
  commandId: string = crypto.randomUUID();
  commandTimestamp: number = new Date().getTime();
  commandType: DocumentCommandType = 'reorder-blocks';
  dataKey: string;
  acknowledged: boolean = false;
  updatedOrder: string[];
  previousOrder: string[];

  constructor(dataKey: string, updatedOrder: string[], previousOrder: string[]) {
    this.dataKey = dataKey;
    this.updatedOrder = updatedOrder;
    this.previousOrder = previousOrder;
  }
}

export interface UpdateBlockInDocument extends DocumentCommand {
  blockId: string;
  data: string;
  previousData: string;
}

export class UpdateBlockInDocumentCmd implements UpdateBlockInDocument {
  commandId: string = crypto.randomUUID();
  commandTimestamp: number = new Date().getTime();
  commandType: DocumentCommandType = 'update-block';
  dataKey: string;
  acknowledged: boolean = false;
  blockId: string;
  data: string;
  previousData: string

  constructor(dataKey: string, blockId: string, data: string, previousData: string) {
    this.dataKey = dataKey;
    this.blockId = blockId;
    this.data = data;
    this.previousData = previousData;
  }
}

export interface MoralityPairAdded extends DocumentCommand {
  id: string;
}

export class MoralityPairAddedCmd implements MoralityPairAdded {
  commandId: string = crypto.randomUUID();
  commandTimestamp: number = new Date().getTime();
  commandType: DocumentCommandType = 'add-morality-pair';
  dataKey: string;
  acknowledged: boolean = false;
  id: string;

  constructor(dataKey: string, id: string) {
    this.dataKey = dataKey;
    this.id = id;
  }
}

export interface MoralityPairDeleted extends DocumentCommand {
  id: string;
  previousValues: {
    first: string;
    second: string;
  }
}

export class MoralityPairDeletedCmd implements MoralityPairDeleted {
  commandId: string = crypto.randomUUID();
  commandTimestamp: number = new Date().getTime();
  commandType: DocumentCommandType = 'delete-morality-pair';
  dataKey: string;
  acknowledged: boolean = false;
  id: string;
  previousValues: {
    first: string;
    second: string;
  }

  constructor(dataKey: string, id: string, previousFirstValue: string, previousSecondValue: string) {
    this.dataKey = dataKey;
    this.id = id;
    this.previousValues = {
      first: previousFirstValue,
      second: previousSecondValue,
    };
  }
}

export interface MoralityPairUpdated extends DocumentCommand {
  id: string;
  field: 'first' | 'second';
  value: string;
  previousValue: string;
}

export class MoralityPairUpdatedCmd implements MoralityPairUpdated {
  commandId: string = crypto.randomUUID();
  commandTimestamp: number = new Date().getTime();
  commandType: DocumentCommandType = 'delete-morality-pair';
  dataKey: string;
  acknowledged: boolean = false;
  id: string;
  field: "first" | "second";
  value: string;
  previousValue: string

  constructor(dataKey: string, id: string, field: 'first' | 'second', value: string, previousValue: string) {
    this.dataKey = dataKey;
    this.id = id;
    this.field = field;
    this.value = value;
    this.previousValue = previousValue;
  }
}

export type AnyDocumentCommand =
  | AddBlockToDocument
  | RemoveBlockFromDocument
  | ReorderBlocksInDocument
  | UpdateBlockInDocument
  | MoralityPairAdded
  | MoralityPairDeleted
  | MoralityPairUpdated;
