"use client"

import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu"

export function Navbar() {
  return (
    <div className="w-full bg-neutral-950">
      {/* Status strip */}
      <div className="border-b border-white/[0.06] px-2 py-1.5 text-center text-xs font-mono text-neutral-500">
        LifyGo Core Engine v1.0.0 — Production ready API delivery
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-neutral-50 transition-colors duration-200 hover:text-white"
          >
            LifyGo
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="rounded-md bg-transparent px-3 py-2 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:bg-white/[0.06] hover:text-neutral-50 data-[state=open]:bg-white/[0.06] data-[state=open]:text-neutral-50">
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="w-[420px] rounded-lg border border-white/[0.08] bg-neutral-900 p-2 shadow-2xl shadow-black/40">
                    <div className="grid gap-1">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/solutions/notify"
                          className="block rounded-md p-2.5 transition-colors duration-200 hover:bg-white/[0.06]"
                        >
                          <div className="text-sm font-medium text-neutral-50">Email Notifications</div>
                          <p className="mt-0.5 text-xs text-neutral-400">
                            Send transactional messages and OTPs using your own SMTP server.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/solutions/schedule"
                          className="block rounded-md p-2.5 transition-colors duration-200 hover:bg-white/[0.06]"
                        >
                          <div className="text-sm font-medium text-neutral-50">Cron Jobs</div>
                          <p className="mt-0.5 text-xs text-neutral-400">
                            Automate recurring webhooks and tasks with native cron syntax.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link
              href="/pricing"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:bg-white/[0.06] hover:text-neutral-50"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:bg-white/[0.06] hover:text-neutral-50"
            >
              Docs
            </Link>
            <a
              href="https://github.com/lifygo/lifygo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:bg-white/[0.06] hover:text-neutral-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:bg-white/[0.06] hover:text-neutral-50 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-9 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>
    </div>
  )
}