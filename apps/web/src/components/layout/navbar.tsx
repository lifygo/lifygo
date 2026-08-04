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
} from "@/components/ui/navigation-menu"
import { 
  Mail, 
  Webhook, 
  Menu, 
  X, 
  ChevronDown,
  ArrowRight,
  ShieldAlert
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

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    <div className="fixed top-0 z-50 w-full font-sans antialiased text-neutral-50">
      <header
        className={cn(
          "w-full transition-all duration-300",
          scrolled || mobileMenuOpen
            ? "bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/[0.04]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <Link
            href="/"
            className="flex shrink-0 items-center transition-opacity duration-200 hover:opacity-80 active:scale-95"
            aria-label="LifyGo Home"
          >
            <Image
              src={lifygoLogo}
              alt="LifyGo"
              width={0}
              height={0}
              sizes="100vw"
              className="h-15 md:h-29 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center gap-1 lg:gap-4">
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="bg-transparent px-2 py-2 text-[13px] font-normal text-neutral-400 transition-colors hover:bg-transparent hover:text-white focus:bg-transparent focus:text-white data-[state=open]:bg-transparent data-[state=open]:text-white font-medium"
                  >
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    {/* Removed negative translations to keep it correctly bounded by the navigation container */}
                    <div className="flex w-[750px] rounded-xl border border-neutral-800 bg-[#0A0A0A] p-0 shadow-2xl overflow-hidden mt-2">
                      
                      <div className="flex-1 p-8 pr-6">
                        <div className="text-[11px] font-bold tracking-[0.15em] text-brand uppercase mb-2">
                          Core Features
                        </div>
                        <p className="text-[14px] text-neutral-400 mb-6">
                          Powerful tools for your infrastructure.
                        </p>
                        
                        <div className="grid gap-4">
                          <NavigationMenuLink asChild>
                            <Link
                              href="/dashboard"
                              className="group flex items-start gap-4 rounded-lg transition-colors hover:bg-white/[0.03] p-3 -ml-3"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-[#121212] group-hover:border-brand/50 transition-colors">
                                <Mail className="h-5 w-5 text-neutral-300 group-hover:text-white" />
                              </div>
                              <div>
                                <div className="text-[15px] font-medium text-white mb-0.5">Transactional Email & OTP</div>
                                <p className="text-[13px] text-neutral-500">Send emails and passcodes via your SMTP without shared infra.</p>
                              </div>
                            </Link>
                          </NavigationMenuLink>

                          <NavigationMenuLink asChild>
                            <Link
                              href="/dashboard"
                              className="group flex items-start gap-4 rounded-lg transition-colors hover:bg-white/[0.03] p-3 -ml-3"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-[#121212] group-hover:border-brand/50 transition-colors">
                                <Webhook className="h-5 w-5 text-neutral-300 group-hover:text-white" />
                              </div>
                              <div>
                                <div className="text-[15px] font-medium text-white mb-0.5">Cron Jobs & Scheduling</div>
                                <p className="text-[13px] text-neutral-500">Schedule recurring webhooks to any endpoint cleanly.</p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>

                      <div className="w-[320px] bg-[#111111] border-l border-neutral-800 p-8 flex flex-col">
                        <div className="text-[11px] font-bold tracking-[0.15em] text-brand uppercase mb-2">
                          Get Started
                        </div>
                        <h3 className="text-[16px] font-medium text-white mb-3">
                          Build without limits.
                        </h3>
                        <p className="text-[14px] text-neutral-400 mb-8 leading-relaxed">
                          Integrate effortlessly. View our guides to master scheduling and email delivery in minutes.
                        </p>
                        
                        <div className="mt-auto flex flex-col gap-4">
                          <NavigationMenuLink asChild>
                            <a href="https://docs.lifygo.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-[14px] font-medium text-brand hover:text-brand/80 transition-colors">
                              Read the docs <ArrowRight className="ml-1.5 h-4 w-4" />
                            </a>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/dashboard" className="flex items-center text-[14px] font-medium text-brand hover:text-brand/80 transition-colors">
                              Go to dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link href="/security" className="flex items-center text-[14px] font-medium text-neutral-400 hover:text-white transition-colors mt-2 pt-4 border-t border-neutral-800">
                              <ShieldAlert className="mr-2 h-4 w-4 text-brand" /> Important Security Notice
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>

                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/how-it-works" className="px-2 py-2 text-[13px] font-medium text-neutral-400 transition-colors hover:text-white">
                      How it works
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <a href="https://docs.lifygo.com" target="_blank" rel="noopener noreferrer" className="px-2 py-2 text-[13px] font-medium text-neutral-400 transition-colors hover:text-white">
                      Docs
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <a href="https://github.com/lifygo/lifygo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-2 text-[13px] font-medium text-neutral-400 transition-colors hover:text-white">
                      <GithubIcon className="h-4 w-4" />
                      GitHub
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <a href="https://www.linkedin.com/company/lifygo/about/" target="_blank" rel="noopener noreferrer" className="flex items-center px-2 py-2 text-neutral-400 transition-colors hover:text-white" aria-label="LinkedIn">
                      <LinkedInIcon className="h-4 w-4" />
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-[14px] font-medium text-neutral-400 transition-colors hover:text-white"
            >
              Log in
            </Link>

            <Link
              href="https://dashboard.lifygo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center justify-center rounded-full bg-brand px-4 text-[13px] font-medium text-white transition-all hover:bg-brand/90 active:scale-95"
            >
              Sign up
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex p-2 text-neutral-400 transition-colors hover:text-white md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 h-screen w-full overflow-y-auto border-b border-neutral-900 bg-[#0A0A0A]/95 px-5 pb-24 pt-4 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFeaturesOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between py-2 text-[16px] font-medium text-neutral-200"
                >
                  <span>Features</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-neutral-500 transition-transform duration-200",
                      mobileFeaturesOpen && "rotate-180"
                    )}
                  />
                </button>

                {mobileFeaturesOpen && (
                  <div className="flex flex-col gap-4 border-l border-neutral-800 ml-2 pl-4 py-3">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-[15px] text-neutral-400 hover:text-white"
                    >
                      <Mail className="h-4 w-4 text-brand"/> Transactional Email & OTP
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-[15px] text-neutral-400 hover:text-white"
                    >
                      <Webhook className="h-4 w-4 text-brand"/> Cron Jobs & Scheduling
                    </Link>
                    <div className="my-1 h-px w-full bg-neutral-800"></div>
                    <a
                      href="https://docs.lifygo.com"
                      className="text-[15px] font-medium text-brand hover:text-brand/80"
                    >
                      Read the docs
                    </a>
                    <Link
                      href="/dashboard"
                      className="text-[15px] font-medium text-brand hover:text-brand/80"
                    >
                      Go to dashboard
                    </Link>
                    <Link
                      href="/security"
                      className="text-[15px] font-medium text-neutral-300 hover:text-white"
                    >
                      Important Security Notice
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-[16px] font-medium text-neutral-200 hover:text-white"
              >
                How it works
              </Link>

              <a
                href="https://docs.lifygo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 text-[16px] font-medium text-neutral-200 hover:text-white"
              >
                Docs
              </a>

              <a
                href="https://github.com/lifygo/lifygo"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 text-[16px] font-medium text-neutral-200 hover:text-white"
              >
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/company/lifygo/about/"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 text-[16px] font-medium text-neutral-200 hover:text-white"
              >
                LinkedIn
              </a>

              <div className="mt-6 flex flex-col gap-3 border-t border-neutral-900 pt-6">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-white/5 text-[15px] font-medium text-white transition-colors hover:bg-white/10"
                >
                  Log in
                </Link>
                <Link
                  href="https://dashboard.lifygo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-brand text-[15px] font-medium text-white transition-colors hover:bg-brand/90"
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  )
}