"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

const slides = [
  {
    tag: "Email",
    title: "Your emails go through Resend",
    description:
      "Free tier emails are delivered via the LifyGo Resend relay. Set your from address and you are done. No SMTP config, no DNS records, no domain verification.",
    actionText: "Configure from address",
    actionHref: "/dashboard/smtp",
  },
  {
    tag: "Security",
    title: "API keys should never leave your server",
    description:
      "Make all LifyGo calls from your backend. Never expose your API key in client side code or mobile apps. A leaked key can send emails as you.",
    actionText: "Manage API keys",
    actionHref: "/dashboard/api-keys",
  },
  {
    tag: "Jobs",
    title: "Schedule anything with a cron expression",
    description:
      "Create recurring webhooks or email jobs. Every execution is logged with status, duration, and response code. One time jobs mark themselves complete after first run.",
    actionText: "View your jobs",
    actionHref: "/dashboard/jobs",
  },
]

export function DashboardCarousel() {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }, [])

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  useEffect(() => {
    if (isHovered) return
    const interval = setInterval(nextSlide, 6000)
    return () => clearInterval(interval)
  }, [isHovered, nextSlide])

  return (
    <div
      className="group relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Did you know
            </span>
            <span className="h-4 w-[1px] bg-border" />
            <span className="text-xs font-medium text-foreground">
              {slides[current].tag}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={prevSlide}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 min-h-[80px]">
          <h3 className="text-lg font-medium tracking-tight text-foreground">
            {slides[current].title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {slides[current].description}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <a
            href={slides[current].actionHref}
            className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          >
            {slides[current].actionText}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </a>

          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === current
                    ? "w-6 bg-foreground"
                    : "w-2 bg-muted hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
