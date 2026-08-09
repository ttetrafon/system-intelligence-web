import type { AnyDocumentCommand } from './commands';

export type WsMsgType = 'chat' | 'command';

/** Client → Server: a single command to apply */
export interface WsClientMessage {
  type: WsMsgType;
  system: string;
  command?: AnyDocumentCommand;
}

/** Server → Client: broadcast of applied commands */
export interface WsServerMessage {
  type: 'game-system-update';
  system: string;
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
