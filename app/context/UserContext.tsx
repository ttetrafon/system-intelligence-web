import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from 'react';

interface UserContextType {
  session: Object | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Object | null>(null);

  useEffect(() => {

  }, []);

  return (
    <UserContext.Provider value={{ session }}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
