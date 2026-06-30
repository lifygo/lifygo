"use client"

import { useState, useEffect, useCallback } from "react"
import { Zap, ShieldCheck, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    tag: "Performance",
    icon: Zap,
    title: "Faster batch delivery",
    description:
      "Concurrent email sends now route across worker pools, cutting average gateway latency to under 15ms.",
    actionText: "Read the docs",
    actionHref: "#",
    color: "text-brand",
  },
  {
    tag: "Security",
    icon: ShieldCheck,
    title: "Automatic key rotation",
    description:
      "Turn on monthly API key rotation from your settings to keep long-lived integrations secure by default.",
    actionText: "Review security settings",
    actionHref: "/dashboard/api-keys",
    color: "text-amber-500",
  },
  {
    tag: "New",
    icon: Sparkles,
    title: "Cron engine v2",
    description:
      "Scheduled jobs now support millisecond-precision intervals and smarter retry behavior on failure.",
    actionText: "View changelog",
    actionHref: "#",
    color: "text-emerald-500",
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
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isHovered, nextSlide])

  const SlideIcon = slides[current].icon

  return (
    <div
      className="group/carousel relative w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card p-5 text-foreground"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">What&apos;s new</span>

        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover/carousel:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            aria-label="Previous update"
            className="h-6 w-6 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            aria-label="Next update"
            className="h-6 w-6 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-[96px] flex-col justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <SlideIcon className={`h-4 w-4 shrink-0 ${slides[current].color}`} aria-hidden="true" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {slides[current].tag}
            </span>
          </div>

          <h4 className="text-sm font-semibold tracking-tight text-foreground">
            {slides[current].title}
          </h4>

          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-muted-foreground">
            {slides[current].description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <a
            href={slides[current].actionHref}
            className="text-xs font-medium text-brand transition-opacity hover:opacity-80"
          >
            {slides[current].actionText} →
          </a>

          <div className="flex items-center gap-1.5">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                onClick={() => setCurrent(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === current
                    ? "w-4 bg-brand"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Show update ${index + 1} of ${slides.length}: ${slide.title}`}
                aria-current={index === current}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}