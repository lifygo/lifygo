"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const steps = [
  {
    number: "1",
    title: "Set your from address",
    description:
      "Sign in with Google or GitHub, then set the address your recipients will see. No SMTP credentials needed — we provide the relay. Or bring your own SMTP for unlimited sending.",
  },
  {
    number: "2",
    title: "Create an API key",
    description:
      "One key covers everything — email, OTP, and cron jobs. Drop it in your environment variables. No SDKs, no client libraries. Just a header.",
  },
  {
    number: "3",
    title: "Send or schedule",
    description:
      "POST to /send for transactional email. POST to /jobs to schedule recurring webhooks. Every delivery is logged. Every job execution is recorded.",
  },
]

export function HowItWorksCTA() {
  return (
    <section className="w-full bg-white font-sans antialiased py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Get started
          </span>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl">
            Three steps to production.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-500">
            No vendor forms. No credit card. No monthly invoice.
            Two minutes from signup to your first API call.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-neutral-200 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative flex flex-col bg-white p-8 sm:p-10"
            >
              <span className="font-mono text-xs font-medium text-neutral-300">
                {step.number}
              </span>
              <h3 className="mt-3 text-lg font-medium tracking-tight text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="https://dashboard.lifygo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Try the demo
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800"
          >
            Read the docs
          </Link>
        </div>

      </div>
    </section>
  )
}
