"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Plug in your SMTP",
    description:
      "Sign in with Google or GitHub, then add your SMTP credentials. Gmail, Zoho, your hosting provider. Your password is encrypted with AES-256. Or skip this and use our free hosted version.",
  },
  {
    number: "02",
    title: "Get one API key",
    description:
      "A single key covers email sending, OTP verification, and cron job scheduling. Drop it in your environment. No SDK required.",
  },
  {
    number: "03",
    title: "Send or schedule",
    description:
      "One POST to send an email. Another to schedule a recurring webhook. Every delivery and execution is logged automatically. Enable AWS EventBridge for production workloads that survive restarts.",
  },
]

export function HowItWorksCTA() {
  return (
    <section className="w-full bg-white text-neutral-900 font-sans antialiased pt-12 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-neutral-100/80 overflow-hidden min-h-[460px] flex flex-col md:flex-row items-stretch border border-neutral-200/80 shadow-sm">
          <div className="relative md:w-1/2 w-full min-h-[300px] md:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop"
              alt="Developer working on laptop"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-100/90 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-neutral-100/90" />
          </div>

          <div className="md:w-1/2 w-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative z-10 bg-neutral-100/90 md:bg-transparent">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-[1.1]">
              From zero to delivery in five minutes
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
              Sign up free or self host on your own server. No vendor accounts. No monthly fees. Just your SMTP, one API key, and a curl command.
            </p>
            <div className="mt-8">
              <Link
                href="/how-it-works"
                className="group inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand/80 transition-colors"
              >
                <span>See how it works</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-20 -mt-12 sm:-mt-20 px-2 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group rounded-2xl bg-white p-6 sm:p-8 shadow-xl shadow-neutral-200/50 border border-neutral-200/80 flex flex-col items-start gap-4 hover:border-brand/40 hover:shadow-2xl hover:shadow-brand/5 hover:-translate-y-1 transition-all duration-300"
              >
                <span className="inline-flex h-8 px-3.5 items-center justify-center bg-brand text-white font-mono text-xs font-black tracking-wider shadow-md shadow-brand/20 rounded-[4px_0px_4px_0px]">
                  {step.number}
                </span>

                <div>
                  <h3 className="text-xl font-bold text-neutral-950 group-hover:text-brand transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}