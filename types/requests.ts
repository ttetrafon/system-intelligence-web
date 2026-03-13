import type { Block } from "./game";

export interface documentCommand {
  dataPath: string;
  dataProperty: string;
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

export type AnyDocumentCommand =
  | addBlockToDocumentCommand
  | removeBlockFromDocument
  | reorderBlocksInDocument
  | updateBlockInDocument;

export interface UpdateBody {
  dataPath: string;
  dataProperty: string;
  dataKey: string;
  data: AnyDocumentCommand[];
}
