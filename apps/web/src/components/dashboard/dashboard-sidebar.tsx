"use client"

import Link from "next/link"
import Image from "next/image"
import { UserButton } from "@clerk/nextjs"

import { cn } from "@/lib/utils"
import type { DashboardNavItem } from "@/components/dashboard/nav-items"
import logoImg from "@/assets/logos/lifygo-officiel.png"

type DashboardSidebarProps = {
  items: DashboardNavItem[]
  pathname: string
}

export function DashboardSidebar({ items, pathname }: DashboardSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex h-screen w-64 flex-col justify-between border-r border-border bg-card px-4 py-5 shadow-xs">
      <div className="flex flex-col gap-6">
        {/* Brand Logo Header */}
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2.5 px-2 py-1 transition-opacity hover:opacity-90"
        >
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
            <Image
              src={logoImg}
              alt="LifyGo Logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            LifyGo
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-150",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer System Status & User Action */}
      <div className="flex items-center justify-between border-t border-border px-2 pt-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            All systems normal
          </span>
        </div>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-7 w-7 rounded-full border border-border hover:opacity-90 transition-opacity",
            },
          }}
        />
      </div>
    </aside>
  )
}