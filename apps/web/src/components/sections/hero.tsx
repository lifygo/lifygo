"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Copy, Mail, Clock3 } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "email" | "cron"

const SNIPPETS: Record<
  Tab,
  { lines: { tokens: { text: string; cls?: string }[] }[] }
> = {
  email: {
    lines: [
      { tokens: [{ text: "curl ", cls: "text-neutral-500" }, { text: "https://api.lifygo.com/send", cls: "text-neutral-200" }] },
      { tokens: [{ text: "  -H ", cls: "text-neutral-500" }, { text: '"X-API-Key: lfy_your_key"', cls: "text-emerald-400" }] },
      { tokens: [{ text: "  -d ", cls: "text-neutral-500" }, { text: "'{", cls: "text-sky-400" }] },
      { tokens: [{ text: '    "to": "hello@example.com",', cls: "text-sky-400" }] },
      { tokens: [{ text: '    "subject": "Welcome",', cls: "text-sky-400" }] },
      { tokens: [{ text: '    "body": "Thanks for signing up."', cls: "text-sky-400" }] },
      { tokens: [{ text: "  }'", cls: "text-sky-400" }] },
    ],
  },
  cron: {
    lines: [
      { tokens: [{ text: "curl ", cls: "text-neutral-500" }, { text: "https://api.lifygo.com/jobs", cls: "text-neutral-200" }] },
      { tokens: [{ text: "  -H ", cls: "text-neutral-500" }, { text: '"X-API-Key: lfy_your_key"', cls: "text-emerald-400" }] },
      { tokens: [{ text: "  -d ", cls: "text-neutral-500" }, { text: "'{", cls: "text-sky-400" }] },
      { tokens: [{ text: '    "name": "weekly-digest",', cls: "text-sky-400" }] },
      { tokens: [{ text: '    "schedule_type": "cron",', cls: "text-sky-400" }] },
      { tokens: [{ text: '    "cron_expression": "0 9 * * 1",', cls: "text-sky-400" }] },
      { tokens: [{ text: '    "webhook_url": "https://yourapp.com/webhook"', cls: "text-sky-400" }] },
      { tokens: [{ text: "  }'", cls: "text-sky-400" }] },
    ],
  },
}

export function Hero() {
  const [tab, setTab] = useState<Tab>("email")
  const active = SNIPPETS[tab]

  const handleCopy = () => {
    const text = active.lines.map((l) => l.tokens.map((t) => t.text).join("")).join("\n")
    navigator.clipboard.writeText(text)
  }

  return (
    <section className="relative w-full overflow-hidden bg-neutral-950 font-sans [font-feature-settings:'cv11','ss01']">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.68]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-neutral-950/70 to-neutral-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-transparent to-neutral-950/70" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-12 text-center md:pt-16">
        <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-neutral-50 sm:text-5xl lg:text-6xl">
          Email and cron jobs,
          <br className="hidden sm:block" />
          <span className="text-neutral-500">without the monthly bill.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-balance text-base leading-relaxed text-neutral-400 sm:text-lg">
          Start free on our hosted version, or self-host on your own server.
          Send transactional emails, verify OTPs, and schedule recurring webhooks.
          One API key. No per-email fees. No credit card.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="group inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-brand px-6 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            Try the demo
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link
            href="https://github.com/lifygo/lifygo"
            className="inline-flex h-11 items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.04] px-6 text-sm font-medium text-neutral-200 backdrop-blur-sm transition-colors duration-200 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            Star on GitHub
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {["Free hosted version", "Self-host on your own server", "No per-email fees, ever"].map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-sm text-neutral-400">
              <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl text-left">
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-900/95 shadow-2xl shadow-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-1 border-b border-white/[0.06] bg-white/[0.02] px-2 pt-2">
              <TabButton
                label="Email"
                icon={<Mail className="h-3.5 w-3.5" aria-hidden="true" />}
                active={tab === "email"}
                onClick={() => setTab("email")}
              />
              <TabButton
                label="Cron job"
                icon={<Clock3 className="h-3.5 w-3.5" aria-hidden="true" />}
                active={tab === "cron"}
                onClick={() => setTab("cron")}
              />
              <button
                onClick={handleCopy}
                className="ml-auto mb-1 mr-1 rounded-md p-1.5 text-neutral-500 transition-colors duration-200 hover:bg-white/[0.08] hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label="Copy code to clipboard"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-7 text-neutral-300">
              <code>
                {active.lines.map((line, i) => (
                  <div key={i}>
                    {line.tokens.map((t, j) => (
                      <span key={j} className={t.cls}>
                        {t.text}
                      </span>
                    ))}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-t-md px-3 py-2 text-xs font-medium transition-colors duration-200",
        active
          ? "border-x border-t border-white/[0.08] bg-neutral-900 text-neutral-50"
          : "text-neutral-500 hover:text-neutral-200"
      )}
    >
      {icon}
      {label}
    </button>
  )
}