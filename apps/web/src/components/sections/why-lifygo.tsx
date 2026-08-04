"use client"

import { Check, X } from "lucide-react"

const rows = [
  {
    label: "Send transactional emails",
    without: "Resend, SendGrid, or Mailgun. Configure SPF, DKIM, DMARC before your first send.",
    with: "Set your from address and call POST /send. Deliverability is handled for you.",
  },
  {
    label: "Verify users with OTP",
    without: "Twilio Verify or a separate auth service. Per SMS cost. Another SDK to manage.",
    with: "One call to generate, one to verify. 6-digit codes, 10 minute TTL, single use.",
  },
  {
    label: "Schedule recurring jobs",
    without: "CloudWatch, Trigger.dev, or a custom cron daemon. More infrastructure, more config.",
    with: "POST /jobs with a cron expression. Fires webhooks or emails on schedule. Logged automatically.",
  },
  {
    label: "Setup time",
    without: "Three accounts, three API keys, three dashboards. An afternoon in DNS settings.",
    with: "Sign in with Google, set one from address, get one API key. Under two minutes.",
  },
  {
    label: "Monthly cost",
    without: "Pay for each service individually. Scaling means scaling three separate bills.",
    with: "Free for 1,000 emails/month. Self-host when you need more. No per-email pricing.",
  },
]

export function WhyLifyGo() {
  return (
    <section className="w-full bg-neutral-950 text-white font-sans antialiased py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        <div className="max-w-2xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Email infrastructure without the infrastructure.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed">
            One API for email, OTP, and cron. Spend your time building features, not configuring email providers.
          </p>
        </div>

        <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-neutral-900/50">

          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-neutral-900/60 border-b border-white/[0.06] text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
            <div className="col-span-4">What you need</div>
            <div className="col-span-4">The old way</div>
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
          <p>Free to start. Self-host when you grow. No lock in.</p>
          <a
            href="https://github.com/lifygo/lifygo"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand hover:text-brand/80 transition-colors"
          >
            View on GitHub
          </a>
        </div>

      </div>
    </section>
  )
}
