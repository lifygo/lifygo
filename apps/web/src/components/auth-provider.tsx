"use client";

import React, { createContext, useContext } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  isLoaded: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  getToken: async () => null,
  signOut: async () => {},
  isLoaded: false,
});

export function useLifygoAuth() {
  return useContext(AuthContext);
}

const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "clerk";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (AUTH_PROVIDER === "local") {
    const { LocalAuthProvider } = require("./auth-provider-local");
    return <LocalAuthProvider>{children}</LocalAuthProvider>;
  }
  const { ClerkAuthProvider } = require("./auth-provider-clerk");
  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
}