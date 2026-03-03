import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { GameSystemData } from "../../types/gameSystem";
import { useUser } from "./UserContext";

const LS_KEY = 'si:game-system';

interface GameSystemContextType {
  data: GameSystemData | null;
  // dataLinks: object | null;
}

const GameSystemContext = createContext<GameSystemContextType | undefined>(undefined);

export const GameSystemProvider = ({ children }: { children: ReactNode }) => {
  const { systemEvents } = useUser();
  const [data, setData] = useState<GameSystemData | null>(() => {
    try {
      const cached = localStorage.getItem(LS_KEY);
      return cached ? (JSON.parse(cached) as GameSystemData) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!systemEvents) return;

    const handleGameSystemUpdate = (e: MessageEvent<string>) => {
      const payload = JSON.parse(e.data) as { data: string; dataKey: string };
      setData(prev => {
        if (!prev) return prev;
        const keys = payload.dataKey.split('.');
        const updated = { ...prev };
        let node: Record<string, unknown> = updated as unknown as Record<string, unknown>;
        for (let i = 0; i < keys.length - 1; i++) {
          node[keys[i]] = { ...(node[keys[i]] as Record<string, unknown>) };
          node = node[keys[i]] as Record<string, unknown>;
        }
        node[keys[keys.length - 1]] = payload.data;
        localStorage.setItem(LS_KEY, JSON.stringify(updated));
        return updated;
      });
    };

    systemEvents.addEventListener('game-system-update', handleGameSystemUpdate);
    return () => systemEvents.removeEventListener('game-system-update', handleGameSystemUpdate);
  }, [systemEvents]);

  useEffect(() => {
    const cached = localStorage.getItem(LS_KEY);
    const lastUpdated = cached ? (JSON.parse(cached) as GameSystemData).last_updated : null;
    const url = lastUpdated ? `/api/game-system/si/${lastUpdated}` : '/api/game-system/si';

    fetch(url)
      .then((res) => (res.ok ? (res.json() as Promise<GameSystemData>) : null))
      .then((fresh) => {
        if (!fresh) return;
        setData(fresh);
        localStorage.setItem(LS_KEY, JSON.stringify(fresh));
      })
      .catch(() => {});
  }, []);

  return (
    <GameSystemContext.Provider value={{ data }}>{children}</GameSystemContext.Provider>
  );
};

export const useGameSystem = () => {
  const context = useContext(GameSystemContext);
  if (context === undefined) {
    throw new Error('useGameSystem must be used within a GameSystemProvider');
  }
  return context;
};
