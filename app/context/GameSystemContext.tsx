import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { BlockDocument, DataLinks, GameSystemData, MoralityPair } from "../../types/game";
import type { AnyDocumentCommand } from "../../types/requests";
import type { WsIncoming } from "../../types/websocket";
import { applyCommandToDocument } from "../../util/commands";
import { buildDataLinks } from "../../util/game";
import { useWebSocket } from "./WebSocketContext";

const LS_KEY_GAME_SYSTEM = 'si:game-system';

interface GameSystemContextType {
  data: GameSystemData | null;
  dataLinks: DataLinks | null;
  applyCommand: (dataKey: string, command: AnyDocumentCommand) => void;
}

const GameSystemContext = createContext<GameSystemContextType | undefined>(undefined);

export const GameSystemProvider = ({ children }: { children: ReactNode }) => {
  const { subscribe, status } = useWebSocket();
  const [dataLinks, setDataLinks] = useState<DataLinks | null>(null);
  const [data, setData] = useState<GameSystemData | null>(() => {
    try {
      const cached = localStorage.getItem(LS_KEY_GAME_SYSTEM);
      return cached ? (JSON.parse(cached) as GameSystemData) : null;
    } catch {
      return null;
    }
  });

  // Apply a command optimistically to local state (used by the sender before the server echoes back)
  const applyCommand = useCallback((dataKey: string, command: AnyDocumentCommand) => {
    setData(prev => {
      if (!prev) return prev;
      const keys = dataKey.split('.');
      const updated = { ...prev };
      let node: Record<string, unknown> = updated as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        node[keys[i]] = { ...(node[keys[i]] as Record<string, unknown>) };
        node = node[keys[i]] as Record<string, unknown>;
      }
      const docKey = keys[keys.length - 1];

      // Handle non-block-document commands
      if (command.commandType === 'add-morality-pair' && 'id' in command) {
        const existing = (node[docKey] as MoralityPair[]) ?? [];
        node[docKey] = [...existing, { id: command.id, first: '', second: '' }];
      }
      else if (command.commandType === 'delete-morality-pair' && 'id' in command) {
        const existing = (node[docKey] as MoralityPair[]) ?? [];
        node[docKey] = existing.filter(p => p.id !== command.id);
      }
      else if (command.commandType === 'update-morality-pair' && 'id' in command && 'field' in command && 'value' in command) {
        const existing = (node[docKey] as MoralityPair[]) ?? [];
        node[docKey] = existing.map(p => p.id === command.id ? { ...p, [command.field as 'first' | 'second']: command.value as string } : p);
      }
      // Handle block-document commands
      else {
        const existing = node[docKey] as BlockDocument;
        const doc: BlockDocument = { order: [...existing.order], blocks: { ...existing.blocks } };
        applyCommandToDocument(doc, command);
        node[docKey] = doc;
      }

      localStorage.setItem(LS_KEY_GAME_SYSTEM, JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    const unsub = subscribe((msg: WsIncoming) => {
      if (msg.type !== 'game-system-update') return;
      const payload = msg as { dataKey: string; commands: AnyDocumentCommand[] };
      for (const cmd of payload.commands) {
        applyCommand(payload.dataKey, cmd);
      }
    });
    return unsub;
  }, [subscribe, applyCommand]);

  // Fetch full data on initial load and on WebSocket reconnect (to catch missed messages)
  useEffect(() => {
    if (status !== 'connected' && data !== null) return;

    fetch('/api/game-system/si')
      .then((res) => (res.ok ? (res.json() as Promise<GameSystemData>) : null))
      .then((fresh) => {
        if (!fresh) return;
        setData(fresh);
        localStorage.setItem(LS_KEY_GAME_SYSTEM, JSON.stringify(fresh));
      })
      .catch(() => { });
  }, [status]);

  useEffect(() => {
    if (!data) return;
    buildDataLinks(data).then(setDataLinks).catch(() => { });
  }, [data]);

  return (
    <GameSystemContext.Provider value={{ data, dataLinks, applyCommand }}>
      {children}
    </GameSystemContext.Provider>
  );
};

export const useGameSystem = () => {
  const context = useContext(GameSystemContext);
  if (context === undefined) {
    throw new Error('useGameSystem must be used within a GameSystemProvider');
  }
  return context;
};
