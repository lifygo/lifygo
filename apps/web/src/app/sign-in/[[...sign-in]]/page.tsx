"use client";

import { SignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Loader2, Lock } from "lucide-react";

import logoPic from "@/assets/logos/lifygo-officiel.png";

const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "clerk";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function LocalSignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Sign in failed");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md rounded-md border border-neutral-800 bg-neutral-950 p-5 sm:p-6 shadow-2xl">
      {/* Header & Logo */}
      <div className="flex flex-col items-center text-center mb-5">
        <Link href="/" className="inline-block mb-3 hover:opacity-90 transition-opacity">
          <Image
            src={logoPic}
            alt="LifyGo Logo"
            width={160}
            height={45}
            priority
            className="w-36 sm:w-44 h-auto object-contain"
          />
        </Link>

        <span className="inline-flex h-4 px-1.5 items-center justify-center bg-white text-black font-mono text-[9px] font-black tracking-widest rounded-[2px_0px_2px_0px] mb-2">
          Console AUTH
        </span>

        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Sign in to LifyGo
        </h1>
        <p className="mt-0.5 text-xs text-neutral-400">
          Enter your developer credentials
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 transition-colors focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
            placeholder="developer@company.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Password
            </label>
            {/* <a href="/forgot-password" className="text-xs text-neutral-500 hover:text-white transition-colors">
              Forgot?
            </a> */}
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 transition-colors focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
            placeholder="••••••••••••"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-950/50 border border-red-800/80 p-2.5 text-xs font-medium text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-4 text-xs font-bold text-black hover:bg-neutral-200 transition-colors active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-700" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="mt-5 pt-4 border-t border-neutral-900 text-center">
        <p className="text-xs text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-white hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="min-h-screen w-full bg-black text-white font-sans antialiased flex flex-col justify-center items-center p-3 sm:p-4 relative">
      {/* Background Dot Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        {AUTH_PROVIDER === "clerk" ? (
          <div className="flex flex-col items-center">
            <Link href="/" className="mb-3 hover:opacity-90 transition-opacity">
              <Image
                src={logoPic}
                alt="LifyGo Logo"
                width={160}
                height={45}
                priority
                className="w-36 sm:w-44 h-auto object-contain"
              />
            </Link>
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full shadow-2xl rounded-md border border-neutral-800 overflow-hidden",
                  card: "shadow-none border-none bg-neutral-950 p-5 sm:p-6 rounded-md",
                  headerTitle: "text-lg sm:text-xl font-bold text-white tracking-tight",
                  headerSubtitle: "text-xs text-neutral-400",
                  formButtonPrimary:
                    "bg-white hover:bg-neutral-200 text-black font-bold text-xs h-9 rounded-md transition-colors active:scale-[0.99]",
                  formFieldInput:
                    "rounded-md border-neutral-800 bg-neutral-900 focus:bg-neutral-900 focus:border-white focus:ring-white text-white text-xs h-9",
                  footerActionLink: "text-white font-semibold hover:underline",
                },
              }}
            />
          </div>
        ) : (
          <LocalSignInForm />
        )}
      </div>
    </main>
  );
}