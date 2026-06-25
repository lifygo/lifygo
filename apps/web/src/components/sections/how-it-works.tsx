"use client"

import { ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Register & Add SMTP",
    description:
      "Sign in with Google or GitHub. Add your SMTP credentials once. LifyGo encrypts them at rest with AES-256 and never stores plain text passwords.",
    delay: "animation-delay-100"
  },
  {
    number: "02",
    title: "Get Your API Key",
    description:
      "Generate an API key from the dashboard. Copy it into your application as an environment variable. One key, all features.",
    delay: "animation-delay-200"
  },
  {
    number: "03",
    title: "Call the API",
    description:
      "One POST request. Email delivered. Check the dashboard for delivery logs, status, and error details in real time.",
    delay: "animation-delay-300"
  },
]

export function HowItWorks() {
  return (
    <section className="relative w-full border-t border-neutral-200 bg-white px-4 py-24 sm:px-6 md:py-32 overflow-hidden text-neutral-900">
      {/* Bright blue-400 gradient dot centered in the middle of the section */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.15),transparent_60%)] pointer-events-none blur-3xl" />
      
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">
        
        {/* Header Stream */}
        <div className="max-w-2xl space-y-4 mb-16 md:mb-24">
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl">
            Up and running in <span className="text-brand">5 minutes</span>
          </h2>
          <p className="text-base text-neutral-600 max-w-lg leading-relaxed">
            Three hyper-clean steps to bridge your application instances with custom external servers and real-time logging infrastructure.
          </p>
        </div>

        {/* Custom Asymmetrical Corner Cards Grid with Intro Staggered Animations */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative items-stretch">
          {steps.map((step, index) => (
            <div 
              key={step.number} 
              className={`group relative flex flex-col justify-between border border-neutral-200 bg-white p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:border-neutral-300 ${step.delay}`}
              style={{
                borderRadius: '12px 0px 12px 12px',
                animation: 'fadeUpSlide 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                opacity: 0
              }}
            >
              <div>
                {/* Upper Left Absolute Structured Unified Brand-Color Badge */}
                <div className="flex items-start justify-between mb-8">
                  <div className="px-3 py-1 text-xs font-mono font-bold tracking-widest bg-brand border border-brand text-white shadow-xs">
                    STEP {step.number}
                  </div>
                </div>

                {/* Core Context */}
                <h3 className="mb-3 font-heading text-xl font-bold text-neutral-950 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600 font-normal group-hover:text-neutral-800 transition-colors">
                  {step.description}
                </p>
              </div>

              {/* Technical Bottom Trace line */}
              <div className="mt-8 pt-4 border-t border-neutral-200/60 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                <span>Instance Node</span>
                <span>SEC_ID_0{step.number}</span>
              </div>

              {/* Precise Midpoint Connector Arrow Link */}
              {index < steps.length - 1 && (
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center z-20 pointer-events-none">
                  <div className="h-px w-4 bg-neutral-200 group-hover:bg-brand/60 transition-colors duration-300" />
                  <ArrowRight
                    className="h-4 w-4 text-neutral-300 group-hover:text-brand transition-colors duration-300 translate-x-[-2px]"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      <style jsx global>{`
        @keyframes fadeUpSlide {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animation-delay-100 { animation-delay: 100ms !important; }
        .animation-delay-200 { animation-delay: 200ms !important; }
        .animation-delay-300 { animation-delay: 300ms !important; }
      `}</style>
    </section>
  )
}