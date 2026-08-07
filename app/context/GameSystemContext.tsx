import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { MkDocument, DataLinks, GameSystemData, MoralityPair } from "../../types/game";
import type { AddBlockToDocument, AnyDocumentCommand, RemoveBlockFromDocument, ReorderBlocksInDocument, UpdateBlockInDocument } from "../../types/commands";
import type { WsIncoming } from "../../types/websocket";
import { useCommandHistory } from "../../util/commands";
import { useWebSocket } from "./WebSocketContext";
import { addBlockToDocument, removeBlockFromDocument, reorderBlocksInDocument, updateBlockInDocument } from "util/data";

// const LS_KEY_GAME_SYSTEM = 'si:game-system';

interface GameSystemContextType {
  dataSystem: string;
  data: GameSystemData | null;
  dataLinks: DataLinks | null;
  editing: boolean;
  applyCommand: (command: AnyDocumentCommand) => void;
}

const GameSystemContext = createContext<GameSystemContextType | undefined>(undefined);

export function GameSystemProvider({ children }: { children: ReactNode }) {
  const { subscribe, status } = useWebSocket();
  const { pushCmd, undoCmd, redoCmd, getAppliedCmd, clearCmd } = useCommandHistory();
  const [dataLinks, setDataLinks] = useState<DataLinks | null>(null);
  const [dataSystem, setDataSystem] = useState<string>("si");
  const [data, setData] = useState<GameSystemData | null>(null);
  const [editing, setEditing] = useState<boolean>(true); // TODO: default to 'false' and then switch if allowed!
  // TODO: will need an editing value for each user role... or apply roles directly in the element
  // TODO: will also need to check for editing authorisation server-side...

  // const [data, setData] = useState<GameSystemData | null>(() => {
  //   try {
  //     const cached = localStorage.getItem(LS_KEY_GAME_SYSTEM);
  //     return cached ? (JSON.parse(cached) as GameSystemData) : null;
  //   } catch {
  //     return null;
  //   }
  // });

  useEffect(() => {
    console.log("...game-data updated:", data);
  }, [data]);

  // Apply a command optimistically to local state (used by the sender before the server echoes back)
  const applyCommand = useCallback((command: AnyDocumentCommand) => {
    // add the command to history
    pushCmd(command);

    setData(prev => {
      if (!prev) return prev;

      // TODO: this should be extracted in the lib, as it will be used exactly the same server-side (on the System Notifier)
      const keys = command.dataKey.split('.');
      const updated = { ...prev };
      let node: Record<string, unknown> = updated as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        node[keys[i]] = { ...(node[keys[i]] as Record<string, unknown>) };
        node = node[keys[i]] as Record<string, unknown>;
      }
      const docKey = keys[keys.length - 1];
      let cmd = null;

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
      else if (command.commandType === 'add-block') {
        const existing = node[docKey] as MkDocument;
        cmd = command as AddBlockToDocument;
        addBlockToDocument(existing, cmd.blockId, cmd.data, cmd.position);
      }
      else if (command.commandType === 'remove-block') {
        const existing = node[docKey] as MkDocument;
        cmd = command as RemoveBlockFromDocument;
        removeBlockFromDocument(existing, cmd.blockId);
      }
      else if (command.commandType === 'reorder-blocks') {
        const existing = node[docKey] as MkDocument;
        cmd = command as ReorderBlocksInDocument;
        reorderBlocksInDocument(existing, cmd.updatedOrder);
      }
      else if (command.commandType === 'update-block') {
        const existing = node[docKey] as MkDocument;
        cmd = command as UpdateBlockInDocument;
        updateBlockInDocument(existing, cmd.blockId, cmd.data);
      }

      // localStorage.setItem(LS_KEY_GAME_SYSTEM, JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    const unsub = subscribe((msg: WsIncoming) => {
      if (msg.type !== 'game-system-update') return;
      const payload = msg as { commands: AnyDocumentCommand[] };
      for (const cmd of payload.commands) {
        applyCommand(cmd);
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
        // localStorage.setItem(LS_KEY_GAME_SYSTEM, JSON.stringify(fresh));
      })
      .catch(() => { });
  }, [status]);

  useEffect(() => {
    if (!data) return;
    // FIXME: buildDataLinks(data).then(setDataLinks).catch(() => { });
  }, [data]);

  return (
    <GameSystemContext.Provider value={{ dataSystem, data, dataLinks, editing, applyCommand }}>
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
