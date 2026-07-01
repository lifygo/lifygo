"use client"

import { KeyRound, Lock, Copy, CheckCircle2, ShieldCheck, Terminal } from "lucide-react"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
      <path d="M5.84 14.1A6.6 6.6 0 015.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 001 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}

export function HowItWorks() {
  return (
    <section className="relative w-full overflow-hidden bg-white px-6 py-24 font-sans antialiased md:py-32 rounded-t-[48px] md:rounded-t-[64px] text-neutral-900 shadow-[0_-12px_40px_rgba(0,0,0,0.03)] -mt-12 z-20">
      
      {/* Massive Graphic Background Typography Watermark */}
      <div className="absolute inset-x-0 top-12 pointer-events-none select-none overflow-hidden flex justify-center z-0 opacity-[0.03]">
        <h1 className="font-heading font-black tracking-tighter uppercase text-[24vw] leading-none text-neutral-950">
          OVERVIEW
        </h1>
      </div>

      <div className="relative mx-auto max-w-5xl z-10">
        {/* Editorial Text Head */}
        <div className="mb-24 md:mb-32 text-left max-w-2xl animate-fade-in-up">
          <h2 className="text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl uppercase font-heading" style={{ fontFamily: 'Inter, sans-serif' }}>
            Up and running in <span className="text-brand">five minutes</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            From securely linking credentials to executing your very first payload — engineered entirely without extra infrastructure friction.
          </p>
        </div>

        {/* Steps Grid System */}
        <ol className="flex flex-col gap-24 relative">
          
          {/* Step 01 */}
          <li className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-center group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="lg:col-span-5 flex flex-col justify-center order-1">
              <div className="flex items-center gap-3 mb-5">
                {/* Asymmetrical Custom Corner Cut Badge */}
                <span 
                  className="font-mono text-xs font-bold tracking-widest bg-brand text-white px-3 py-1 border border-brand" 
                  style={{ borderRadius: '4px 0px 4px 0px', fontFamily: 'Inter, sans-serif' }}
                >
                  01
                </span>
                <div className="h-px bg-neutral-200 flex-1" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-neutral-950 font-heading" style={{ fontFamily: 'Inter, sans-serif' }}>
                Connect your mail server
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                Sign in with Google or GitHub, then link your custom external SMTP credentials once. Everything is encrypted securely at rest with AES-256 — plain text passwords are never stored.
              </p>
            </div>

            {/* Panel Mockup 1 */}
            <div className="lg:col-span-7 order-2">
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-md transition-all duration-300 group-hover:border-neutral-300 group-hover:shadow-lg">
                <div className="border-b border-neutral-200 bg-white px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-mono tracking-wide text-neutral-500">Sign in & Auth Gateway</span>
                  <span className="h-2 w-2 rounded-full bg-neutral-200" />
                </div>
                <div className="flex flex-col gap-3 p-5 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
                      <GoogleIcon className="h-4 w-4 text-neutral-500 group-hover:text-neutral-900" />
                      Google Workspace
                    </button>
                    <button className="flex items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
                      <GithubIcon className="h-4 w-4 text-neutral-500 group-hover:text-neutral-900" />
                      GitHub Account
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/50 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      <span className="font-mono text-xs text-neutral-600">smtp.relay.service.net</span>
                    </div>
                    <span className="relative flex items-center gap-1.5 text-xs font-medium text-neutral-700 font-mono">
                      <Lock className="h-3 w-3 text-neutral-400" aria-hidden="true" />
                      AES-256
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* Step 02 */}
          <li className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-center group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-5">
                {/* Asymmetrical Custom Corner Cut Badge */}
                <span 
                  className="font-mono text-xs font-bold tracking-widest bg-brand text-white px-3 py-1 border border-brand" 
                  style={{ borderRadius: '4px 0px 4px 0px', fontFamily: 'Inter, sans-serif' }}
                >
                  02
                </span>
                <div className="h-px bg-neutral-200 flex-1" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-neutral-950 font-heading" style={{ fontFamily: 'Inter, sans-serif' }}>
                Generate an API key
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                One key from the dashboard covers every single feature. Drop it into an environment variable and you're authenticated everywhere, instantly.
              </p>
            </div>

            {/* Panel Mockup 2 */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-md transition-all duration-300 group-hover:border-neutral-300 group-hover:shadow-lg">
                <div className="border-b border-neutral-200 bg-white px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-mono tracking-wide text-neutral-500">API Key Manager</span>
                  <span className="rounded-full bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[10px] font-mono text-neutral-600">Active</span>
                </div>
                <div className="p-5 bg-white">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-400">Live Tokens</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <KeyRound className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                      <span className="truncate font-mono text-xs text-neutral-700">
                        lfy_live_4f9a721c810de08e21c
                      </span>
                    </div>
                    <Copy className="h-3.5 w-3.5 shrink-0 text-neutral-400 cursor-pointer hover:text-neutral-900 transition-colors" aria-hidden="true" />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
                    Header requirement config: <code className="text-brand font-mono bg-brand/5 border border-brand/10 px-1 rounded">X-API-Key</code>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* Step 03 */}
          <li className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-center group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="lg:col-span-5 flex flex-col justify-center order-1">
              <div className="flex items-center gap-3 mb-5">
                {/* Asymmetrical Custom Corner Cut Badge */}
                <span 
                  className="font-mono text-xs font-bold tracking-widest bg-brand text-white px-3 py-1 border border-brand" 
                  style={{ borderRadius: '4px 0px 4px 0px', fontFamily: 'Inter, sans-serif' }}
                >
                  03
                </span>
                <div className="h-px bg-neutral-200 flex-1" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-neutral-950 font-heading" style={{ fontFamily: 'Inter, sans-serif' }}>
                Call the API
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                One simple POST request. Execution delivered. Beautiful real-time operational delivery logs and metrics land straight back inside your interface cockpit.
              </p>
            </div>

            {/* Panel Mockup 3 */}
            <div className="lg:col-span-7 order-2">
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shadow-md transition-all duration-300 group-hover:border-neutral-300 group-hover:shadow-lg">
                <div className="border-b border-neutral-200 bg-white px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-mono tracking-wide text-neutral-400 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-neutral-400" /> Terminal Runtime
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-neutral-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-neutral-800" aria-hidden="true" />
                    200 OK
                  </span>
                </div>
                <div className="bg-neutral-900 p-5">
                  <pre className="overflow-x-auto font-mono text-xs leading-6 text-neutral-300">
                    <code>
                      <span className="text-neutral-500">curl </span>
                      <span className="text-neutral-200">https://api.lifygo.com/v1/send</span>{"\n"}
                      <span className="text-neutral-500">  -H </span>
                      <span className="text-neutral-400">"X-API-Key: lfy_live_••••"</span>{"\n"}
                      <span className="text-neutral-500">  -d </span>
                      <span className="text-brand">{"'{"}</span>{"\n"}
                      <span className="text-neutral-300">{"     \"to\": \"user@example.com\","}</span>{"\n"}
                      <span className="text-neutral-300">{"     \"subject\": \"Welcome\""}</span>{"\n"}
                      <span className="text-brand">{"  }'"}</span>
                    </code>
                  </pre>
                </div>
                <div className="border-t border-neutral-200 bg-white px-5 py-3">
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" aria-hidden="true" />
                    Payload delivered · <span className="text-neutral-400">avg latency: 14ms</span>
                  </div>
                </div>
              </div>
            </div>
          </li>

        </ol>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </section>
  )
}