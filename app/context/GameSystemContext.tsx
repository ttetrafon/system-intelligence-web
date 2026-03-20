import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { BlockDocument, DataLinks, GameSystemData } from "../../types/game";
import type { AnyDocumentCommand } from "../../types/requests";
import type { WsIncoming } from "../../types/websocket";
import { addBlockToDocument, removeBlockFromDocument, reorderBlocksInDocument, updateBlockInDocument } from "../../util/data";
import { buildDataLinks } from "../../util/game";
import { useWebSocket } from "./WebSocketContext";

const LS_KEY_GAME_SYSTEM = 'si:game-system';

interface GameSystemContextType {
  data: GameSystemData | null;
  dataLinks: DataLinks | null;
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

  useEffect(() => {
    const unsub = subscribe((msg: WsIncoming) => {
      if (msg.type !== 'game-system-update') return;
      const payload = msg as { dataKey: string; commands: AnyDocumentCommand[] };
      setData(prev => {
        if (!prev) return prev;
        const keys = payload.dataKey.split('.');
        const updated = { ...prev };
        let node: Record<string, unknown> = updated as unknown as Record<string, unknown>;
        for (let i = 0; i < keys.length - 1; i++) {
          node[keys[i]] = { ...(node[keys[i]] as Record<string, unknown>) };
          node = node[keys[i]] as Record<string, unknown>;
        }
        const docKey = keys[keys.length - 1];
        const existing = node[docKey] as BlockDocument;
        const doc: BlockDocument = { order: [...existing.order], blocks: { ...existing.blocks } };
        for (const cmd of payload.commands) {
          if ('block' in cmd) {
            addBlockToDocument(doc, cmd.block, cmd.position);
          } else if ('blockId' in cmd) {
            removeBlockFromDocument(doc, cmd.blockId);
          } else if ('updatedOrder' in cmd) {
            reorderBlocksInDocument(doc, cmd.updatedOrder);
          } else if ('updatedBlock' in cmd) {
            updateBlockInDocument(doc, cmd.updatedBlock);
          }
        }
        node[docKey] = doc;
        localStorage.setItem(LS_KEY_GAME_SYSTEM, JSON.stringify(updated));
        return updated;
      });
    });
    return unsub;
  }, [subscribe]);

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
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    if (!data) return;
    buildDataLinks(data).then(setDataLinks).catch(() => {});
  }, [data]);

  return (
    <GameSystemContext.Provider value={{ data, dataLinks }}>
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
