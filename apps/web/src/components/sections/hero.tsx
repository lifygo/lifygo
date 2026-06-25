"use client"

import Link from "next/link"
import { Check, Terminal, Copy, Mail, CalendarDays } from "lucide-react"

export function Hero() {
    const codeSnippet = `curl -X POST https://api.lifygo.com/send \\
        -H "X-API-Key: lfy_your_key_here" \\
        -H "Content-Type: application/json" \\
        -d '{"to":"user@example.com","subject":"Welcome","body":"Thanks for signing up."}'`

  return (
    <section className="relative w-full border-b border-neutral-200 bg-neutral-50 px-4 py-20 sm:px-6 md:py-32 overflow-hidden">
      {/* Full section ambient brand gradient background layer */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-blue-600/[0.3] via-transparent to-blue-600/[0.2]" />
      
      {/* Concentrated radial gradient backdrop flare */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(circle_at_top,rgba(255,87,34,0.12),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center relative">
          
          {/* Left Block */}
          <div className="flex flex-col items-start text-left lg:col-span-5">
            <div className="flex items-center gap-3 border border-neutral-200 bg-white pl-2.5 pr-3.5 py-1.5 rounded-md text-xs font-mono text-neutral-800 shadow-xs mb-6">
              <span className="flex items-center gap-1.5 text-neutral-500 font-medium">
                <Mail className="h-3.5 w-3.5 text-brand" />
                Notify
              </span>
              <div className="h-3 w-px bg-neutral-300" />
              <span className="flex items-center gap-1.5 font-medium text-neutral-900 animate-pulse">
                <CalendarDays className="h-3.5 w-3.5 text-sky-500" />
                Cron active: <code className="bg-neutral-100 px-1 rounded text-[11px] text-neutral-700">*/5 * * * *</code>
              </span>
            </div>

            <h1 className="w-full tracking-tighter">
              <span className="block font-heading text-6xl md:text-8xl font-black text-neutral-950 uppercase leading-none">
                Simple
              </span>
              <span className="block font-mono text-2xl md:text-3xl font-bold tracking-tight text-brand mt-4 space-y-3">
                <span className="relative inline-block pb-1">
                  EMAIL NOTIF.
                  <span 
                    className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-full"
                    style={{ animation: "periodicLineOne 8s ease-in-out infinite" }}
                  />
                </span>
                <br />
                <span className="relative inline-block pb-1">
                  BACKGROUND JOBS.
                  <span 
                    className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-full"
                    style={{ animation: "periodicLineTwo 8s ease-in-out infinite" }}
                  />
                </span>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-neutral-600 md:text-lg">
              One unified API key. Access direct transactional emails via your own SMTP server for free, or execute accurate scheduled recurring tasks via simple cron syntax. No internal queues. No infrastructure friction.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:w-auto">
              <Link
                href="/sign-up"
                className="rounded-md bg-brand px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-brand/90 shadow-md"
              >
                Get Started Free
              </Link>
              <Link
                href="/docs"
                className="rounded-md border border-neutral-300 bg-white px-6 py-3 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Read the Docs
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-medium text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-brand" />
                Free tier forever
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-brand" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-brand" />
                5 minutes to deployment
              </span>
            </div>
          </div>

          {/* Right Block - Perfect Level Stepped Stack Loop */}
          <div className="hidden lg:flex lg:col-span-7 relative h-[480px] items-center pl-16">
            
            {/* Animated Structural Timeline Line Indicator */}
            <div 
              className="absolute inset-y-0 pointer-events-none z-40 flex flex-col items-center"
              style={{
                animation: 'sideToSideAssemble 6s ease-in-out infinite alternate',
                width: '1px'
              }}
            >
              <div 
                style={{ borderRadius: '4px 0px 4px 0px' }}
                className="bg-neutral-900 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-white border border-neutral-800 shadow-md whitespace-nowrap"
              >
                Cron job active
              </div>
              <div className="w-px bg-brand flex-1 opacity-70" />
            </div>

            {/* CARD 1 */}
            <div 
              style={{ animation: "stackCardLevelOne 9s cubic-bezier(0.25, 1, 0.5, 1) infinite" }}
              className="absolute w-[calc(100%-6rem)] rounded-xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl transition-all"
            >
              <div className="absolute top-4 left-4 flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAA2C]" />
              </div>
              <div className="flex items-center justify-end gap-2 border-b border-neutral-800 pb-3 mb-4 text-neutral-500">
                <Terminal className="h-3.5 w-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-wider">cURL Request // Instance 01</span>
              </div>
              <pre className="overflow-x-auto font-mono text-xs leading-6 text-neutral-300">
                <code>
                  <span className="text-neutral-200">https://api.lifygo.com/send</span> {"\\"}
                        {"\n    "}<span className="text-neutral-500">-H</span> <span className="text-emerald-400">"X-API-Key: lfy_your_key_here"</span> {"\\"}
                        {"\n    "}<span className="text-neutral-500">-H</span> <span className="text-emerald-400">"Content-Type: application/json"</span> {"\\"}
                        {"\n    "}<span className="text-neutral-500">-d</span> <span className="text-sky-400">{"'{"}</span>
                        {"\n      "}<span className="text-sky-400">"to": "user@example.com",</span>
                        {"\n      "}<span className="text-sky-400">"subject": "Welcome",</span>
                        {"\n      "}<span className="text-sky-400">"body": "Thanks for signing up."</span>
                        {"\n    "}<span className="text-sky-400">{"}'"}</span>
                </code>
              </pre>
              <button onClick={() => navigator.clipboard.writeText(codeSnippet)} className="absolute bottom-4 right-4 text-neutral-500 transition-colors hover:text-neutral-300 pointer-events-auto" aria-label="Copy source layout text">
                <Copy className="h-4 w-4" />
              </button>
            </div>

            {/* CARD 2 */}
            <div 
              style={{ animation: "stackCardLevelTwo 9s cubic-bezier(0.25, 1, 0.5, 1) infinite" }}
              className="absolute w-[calc(100%-6rem)] rounded-xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl transition-all"
            >
              <div className="absolute top-4 left-4 flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAA2C]" />
              </div>
              <div className="flex items-center justify-end gap-2 border-b border-neutral-800 pb-3 mb-4 text-neutral-500">
                <Terminal className="h-3.5 w-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-wider">cURL Request // Instance 02</span>
              </div>
              <pre className="overflow-x-auto font-mono text-xs leading-6 text-neutral-300">
                <code>
                  <span className="text-neutral-500">curl</span> <span className="text-neutral-500">-X</span> <span className="text-brand font-medium">POST</span> {"\\"}
                  {"\n    "}<span className="text-neutral-200">https://api.lifygo.com/v1/send</span> {"\\"}
                  {"\n    "}<span className="text-neutral-500">-H</span> <span className="text-emerald-400">"Authorization: Bearer lify_sk_..."</span> {"\\"}
                  {"\n    "}<span className="text-neutral-500">-H</span> <span className="text-emerald-400">"Content-Type: application/json"</span> {"\\"}
                  {"\n    "}<span className="text-neutral-500">-d</span> <span className="text-sky-400">{"'{"}</span>
                  {"\n      "}<span className="text-sky-400">"to": "user@example.com",</span>
                  {"\n      "}<span className="text-sky-400">"subject": "System Auth",</span>
                  {"\n      "}<span className="text-sky-400">"cron": "*/5 * * * *"</span>
                  {"\n    "}<span className="text-sky-400">{"}'"}</span>
                </code>
              </pre>
              <button onClick={() => navigator.clipboard.writeText(codeSnippet)} className="absolute bottom-4 right-4 text-neutral-500 transition-colors hover:text-neutral-300 pointer-events-auto" aria-label="Copy source layout text">
                <Copy className="h-4 w-4" />
              </button>
            </div>

            {/* CARD 3 */}
            <div 
              style={{ animation: "stackCardLevelThree 9s cubic-bezier(0.25, 1, 0.5, 1) infinite" }}
              className="absolute w-[calc(100%-6rem)] rounded-xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl transition-all"
            >
              <div className="absolute top-4 left-4 flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAA2C]" />
              </div>
              <div className="flex items-center justify-end gap-2 border-b border-neutral-800 pb-3 mb-4 text-neutral-500">
                <Terminal className="h-3.5 w-3.5" />
                <span className="font-mono text-[10px] uppercase tracking-wider">cURL Request // Instance 03</span>
              </div>
              <pre className="overflow-x-auto font-mono text-xs leading-6 text-neutral-300">
                <code>
                  <span className="text-neutral-500">curl</span> <span className="text-neutral-500">-X</span> <span className="text-brand font-medium">POST</span> {"\\"}
                  {"\n    "}<span className="text-neutral-200">https://api.lifygo.com/v1/send</span> {"\\"}
                  {"\n    "}<span className="text-neutral-500">-H</span> <span className="text-emerald-400">"Authorization: Bearer lify_sk_..."</span> {"\\"}
                  {"\n    "}<span className="text-neutral-500">-H</span> <span className="text-emerald-400">"Content-Type: application/json"</span> {"\\"}
                  {"\n    "}<span className="text-neutral-500">-d</span> <span className="text-sky-400">{"'{"}</span>
                  {"\n      "}<span className="text-sky-400">"to": "user@example.com",</span>
                  {"\n      "}<span className="text-sky-400">"subject": "System Auth",</span>
                  {"\n      "}<span className="text-sky-400">"cron": "*/5 * * * *"</span>
                  {"\n    "}<span className="text-sky-400">{"}'"}</span>
                </code>
              </pre>
              <button onClick={() => navigator.clipboard.writeText(codeSnippet)} className="absolute bottom-4 right-4 text-neutral-500 transition-colors hover:text-neutral-300 pointer-events-auto" aria-label="Copy source layout text">
                <Copy className="h-4 w-4" />
              </button>
            </div>

          </div>

          {/* Mobile Fallback */}
          <div className="block lg:hidden w-full">
            <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl">
              <pre className="overflow-x-auto font-mono text-xs leading-6 text-neutral-300">
                <code>
                  <span className="text-neutral-500">curl</span> <span className="text-neutral-500">-X</span> <span className="text-brand font-medium">POST</span> https://api.lifygo.com/v1/send
                </code>
              </pre>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes sideToSideAssemble {
          0% { left: 4%; }
          100% { left: 78%; }
        }
        @keyframes periodicLineOne {
          0%, 40%, 100% { width: 0%; opacity: 0; }
          5%, 35% { width: 100%; opacity: 1; }
        }
        @keyframes periodicLineTwo {
          0%, 45%, 90%, 100% { width: 0%; opacity: 0; }
          50%, 85% { width: 100%; opacity: 1; }
        }
        
        /* Level Stepped Loop - Each card moves from top layer downward proportionally */
        @keyframes stackCardLevelOne {
          0%, 28% { transform: translate(0px, 0px); z-index: 30; opacity: 1; filter: blur(0px); }
          33%, 61% { transform: translate(24px, 24px); z-index: 20; opacity: 0.7; filter: blur(0.5px); }
          66%, 95% { transform: translate(48px, 48px); z-index: 10; opacity: 0.35; filter: blur(1px); }
          100% { transform: translate(0px, 0px); z-index: 30; opacity: 1; filter: blur(0px); }
        }
        @keyframes stackCardLevelTwo {
          0%, 28% { transform: translate(48px, 48px); z-index: 10; opacity: 0.35; filter: blur(1px); }
          33%, 61% { transform: translate(0px, 0px); z-index: 30; opacity: 1; filter: blur(0px); }
          66%, 95% { transform: translate(24px, 24px); z-index: 20; opacity: 0.7; filter: blur(0.5px); }
          100% { transform: translate(48px, 48px); z-index: 10; opacity: 0.35; filter: blur(1px); }
        }
        @keyframes stackCardLevelThree {
          0%, 28% { transform: translate(24px, 24px); z-index: 20; opacity: 0.7; filter: blur(0.5px); }
          33%, 61% { transform: translate(48px, 48px); z-index: 10; opacity: 0.35; filter: blur(1px); }
          66%, 95% { transform: translate(0px, 0px); z-index: 30; opacity: 1; filter: blur(0px); }
          100% { transform: translate(24px, 24px); z-index: 20; opacity: 0.7; filter: blur(0.5px); }
        }
      `}</style>
    </section>
  )
}