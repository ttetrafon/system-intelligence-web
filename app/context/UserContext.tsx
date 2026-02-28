import type { SystemRole } from '@app-types/user';
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from 'react';

export interface SessionUser {
  id: number;
  username: string;
  display: string | null;
  colour: string;
  system_role: SystemRole;
}

interface UserContextType {
  session: SessionUser | null;
  setSession: (user: SessionUser | null) => void;
  systemEvents: EventSource | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [systemEvents, setSystemEvents] = useState<EventSource | null>(null);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => (res.ok ? (res.json() as Promise<{ user: SessionUser }>) : null))
      .then((data) => {
        if (data?.user) setSession(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!session) return;

    const es = new EventSource('/api/system/events');
    setSystemEvents(es);

    return () => {
      es.close();
      setSystemEvents(null);
    };
  }, [session?.id]);

  return (
    <UserContext.Provider value={{ session, setSession, systemEvents }}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
