import { createContext, useContext, useState, type ReactNode } from 'react';
import { type User, type UserRole } from '../types/user';

interface UserContextType {
  user: User | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const createInitialUser = (): User => {
  const randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);

  return {
    id: crypto.randomUUID(),
    username: `${randomSixDigitNumber}`,
    role: 'observer' as UserRole,
    colour: '000000',
    loginType: 'none',
  };
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user] = useState<User | null>(() => {
    // This check ensures the user is only created on the client-side,
    // preventing SSR hydration mismatch errors.
    if (typeof window !== 'undefined') {
      return createInitialUser();
    }
    return null;
  });

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
