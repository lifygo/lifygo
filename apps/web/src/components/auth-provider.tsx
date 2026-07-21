"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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

const AuthContext = createContext<AuthContextValue>({
  user: null,
  getToken: async () => null,
  signOut: async () => {},
  isLoaded: false,
});

export function useLifygoAuth() {
  return useContext(AuthContext);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchUser(): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function localSignOut() {
  await fetch(`${API_URL}/auth/signout`, {
    method: "POST",
    credentials: "include",
  });
}

function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchUser().then((u) => {
      setUser(u);
      setIsLoaded(true);
    });
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    const match = document.cookie.match(/(?:^|;\s*)lifygo_token=([^;]*)/);
    return match ? match[1] : null;
  }, []);

  const signOut = useCallback(async () => {
    await localSignOut();
    setUser(null);
    document.cookie = "lifygo_token=; Path=/; Max-Age=0";
    window.location.href = "/sign-in";
  }, []);

  return (
    <AuthContext.Provider value={{ user, getToken, signOut, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "clerk";

  if (provider === "local") {
    return <LocalAuthProvider>{children}</LocalAuthProvider>;
  }

  return <ClerkAuthWrapper>{children}</ClerkAuthWrapper>;
}

function ClerkAuthWrapper({ children }: { children: React.ReactNode }) {
  const { useAuth, useUser } = require("@clerk/nextjs");
  const { getToken: clerkGetToken, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();

  const getToken = useCallback(async () => {
    return (await clerkGetToken()) ?? null;
  }, [clerkGetToken]);

  const signOut = useCallback(async () => {
    const { signOut: clerkSignOut } = require("@clerk/nextjs");
    await clerkSignOut();
  }, []);

  const user: User | null =
    clerkUser && isLoaded
      ? { id: clerkUser.id, name: clerkUser.fullName ?? "", email: clerkUser.primaryEmailAddress?.emailAddress ?? "" }
      : null;

  return (
    <AuthContext.Provider value={{ user, getToken, signOut, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}