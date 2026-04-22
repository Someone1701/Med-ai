import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserAccount = {
  email: string;
  password: string;
  displayName: string;
  role: "patient" | "caretaker";
};

type AuthUser = {
  email: string;
  displayName: string;
  role: "patient" | "caretaker";
};

type LocalAuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, role: "patient" | "caretaker") => string | null;
  signIn: (email: string, password: string, role: "patient" | "caretaker") => string | null;
  signOut: () => void;
};

const LocalAuthContext = createContext<LocalAuthContextType>({
  user: null,
  loading: true,
  signUp: () => null,
  signIn: () => null,
  signOut: () => {},
});

const ACCOUNTS_KEY = "medibot_accounts";
const SESSION_KEY = "medibot_session";

function getAccounts(): UserAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts: UserAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export const LocalAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (session) setUser(session);
    } catch {}
    setLoading(false);
  }, []);

  const signUp = (email: string, password: string, displayName: string, role: "patient" | "caretaker"): string | null => {
    const accounts = getAccounts();
    const exists = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.role === role);
    if (exists) return `An account with this email already exists as a ${role}.`;

    accounts.push({ email: email.toLowerCase(), password, displayName, role });
    saveAccounts(accounts);

    const authUser: AuthUser = { email: email.toLowerCase(), displayName, role };
    setUser(authUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    return null;
  };

  const signIn = (email: string, password: string, role: "patient" | "caretaker"): string | null => {
    const accounts = getAccounts();
    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.role === role
    );
    if (!account) return `No ${role} account found with this email.`;
    if (account.password !== password) return "Incorrect password.";

    const authUser: AuthUser = { email: account.email, displayName: account.displayName, role: account.role };
    setUser(authUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    return null;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <LocalAuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </LocalAuthContext.Provider>
  );
};

export const useLocalAuth = () => useContext(LocalAuthContext);
