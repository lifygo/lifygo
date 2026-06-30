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
      { tokens: [{ text: "curl ", cls: "text-neutral-500" }, { text: "https://api.lifygo.com/v1/send", cls: "text-neutral-800" }] },
      { tokens: [{ text: "  -H ", cls: "text-neutral-500" }, { text: '"X-API-Key: lfy_live_••••••••"', cls: "text-emerald-600" }] },
      { tokens: [{ text: "  -d ", cls: "text-neutral-500" }, { text: "'{", cls: "text-sky-600" }] },
      { tokens: [{ text: '    "to": "user@example.com",', cls: "text-sky-600" }] },
      { tokens: [{ text: '    "subject": "Welcome to Acme",', cls: "text-sky-600" }] },
      { tokens: [{ text: '    "body": "Thanks for signing up."', cls: "text-sky-600" }] },
      { tokens: [{ text: "  }'", cls: "text-sky-600" }] },
    ],
  },
  cron: {
    lines: [
      { tokens: [{ text: "curl ", cls: "text-neutral-500" }, { text: "https://api.lifygo.com/v1/jobs", cls: "text-neutral-800" }] },
      { tokens: [{ text: "  -H ", cls: "text-neutral-500" }, { text: '"X-API-Key: lfy_live_••••••••"', cls: "text-emerald-600" }] },
      { tokens: [{ text: "  -d ", cls: "text-neutral-500" }, { text: "'{", cls: "text-sky-600" }] },
      { tokens: [{ text: '    "name": "sync-inventory",', cls: "text-sky-600" }] },
      { tokens: [{ text: '    "schedule": "*/5 * * * *",', cls: "text-sky-600" }] },
      { tokens: [{ text: '    "endpoint": "https://acme.io/jobs/sync"', cls: "text-sky-600" }] },
      { tokens: [{ text: "  }'", cls: "text-sky-600" }] },
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
    <section className="relative w-full overflow-hidden bg-neutral-50 font-sans [font-feature-settings:'cv11','ss01']">
      {/* Background image: a faint, faded code editor screenshot — replace src with your own asset */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-top opacity-[0.16] grayscale"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        {/* Fades the image into the page background so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/40 via-neutral-50/85 to-neutral-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-50 via-transparent to-neutral-50" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-24 text-center md:pt-32">
        {/* Eyebrow */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-500 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          One API key for email and jobs
        </div>

        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
          Email and background jobs,
          <br className="hidden sm:block" />
          <span className="text-neutral-400">without the infrastructure.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-neutral-500 sm:text-lg">
          Transactional email over your own SMTP, and reliable cron-scheduled
          jobs — both on a single API key, with no queues to manage.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="group inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-brand px-6 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link
            href="/docs"
            className="inline-flex h-11 items-center justify-center rounded-md border border-neutral-200 bg-white px-6 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2"
          >
            Read the docs
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {["Free tier forever", "No credit card required", "Live in under 5 minutes"].map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-sm text-neutral-500">
              <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Code panel */}
        <div className="mx-auto mt-16 max-w-2xl text-left">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl shadow-black/[0.06]">
            <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-2 pt-2">
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
                className="ml-auto mb-1 mr-1 rounded-md p-1.5 text-neutral-400 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
                aria-label="Copy code to clipboard"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-7 text-neutral-700">
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
          ? "border-x border-t border-neutral-200 bg-white text-neutral-900"
          : "text-neutral-400 hover:text-neutral-700"
      )}
    >
      {icon}
      {label}
    </button>
  )
}