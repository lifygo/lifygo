"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, ShieldCheck } from "lucide-react"
import lifygoLogo from "@/assets/logos/lifygo.png"

function CustomGithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function CustomXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative w-full overflow-hidden bg-neutral-950 border-t border-neutral-900 px-6 pt-24 pb-12 font-sans antialiased z-30">
      
      {/* Massive Graphic Background Typography Watermark */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden flex justify-center z-0 opacity-[0.1] translate-y-1/4">
        <h1 className="font-heading font-black tracking-tighter uppercase text-[26vw] leading-none text-brand">
          LIFYGO
        </h1>
      </div>

      <div className="relative mx-auto max-w-6xl z-10">
        
        {/* Main Footer Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-neutral-900">
          
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              {/* Logo Brand Mark - Image implementation without backplate background */}
              <Link 
                href="/" 
                className="inline-flex items-center transition-transform duration-200 active:scale-95"
                aria-label="LifyGo Home"
              >
                <Image
                  src={lifygoLogo}
                  alt="LifyGo Brand Logo"
                  width={190}
                  height={35}
                  className="w-[190px] h-auto object-contain"
                />
              </Link>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                Transactional email and reliable micro background job execution via a single unified API endpoint.
              </p>
            </div>
            
            {/* System Status Indicator Box */}
            <div className="inline-flex w-fit items-center gap-2 border border-neutral-900 bg-neutral-900/30 pl-2.5 pr-3 py-1.5 rounded-md text-xs font-mono text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </div>
          </div>

          {/* Nav Links Grid */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Column 1: Product */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold font-mono tracking-widest text-neutral-500 uppercase">Product</h4>
              <ul className="space-y-2.5">
                {["Features", "Pricing", "Documentation", "Changelog"].map((item) => (
                  <li key={item}>
                    <Link 
                      href={`/${item.toLowerCase()}`} 
                      className="text-sm text-neutral-400 hover:text-brand font-medium transition-colors duration-150 inline-flex items-center gap-0.5 group"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Developers */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold font-mono tracking-widest text-neutral-500 uppercase">Developers</h4>
              <ul className="space-y-2.5">
                {["API Reference", "System Status", "SDK Libraries", "GitHub Issues"].map((item) => (
                  <li key={item}>
                    <Link 
                      href="#" 
                      className="text-sm text-neutral-400 hover:text-brand font-medium transition-colors duration-150 inline-flex items-center gap-0.5 group"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {item}
                      {item === "API Reference" && <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal & Trust */}
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="text-xs font-bold font-mono tracking-widest text-neutral-500 uppercase">Security</h4>
              <ul className="space-y-2.5">
                {["Privacy Policy", "Terms of Service", "GDPR Compliance"].map((item) => (
                  <li key={item}>
                    <Link 
                      href="#" 
                      className="text-sm text-neutral-400 hover:text-brand font-medium transition-colors duration-150"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Copyright & Core Cert */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span>&copy; {currentYear} LifyGo Inc. All rights reserved.</span>
            <div className="flex items-center gap-1.5 border-l border-neutral-900 pl-6">
              <ShieldCheck className="h-3.5 w-3.5 text-neutral-600" />
              <span>ISO 27001 Compliant Architecture</span>
            </div>
          </div>

          {/* Social Links via embedded customized inline SVGs */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/lifygo" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 border border-neutral-900 bg-neutral-900/20 text-neutral-400 hover:text-white rounded transition-colors duration-150"
              aria-label="GitHub Repository Link"
            >
              <CustomGithubIcon className="h-4 w-4" />
            </a>
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 border border-neutral-900 bg-neutral-900/20 text-neutral-400 hover:text-white rounded transition-colors duration-150"
              aria-label="X Platform Profile Link"
            >
              <CustomXIcon className="h-4 w-4" />
            </a>
          </div>

        </div>

      </div>
    </footer>
  )
}