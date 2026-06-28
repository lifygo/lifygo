"use client"

import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { Mail } from "lucide-react"

import { cn } from "@/lib/utils"
import type { DashboardNavItem } from "@/components/dashboard/nav-items"

type DashboardSidebarProps = {
  items: DashboardNavItem[]
  pathname: string
}

export function DashboardSidebar({ items, pathname }: DashboardSidebarProps) {
  return (
    <aside className="fixed z-30 flex h-screen w-64 flex-col justify-between border-r border-border bg-card p-5">
      <div className="flex flex-col gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1">
          <Mail className="h-5 w-5 text-brand" strokeWidth={2.5} />
          <span className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
            LifyGo
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center justify-between border-t border-border px-3 pt-4">
        <div className="flex flex-col">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Node Cluster
          </span>
          <span className="text-[11px] font-mono font-semibold text-emerald-500 animate-pulse dark:text-emerald-400">
            Live: Active
          </span>
        </div>
        <div className="scale-105">
          <UserButton />
        </div>
      </div>
    </aside>
  )
}
