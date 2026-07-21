"use client";

import { SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "clerk";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function LocalSignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Sign up failed");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-foreground">
        Create your account
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            placeholder="Min. 8 characters"
          />
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/sign-in" className="text-brand hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  if (AUTH_PROVIDER === "clerk") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <SignUp />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <LocalSignUpForm />
    </main>
  );
}