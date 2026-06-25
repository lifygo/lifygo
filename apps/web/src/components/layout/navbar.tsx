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
    <div className="w-full">
      <div className="bg-black px-2 py-0.5 text-center text-xs font-mono tracking-tight text-white">
        LifyGo Core Engine v1.0.0 — Production Ready API Delivery
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-brand backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-heading text-xl font-bold text-white">
            LifyGo
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-sm text-white/80 transition-colors hover:text-white data-[state=open]:bg-transparent data-[active]:bg-transparent hover:bg-transparent focus:bg-transparent">
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-4 w-[400px] bg-white border border-neutral-200 rounded-lg shadow-lg">
                    <div className="grid gap-3">
                      <div className="rounded-md p-2 transition-colors hover:bg-neutral-50">
                        <NavigationMenuLink asChild>
                          <Link href="/solutions/notify">
                            <div className="text-sm font-medium text-neutral-900">EMAIL notifications delivery</div>
                            <p className="text-xs text-muted-foreground mt-0.5">Send transactional messages and OTPs using your own SMTP.</p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      <div className="rounded-md p-2 transition-colors hover:bg-neutral-50">
                        <NavigationMenuLink asChild>
                          <Link href="/solutions/schedule">
                            <div className="text-sm font-medium text-neutral-900">Cron Jobs</div>
                            <p className="text-xs text-muted-foreground mt-0.5">Automate recurring webhooks and tasks with native cron syntax.</p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link
              href="/pricing"
              className="text-sm text-white/80 transition-colors hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-sm text-white/80 transition-colors hover:text-white"
            >
              Docs
            </Link>
            <a
              href="https://github.com/lifygo/lifygo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="hidden text-sm text-white/80 transition-colors hover:text-white sm:inline"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-neutral-100"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>
    </div>
  )
}