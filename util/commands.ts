import { useCallback, useEffect, useRef } from 'react';
import type { AnyDocumentCommand } from '@app-types/commands';

// TODO: switch to a linked-list implementation & store commands in local-storage
export function useCommandHistory() {
  const history = useRef<AnyDocumentCommand[]>([]);
  const pointer = useRef<number>(-1);

  useEffect(() => {
    console.log(`[CMD] pointer: ${pointer.current}`);
    console.log("[CMD] history.current:", history.current);
  }, [history, history.current, pointer, pointer.current]);

  const pushCmd = useCallback((cmd: AnyDocumentCommand) => {
    if (cmdExists(cmd)) return;

    console.log(`---> pushCmd: ${JSON.stringify(cmd)}`);
    // Discard any commands after the current pointer (redo branch)
    history.current = history.current.slice(0, pointer.current + 1);
    history.current.push(cmd);
    pointer.current = history.current.length - 1;
  }, []);

  const undoCmd = useCallback((): AnyDocumentCommand | null => {
    if (pointer.current < 0) return null;
    return history.current[pointer.current--];
  }, []);

  const redoCmd = useCallback((): AnyDocumentCommand | null => {
    if (pointer.current >= history.current.length - 1) return null;
    return history.current[++pointer.current];
  }, []);

  const clearCmd = useCallback(() => {
    history.current = [];
    pointer.current = -1;
  }, []);

  const cmdExists = useCallback((cmd: AnyDocumentCommand): boolean => {
    for (let i = 0; i < history.current.length; i++) {
      if (history.current[i].commandId === cmd.commandId) return true;
    }
    return false;
  }, [])

  const acknowledgeCmd = useCallback((cmdId: string): void => {
    if (!history.current) return;

    for (let i = 0; i < history.current.length; i++) {
      const hc = history.current[i];
      if (hc.commandId === cmdId) {
        hc.acknowledged = true;
        break;
      }
    }
  }, []);

  return { pushCmd, undoCmd, redoCmd, clearCmd, cmdExists, acknowledgeCmd };
}
