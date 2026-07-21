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
    <section id="how-it-works" className="relative w-full overflow-hidden bg-white px-6 py-24 font-sans antialiased md:py-32 rounded-t-[48px] md:rounded-t-[64px] text-neutral-900 shadow-[0_-12px_40px_rgba(0,0,0,0.03)] -mt-12 z-20 scroll-mt-20">

      <div className="absolute inset-x-0 top-12 pointer-events-none select-none overflow-hidden flex justify-center z-0 opacity-[0.03]">
        <h1 className="font-heading font-black tracking-tighter uppercase text-[24vw] leading-none text-neutral-950">
          HOW
        </h1>
      </div>

      <div className="relative mx-auto max-w-5xl z-10">
        <div className="mb-24 md:mb-32 text-left max-w-2xl">
          <h2 className="text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl uppercase font-heading">
            From zero to production in five minutes.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-500">
            No new infrastructure. No vendor accounts. Just your SMTP, one API key, and a curl command.
          </p>
        </div>

        <ol className="flex flex-col gap-24 relative">

          <li className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-center group">
            <div className="lg:col-span-5 flex flex-col justify-center order-1">
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-xs font-bold tracking-widest bg-brand text-white px-3 py-1" style={{ borderRadius: '4px 0px 4px 0px' }}>
                  01
                </span>
                <div className="h-px bg-neutral-200 flex-1" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-neutral-950">
                Plug in your SMTP
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                Sign in with Google or GitHub. Add the SMTP credentials you already have — Gmail, Zoho, Resend, anything. Your password is encrypted with AES-256 and never leaves your control.
              </p>
            </div>

            <div className="lg:col-span-7 order-2">
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 group-hover:shadow-md">
                <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-mono tracking-wide text-neutral-400">dashboard / smtp</span>
                  <span className="h-2 w-2 rounded-full bg-neutral-200" />
                </div>
                <div className="flex flex-col gap-3 p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
                      <GoogleIcon className="h-4 w-4 text-neutral-400" />
                      Continue with Google
                    </button>
                    <button className="flex items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
                      <GithubIcon className="h-4 w-4 text-neutral-400" />
                      Continue with GitHub
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      <span className="font-mono text-xs text-neutral-600">smtp.gmail.com:587</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                      <Lock className="h-3 w-3" />
                      AES-256
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>

          <li className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-center group">
            <div className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-xs font-bold tracking-widest bg-brand text-white px-3 py-1" style={{ borderRadius: '4px 0px 4px 0px' }}>
                  02
                </span>
                <div className="h-px bg-neutral-200 flex-1" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-neutral-950">
                Get one key. Use it everywhere.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                A single API key unlocks email sending, OTP verification, and job scheduling. Add it to your environment and you are done. No SDK required.
              </p>
            </div>

            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 group-hover:shadow-md">
                <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-mono tracking-wide text-neutral-400">dashboard / api-keys</span>
                  <span className="rounded-full bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[10px] font-mono text-neutral-500">live</span>
                </div>
                <div className="p-5">
                  <div className="mb-3 text-xs text-neutral-400 font-mono">your key — shown once</div>
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <KeyRound className="h-3.5 w-3.5 shrink-0 text-brand" />
                      <span className="truncate font-mono text-xs text-neutral-700">
                        lfy_4f9a721c810de08e21c3b...
                      </span>
                    </div>
                    <Copy className="h-3.5 w-3.5 shrink-0 text-neutral-400 cursor-pointer hover:text-neutral-900 transition-colors" />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    pass as <code className="text-brand bg-brand/5 border border-brand/10 px-1 rounded">X-API-Key</code> on every request
                  </div>
                </div>
              </div>
            </div>
          </li>

          <li className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-center group">
            <div className="lg:col-span-5 flex flex-col justify-center order-1">
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-xs font-bold tracking-widest bg-brand text-white px-3 py-1" style={{ borderRadius: '4px 0px 4px 0px' }}>
                  03
                </span>
                <div className="h-px bg-neutral-200 flex-1" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-neutral-950">
                One call. Done.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                POST to send. POST to schedule. Every delivery and execution is logged automatically. Check your dashboard — no extra setup needed.
              </p>
            </div>

            <div className="lg:col-span-7 order-2">
              <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm transition-all duration-300 group-hover:shadow-md">
                <div className="border-b border-neutral-800 bg-neutral-900 px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-500 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5" /> terminal
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    200 OK
                  </span>
                </div>
                <div className="bg-neutral-950 p-5">
                  <pre className="overflow-x-auto font-mono text-xs leading-6 text-neutral-300">
                    <code>
                      <span className="text-neutral-500">curl </span>
                      <span className="text-neutral-300">https://api.lifygo.com/send</span>{"\n"}
                      <span className="text-neutral-500">  -H </span>
                      <span className="text-emerald-400">"X-API-Key: lfy_your_key"</span>{"\n"}
                      <span className="text-neutral-500">  -d </span>
                      <span className="text-sky-400">{"'{"}</span>{"\n"}
                      <span className="text-neutral-300">{"       \"to\": \"user@example.com\","}</span>{"\n"}
                      <span className="text-neutral-300">{"       \"subject\": \"Welcome aboard\","}</span>{"\n"}
                      <span className="text-neutral-300">{"       \"body\": \"You're in.\""}</span>{"\n"}
                      <span className="text-sky-400">{"  }'"}</span>
                    </code>
                  </pre>
                </div>
                <div className="border-t border-neutral-800 bg-neutral-900 px-5 py-3">
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    delivered · 14ms · logged to dashboard
                  </div>
                </div>
              </div>
            </div>
          </li>

        </ol>
      </div>
    </section>
  )
}