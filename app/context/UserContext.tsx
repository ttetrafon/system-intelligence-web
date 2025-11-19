import { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'owner' | 'gm' | 'player' | 'observer';

export type UserColour =
  | 'amber'
  | 'blue'
  | 'emerald'
  | 'cyan'
  | 'fuchsia'
  | 'gray'
  | 'green'
  | 'indigo'
  | 'lime'
  | 'neutral'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'rose'
  | 'sky'
  | 'slate'
  | 'stone'
  | 'teal'
  | 'violet'
  | 'yellow'
  | 'zinc';

type User = {
  username: string | null;
  role: UserRole | null;
  colour: UserColour | null;
};

type UserContextType = {
  username: string | null;
  role: UserRole | null;
  colour: UserColour | null;
  setUser: (user: User) => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

type UserProviderProps = {
  children: ReactNode;
};

export function UserProvider({ children }: UserProviderProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [colour, setColour] = useState<UserColour | null>(null);

  const setUser = (user: User) => {
    setUsername(user.username);
    setRole(user.role);
    setColour(user.colour);
  };

  return (
    <UserContext.Provider value={{ username, role, colour, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
