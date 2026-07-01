"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const freeFeatures = [
  "Unlimited email sends (POST /send)",
  "OTP generation and verification",
  "Email delivery logs",
  "Up to 3 scheduled jobs",
  "Bring your own SMTP",
  "100 requests/hour rate limit",
]

const proFeatures = [
  "Everything in Free",
  "Unlimited scheduled jobs",
  "Full execution history (30 days)",
  "Priority job execution",
  "Higher rate limits",
  "Email support",
]

export default function PricingCards({ showTitle = true }: { showTitle?: boolean }) {
  return (
    <section className="relative w-full overflow-hidden bg-neutral-950 px-4 py-24 sm:px-6 md:py-32 font-sans antialiased">
      {/* Subtle ambient backlighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/5 blur-3xl" aria-hidden="true" />

      {showTitle && (
        <div className="relative z-10 mx-auto max-w-2xl space-y-4 text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight text-white uppercase font-heading" style={{ fontFamily: 'Inter, sans-serif' }}>
            Simple, transparent pricing
          </h2>
          <p className="text-base text-neutral-400 max-w-md mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Start completely free. Scale seamlessly with full operational transparency.
          </p>
        </div>
      )}

      <div className="relative z-10 mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
        
        {/* Obsidian Glass - Free Card */}
        <Card className="flex flex-col justify-between border-neutral-800 bg-neutral-900/40 backdrop-blur-md rounded-2xl p-2 transition-all duration-300 hover:border-neutral-700">
          <div>
            <CardHeader className="space-y-4">
              <Badge
                variant="outline"
                className="w-fit border-neutral-800 bg-neutral-950 px-3 py-1 text-xs font-mono tracking-wide text-neutral-400 rounded"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                DEVELOPER FREE
              </Badge>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tight text-white font-heading" style={{ fontFamily: 'Inter, sans-serif' }}>$0</span>
                <span className="text-neutral-500 font-mono text-sm">/month</span>
              </div>
              <p className="text-xs text-neutral-400 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                Forever runtime instance. No credit card required.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-0">
              <Separator className="bg-neutral-800/80" />
              <ul className="space-y-3.5">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span className="text-sm text-neutral-400 tracking-wide font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>

          <CardContent className="pt-0">
            <Link
              href="/sign-up"
              className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-center text-sm font-bold text-neutral-200 transition-all duration-200 hover:bg-neutral-900 hover:text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Get Started Free
            </Link>
          </CardContent>
        </Card>

        {/* High Octane Brand Canvas - Pro Card (Recommended) */}
        <Card className="flex flex-col justify-between border-brand bg-brand shadow-2xl shadow-brand/20 rounded-2xl p-2 relative overflow-hidden transform md:-translate-y-2 group">
          {/* Subtle design dynamic lines inside the card */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" 
               style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
          
          <div>
            <CardHeader className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <Badge
                  className="w-fit border-white/20 bg-white/15 px-3 py-1 text-xs font-mono tracking-wide text-white rounded shadow-sm backdrop-blur-xs"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  PRODUCTION PRO
                </Badge>
                <span className="text-[10px] font-black tracking-widest uppercase bg-white text-brand px-2 py-0.5 rounded-[4px_0px_4px_0px]">
                  RECOMMENDED
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tight text-white font-heading" style={{ fontFamily: 'Inter, sans-serif' }}>$9</span>
                <span className="text-white/70 font-mono text-sm">/month</span>
              </div>
              <p className="text-xs text-white/90 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                Cancel anytime. Uncapped programmatic power.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-0 relative z-10">
              <Separator className="bg-white/20" />
              <ul className="space-y-3.5">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                    <span className="text-sm text-white tracking-wide font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>

          <CardContent className="pt-4 relative z-10">
            <Link
              href="/sign-up"
              className="block w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-black text-brand shadow-xl transition-all duration-200 hover:bg-neutral-50 hover:scale-[1.01]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Upgrade to Pro
            </Link>
          </CardContent>
        </Card>

      </div>
    </section>
  )
}