"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Copy, Mail, Clock3, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "email" | "cron"

// Brand SVGs
function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function GolangIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 95" fill="currentColor" {...props}>
      <path d="M37.4 33.1c-1.8 1.1-3.6 1.7-5.5 1.7-4.1 0-7.1-2.6-7.1-6.6 0-4.3 3.3-6.8 7.8-6.8 1.5 0 3 .3 4.2.9v10.8zm11-13.8c-3.1-2.1-7.5-3.3-12.4-3.3-10.8 0-18.7 6.3-18.7 15.8 0 9.2 7.2 15.6 17.6 15.6 4.6 0 8.6-1.1 11.5-2.8v-10h-12v-7.1h20v11.8zM70.8 33.1c-1.8 1.1-3.6 1.7-5.5 1.7-4.1 0-7.1-2.6-7.1-6.6 0-4.3 3.3-6.8 7.8-6.8 1.5 0 3 .3 4.2.9v10.8zm11-13.8c-3.1-2.1-7.5-3.3-12.4-3.3-10.8 0-18.7 6.3-18.7 15.8 0 9.2 7.2 15.6 17.6 15.6 4.6 0 8.6-1.1 11.5-2.8v-10h-12v-7.1h20v11.8z" />
      <path d="M103 16.5h8.8v25.2H103V16.5zM128.2 27.2c0-3.9 2.5-6.2 6.1-6.2 3.6 0 6 2.3 6 6.2 0 3.9-2.4 6.2-6 6.2-3.6 0-6.1-2.3-6.1-6.2zm20.8 0c0-8-5.7-13.3-14.7-13.3-9 0-14.8 5.3-14.8 13.3 0 8 5.8 13.3 14.8 13.3 9 0 14.7-5.3 14.7-13.3zM157.8 28.1V16.5h8.3v2c1.7-1.7 4.1-2.4 6.7-2.4 5.6 0 9 3.5 9 9.3v16.2h-8.8V26.2c0-2.8-1.5-4.4-3.9-4.4-2.7 0-4.5 1.9-4.5 4.9v14.9h-6.8V28.1zM203.4 16.5v22.4c0 7.8-4.8 11.5-12.7 11.5-4 0-8.1-1.1-10.9-3l3.1-5.7c2.1 1.4 5.2 2.3 7.8 2.3 4.3 0 6.6-1.8 6.6-5.8v-2.3c-1.8 1.8-4.3 2.7-7.1 2.7-6.8 0-11.8-4.8-11.8-11.9 0-7.2 5.1-12.1 12-12.1 2.9 0 5.2.8 7 2.4v-1.5h9zm-8.8 10.7c0-3.8-2.5-6-6-6-3.6 0-6.1 2.2-6.1 6 0 3.7 2.5 6 6.1 6 3.5 0 6-2.2 6-6z" />
    </svg>
  )
}

function AwsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.763 10.038c0 .21-.053.29-.263.29h-.946c-.158 0-.237-.053-.29-.211l-1.393-4.522c-.027-.08-.08-.132-.158-.132h-.868c-.08 0-.132.053-.158.132l-1.393 4.522c-.027.158-.106.211-.264.211h-.946c-.21 0-.263-.08-.263-.29 0-.026.026-.105.026-.131l2.13-6.31c.08-.21.184-.316.395-.316h1.21c.21 0 .315.105.394.316l2.13 6.31c0 .026.026.105.026.131zm2.735.29h-.92c-.185 0-.264-.08-.316-.237L6.92 5.75c-.053-.158-.027-.237.132-.237h.972c.185 0 .29.053.342.21l.947 3.392.894-3.392c.053-.158.158-.21.342-.21h.789c.184 0 .289.053.342.21l.894 3.392.947-3.392c.053-.158.158-.21.342-.21h.973c.158 0 .184.08.132.237l-1.34 4.34c-.053.158-.132.238-.317.238h-.92c-.184 0-.289-.053-.342-.211l-.894-3.26-.894 3.26c-.053.158-.158.211-.342.211zm8.334.105c-1.446 0-2.288-.657-2.288-1.525 0-.946.815-1.367 2.156-1.551.71-.106 1.419-.132 2.051-.237v-.237c0-.526-.342-.815-1.078-.815-.552 0-1.157.158-1.63.421-.132.08-.237.053-.29-.08l-.29-.446c-.052-.08-.026-.158.08-.237.604-.394 1.393-.578 2.208-.578 1.472 0 2.182.71 2.182 1.841v2.524c0 .368.08.526.237.631.08.053.08.132.026.211l-.5.526c-.053.053-.132.08-.211.026a1.328 1.328 0 0 1-.368-.447c-.526.552-1.315.894-2.298.894zm.21-.868c.631 0 1.183-.237 1.63-.684v-.736c-.447.08-1.025.132-1.577.211-.736.105-1.183.315-1.183.841 0 .421.394.368 1.13.368z" />
      <path d="M18.913 14.887c-2.314 1.709-5.653 2.603-8.52 2.603-4.023 0-7.652-1.472-10.386-3.944-.21-.184-.027-.447.21-.315 2.945 1.683 6.626 2.708 10.386 2.708 2.55 0 5.337-.63 7.783-1.893.368-.21.684.158.527.841zm1.262-1.472c-.29-.368-1.893-.894-2.603-1.236-.21-.105-.184-.315.053-.263 1.551.342 3.392.868 3.655 1.183.263.342-.08 2.183-.342 3.734-.027.237-.21.263-.316.08-.342-.71-.841-2.261-.447-2.498z" />
    </svg>
  )
}

function ClerkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z" />
      <path d="M12 6a6 6 0 0 0-4.24 1.76l1.42 1.42A4 4 0 1 1 8 12H6a6 6 0 1 0 6-6z" />
    </svg>
  )
}

const SNIPPETS: Record<
  Tab,
  { lines: { tokens: { text: string; cls?: string }[] }[] }
> = {
  email: {
    lines: [
      { tokens: [{ text: "curl ", cls: "text-neutral-500" }, { text: "https://api.lifygo.com/send", cls: "text-neutral-200" }] },
      { tokens: [{ text: "  -H ", cls: "text-neutral-500" }, { text: '"X-API-Key: lfy_your_key"', cls: "text-emerald-400 font-semibold" }] },
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
      { tokens: [{ text: "  -H ", cls: "text-neutral-500" }, { text: '"X-API-Key: lfy_your_key"', cls: "text-emerald-400 font-semibold" }] },
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
  const [copied, setCopied] = useState(false)
  const active = SNIPPETS[tab]

  const handleCopy = () => {
    const text = active.lines.map((l) => l.tokens.map((t) => t.text).join("")).join("\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative w-full overflow-hidden bg-neutral-950 font-sans antialiased">
      {/* Background Image Layer */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.45]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        {/* Dark Overlays for Optimal Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/80 to-neutral-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-transparent to-neutral-950/80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-8 text-center sm:px-6 md:pb-24 md:pt-14 lg:px-8">
        {/* Main Headline */}
        <h1 className="mx-auto max-w-4xl text-balance text-3xl font-bold leading-[1.15] tracking-tight text-neutral-50 sm:text-5xl lg:text-6xl">
          Email and cron jobs,
          <br className="hidden sm:block" />
          <span className="text-neutral-500"> without the monthly bill.</span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-5 max-w-2xl text-balance text-sm leading-relaxed text-neutral-300 sm:text-base md:text-lg">
          Start free on our hosted version, or self-host on your own server.
          Send transactional emails, verify OTPs, and schedule recurring webhooks.
          One API key. No per-email fees. No credit card required.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="https://dashboard.lifygo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-semibold text-white shadow-md shadow-brand/20 transition-all duration-200 hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/30 sm:w-auto active:scale-[0.98]"
          >
            <span>Try the demo</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <a
            href="https://github.com/lifygo/lifygo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-neutral-200 backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.08] hover:text-white sm:w-auto active:scale-[0.98]"
          >
            <GithubIcon className="h-4 w-4" />
            <span>Star on GitHub</span>
          </a>
        </div>

        {/* Feature Checkmarks */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {["Free hosted version", "Self-host on your own server", "No per-email fees, ever"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs font-medium text-neutral-300 sm:text-sm">
              <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Powered By Logos Bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-3.5 backdrop-blur-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Powered by
          </span>
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-white">
              <GolangIcon className="h-5 w-auto" />
            </div>
            <div className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-white">
              <AwsIcon className="h-5 w-auto" />
            </div>
            <div className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-white">
              <ClerkIcon className="h-5 w-5" />
              <span className="font-semibold text-sm tracking-tight text-neutral-300">Clerk</span>
            </div>
          </div>
        </div>

        {/* Interactive Code Snippet Card */}
        <div className="mx-auto mt-10 max-w-3xl text-left">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-neutral-900/90 shadow-2xl shadow-black/80 backdrop-blur-md">
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-3 pt-2.5 pb-2">
              <div className="flex items-center gap-2">
                {/* macOS Controls */}
                <div className="hidden items-center gap-1.5 pl-1 sm:flex">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                </div>
                
                {/* Tabs */}
                <div className="flex items-center gap-1 sm:ml-2">
                  <TabButton
                    label="Email API"
                    icon={<Mail className="h-3.5 w-3.5" aria-hidden="true" />}
                    active={tab === "email"}
                    onClick={() => setTab("email")}
                  />
                  <TabButton
                    label="Cron Job API"
                    icon={<Clock3 className="h-3.5 w-3.5" aria-hidden="true" />}
                    active={tab === "cron"}
                    onClick={() => setTab("cron")}
                  />
                </div>
              </div>

              {/* Copy Code Action */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Copy code to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Output Area */}
            <div className="overflow-x-auto p-4 sm:p-5">
              <pre className="font-mono text-xs leading-6 text-neutral-300 sm:text-[13px] sm:leading-7">
                <code>
                  {active.lines.map((line, i) => (
                    <div key={i} className="table-row">
                      <span className="table-cell select-none pr-4 text-right text-xs text-neutral-600">
                        {i + 1}
                      </span>
                      <span className="table-cell">
                        {line.tokens.map((t, j) => (
                          <span key={j} className={t.cls}>
                            {t.text}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
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
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
        active
          ? "bg-white/10 text-white shadow-xs"
          : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
