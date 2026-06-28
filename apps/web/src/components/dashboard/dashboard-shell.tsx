"use client"

import { usePathname } from "next/navigation"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { dashboardNavItems } from "@/components/dashboard/nav-items"

type DashboardShellProps = {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-brand/20">
      <DashboardSidebar items={dashboardNavItems} pathname={pathname} />

      <div className="flex flex-1 flex-col pl-64">
        <DashboardHeader />
        <main className="mx-auto flex w-full max-w-6xl flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
