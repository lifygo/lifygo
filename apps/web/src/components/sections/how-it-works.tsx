"use client"

import { useState } from "react"
import { Copy, Check, KeyRound, ShieldCheck, Terminal, Eye, EyeOff, Server, Lock, ArrowUpRight } from "lucide-react"

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
    <section className="w-full font-sans antialiased bg-white">
      
      <div className="relative w-full bg-neutral-950 pt-32 pb-48 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <img
            src="https://i.pinimg.com/736x/42/ff/64/42ff64e0090e1ef52c2b2d3ac9eec5b8.jpg"
            alt=""
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/60 via-transparent to-neutral-950/60" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full text-center md:text-left">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.05]">
            From zero to delivery in five minutes.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl leading-relaxed mx-auto md:mx-0">
            Sign up free or self host on your own server. Connect your SMTP, generate an API key, and send your first email with a single curl command.
          </p>
        </div>
      </div>

      <div className="relative z-20 w-full px-6 md:px-12 lg:px-20 pb-32 -mt-24 sm:-mt-32">
        <div className="max-w-5xl mx-auto flex flex-col gap-12 sm:gap-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center bg-white rounded-2xl p-6 sm:p-10 border border-neutral-200 shadow-xl shadow-neutral-200/40">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <span className="inline-flex h-7 px-3 items-center justify-center font-mono text-xs font-black bg-brand text-white rounded-[4px_0_4px_0] mb-5 w-fit">
                01
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
                Plug in your SMTP
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
                Sign in with Google or GitHub, then add your SMTP credentials. Your password is encrypted with AES-256 and never stored in plain text. Or skip this entirely and use our free hosted version.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-white">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-neutral-400" />
                    <span className="font-mono text-xs text-neutral-700">smtp settings</span>
                  </div>
                  <div className="flex bg-neutral-100 rounded-md p-0.5 border border-neutral-200">
                    <button
                      onClick={() => setSelectedSmtp("gmail")}
                      className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${selectedSmtp === "gmail" ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/50" : "text-neutral-500 hover:text-neutral-900"}`}
                    >
                      Gmail
                    </button>
                    <button
                      onClick={() => setSelectedSmtp("aws")}
                      className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${selectedSmtp === "aws" ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/50" : "text-neutral-500 hover:text-neutral-900"}`}
                    >
                      AWS SES
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <a href="/sign-in" className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:border-brand/40 hover:text-neutral-900 transition-colors shadow-sm">
                      <GoogleIcon className="w-4 h-4" />
                      Google
                    </a>
                    <a href="/sign-in" className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:border-brand/40 hover:text-neutral-900 transition-colors shadow-sm">
                      <GithubIcon className="w-4 h-4" />
                      GitHub
                    </a>
                  </div>

                  <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3 font-mono text-sm shadow-sm">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-400 text-xs">Host</span>
                      <span className="text-neutral-900">
                        {selectedSmtp === "gmail" ? "smtp.gmail.com" : "email-smtp.us-east-1.amazonaws.com"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <span className="text-neutral-400 text-xs">Port</span>
                      <span className="text-neutral-900">587</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-neutral-400 text-xs">Encryption</span>
                      <span className="flex items-center gap-1.5 text-neutral-900">
                        <Lock className="w-3.5 h-3.5 text-neutral-400" /> AES-256
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center bg-white rounded-2xl p-6 sm:p-10 border border-neutral-200 shadow-xl shadow-neutral-200/40">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <span className="inline-flex h-7 px-3 items-center justify-center font-mono text-xs font-black bg-brand text-white rounded-[4px_0_4px_0] mb-5 w-fit">
                02
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
                One key. Use it everywhere.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
                A single API key covers email sending, OTP verification, and cron job scheduling. Drop it in your environment and you are done. No SDK required.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-neutral-400" />
                    <span className="font-mono text-sm text-neutral-900 font-medium">Your API key</span>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-300 bg-white shadow-sm font-mono text-sm mb-4">
                  <span className="text-neutral-900 select-all">
                    {showKey ? rawKey : maskedKey}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-2 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleCopyKey}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition-colors text-xs font-medium shadow-sm"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border border-neutral-200 bg-white">
                  <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Pass this as <code className="text-neutral-900 font-bold font-mono bg-neutral-100 px-1 py-0.5 rounded border border-neutral-200">X-API-Key</code> on every request. Never expose it in client-side code.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start bg-white rounded-2xl p-6 sm:p-10 border border-neutral-200 shadow-xl shadow-neutral-200/40">
            <div className="lg:col-span-5 flex flex-col justify-start">
              <span className="inline-flex h-7 px-3 items-center justify-center font-mono text-xs font-black bg-brand text-white rounded-[4px_0_4px_0] mb-5 w-fit">
                03
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
                One call. Done.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
                POST to send an email. POST to schedule a cron job. Every delivery and execution is logged automatically to your dashboard. Need production reliability? Enable AWS EventBridge and jobs survive server restarts.
              </p>
              
              <div className="mt-8 pt-6 border-t border-neutral-100">
                <a
                  href="https://docs.lifygo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand/80 transition-colors"
                >
                  Read the full API docs
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-900">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Terminal className="w-4 h-4" />
                    <span className="font-mono text-xs">terminal</span>
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

                <div className="p-5 sm:p-6 overflow-x-auto bg-neutral-950">
                  <pre className="font-mono text-sm leading-relaxed text-neutral-200">
                    <code>{curlExample}</code>
                  </pre>
                </div>

                <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-800 bg-neutral-900/50 text-xs font-mono text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>200 OK</span>
                  </div>
                  <span>POST /send</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}