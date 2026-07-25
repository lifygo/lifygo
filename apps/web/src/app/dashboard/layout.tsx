"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { dashboardNavItems } from "@/components/dashboard/nav-items"
import { UserMenu } from "@/components/dashboard/user-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import logoImg from "@/assets/logos/lifygo-officiel.png"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  return (
    <TooltipProvider>
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="bg-background text-foreground selection:bg-primary/20"
      >
        <Sidebar collapsible="icon" className="border-r border-border bg-card">
          {/* Header with dual logo logic (expanded vs collapsed) */}
          <SidebarHeader className="relative flex h-16 flex-row items-center justify-between px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Link
              href="https://lifygo.com"
              className="flex items-center rounded-md p-1 transition-opacity hover:opacity-90"
              aria-label="LifyGo Home"
            >
              {/* Expanded Logo */}
              <div className="relative flex items-center justify-center group-data-[collapsible=icon]:hidden">
                <Image
                  src={logoImg}
                  alt="LifyGo Logo"
                  width={120}
                  height={36}
                  className="h-29 w-auto object-contain"
                  priority
                />
              </div>

              {/* Collapsed Favicon Logo */}
              <div className="hidden items-center justify-center group-data-[collapsible=icon]:flex">
                <Image
                  src="/favicon.jpg"
                  alt="LifyGo Icon"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-md object-cover"
                  priority
                />
              </div>
            </Link>

            {/* Floating Collapse Toggle */}
            <SidebarMenuButton
              type="button"
              tooltip={{
                children: sidebarOpen ? "Collapse sidebar" : "Expand sidebar",
                hidden: false,
                sideOffset: 8,
              }}
              className={cn(
                "absolute -right-3 top-5 z-50 flex size-6 items-center justify-center rounded-full border border-border bg-card p-0 text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground",
                "group-data-[collapsible=icon]:-right-3 group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:p-0"
              )}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              onClick={() => setSidebarOpen((open) => !open)}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </SidebarMenuButton>
          </SidebarHeader>

          {/* Main Sidebar Navigation */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {dashboardNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={{
                            children: item.label,
                            hidden: false,
                            sideOffset: 8,
                          }}
                          className={cn(
                            "h-9 gap-3 px-3 text-xs font-medium transition-all duration-150",
                            isActive &&
                              "bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:text-primary-foreground"
                          )}
                        >
                          <Link href={item.href}>
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer with simple static green status indicator */}
          <SidebarFooter className="border-t border-sidebar-border p-2">
            <div className="flex items-center justify-between gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-medium text-muted-foreground">
                  System online
                </span>
              </div>
              <div>
                <UserMenu />
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <DashboardHeader />
          <main className="w-full flex-1 p-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}