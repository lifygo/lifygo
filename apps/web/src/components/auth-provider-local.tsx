"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./auth-provider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchUser() {
  try {
    const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<React.ContextType<typeof AuthContext>["user"]>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchUser().then((u) => {
      setUser(u);
      setIsLoaded(true);
    });
  }, []);

  const getToken = useCallback(async () => {
    // lifygo_token is HttpOnly by design. The browser sends it automatically
    // with credentials: "include"; JavaScript must not try to read it.
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await fetch(`${API_URL}/auth/signout`, { method: "POST", credentials: "include" });
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
