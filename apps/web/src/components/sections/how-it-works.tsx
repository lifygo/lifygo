"use client"

import { useState } from "react"
import { Copy, Check, KeyRound, ShieldCheck, Terminal, Eye, EyeOff, Server, Lock, ArrowUpRight, Mail, Clock3, ArrowDown } from "lucide-react"

import jobsImg from "@/assets/links/jobs.png"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.987 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

const curlExample = `curl -X POST https://api.lifygo.com/send \\
  -H "X-API-Key: lfy_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "hello@example.com",
    "subject": "Welcome aboard",
    "body": "You are in."
  }'`

export function HowItWorks() {
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [selectedSmtp, setSelectedSmtp] = useState<"gmail" | "aws">("gmail")

  const rawKey = "lfy_live_9a721c810de08e21c3b99"
  const maskedKey = "lfy_live_••••••••••••••••••••"

  const handleCopyKey = () => {
    navigator.clipboard.writeText(rawKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlExample)
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
  }

  return (
    <section className="w-full bg-white font-sans antialiased">

      {/* ─── Dark hero ─── */}
      <div className="relative w-full bg-neutral-950 pb-28 pt-28 sm:pb-36 sm:pt-36 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-brand/8 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-6">
          <span className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand/70 cursor-default">
            How it works
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">→</span>
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            One API to send, verify,
            <br />
            <span className="text-brand">and schedule.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-neutral-400">
            Set your from address, get an API key, and you&apos;re done.
            No vendor accounts. No credit card.
          </p>
        </div>
      </div>

      {/* ─── Timeline ─── */}
      <div className="relative mx-auto max-w-6xl px-5 pb-32 sm:px-6">

        {/* ── Step 01 ── */}
        <div className="relative pt-24 sm:pt-32">
          {/* Connector dot */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-neutral-200 hidden lg:block" />
          <div className="lg:ml-20 lg:pl-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand">
                <span className="text-xl font-bold text-white font-mono">01</span>
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
                  Set your from address
                </h2>
                <p className="mt-1 text-neutral-500">
                  Sign in and tell us what your recipients should see.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-2 space-y-4">
                <p className="text-base leading-relaxed text-neutral-600">
                  Sign in with Google or GitHub. Set the address your recipients see.
                  Use our free relay — no SMTP credentials needed. Or connect your own
                  SMTP for unlimited sending. Passwords are encrypted with AES-256.
                </p>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <GoogleIcon className="h-4 w-4" /> Google
                  <span className="text-neutral-200">·</span>
                  <GithubIcon className="h-4 w-4" /> GitHub
                </div>
              </div>

              <div className="lg:col-span-3 rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-neutral-400" />
                    <span className="font-mono text-xs text-neutral-500">smtp settings</span>
                  </div>
                  <div className="flex gap-0.5 rounded-md bg-neutral-100 p-0.5">
                    <button
                      onClick={() => setSelectedSmtp("gmail")}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${selectedSmtp === "gmail" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                    >
                      Gmail
                    </button>
                    <button
                      onClick={() => setSelectedSmtp("aws")}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${selectedSmtp === "aws" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                    >
                      AWS SES
                    </button>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3 font-mono text-sm">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <span className="text-xs text-neutral-400">Host</span>
                      <span className="text-neutral-800">
                        {selectedSmtp === "gmail" ? "smtp.gmail.com" : "email-smtp.us-east-1.amazonaws.com"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <span className="text-xs text-neutral-400">Port</span>
                      <span className="text-neutral-800">587</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-neutral-400">Encryption</span>
                      <span className="flex items-center gap-1.5 text-neutral-800">
                        <Lock className="h-3.5 w-3.5 text-neutral-400" /> AES-256
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Step 02 ── */}
        <div className="relative pt-24 sm:pt-32">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-neutral-200 hidden lg:block" />
          <div className="lg:ml-20 lg:pl-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand">
                <span className="text-xl font-bold text-white font-mono">02</span>
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
                  One key. Everything.
                </h2>
                <p className="mt-1 text-neutral-500">
                  A single API key covers email, OTP, and cron jobs.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-neutral-400" />
                    <span className="font-mono text-sm font-medium text-neutral-800">Your API key</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>

                <div className="mb-4 flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 font-mono text-sm">
                  <span className="select-all text-neutral-800">
                    {showKey ? rawKey : maskedKey}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={handleCopyKey}
                      className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
                    >
                      {copiedKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedKey ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <p className="text-xs leading-relaxed text-neutral-500">
                    Pass as <code className="rounded border border-neutral-200 bg-neutral-100 px-1 py-0.5 font-mono font-semibold text-neutral-800">X-API-Key</code> on every request.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <p className="text-base leading-relaxed text-neutral-600">
                  One API key covers email, OTP, and cron jobs. Drop it in your
                  environment variables and you&apos;re done. No SDK. No client library.
                </p>
                <p className="text-sm text-neutral-400">
                  Never expose it in client-side code. Use environment variables or
                  a secrets manager.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Step 03 ── */}
        <div className="relative pt-24 sm:pt-32">
          <div className="absolute left-8 top-0 h-full w-px bg-neutral-200 hidden lg:block" />
          <div className="lg:ml-20 lg:pl-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand">
                <span className="text-xl font-bold text-white font-mono">03</span>
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
                  One call. Done.
                </h2>
                <p className="mt-1 text-neutral-500">
                  POST to send. Everything is logged. Nothing is hidden.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Terminal */}
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-5 py-3">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Terminal className="h-4 w-4" />
                    <span className="font-mono text-xs">terminal</span>
                  </div>
                  <button
                    onClick={handleCopyCurl}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-white"
                  >
                    {copiedCurl ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-brand" />
                        <span className="text-brand">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="overflow-x-auto p-5">
                  <pre className="font-mono text-sm leading-relaxed text-neutral-200">
                    <code>{curlExample}</code>
                  </pre>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/50 px-5 py-3 font-mono text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    200 OK
                  </div>
                  <span>POST /send</span>
                </div>
              </div>

              {/* Screenshot */}
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-lg">
                  <img
                    src={jobsImg.src}
                    alt="LifyGo dashboard"
                    className="w-full"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-brand" />
                    Emails
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 text-brand" />
                    Cron jobs
                  </span>
                  <span className="text-neutral-200">—</span>
                  <span>All logged automatically</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-28 flex flex-col items-center gap-4 text-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
            <ArrowDown className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="text-sm text-neutral-400">Ready to try it yourself?</p>
          <a
            href="https://docs.lifygo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Read the docs
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

      </div>
    </section>
  )
}
