import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface AppContextType {
  loading: boolean;
  setLoading: (state: boolean) => void;
  addPendingCommand: (id: string) => void;
  removePendingCommand: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Direct loading flag (used by logout, etc.)
  const [directLoading, setDirectLoading] = useState(false);
  // Tracks in-flight command IDs so concurrent commands don't clobber each other
  const pendingRef = useRef<Set<string>>(new Set());
  const [pendingCount, setPendingCount] = useState(0);

  const setLoading = useCallback((state: boolean) => setDirectLoading(state), []);

  const addPendingCommand = useCallback((id: string) => {
    pendingRef.current.add(id);
    setPendingCount(pendingRef.current.size);
  }, []);

  const removePendingCommand = useCallback((id: string) => {
    pendingRef.current.delete(id);
    setPendingCount(pendingRef.current.size);
  }, []);

  const loading = directLoading || pendingCount > 0;

  return (
    <AppContext.Provider value={{ loading, setLoading, addPendingCommand, removePendingCommand }}>
      {children}
    </AppContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within an AppProvider');
  }
  return context;
};
