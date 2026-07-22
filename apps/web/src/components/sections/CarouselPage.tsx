"use client"

import { useState } from "react"
import { Webhook, Mail, Shield, ArrowRight } from "lucide-react"

const services = [
  {
    id: "01",
    title: "Send transactional emails",
    description:
      "Send welcome emails, password resets, and alerts through your own SMTP. No per-email fees. No shared IP pools.",
    icon: Mail,
    imagePlaceholder:
      "https://www.litmus.com/wp-content/uploads/2020/04/6-email-deliverability-questions-answered-qa-with-mailjet.png",
  },
  {
    id: "02",
    title: "Verify users with OTP",
    description:
      "Generate cryptographically secure 6-digit codes and verify them in one call. 10-minute TTL. Single use.",
    icon: Shield,
    imagePlaceholder:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "03",
    title: "Schedule cron jobs",
    description:
      "Create recurring webhooks that hit any URL on a cron schedule. Use it to trigger emails, clean databases, or run reports.",
    icon: Webhook,
    imagePlaceholder:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
  },
]

export function ServiceCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="w-full bg-white text-neutral-900 font-sans antialiased py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <p className="font-mono text-xs font-bold text-brand uppercase tracking-wider mb-2">
            Core Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-[1.1]">
            One API. Three things you need.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-600 font-normal">
            Email, OTP, and cron jobs. No separate services. No separate bills.
          </p>
        </div>

        {/* Interactive Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Smooth Interactive Tabs */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-3">
            {services.map((service, index) => {
              const isActive = index === activeIndex
              const Icon = service.icon

              return (
                <button
                  key={service.id}
                  onClick={() => setActiveIndex(index)}
                  className={`group relative text-left p-6 rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive
                      ? "bg-neutral-950 text-white border-neutral-950 shadow-xl shadow-neutral-950/10 scale-[1.01]"
                      : "bg-neutral-50/70 hover:bg-white text-neutral-600 border-neutral-200/80 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/50 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-7 px-3 items-center justify-center font-mono text-xs font-black transition-all duration-300 rounded-[4px_0px_4px_0px] ${
                          isActive
                            ? "bg-brand text-white shadow-sm shadow-brand/30"
                            : "bg-neutral-200/80 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white"
                        }`}
                      >
                        {service.id}
                      </span>
                      <Icon
                        className={`h-4 w-4 transition-colors duration-300 ${
                          isActive
                            ? "text-brand"
                            : "text-neutral-400 group-hover:text-neutral-950"
                        }`}
                      />
                    </div>
                  </div>

                  <h3
                    className={`text-lg font-bold leading-snug transition-colors duration-300 ${
                      isActive ? "text-white" : "text-neutral-950"
                    }`}
                  >
                    {service.title}
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-relaxed transition-colors duration-300 ${
                      isActive ? "text-neutral-300" : "text-neutral-500"
                    }`}
                  >
                    {service.description}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Right Column: Dynamic Stage Preview with Cross-Fade */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-neutral-200 bg-neutral-950 text-white overflow-hidden shadow-2xl shadow-neutral-950/10 min-h-[420px]">
            
            {/* Image Stage Container */}
            <div className="relative flex-1 bg-neutral-900 overflow-hidden min-h-[280px]">
              {services.map((service, index) => {
                const isActive = index === activeIndex
                return (
                  <div
                    key={service.id}
                    className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive
                        ? "opacity-100 scale-100 z-10 pointer-events-auto"
                        : "opacity-0 scale-105 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={service.imagePlaceholder}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                        {service.title}
                      </h3>
                      <p className="mt-2 text-sm text-neutral-300 leading-relaxed max-w-lg">
                        {service.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Stage Footer Bar */}
            <div className="p-5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs">
              <span className="font-mono text-neutral-400">Open source under AGPL-3.0</span>
              <a
                href="https://docs.lifygo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 font-semibold text-brand hover:text-brand/80 transition-colors"
              >
                <span>Read the docs</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}