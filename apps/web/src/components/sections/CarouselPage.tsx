"use client"

import { useState } from "react"

const services = [
  {
    id: "01",
    title: "Send transactional emails",
    description:
      "Send welcome emails, password resets, and alerts. Use your own SMTP or our free hosted version. No per-email fees. No shared IP pools.",
    imagePlaceholder:
      "https://www.litmus.com/wp-content/uploads/2020/04/6-email-deliverability-questions-answered-qa-with-mailjet.png",
  },
  {
    id: "02",
    title: "Verify users with OTP",
    description:
      "Generate cryptographically secure 6 digit codes and verify them in one call. 10 minute TTL. Single use. Works with any email provider.",
    imagePlaceholder:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "03",
    title: "Schedule cron jobs",
    description:
      "Create recurring webhooks that hit any URL on a cron schedule. Use it to trigger emails, clean databases, run reports, or anything else.",
    imagePlaceholder:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
  },
]

export function ServiceCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = services[activeIndex]

  return (
    <section className="w-full bg-white text-neutral-900 font-sans antialiased py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-[1.1]">
            One API. Three things you need.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-neutral-600">
            Email, OTP, and cron jobs. No separate services. No separate bills.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-5 flex flex-col gap-3">
            {services.map((service, index) => {
              const isActive = index === activeIndex

              return (
                <button
                  key={service.id}
                  onClick={() => setActiveIndex(index)}
                  className={`group relative text-left p-6 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? "bg-neutral-950 text-white border-neutral-950 shadow-xl scale-[1.01]"
                      : "bg-neutral-50/70 hover:bg-white text-neutral-600 border-neutral-200/80 hover:border-neutral-300 hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  <span
                    className={`inline-flex h-7 px-3 items-center justify-center font-mono text-xs font-black transition-all duration-300 rounded-[4px_0px_4px_0px] mb-3 ${
                      isActive
                        ? "bg-brand text-white"
                        : "bg-neutral-200/80 text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white"
                    }`}
                  >
                    {service.id}
                  </span>

                  <h3 className={`text-lg font-bold leading-snug transition-colors duration-300 ${isActive ? "text-white" : "text-neutral-950"}`}>
                    {service.title}
                  </h3>

                  <p className={`mt-2 text-sm leading-relaxed transition-colors duration-300 ${isActive ? "text-neutral-300" : "text-neutral-500"}`}>
                    {service.description}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-neutral-200 bg-neutral-950 text-white overflow-hidden shadow-2xl min-h-[420px] flex flex-col">
            
            <div className="relative flex-1 bg-neutral-900 overflow-hidden min-h-[280px]">
              {services.map((service, index) => {
                const isActive = index === activeIndex
                return (
                  <div
                    key={service.id}
                    className={`absolute inset-0 transition-all duration-500 ${
                      isActive
                        ? "opacity-100 scale-100 z-10"
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

            <div className="p-5 bg-neutral-950 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-neutral-400">Open source under AGPL-3.0</span>
              <a
                href="https://docs.lifygo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Read the docs
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}