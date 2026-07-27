"use client";

import React, { createContext, useContext } from "react";
import { ClerkAuthProvider } from "./auth-provider-clerk";
import { LocalAuthProvider } from "./auth-provider-local";

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
    return <LocalAuthProvider>{children}</LocalAuthProvider>;
  }
  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
}
