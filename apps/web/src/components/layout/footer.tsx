"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import lifygoLogo from "@/assets/logos/lifygo-officiel.png"

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative w-full overflow-hidden bg-neutral-950 border-t border-white/[0.06] px-6 pt-20 pb-10 font-sans antialiased z-30">
      
      <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden flex justify-center z-0 opacity-[0.06] translate-y-1/4">
        <h1 className="font-heading font-black tracking-tighter uppercase text-[26vw] leading-none text-white">
          LIFYGO
        </h1>
      </div>

      <div className="relative mx-auto max-w-6xl z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-white/[0.06]">
          
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link 
              href="/" 
              className="inline-flex items-center transition-transform duration-200 active:scale-95"
              aria-label="LifyGo Home"
            >
              <Image
                src={lifygoLogo}
                alt="LifyGo"
                width={160}
                height={35}
                className="w-[160px] h-auto object-contain"
              />
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              Transactional email, OTP verification, and cron job scheduling. Free hosted or self-host. Open source.
            </p>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-widest text-neutral-500 uppercase">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/how-it-works" className="text-sm text-neutral-400 hover:text-white transition-colors">How it works</Link></li>
                <li><a href="https://docs.lifygo.com" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-0.5 group">Docs <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" /></a></li>
                <li><a href="https://github.com/lifygo/lifygo" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-400 hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-widest text-neutral-500 uppercase">Resources</h4>
              <ul className="space-y-2">
                <li><a href="https://docs.lifygo.com" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-400 hover:text-white transition-colors">API Reference</a></li>
                <li><a href="https://docs.lifygo.com/guides/gmail-smtp" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-400 hover:text-white transition-colors">Gmail SMTP guide</a></li>
                <li><a href="https://docs.lifygo.com/guides/self-hosting" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-400 hover:text-white transition-colors">Self-hosting guide</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-widest text-neutral-500 uppercase">Legal</h4>
              <ul className="space-y-2">
                <li><a href="https://github.com/lifygo/lifygo/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-400 hover:text-white transition-colors">AGPL-3.0</a></li>
              </ul>
            </div>

          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span>&copy; {currentYear} LifyGo. Open source under AGPL-3.0.</span>
            <span className="hidden sm:inline text-neutral-700">|</span>
            <span className="hidden sm:inline">
              Powered by{" "}
              <a href="https://go.dev" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">Go</a>
              {", "}
              <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">AWS</a>
              {", and "}
              <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">Clerk</a>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/lifygo/lifygo" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}