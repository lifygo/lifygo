"use client";

import React, { useCallback } from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/nextjs";
import { AuthContext } from "./auth-provider";

function ClerkAuthInner({ children }: { children: React.ReactNode }) {
  const { getToken: clerkGetToken, isLoaded, signOut: clerkSignOut } = useAuth();
  const { user: clerkUser } = useUser();

  const getToken = useCallback(async () => {
    return (await clerkGetToken()) ?? null;
  }, [clerkGetToken]);

  const signOut = useCallback(async () => {
    await clerkSignOut();
    window.location.href = "https://lifygo.com";
  }, [clerkSignOut]);

  const u =
    clerkUser && isLoaded
      ? {
          id: clerkUser.id,
          name: clerkUser.fullName ?? "",
          email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        }
      : null;

  return (
    <AuthContext.Provider value={{ user: u, getToken, signOut, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ClerkAuthInner>{children}</ClerkAuthInner>
    </ClerkProvider>
  );
}