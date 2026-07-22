"use client"

import { useState } from "react"
import { KeyRound, Lock, Copy, Check, ShieldCheck, Terminal, ArrowUpRight } from "lucide-react"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
      <path d="M5.84 14.1A6.6 6.6 0 015.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 001 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}

export function HowItWorks() {
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)

  const apiKey = "lfy_live_9a721c810de08e21c3b99"
  const curlCommand = `curl -X POST http://localhost:8080/send \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "hello@example.com",
    "subject": "Welcome aboard",
    "body": "You are in."
  }'`

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand)
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
  }

  return (
    <section className="relative w-full bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-brand selection:text-white">
      <div className="relative w-full min-h-[60vh] flex flex-col justify-end overflow-hidden border-b border-neutral-800/80 pt-24 pb-16 md:pb-24 px-6 md:px-12 lg:px-20">
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="https://i.pinimg.com/736x/42/ff/64/42ff64e0090e1ef52c2b2d3ac9eec5b8.jpg"
            alt=""
            className="w-full h-full object-cover object-center opacity-70 mix-blend-luminosity grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/40 to-neutral-950/90" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05] max-w-4xl drop-shadow-sm">
            From zero to delivery in five minutes.
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl leading-relaxed drop-shadow-sm">
            Connect your SMTP server, generate an API key, and send your first email with a single curl command. No vendor accounts. No monthly fees.
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full bg-neutral-900/50 py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-24 lg:gap-32">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative group inline-flex">
                  <div className="absolute -inset-0.5 bg-brand/50 blur-sm rounded-[4px_0_4px_0] opacity-60 group-hover:opacity-100 transition duration-300" />
                  <span className="relative flex items-center justify-center min-w-[2.5rem] h-7 px-3 bg-brand text-white font-mono text-xs font-black tracking-wider rounded-[4px_0_4px_0] shadow-lg shadow-brand/20 border border-white/10">
                    01
                  </span>
                </div>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Plug in your SMTP
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed">
                Sign in with Google or GitHub, then add the SMTP credentials you already have. Gmail, Zoho, your hosting provider. Your password is encrypted with AES-256 and never stored in plain text.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-neutral-700">
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  </div>
                  <span className="font-mono text-xs text-neutral-500">smtp settings</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-all">
                      <GoogleIcon className="w-4 h-4" />
                      Google Workspace
                    </button>
                    <button className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-all">
                      <GithubIcon className="w-4 h-4" />
                      GitHub
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-neutral-400">Host</span>
                      <span className="font-mono text-xs text-white">smtp.gmail.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-neutral-400">Port</span>
                      <span className="font-mono text-xs text-white">587</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                      <span className="font-mono text-xs text-neutral-400">Encryption</span>
                      <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
                        <Lock className="w-3 h-3" /> AES-256
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-5 lg:order-2 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative group inline-flex">
                  <div className="absolute -inset-0.5 bg-brand/50 blur-sm rounded-[4px_0_4px_0] opacity-60 group-hover:opacity-100 transition duration-300" />
                  <span className="relative flex items-center justify-center min-w-[2.5rem] h-7 px-3 bg-brand text-white font-mono text-xs font-black tracking-wider rounded-[4px_0_4px_0] shadow-lg shadow-brand/20 border border-white/10">
                    02
                  </span>
                </div>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
                One key. Use it everywhere.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed">
                A single API key covers email sending, OTP verification, and cron job scheduling. Drop it in your environment and you are done. No SDK required.
              </p>
            </div>

            <div className="lg:col-span-7 lg:order-1">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-neutral-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-brand" />
                    <span className="font-mono text-xs text-neutral-400">Your API key</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>

                <div className="relative flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-950 font-mono text-xs">
                  <span className="text-neutral-200 truncate pr-4">{apiKey}</span>
                  <button
                    onClick={handleCopyKey}
                    className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-brand text-neutral-300 hover:text-white transition-all text-xs"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span className="text-white">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
                  <ShieldCheck className="w-4 h-4 text-brand" />
                  <span>Pass as <code className="text-neutral-300 font-mono">X-API-Key</code> on every request</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative group inline-flex">
                  <div className="absolute -inset-0.5 bg-brand/50 blur-sm rounded-[4px_0_4px_0] opacity-60 group-hover:opacity-100 transition duration-300" />
                  <span className="relative flex items-center justify-center min-w-[2.5rem] h-7 px-3 bg-brand text-white font-mono text-xs font-black tracking-wider rounded-[4px_0_4px_0] shadow-lg shadow-brand/20 border border-white/10">
                    03
                  </span>
                </div>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
                One call. Done.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed">
                POST to send an email. POST to schedule a cron job. Every delivery and execution is logged automatically to your dashboard.
              </p>
              
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <a
                  href="https://docs.lifygo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand/80 transition-colors"
                >
                  Read the full API docs
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl transition-all duration-300 hover:border-neutral-700">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/60">
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                    <Terminal className="w-4 h-4 text-brand" />
                    <span>terminal</span>
                  </div>
                  <button
                    onClick={handleCopyCurl}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    {copiedCurl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-brand" />
                        <span className="text-brand">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-5 sm:p-6 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-neutral-300">
                  <pre>
                    <code>
                      <span className="text-neutral-500">curl</span> -X POST http://localhost:8080/send \<br />
                      {"  "}-H <span className="text-emerald-400">"X-API-Key: {apiKey}"</span> \<br />
                      {"  "}-H <span className="text-emerald-400">"Content-Type: application/json"</span> \<br />
                      {"  "}-d <span className="text-amber-300">{'{'}</span><br />
                      {"    "}<span className="text-neutral-400">"to":</span> <span className="text-amber-200">"hello@example.com"</span>,<br />
                      {"    "}<span className="text-neutral-400">"subject":</span> <span className="text-amber-200">"Welcome aboard"</span>,<br />
                      {"    "}<span className="text-neutral-400">"body":</span> <span className="text-amber-200">"You are in."</span><br />
                      {"  "}<span className="text-amber-300">{'}'}</span>
                    </code>
                  </pre>
                </div>

                <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-800/80 bg-neutral-900/30 text-xs font-mono text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>200 OK · 14ms</span>
                  </div>
                  <a href="https://docs.lifygo.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300 transition-colors">
                    docs.lifygo.com
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}