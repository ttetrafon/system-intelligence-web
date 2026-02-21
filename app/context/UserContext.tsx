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
}

interface UserContextType {
  session: SessionUser | null;
  setSession: (user: SessionUser | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => (res.ok ? (res.json() as Promise<{ user: SessionUser }>) : null))
      .then((data) => {
        if (data?.user) setSession(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <UserContext.Provider value={{ session, setSession }}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
