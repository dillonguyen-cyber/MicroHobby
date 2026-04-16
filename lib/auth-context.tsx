"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface AuthUser {
  name: string;
  email: string;
  photo: string | null;
  joinedAt: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (name: string, email: string, password: string, photo: string | null) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (updates: Partial<Pick<AuthUser, "name" | "email" | "photo">>) => void;
}

const USERS_KEY = "microhobby_users";
const SESSION_KEY = "microhobby_session";

function getUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, StoredUser>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const email = localStorage.getItem(SESSION_KEY);
    if (email) {
      const users = getUsers();
      const stored = users[email];
      if (stored) {
        const { password: _pw, ...authUser } = stored;
        setUser(authUser);
      }
    }
    setIsLoading(false);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string, photo: string | null) => {
      const users = getUsers();
      if (users[email]) {
        throw new Error("An account with that email already exists.");
      }
      const newUser: StoredUser = {
        name,
        email,
        password,
        photo,
        joinedAt: new Date().toISOString(),
      };
      users[email] = newUser;
      saveUsers(users);
      localStorage.setItem(SESSION_KEY, email);
      const { password: _pw, ...authUser } = newUser;
      setUser(authUser);
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const users = getUsers();
    const stored = users[email];
    if (!stored || stored.password !== password) {
      throw new Error("Invalid email or password.");
    }
    localStorage.setItem(SESSION_KEY, email);
    const { password: _pw, ...authUser } = stored;
    setUser(authUser);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<Pick<AuthUser, "name" | "email" | "photo">>) => {
      if (!user) return;
      const users = getUsers();
      const stored = users[user.email];
      if (!stored) return;

      // If email changed, move the record
      const newEmail = updates.email ?? user.email;
      if (updates.email && updates.email !== user.email) {
        delete users[user.email];
        localStorage.setItem(SESSION_KEY, newEmail);
      }

      const updated: StoredUser = { ...stored, ...updates, email: newEmail };
      users[newEmail] = updated;
      saveUsers(users);

      const { password: _pw, ...authUser } = updated;
      setUser(authUser);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
