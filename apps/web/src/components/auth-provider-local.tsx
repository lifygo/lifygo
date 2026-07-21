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
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchUser().then((u) => {
      setUser(u);
      setIsLoaded(true);
    });
  }, []);

  const getToken = useCallback(async () => {
    const match = document.cookie.match(/(?:^|;\s*)lifygo_token=([^;]*)/);
    return match ? match[1] : null;
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