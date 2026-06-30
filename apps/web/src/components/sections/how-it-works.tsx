"use client"

import { KeyRound, Lock, Copy, CheckCircle2 } from "lucide-react"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 015.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 001 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

export function HowItWorks() {
  return (
    <section className="relative w-full overflow-hidden border-t border-white/[0.06] bg-neutral-950 px-6 py-24 font-sans md:py-32">
      {/* Quiet backdrop — same family as the hero, kept low so the white cards do the work */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(255,87,34,0.14),transparent_65%)] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[420px] w-[420px] translate-x-1/3 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.1),transparent_65%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-xl text-center md:mb-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-neutral-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            Three steps, start to finish
          </div>
          <h2 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-neutral-50 sm:text-5xl">
            Up and running in <span className="text-brand">five minutes</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-balance text-base leading-relaxed text-neutral-400">
            From credentials to your first delivered email — no infrastructure to provision in between.
          </p>
        </div>

        {/* Bento grid: featured first step, two supporting steps below */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* CARD 1 — featured, full width, distinct shape from the rest */}
          <div
            className="group fill-mode-both animate-in fade-in slide-in-from-bottom-6 duration-700 md:col-span-2"
            style={{ animationDelay: "0ms" }}
          >
            <div className="grid overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20 transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/30 md:grid-cols-2">
              {/* Text side */}
              <div className="flex flex-col justify-center p-8 md:p-10">
                <span className="mb-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                  1
                </span>
                <h3 className="mb-2.5 text-xl font-semibold tracking-tight text-neutral-900">
                  Connect &amp; add SMTP
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-neutral-500">
                  Sign in with Google or GitHub, then add your SMTP credentials once. Everything
                  is encrypted at rest with AES-256 — LifyGo never stores plain text.
                </p>
              </div>

              {/* Mockup side — small, contained motion */}
              <div className="relative flex flex-col justify-center gap-3 border-t border-neutral-100 bg-neutral-50 p-8 md:border-l md:border-t-0 md:p-10">
                <div className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium text-neutral-700 shadow-sm">
                  <GoogleIcon className="h-3.5 w-3.5" />
                  Continue with Google
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium text-neutral-700 shadow-sm">
                  <GithubIcon className="h-3.5 w-3.5" />
                  Continue with GitHub
                </div>

                <div className="mt-2 flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-xs">
                  <span className="font-mono text-neutral-400">smtp.host • • • • • • • •</span>
                  <span className="relative flex items-center gap-1.5 font-medium text-emerald-600">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    Encrypted
                    <span className="absolute -right-1 -top-1 h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" aria-hidden="true" />
                    <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2 — API key */}
          <div
            className="group fill-mode-both animate-in fade-in slide-in-from-bottom-6 duration-700"
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30">
              <span className="mb-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                2
              </span>
              <h3 className="mb-2.5 text-xl font-semibold tracking-tight text-neutral-900">
                Generate an API key
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-neutral-500">
                One key from the dashboard covers every endpoint. Drop it into an environment
                variable and you&apos;re authenticated everywhere.
              </p>

              <div className="mt-auto flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2.5">
                <div className="flex items-center gap-2 overflow-hidden">
                  <KeyRound
                    className="h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform duration-300 group-hover:-rotate-12 group-hover:text-brand"
                    aria-hidden="true"
                  />
                  <span className="truncate font-mono text-xs text-neutral-500">
                    lfy_live_4f9a••••••••e21c
                  </span>
                </div>
                <Copy className="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* CARD 3 — call the API */}
          <div
            className="group fill-mode-both animate-in fade-in slide-in-from-bottom-6 duration-700"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30">
              <span className="mb-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                3
              </span>
              <h3 className="mb-2.5 text-xl font-semibold tracking-tight text-neutral-900">
                Call the API
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-neutral-500">
                Send a request, the job runs. Delivery logs, retries, and status land in your
                dashboard in real time.
              </p>

              <div className="mt-auto flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-900 px-3.5 py-2.5">
                <span className="font-mono text-xs text-neutral-300">
                  POST /v1/send
                  <span className="animate-caret-blink ml-0.5 inline-block h-3 w-px translate-y-0.5 bg-neutral-400 align-middle" aria-hidden="true" />
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  200
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}