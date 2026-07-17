"use client"

import Link from "next/link"
import Image from "next/image"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu"
import { Mail, Webhook } from "lucide-react"
import lifygoLogo from "@/assets/logos/lifygo.png"

export function Navbar() {
  return (
    /* Combines global status elements into a singular persistent layout position */
    <div className="sticky top-0 z-50 w-full font-sans antialiased">
      
      {/* Brand-colored status bar layout */}
      <div className="bg-brand px-4 py-2 text-center text-[11px] font-mono tracking-wide text-white font-medium shadow-sm relative z-50">
        <span>LifyGo</span>
        {" "}Core Engine v1.0.0 —{" "}
        <span className="text-white/90">Production ready API delivery</span>
      </div>

      {/* Primary Navigation Layer */}
      <header className="w-full border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          
          {/* Logo Brand Mark - Pure SVG style alignment without boundaries */}
          <Link 
            href="/" 
            className="inline-flex items-center transition-transform duration-200 active:scale-95"
            aria-label="LifyGo Home"
          >
            <Image
              src={lifygoLogo}
              alt="LifyGo Brand Logo"
              width={160}
              height={55}
              className="w-[160px] h-auto object-contain"
              priority
            />
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="rounded-md bg-transparent px-3 py-2 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:bg-white/[0.06] hover:text-neutral-50 data-[state=open]:bg-white/[0.06] data-[state=open]:text-neutral-50">
                    Solutions
                  </NavigationMenuTrigger>

                  <NavigationMenuContent>
                    <div className="w-[520px] rounded-xl border border-neutral-800 bg-neutral-900 p-3 shadow-2xl shadow-black/80">
                      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 font-mono">
                        What LifyGo does
                      </p>
                      <div className="grid gap-1.5">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/solutions/notify"
                            className="group flex items-start gap-4 rounded-lg p-3 transition-colors duration-200 hover:bg-neutral-800/60"
                          >
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-800 border border-neutral-700/50 group-hover:border-neutral-600 transition-colors">
                              <Mail className="h-4 w-4 text-brand" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-neutral-50" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Email Notifications
                              </div>
                              <p className="mt-0.5 text-xs leading-relaxed text-neutral-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Send transactional messages and OTPs through your own SMTP server — no shared infrastructure, full delivery control.
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>

                        <NavigationMenuLink asChild>
                          <Link
                            href="/solutions/schedule"
                            className="group flex items-start gap-4 rounded-lg p-3 transition-colors duration-200 hover:bg-neutral-800/60"
                          >
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-800 border border-neutral-700/50 group-hover:border-neutral-600 transition-colors">
                              <Webhook className="h-4 w-4 text-blue-400" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-neutral-50" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Cron Jobs
                              </div>
                              <p className="mt-0.5 text-xs leading-relaxed text-neutral-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                                Automate recurring webhooks and background tasks using standard cron syntax — no queue management required.
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>

                      {/* Content Dropdown Bottom Strip Footer */}
                      <div className="mt-3 flex items-center justify-between border-t border-neutral-800 pt-3 px-2">
                        <span className="text-[11px] text-neutral-500 font-mono">One API key for both products.</span>
                        <Link
                          href="/docs"
                          className="text-[11px] font-bold text-brand transition-opacity hover:opacity-80 font-mono"
                        >
                          Read the docs →
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link
              href="/pricing"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:bg-white/[0.06] hover:text-neutral-50"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:bg-white/[0.06] hover:text-neutral-50"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Docs
            </Link>
            <a
              href="https://github.com/lifygo/lifygo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:bg-white/[0.06] hover:text-neutral-50"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </nav>

          {/* Auth Action Stack */}
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-neutral-300 transition-colors duration-200 hover:text-white sm:inline-flex px-3 py-2"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-neutral-950 transition-colors duration-200 hover:bg-neutral-100 shadow-sm transition-transform active:scale-95"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>
    </div>
  )
}