"use client"

import { useState, useEffect } from "react"
import { Terminal, Mail, CheckCircle2, ArrowRight, Clock } from "lucide-react"

export function EmailDeliverySimulator() {
  const [step, setStep] = useState<"idle" | "sending" | "delivered">("idle")

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((current) => {
        if (current === "idle") return "sending"
        if (current === "sending") return "delivered"
        return "idle"
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mx-auto mt-12 max-w-3xl px-4">
      <div className="text-center mb-6">
        <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
          Live Execution Stream
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 items-stretch">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-neutral-500" />
              <span className="font-mono text-xs font-semibold text-neutral-700">LifyGo Core API Router</span>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
              step === "sending" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-neutral-50 text-neutral-600 border border-neutral-200"
            }`}>
              {step === "sending" ? "POST /v1/send" : "READY"}
            </span>
          </div>

          <div className="mt-4 space-y-2 font-mono text-xs text-neutral-600">
            <div className="p-2.5 bg-neutral-50 rounded border border-neutral-100">
              <span className="text-neutral-400"># Payload</span>
              <pre className="mt-1 overflow-x-auto text-neutral-800">
{`{
  "to": "user@domain.com",
  "template": "welcome_otp",
  "vars": { "code": "482019" }
}`}
              </pre>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-neutral-400">Transport Layer:</span>
              <span className="text-neutral-800 font-medium">Custom SMTP Server</span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          {step === "idle" && (
            <div className="flex h-full flex-col items-center justify-center text-center p-6">
              <Clock className="h-8 w-8 text-neutral-300" />
              <p className="mt-2 text-sm font-medium text-neutral-600">Awaiting API trigger...</p>
              <p className="text-xs text-neutral-400 mt-0.5">Payload will route in real-time.</p>
            </div>
          )}

          {step === "sending" && (
            <div className="flex h-full flex-col items-center justify-center text-center p-6">
              <div className="h-2 w-24 bg-neutral-100 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-brand w-1/2 rounded-full" />
              </div>
              <p className="mt-4 text-sm font-medium text-neutral-700">Processing transactional delivery</p>
              <p className="text-xs text-neutral-400 mt-0.5">Bypassing internal queues...</p>
            </div>
          )}

          {step === "delivered" && (
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-700">Inbox (user@domain.com)</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Delivered
                  </span>
                </div>

                <div className="mt-4 rounded-lg border border-neutral-100 bg-neutral-50 p-4">
                  <div className="border-b border-neutral-200 pb-2 mb-2">
                    <div className="text-xs font-bold text-neutral-800">Welcome to your app!</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">From: security@yourdomain.com</div>
                  </div>
                  <p className="text-xs text-neutral-600 leading-normal">
                    Your verification identity protocol sequence is complete. Use the following code to authorize your production instance access token:
                  </p>
                  <div className="mt-3 inline-block rounded border border-neutral-200 bg-white px-3 py-1 font-mono text-sm font-bold tracking-wider text-neutral-800">
                    482019
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-2 border-t border-neutral-100">
                <span>Latency: 42ms</span>
                <span>via TLS / Port 587</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}