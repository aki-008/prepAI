import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  // 1. Added username to the context type
  username: string;
  // 2. Updated login signature to accept the username string
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // 3. New state to hold the logged-in user's name
  const [username, setUsername] = useState('Guest');

  // 4. Updated login function to accept and set the username
  const login = (name: string) => {
    setUsername(name);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Reset state on logout
    setIsAuthenticated(false);
    setUsername('Guest');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};