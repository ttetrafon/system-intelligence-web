import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { MkDocument, DataLinks, GameSystemData } from "../../types/game";
import type { AnyDocumentCommand } from "../../types/commands";
import type { WsIncoming, WsServerAck } from "../../types/websocket";
import { useCommandHistory } from "../../util/commands";
import { useWebSocket } from "./WebSocketContext";
import { updateMarkdownDocument } from "util/data";

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
  const { sendCommand, subscribe, status } = useWebSocket();
  const { pushCmd, cmdExists } = useCommandHistory();
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
    if (cmdExists(command)) return;

    // add the command to history
    pushCmd(command);

    // send the command to server
    if (!command.acknowledged) {
      sendCommand({
        type: 'command',
        system: dataSystem,
        command: command
      });
    }

    // update the game data locally
    setData((prev: GameSystemData | null) => {
      // console.log("... prev", prev);
      if (!prev) return prev;

      const keys = command.dataKey.split('.');
      // console.log("... keys", keys);
      const updated = { ...prev };
      // console.log("... updated", updated);
      let node: Record<string, unknown> = updated as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        node[keys[i]] = { ...(node[keys[i]] as Record<string, unknown>) };
        node = node[keys[i]] as Record<string, unknown>;
      }
      // console.log("... node:", node);
      const docKey = keys[keys.length - 1];
      // console.log("... docKey:", docKey);

      if (command.commandType === 'add-block' || command.commandType === 'remove-block' || command.commandType === 'reorder-blocks' || command.commandType === 'update-block') {
        updateMarkdownDocument(node[docKey] as MkDocument, command);
      }
      else if (command.commandType === 'add-morality-pair' || command.commandType === 'delete-morality-pair' || command.commandType === 'update-morality-pair') {
        // TODO...
      }

      return updated;
    });
  }, []);

  useEffect(() => {
    const unsub = subscribe((msg: WsIncoming) => {
      switch (msg.type) {
        case 'game-system-update':
          const payload = msg as { commands: AnyDocumentCommand[] };
          for (const cmd of payload.commands) {
            applyCommand(cmd);
          }
          break;
        case 'command-ack':
          // TODO: ...
          break;
        case 'error':
          break;
        default:
          console.warn(`Received unknown message type: ${JSON.stringify(msg)}`);
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

  // Update derived data whenever the game-system-data are updated
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
