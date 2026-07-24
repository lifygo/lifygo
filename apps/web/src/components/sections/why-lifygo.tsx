"use client"

import { Check, X } from "lucide-react"

const rows = [
  {
    label: "Send transactional emails",
    without: "Resend, SendGrid, or Mailgun — pay per email",
    with: "Your own SMTP or our free hosted version — unlimited sends",
  },
  {
    label: "Verify users with OTP",
    without: "Twilio Verify or separate OTP service — per SMS cost",
    with: "Generate and verify codes through the API — included free",
  },
  {
    label: "Schedule cron jobs",
    without: "Trigger.dev, Celery, or Redis queue — more infrastructure",
    with: "One POST to create a job — fires webhooks or emails on schedule",
  },
  {
    label: "Infrastructure",
    without: "Three accounts, three API keys, three dashboards",
    with: "One API key, one dashboard, your server or ours",
  },
  {
    label: "Monthly bill",
    without: "$30 to $100+ across three services",
    with: "$0. Free hosted or runs on your existing VPS.",
  },
]

export function WhyLifyGo() {
  return (
    <section className="w-full bg-neutral-950 text-white font-sans antialiased py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="max-w-2xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Why add another bill when you already pay for email?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed">
            Sign up and start sending in two minutes. Or self-host and use your own SMTP. Either way, no per-email fees.
          </p>
        </div>

        <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-neutral-900/50">
          
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-neutral-900/60 border-b border-white/[0.06] text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
            <div className="col-span-4">What you need</div>
            <div className="col-span-4">Without LifyGo</div>
            <div className="col-span-4 text-white">With LifyGo</div>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {rows.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-5 text-sm items-start hover:bg-white/[0.02] transition-colors"
              >
                <div className="md:col-span-4 font-semibold text-white pt-0.5">
                  {row.label}
                </div>

                <div className="md:col-span-4 flex items-start gap-2.5 text-neutral-400">
                  <X className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                  <span className="leading-normal">{row.without}</span>
                </div>

                <div className="md:col-span-4 flex items-start gap-2.5 text-neutral-100">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-normal">{row.with}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-neutral-400">
          <p>No per-email fees. No vendor lock-in. Free to start.</p>
          <a
            href="https://github.com/lifygo/lifygo"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand hover:text-brand/80 transition-colors"
          >
            Self-host on your own server →
          </a>
        </div>

      </div>
    </section>
  )
}