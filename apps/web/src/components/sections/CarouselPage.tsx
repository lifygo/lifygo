"use client"

import { useState, useRef } from "react"
import { ArrowLeft, ArrowRight, Terminal, Shield, Zap, Layers } from "lucide-react"

// Define your platform services / descriptions here
const services = [
  {
    id: 1,
    title: "Transactional Mail Delivery",
    subtitle: "HIGH-THROUGHPUT ENGINE",
    description: "Engineered for maximum deliverability. Offload your welcome tracks, password resets, and critical alerts to our hyper-optimized delivery relays.",
    icon: Zap,
    imagePlaceholder: "https://www.litmus.com/wp-content/uploads/2020/04/6-email-deliverability-questions-answered-qa-with-mailjet.png" // Replace this with your actual image URL
  },
  {
    id: 2,
    title: "Programmable Cron & Queues",
    subtitle: "MICRO BACKGROUND JOBS",
    description: "Schedule complex execution loops with zero infrastructure maintenance. Drop a webhook, configure your cadence, and track every single invocation.",
    icon: Terminal,
    imagePlaceholder: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsV2sWGlL7iiw5K27Q0CzokwJDliOqiQ8em5fXHEWqQmjurDFhbgnNo1YM&s=10" // Replace this with your actual image URL
  },
  {
    id: 3,
    title: "Real-time Telemetry Analytics",
    subtitle: "DATA INSIGHT COCKPIT",
    description: "Deep observability right down to the wire. Monitor delivery logs, error tracebacks, latency averages, and server response codes live.",
    icon: Layers,
    imagePlaceholder: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpUCOtylFPjpDM056cBJIlm_TcxOs1mZcBrqquyX2yH3mZHSykXjAv0JY&s=10" // Replace this with your actual image URL
  },
  {
    id: 4,
    title: "Enterprise Shield Cryptography",
    subtitle: "SECURE LAYER",
    description: "All server keys, configurations, and sensitive access variables are heavily guarded under end-to-end envelope encryption via hardware modules.",
    icon: Shield,
    imagePlaceholder: "https://ik.imagekit.io/edtechdigit/uscsi/Content/images/articles/a-brief-guide-on-cryptography-technology-for-cybersecurity.jpg" // Replace this with your actual image URL
  }
]

export function ServiceCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleServiceChange = (index: number) => {
    setActiveIndex(index)
    
    // Smoothly scroll the carousel on the right side to match selection
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.children[0]?.clientWidth || 0
      const gap = 24 // Match space-x-6 gap
      scrollContainerRef.current.scrollTo({
        left: index * (cardWidth + gap),
        behavior: "smooth"
      })
    }
  }

  const handleNext = () => {
    if (activeIndex < services.length - 1) {
      handleServiceChange(activeIndex + 1)
    } else {
      handleServiceChange(0) // loop back
    }
  }

  const handlePrev = () => {
    if (activeIndex > 0) {
      handleServiceChange(activeIndex - 1)
    } else {
      handleServiceChange(services.length - 1) // loop to end
    }
  }

  const ActiveIcon = services[activeIndex].icon

  return (
    <section className="w-full bg-white px-6 py-24 md:py-32 font-sans antialiased relative z-20">
      <div className="mx-auto max-w-6xl">
        
        {/* Dynamic Netflix-Style Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Premium Dark Description Card */}
          <div className="lg:col-span-5 bg-neutral-950 text-white rounded-2xl p-8 md:p-10 flex flex-col justify-between shadow-xl border border-neutral-900 relative overflow-hidden transition-all duration-300">
            {/* Background Texture Line */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10">
              {/* Service Subtitle Tracker Badge */}
              <div className="flex items-center gap-3 mb-8">
                <span className="font-mono text-[10px] font-black tracking-widest bg-brand text-white px-2.5 py-1 rounded-[4px_0px_4px_0px]">
                  {services[activeIndex].subtitle}
                </span>
                <span className="text-neutral-600 font-mono text-xs">
                  0{services[activeIndex].id} / 0{services.length}
                </span>
              </div>

              {/* Dynamic Title / Description Content */}
              <div className="space-y-4 min-h-[180px]">
                {/* <div className="inline-flex p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-brand">
                  <ActiveIcon className="h-5 w-5" />
                </div> */}
                <h3 className="text-2xl font-bold tracking-tight text-white uppercase font-heading" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {services[activeIndex].title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {services[activeIndex].description}
                </p>
              </div>
            </div>

            {/* Control & Navigation Interface */}
            <div className="relative z-10 pt-8 mt-8 border-t border-neutral-900 flex items-center justify-between">
              {/* Pagination Dots Indicators */}
              <div className="flex gap-2">
                {services.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleServiceChange(idx)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${idx === activeIndex ? "w-6 bg-brand" : "w-1.5 bg-neutral-800 hover:bg-neutral-600"}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Directional Arrow Triggers */}
              <div className="flex gap-2">
                <button 
                  onClick={handlePrev}
                  className="p-2.5 border border-neutral-900 bg-neutral-900/40 text-neutral-400 hover:text-white rounded-lg transition-colors"
                  aria-label="Previous Service Feature"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleNext}
                  className="p-2.5 border border-neutral-900 bg-neutral-900/40 text-neutral-400 hover:text-white rounded-lg transition-colors"
                  aria-label="Next Service Feature"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Cinematic Card Canvas Strip */}
          <div className="lg:col-span-7 flex items-center overflow-hidden relative">
            <div 
              ref={scrollContainerRef}
              className="flex space-x-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {services.map((service, idx) => (
                <div 
                  key={service.id}
                  onClick={() => handleServiceChange(idx)}
                  className={`shrink-0 w-[85%] sm:w-[70%] lg:w-[85%] xl:w-[75%] snap-start rounded-2xl overflow-hidden cursor-pointer relative group aspect-[16/10] border transition-all duration-500 bg-neutral-100 ${
                    idx === activeIndex 
                      ? "border-brand ring-4 ring-brand/5 shadow-xl scale-[1.01]" 
                      : "border-neutral-200/80 opacity-50 hover:opacity-80 shadow-sm"
                  }`}
                >
                  {/* --- PLACE YOUR IMAGE URL INSIDE THE src INSTEAD OF PARENT WRAP --- */}
                  <img 
                    src={service.imagePlaceholder} 
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    onError={(e) => {
                      // Fallback visual template context in case image is missing / blank
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Empty Slate Layout Canvas Overlay template */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-6">
                    <span className="font-mono text-xs text-white/90 drop-shadow-md tracking-wider uppercase font-semibold">
                      {service.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Edge fade shadows just like streaming sites */}
            <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none hidden lg:block" />
          </div>

        </div>

      </div>
    </section>
  )
}