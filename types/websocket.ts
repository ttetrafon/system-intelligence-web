import type { AnyDocumentCommand } from './requests';

/** Client → Server: a single command to apply */
export interface WsClientMessage {
  type: 'command';
  system: string;
  dataKey: string;
  command: AnyDocumentCommand;
}

/** Server → Client: broadcast of applied commands */
export interface WsServerMessage {
  type: 'game-system-update';
  system: string;
  dataKey: string;
  commands: AnyDocumentCommand[];
}

/** Server → Client: error notification */
export interface WsServerError {
  type: 'error';
  message: string;
}

export type WsIncoming = WsServerMessage | WsServerError;
