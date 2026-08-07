import { useCallback, useRef } from 'react';
import type { AnyDocumentCommand } from '@app-types/commands';

// TODO: switch to a linked-list implementation & store commands in local-storage
export function useCommandHistory() {
  const history = useRef<AnyDocumentCommand[]>([]);
  const pointer = useRef<number>(-1);

  const pushCmd = useCallback((cmd: AnyDocumentCommand) => {
    // Discard any commands after the current pointer (redo branch)
    history.current = history.current.slice(0, pointer.current + 1);
    history.current.push(cmd);
    pointer.current = history.current.length - 1;
    console.log("[CMD] history.current:", history.current);
  }, []);

  const undoCmd = useCallback((): AnyDocumentCommand | null => {
    if (pointer.current < 0) return null;
    return history.current[pointer.current--];
  }, []);

  const redoCmd = useCallback((): AnyDocumentCommand | null => {
    if (pointer.current >= history.current.length - 1) return null;
    return history.current[++pointer.current];
  }, []);

  // Returns all commands up to and including the current pointer, for server transmission
  const getAppliedCmd = useCallback((): AnyDocumentCommand[] => {
    return history.current.slice(0, pointer.current + 1);
  }, []);

  const clearCmd = useCallback(() => {
    history.current = [];
    pointer.current = 0;
  }, []);

  const acknowledgeCommand = useCallback((cmdId: string): void => {
    if (!history.current) return;

    for (let i = 0; i < history.current.length; i++) {
      const hc = history.current[i];
      if (hc.commandId === cmdId) {
        hc.acknowledged = true;
        break;
      }
    }
  }, []);

  return { pushCmd, undoCmd, redoCmd, getAppliedCmd, clearCmd, acknowledgeCommand };
}
