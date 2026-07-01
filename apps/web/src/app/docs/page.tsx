"use client"

import { useState } from "react"
import { Terminal, Copy, Check, BookOpen, Code2, Cpu, KeyRound, Radio } from "lucide-react"

const docSections = [
  {
    id: "authentication",
    title: "Authentication",
    badge: "AUTH",
    icon: KeyRound,
    description: "Authenticate your account by passing your secret API key in the request headers.",
    steps: [
      {
        title: "Locate your private token",
        text: "Navigate to your operational LifyGo dashboard and copy the live token associated with your production workspace environment variable."
      },
      {
        title: "Configure the request header",
        text: "All programmatic gateway API requests must include your secure token transmitted strictly within the X-API-Key declaration format header."
      }
    ],
    code: `curl -X POST https://api.lifygo.com/v1/auth \\
  -H "X-API-Key: lfy_live_4f9a721c810de08e21c" \\
  -H "Content-Type: application/json"`
  },
  {
    id: "sending-emails",
    title: "Sending Emails",
    badge: "SMTP",
    icon: Code2,
    description: "Dispatch transactional messages instantly over pre-verified relay configurations using our standard REST endpoint.",
    steps: [
      {
        title: "Construct the payload JSON",
        text: "Provide your transmission parameters including the recipient string, dynamic title variables, and raw text body blocks."
      },
      {
        title: "Execute payload endpoint",
        text: "Fire a structured POST request directly into the primary send relay vector loop for instantaneous delivery evaluation."
      }
    ],
    code: `curl -X POST https://api.lifygo.com/v1/send \\
  -H "X-API-Key: lfy_live_••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "developer@example.com",
    "subject": "System Initialization",
    "html": "<p>Runtime instance is active.</p>"
  }'`
  },
  {
    id: "webhooks",
    title: "Webhooks",
    badge: "HOOKS",
    icon: Radio,
    description: "Receive asynchronous runtime performance payloads and event triggers delivered back directly into your origin app instances.",
    steps: [
      {
        title: "Expose ingestion endpoint",
        text: "Set up a highly available destination route within your microservices to catch standard incoming secure payloads."
      },
      {
        title: "Verify structural signatures",
        text: "Evaluate request signatures against the provided workspace secret keys to ensure completely untampered delivery paths."
      }
    ],
    code: `// Express Ingestion Handler Route Example
app.post('/webhooks/lifygo', (req, res) => {
  const event = req.body;
  
  if (event.type === 'email.delivered') {
    console.log(\`Message \${event.id} processed in 14ms\`);
  }
  
  res.status(200).end();
});`
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
        
        {/* Layout Split: Left Nav Menus & Right Core Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Asymmetrical Sticky Reference Controller */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 border border-neutral-200 bg-neutral-50 pl-2 pr-3 py-1 rounded-md text-xs font-mono text-neutral-600 shadow-xs">
                <BookOpen className="h-3.5 w-3.5 text-brand" />
                Developer Reference Guides
              </div>
              <h2 className="text-3xl font-black tracking-tight text-neutral-950 uppercase font-heading" style={{ fontFamily: 'Inter, sans-serif' }}>
                Engineered for <span className="text-brand">Developers</span>
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                Integrate robust message streams and scheduled tasks smoothly with clean REST standard patterns.
              </p>
            </div>

            {/* Asymmetrical Tab Buttons List */}
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
                    style={{ borderRadius: isSelected ? '4px 0px 4px 0px' : '4px', fontFamily: 'Inter, sans-serif' }}
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

          {/* Right Column: Dynamic Interactive Code Canvas Panel */}
          <div className="lg:col-span-8 space-y-8 bg-neutral-50/50 border border-neutral-200 rounded-2xl p-6 md:p-8 shadow-xs">
            
            {/* Dynamic Intro Summary Block */}
            <div className="space-y-3 pb-6 border-b border-neutral-200">
              <div className="flex items-center gap-2 text-brand">
                <ActiveIcon className="h-5 w-5" />
                <span className="text-xs font-bold font-mono uppercase tracking-widest">{activeDoc.title} Overview</span>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                {activeDoc.description}
              </p>
            </div>

            {/* Modular Integration Code Box Element */}
            <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg">
              <div className="border-b border-neutral-800 bg-neutral-950 px-5 py-3 flex items-center justify-between">
                <span className="text-xs font-mono tracking-wide text-neutral-400 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-neutral-500" /> API Environment Core Payload
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
                      <span>Copy Code</span>
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

            {/* Sequential Procedural Step Blocks */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold font-mono tracking-widest text-neutral-400 uppercase">Step-by-Step Implementation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDoc.steps.map((step, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200 p-5 rounded-xl shadow-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black tracking-widest bg-brand/10 text-brand px-1.5 py-0.5 rounded">
                        0{idx + 1}
                      </span>
                      <h5 className="text-xs font-bold tracking-tight text-neutral-950 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {step.title}
                      </h5>
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
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