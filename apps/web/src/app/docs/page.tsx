"use client"

import { useState } from "react"
import { Terminal, Copy, Check, BookOpen, Code2, Cpu, KeyRound, Radio } from "lucide-react"

const docSections = [
  {
    id: "authentication",
    title: "Authentication",
    badge: "AUTH",
    icon: KeyRound,
    description: "Every request needs your API key in the X-API-Key header. Generate one from the dashboard and you are done.",
    steps: [
      {
        title: "Get your key",
        text: "Go to the API keys page in your dashboard and copy the key. It starts with lfy_live_."
      },
      {
        title: "Add it to every request",
        text: "Pass the key as the X-API-Key header. The same key works for email, OTP, and cron jobs."
      }
    ],
    code: `curl -X POST http://localhost:8080/send \\
  -H "X-API-Key: lfy_your_key" \\
  -H "Content-Type: application/json"`
  },
  {
    id: "sending-emails",
    title: "Sending Emails",
    badge: "SMTP",
    icon: Code2,
    description: "Send transactional emails through your own SMTP server. Your emails, your infrastructure, your reputation.",
    steps: [
      {
        title: "Set up your SMTP",
        text: "Add your SMTP host, port, username, and password in the dashboard. Your credentials are encrypted with AES-256."
      },
      {
        title: "Fire off a send request",
        text: "One POST with the recipient, subject, and body. LifyGo delivers it through your SMTP and logs the result."
      }
    ],
    code: `curl -X POST http://localhost:8080/send \\
  -H "X-API-Key: lfy_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "hello@example.com",
    "subject": "Welcome to Acme",
    "body": "Thanks for signing up."
  }'`
  },
  {
    id: "cron-jobs",
    title: "Cron Jobs",
    badge: "CRON",
    icon: Radio,
    description: "Schedule recurring webhooks that hit any URL. Use it to trigger emails, clean your database, or run reports.",
    steps: [
      {
        title: "Create a job",
        text: "Give it a name, choose webhook or email, set a cron expression, and define what URL to hit or who to email."
      },
      {
        title: "Let it run",
        text: "LifyGo fires the job at the scheduled time. Every execution is logged with status, duration, and any errors."
      }
    ],
    code: `curl -X POST http://localhost:8080/jobs \\
  -H "X-API-Key: lfy_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "weekly-digest",
    "type": "webhook",
    "schedule_type": "cron",
    "cron_expression": "0 9 * * 1",
    "webhook_url": "https://yourapp.com/webhook"
  }'`
  }
]

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("authentication")
  const [copied, setCopied] = useState(false)

  const activeDoc = docSections.find((section) => section.id === activeTab) || docSections[0]
  const ActiveIcon = activeDoc.icon

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="w-full bg-white px-6 py-24 md:py-32 font-sans antialiased relative z-20 border-t border-neutral-100">
      <div className="mx-auto max-w-6xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 border border-neutral-200 bg-neutral-50 pl-2 pr-3 py-1 rounded-md text-xs font-mono text-neutral-600 shadow-xs">
                <BookOpen className="h-3.5 w-3.5 text-brand" />
                Developer docs
              </div>
              <h2 className="text-3xl font-black tracking-tight text-neutral-950 uppercase font-heading">
                API Reference
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Everything you need to integrate email, OTP, and cron jobs into your app.
              </p>
            </div>

            <nav className="flex flex-col gap-2 pt-4">
              {docSections.map((section) => {
                const SectionIcon = section.icon
                const isSelected = section.id === activeTab
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`flex items-center justify-between p-3 text-left transition-all duration-150 border ${
                      isSelected
                        ? "border-brand bg-neutral-950 text-white shadow-md"
                        : "border-neutral-200 bg-neutral-50/50 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                    }`}
                    style={{ borderRadius: isSelected ? '4px 0px 4px 0px' : '4px' }}
                  >
                    <div className="flex items-center gap-3">
                      <SectionIcon className={`h-4 w-4 ${isSelected ? "text-brand" : "text-neutral-400"}`} />
                      <span className="text-xs font-bold tracking-wide">{section.title}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-brand text-white" : "bg-neutral-200/60 text-neutral-500"
                    }`}>
                      {section.badge}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="lg:col-span-8 space-y-8 bg-neutral-50/50 border border-neutral-200 rounded-2xl p-6 md:p-8 shadow-xs">
            
            <div className="space-y-3 pb-6 border-b border-neutral-200">
              <div className="flex items-center gap-2 text-brand">
                <ActiveIcon className="h-5 w-5" />
                <span className="text-xs font-bold font-mono uppercase tracking-widest">{activeDoc.title}</span>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {activeDoc.description}
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg">
              <div className="border-b border-neutral-800 bg-neutral-950 px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-mono tracking-wide text-neutral-400 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-neutral-500" /> Terminal
                </span>
                <button
                  onClick={() => handleCopyCode(activeDoc.code)}
                  className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-neutral-950/40 p-5 overflow-x-auto">
                <pre className="font-mono text-xs leading-6 text-neutral-300">
                  <code>{activeDoc.code}</code>
                </pre>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold font-mono tracking-widest text-neutral-400 uppercase">How to do it</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDoc.steps.map((step, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200 p-5 rounded-xl shadow-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black tracking-widest bg-brand/10 text-brand px-1.5 py-0.5 rounded">
                        0{idx + 1}
                      </span>
                      <h5 className="text-xs font-bold tracking-tight text-neutral-950 uppercase">
                        {step.title}
                      </h5>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}