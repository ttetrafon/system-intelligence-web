import type { AnyDocumentCommand } from './requests';

/** Client → Server: a single command to apply */
export interface WsClientMessage {
  type: 'command';
  system: string;
  dataKey: string;
  command: AnyDocumentCommand;
  commandId?: string;
}

/** Server → Client: broadcast of applied commands */
export interface WsServerMessage {
  type: 'game-system-update';
  system: string;
  dataKey: string;
  commands: AnyDocumentCommand[];
}

/** Server → Client: acknowledgement sent back to the original sender */
export interface WsServerAck {
  type: 'command-ack';
  commandId: string;
}

/** Server → Client: error notification */
export interface WsServerError {
  type: 'error';
  message: string;
}

export type WsIncoming = WsServerMessage | WsServerAck | WsServerError;
