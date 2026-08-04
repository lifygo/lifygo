"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Check, Copy, Mail, Clock3, Key, FileText, Star, Zap, Server } from "lucide-react"
import { cn } from "@/lib/utils"

import githubLogo from "@/assets/powered/github.png"
import golangLogo from "@/assets/powered/Golang.png"
import awsLogo from "@/assets/powered/aws.png"
import logotypeLogo from "@/assets/powered/logotype-full-primary-light.svg"

import apiKeysImg from "@/assets/links/apikey.png"
import logsImg from "@/assets/links/logs.png"
import jobsImg from "@/assets/links/jobs.png"

type PreviewTab = "emails" | "cron-jobs" | "api-keys" | "logs"

const EMAIL_SNIPPET = {
  lines: [
    { tokens: [{ text: "curl ", cls: "text-neutral-500" }, { text: "https://api.lifygo.com/send", cls: "text-neutral-200" }] },
    { tokens: [{ text: "  -H ", cls: "text-neutral-500" }, { text: '"X-API-Key: lfy_your_key"', cls: "text-brand font-semibold" }] },
    { tokens: [{ text: "  -d ", cls: "text-neutral-500" }, { text: "'{", cls: "text-neutral-300" }] },
    { tokens: [{ text: '    "to": "hello@example.com",', cls: "text-neutral-300" }] },
    { tokens: [{ text: '    "subject": "Welcome",', cls: "text-neutral-300" }] },
    { tokens: [{ text: '    "body": "Thanks for signing up."', cls: "text-neutral-300" }] },
    { tokens: [{ text: "  }'", cls: "text-neutral-300" }] },
  ],
}

const CRON_SNIPPET = {
  lines: [
    { tokens: [{ text: "curl ", cls: "text-neutral-500" }, { text: "https://api.lifygo.com/jobs", cls: "text-neutral-200" }] },
    { tokens: [{ text: "  -H ", cls: "text-neutral-500" }, { text: '"X-API-Key: lfy_your_key"', cls: "text-brand font-semibold" }] },
    { tokens: [{ text: "  -d ", cls: "text-neutral-500" }, { text: "'{", cls: "text-neutral-300" }] },
    { tokens: [{ text: '    "name": "weekly-digest",', cls: "text-neutral-300" }] },
    { tokens: [{ text: '    "schedule_type": "cron",', cls: "text-neutral-300" }] },
    { tokens: [{ text: '    "cron_expression": "0 9 * * 1",', cls: "text-neutral-300" }] },
    { tokens: [{ text: '    "webhook_url": "https://yourapp.com/webhook"', cls: "text-neutral-300" }] },
    { tokens: [{ text: "  }'", cls: "text-neutral-300" }] },
  ],
}

const TAB_BUTTONS: { id: PreviewTab; label: string; icon: React.ReactNode }[] = [
  { id: "emails", label: "Emails", icon: <Mail className="h-4 w-4" /> },
  { id: "cron-jobs", label: "Cron Jobs", icon: <Clock3 className="h-4 w-4" /> },
  { id: "api-keys", label: "API Keys", icon: <Key className="h-4 w-4" /> },
  { id: "logs", label: "Logs", icon: <FileText className="h-4 w-4" /> },
]

export function Hero() {
  const [previewTab, setPreviewTab] = useState<PreviewTab>("emails")
  const [copied, setCopied] = useState(false)
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    fetch("https://api.github.com/repos/lifygo/lifygo")
      .then((r) => r.json())
      .then((d) => setStars(d.stargazers_count ?? 0))
      .catch(() => {})
  }, [])

  const activeSnippet = previewTab === "emails" ? EMAIL_SNIPPET : CRON_SNIPPET

  const handleCopy = () => {
    const text = activeSnippet.lines.map((l) => l.tokens.map((t) => t.text).join("")).join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#0A0A0A] font-sans antialiased text-neutral-50 flex flex-col justify-center pt-24">
      {/* Small Dot Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#525252_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-8 text-center sm:px-6 md:pb-24 lg:px-8 flex flex-col items-center">
        
        {/* Main Headline */}
        <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          The API for transactional
          <br className="hidden sm:block" />
          <span className="text-brand">email and cron jobs.</span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-6 max-w-2xl text-balance text-sm leading-relaxed text-neutral-400 sm:text-base">
          Send emails, verify OTPs, and schedule recurring webhooks all through
          one clean REST API. Use our free relay or bring your own SMTP.
          No per-email pricing. No credit card.
        </p>

        {/* Badge Row */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[12px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Open source
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800/50 px-3 py-1 text-[12px] font-medium text-neutral-400">
            <Zap className="h-3 w-3" />
            Free to use
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800/50 px-3 py-1 text-[12px] font-medium text-neutral-400">
            <Server className="h-3 w-3" />
            Self-hostable
          </span>
          {stars && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800/50 px-3 py-1 text-[12px] font-medium text-neutral-400">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {stars.toLocaleString()}
            </span>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="https://dashboard.lifygo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-8 text-sm font-semibold text-white transition-all hover:bg-brand/90 active:scale-95"
          >
            <span>Try the demo</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <a
            href="https://github.com/lifygo/lifygo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-black transition-all hover:bg-neutral-200 active:scale-95"
          >
            <img src={githubLogo.src} alt="GitHub" className="h-5 w-5" />
            <span>Star us on GitHub</span>
            {stars && (
              <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                {stars.toLocaleString()}
              </span>
            )}
          </a>
        </div>

        {/* Powered By Logos Bar */}
        <div className="mt-16 flex flex-col items-center justify-center gap-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
            Powered by modern infrastructure
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80">
            <div className="flex items-center gap-2 text-neutral-300">
              <img 
                src={golangLogo.src} 
                alt="Golang" 
                className="h-6 w-auto brightness-0 invert opacity-70 hover:opacity-100 transition-opacity" 
              />
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <img 
                src={awsLogo.src} 
                alt="AWS" 
                className="h-6 w-auto brightness-0 invert opacity-70 hover:opacity-100 transition-opacity" 
              />
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <img 
                src={logotypeLogo.src} 
                alt="Logotype" 
                className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" 
              />
            </div>
          </div>
        </div>

        {/* Dashboard/Code Interface Mockup */}
        <div className="mx-auto mt-20 w-full max-w-4xl text-left shadow-2xl shadow-black">
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-[#0A0A0A]">
            
            {/* UI Top Bar */}
            <div className="flex items-center justify-between border-b border-neutral-800 bg-[#121212] px-4 py-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand">
                    <span className="text-[10px] font-bold text-white">L</span>
                  </div>
                  <span className="font-medium text-white">LifyGo</span>
                </div>
                <div className="h-4 w-px bg-neutral-700" />
                {TAB_BUTTONS.map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setPreviewTab(tb.id)}
                    className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      previewTab === tb.id
                        ? "text-white"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    {tb.icon}
                    <span className="hidden sm:inline">{tb.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewTab("api-keys")}
                  className="rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90 transition-colors"
                >
                  New API Key
                </button>
              </div>
            </div>

            {/* Inner Content */}
            {previewTab === "emails" ? (
              <div className="bg-[#0A0A0A] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-400">Email API</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-md text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="rounded-lg border border-neutral-800/50 bg-[#0F0F0F] p-4 font-mono text-sm">
                  <code>
                    {activeSnippet.lines.map((line, i) => (
                      <div key={i} className="flex">
                        <span className="w-8 shrink-0 select-none text-neutral-600">
                          {i + 1}
                        </span>
                        <span>
                          {line.tokens.map((t, j) => (
                            <span key={j} className={t.cls}>
                              {t.text}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </code>
                </div>
              </div>
            ) : previewTab === "cron-jobs" ? (
              <div className="bg-[#0A0A0A] p-6">
                <img
                  src={jobsImg.src}
                  alt="Cron Jobs"
                  className="w-full rounded-lg border border-neutral-800/50 mb-4"
                />
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-400">Cron Job API</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-md text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="rounded-lg border border-neutral-800/50 bg-[#0F0F0F] p-4 font-mono text-sm">
                  <code>
                    {CRON_SNIPPET.lines.map((line, i) => (
                      <div key={i} className="flex">
                        <span className="w-8 shrink-0 select-none text-neutral-600">
                          {i + 1}
                        </span>
                        <span>
                          {line.tokens.map((t, j) => (
                            <span key={j} className={t.cls}>
                              {t.text}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </code>
                </div>
              </div>
            ) : previewTab === "api-keys" ? (
              <div className="bg-[#0A0A0A] p-4">
                <img
                  src={apiKeysImg.src}
                  alt="API Keys"
                  className="w-full rounded-lg"
                />
              </div>
            ) : (
              <div className="bg-[#0A0A0A] p-4">
                <img
                  src={logsImg.src}
                  alt="Logs"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
