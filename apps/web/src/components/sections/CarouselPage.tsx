"use client"

import { useState } from "react"

import apiKeysImg from "@/assets/links/apikey.png"
import jobsImg from "@/assets/links/jobs.png"
import logsImg from "@/assets/links/logs.png"

const features = [
  {
    id: "01",
    title: "Transactional email & OTP",
    description:
      "Send welcome emails, password resets, and alerts through your own SMTP or our free relay. Verify users with single-use OTP codes — no shared IP pools, no per-message fees.",
    image: jobsImg,
  },
  {
    id: "02",
    title: "Cron jobs & webhooks",
    description:
      "Schedule recurring webhooks that hit any URL on a cron schedule. Use one-time or recurring jobs to trigger emails, clean databases, or run reports.",
    image: logsImg,
  },
  {
    id: "03",
    title: "API keys & logs",
    description:
      "Manage API keys per environment. Every send and every job execution is logged — full visibility into what your application is doing, with zero extra setup.",
    image: apiKeysImg,
  },
]

export function ServiceCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="relative w-full bg-white font-sans antialiased py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Everything you need
          </span>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl">
            One API, three primitives.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-500">
            Stop stitching together SendGrid, Twilio, and cron jobs.
            LifyGo handles email, OTP, and scheduling in a single integration.
          </p>
        </div>

        {/* Feature selector tabs */}
        <div className="mt-14 flex justify-center gap-1 rounded-2xl bg-neutral-100 p-1 w-fit mx-auto">
          {features.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setActiveIndex(i)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                i === activeIndex
                  ? "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/50"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {f.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">

          {/* Left: Description */}
          <div>
            <span className="font-mono text-xs font-medium text-neutral-300">
              {features[activeIndex].id}
            </span>
            <h3 className="mt-2 text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
              {features[activeIndex].title}
            </h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-500">
              {features[activeIndex].description}
            </p>

            {/* Dot indicators */}
            <div className="mt-8 flex gap-2">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? "w-6 bg-neutral-800" : "w-1.5 bg-neutral-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right: Screenshot */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-lg shadow-neutral-200/50">
              {features.map((f, i) => (
                <img
                  key={f.id}
                  src={f.image.src}
                  alt={f.title}
                  className={`w-full transition-opacity duration-500 ${
                    i === activeIndex ? "block opacity-100" : "hidden opacity-0"
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
