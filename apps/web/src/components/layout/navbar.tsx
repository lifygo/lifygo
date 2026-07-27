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
import { 
  Mail, 
  Webhook, 
  ArrowRight, 
  LogIn, 
  Menu, 
  X, 
  ChevronDown,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import lifygoLogo from "@/assets/logos/lifygo-officiel.png"

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false)

  // Track scroll position for backdrop blur effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="sticky top-0 z-50 w-full font-sans antialiased">
      <header
        className={cn(
          "w-full transition-all duration-300",
          scrolled || mobileMenuOpen
            ? "bg-neutral-950/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
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
              width={150}
              height={50}
              className="w-[120px] sm:w-[140px] h-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
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
                    <div className="w-[460px] rounded-xl border border-white/[0.08] bg-neutral-900/95 backdrop-blur-2xl p-2 shadow-2xl shadow-black/80 ring-1 ring-white/[0.04]">
                      <div className="grid gap-1">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/dashboard"
                            className="group flex items-start gap-3.5 rounded-lg p-2.5 transition-all duration-200 hover:bg-white/[0.05]"
                          >
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] group-hover:border-brand/40 group-hover:bg-brand/10 transition-all duration-200">
                              <Mail className="h-4 w-4 text-brand" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white">
                                Transactional email & OTP
                              </div>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">
                                Send emails and passcodes via your SMTP. No shared infra.
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>

                        <NavigationMenuLink asChild>
                          <Link
                            href="/dashboard"
                            className="group flex items-start gap-3.5 rounded-lg p-2.5 transition-all duration-200 hover:bg-white/[0.05]"
                          >
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] group-hover:border-sky-500/40 group-hover:bg-sky-500/10 transition-all duration-200">
                              <Webhook className="h-4 w-4 text-sky-400" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white">
                                Cron jobs & scheduling
                              </div>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">
                                Schedule recurring webhooks to any endpoint cleanly.
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-2.5 px-2.5">
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

                {/* How it works */}
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

                {/* Docs */}
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

                {/* GitHub */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200 rounded-lg px-3 py-2 text-sm font-medium inline-flex items-center gap-1.5"
                    )}
                  >
                    <a href="https://github.com/lifygo/lifygo" target="_blank" rel="noopener noreferrer">
                      <GithubIcon className="h-4 w-4" />
                      GitHub
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* FREE Badge */}
            <span className="hidden sm:inline-block text-emerald-400 font-extrabold text-[11px] tracking-wider uppercase select-none">
              FREE
            </span>

            {/* Sign in */}
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-neutral-950 shadow-xs transition-all duration-200 hover:bg-neutral-200 active:scale-95 sm:px-3.5 sm:text-sm"
            >
              <LogIn className="h-3.5 w-3.5 text-neutral-950 sm:h-4 sm:w-4" />
              <span>Sign in</span>
            </Link>

            {/* Try Demo CTA */}
            <Link
              href="https://dashboard.lifygo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative hidden sm:inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-xs sm:text-sm font-semibold text-white shadow-md shadow-brand/20 transition-all duration-200 hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/30 active:scale-[0.98]"
            >
              <span>Try demo</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-neutral-300 transition-colors hover:bg-white/[0.08] hover:text-white md:hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-white/[0.08] bg-neutral-950/95 px-4 pb-6 pt-2 backdrop-blur-2xl md:hidden">
            <nav className="flex flex-col gap-1.5">
              {/* Features Accordion Mobile */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
                <button
                  type="button"
                  onClick={() => setMobileFeaturesOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-neutral-200"
                >
                  <span>What it does</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-neutral-400 transition-transform duration-200",
                      mobileFeaturesOpen && "rotate-180"
                    )}
                  />
                </button>

                {mobileFeaturesOpen && (
                  <div className="flex flex-col gap-1 border-t border-white/[0.06] px-1 pt-2 pb-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.05]"
                    >
                      <Mail className="h-4 w-4 text-brand" />
                      <span>Transactional Email & OTP</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.05]"
                    >
                      <Webhook className="h-4 w-4 text-sky-400" />
                      <span>Cron Jobs & Scheduling</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Links */}
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                How it works
              </Link>

              <a
                href="https://docs.lifygo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <BookOpen className="h-4 w-4 text-neutral-400" />
                <span>Documentation</span>
              </a>

              <a
                href="https://github.com/lifygo/lifygo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <GithubIcon className="h-4 w-4 text-neutral-400" />
                <span>GitHub Repository</span>
              </a>

              {/* Mobile CTAs */}
              <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.08] pt-4">
                <Link
                  href="https://dashboard.lifygo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-white shadow-md shadow-brand/20"
                >
                  <span>Try the demo</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  )
}
