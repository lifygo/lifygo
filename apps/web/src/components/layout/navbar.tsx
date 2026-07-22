"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Mail, Webhook, ArrowRight, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import lifygoLogo from "@/assets/logos/lifygo-officiel.png"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="sticky top-0 z-50 w-full font-sans antialiased">
      <header
        className={cn(
          "w-full transition-all duration-300",
          scrolled
            ? "bg-neutral-950/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_1px_0_0_rgba(255,255,255,0.03)]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="inline-flex items-center transition-transform duration-200 active:scale-95"
            aria-label="LifyGo Home"
          >
            <Image
              src={lifygoLogo}
              alt="LifyGo"
              width={160}
              height={55}
              className="w-[130px] sm:w-[150px] h-auto object-contain"
              priority
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden items-center gap-0.5 md:flex">
            <NavigationMenu className="relative">
              <NavigationMenuList className="flex items-center gap-0.5">
                {/* Feature Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      "rounded-lg bg-transparent px-3 py-2 text-sm font-medium text-neutral-400",
                      "transition-colors duration-200",
                      "hover:bg-white/[0.05] hover:text-neutral-200",
                      "data-[state=open]:bg-white/[0.06] data-[state=open]:text-white",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    )}
                  >
                    What it does
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="origin-top-left">
                    <div className="w-[480px] rounded-xl border border-white/[0.08] bg-neutral-900/95 backdrop-blur-2xl p-2 shadow-2xl shadow-black/80 ring-1 ring-white/[0.04]">
                      <div className="grid gap-1">
                        {/* Redirects directly to /dashboard */}
                        <NavigationMenuLink asChild>
                          <Link
                            href="/dashboard"
                            className="group flex items-start gap-4 rounded-lg p-3 transition-all duration-200 hover:bg-white/[0.05] hover:shadow-sm"
                          >
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] group-hover:border-brand/40 group-hover:bg-brand/10 transition-all duration-200">
                              <Mail className="h-4 w-4 text-brand transition-colors" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-white">
                                Transactional email & OTP
                              </div>
                              <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">
                                Send emails and one‑time passcodes through your own SMTP. No shared infrastructure.
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>

                        {/* Redirects directly to /dashboard */}
                        <NavigationMenuLink asChild>
                          <Link
                            href="/dashboard"
                            className="group flex items-start gap-4 rounded-lg p-3 transition-all duration-200 hover:bg-white/[0.05] hover:shadow-sm"
                          >
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] group-hover:border-sky-500/40 group-hover:bg-sky-500/10 transition-all duration-200">
                              <Webhook className="h-4 w-4 text-sky-400 transition-colors" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-white">
                                Cron jobs & scheduling
                              </div>
                              <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">
                                Schedule recurring webhooks to any URL. Trigger emails, clean databases, run reports.
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-3 px-3">
                        <span className="text-[11px] text-neutral-500">
                          One API key for both products.
                        </span>
                        <a
                          href="https://docs.lifygo.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-brand transition-colors hover:text-brand/80"
                        >
                          Read the docs →
                        </a>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* How it works Link */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200 rounded-lg px-3 py-2 text-sm font-medium"
                    )}
                  >
                    <Link href="/how-it-works">How it works</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Docs Link */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200 rounded-lg px-3 py-2 text-sm font-medium"
                    )}
                  >
                    <a href="https://docs.lifygo.com" target="_blank" rel="noopener noreferrer">
                      Docs
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* GitHub Link */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200 rounded-lg px-3 py-2 text-sm font-medium inline-flex items-center gap-1.5"
                    )}
                  >
                    <a href="https://github.com/lifygo/lifygo" target="_blank" rel="noopener noreferrer">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      GitHub
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Section: Sign In (White rectangle), Try Demo CTA, Green FREE text */}
          <div className="flex items-center gap-3">
            {/* White background rectangle for Sign In */}
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-950 shadow-sm transition-all duration-200 hover:bg-neutral-100 active:scale-95"
            >
              <LogIn className="h-4 w-4 text-neutral-950" />
              Sign in
            </Link>

            <Link
              href="/sign-up"
              className="group relative inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-md shadow-brand/25 transition-all duration-200 hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/35 active:scale-[0.98]"
            >
              <span>Try the demo</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            {/* Plain Green capital text FREE */}
            <span className="hidden sm:inline-block text-emerald-400 font-extrabold text-xs tracking-wider uppercase select-none">
              FREE
            </span>
          </div>
        </div>
      </header>
    </div>
  )
}