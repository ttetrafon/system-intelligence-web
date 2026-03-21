import type { Block } from "./game";

export type documentCommandType = 'add-block'
  | 'remove-block'
  | 'reorder-blocks'
  | 'update-block'
  | 'add-morality-pair'
  | 'delete-morality-pair'
  | 'update-morality-pair';

export interface documentCommand {
  commandType: documentCommandType;
  dataKey: string;
}

export interface addBlockToDocumentCommand extends documentCommand {
  block: Block;
  position: number;
}

export interface removeBlockFromDocument extends documentCommand {
  blockId: string;
}

export interface reorderBlocksInDocument extends documentCommand {
  updatedOrder: string[];
}

export interface updateBlockInDocument extends documentCommand {
  updatedBlock: Block;
}

export interface moralityPairAdded extends documentCommand {
  id: string;
}

export interface moralityPairDeleted extends documentCommand {
  id: string;
}

export interface moralityPairUpdated extends documentCommand {
  id: string;
  field: 'first' | 'second';
  value: string;
}

export type AnyDocumentCommand =
  | addBlockToDocumentCommand
  | removeBlockFromDocument
  | reorderBlocksInDocument
  | updateBlockInDocument
  | moralityPairAdded
  | moralityPairDeleted
  | moralityPairUpdated;
