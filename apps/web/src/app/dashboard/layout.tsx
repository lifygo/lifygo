"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { usePathname } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { dashboardNavItems } from "@/components/dashboard/nav-items";
import { UserMenu } from "@/components/dashboard/user-menu";
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
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <TooltipProvider>
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="bg-background text-foreground selection:bg-brand/20"
      >
        <Sidebar collapsible="icon" className="border-r border-border bg-card">
          <SidebarHeader className="relative flex h-14 flex-row items-center justify-between px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md group-data-[collapsible=icon]:hidden"
            >
              <Mail className="h-5 w-5 shrink-0 text-brand" strokeWidth={2.5} />
              <span className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
                LifyGo
              </span>
            </Link>

            <SidebarMenuButton
              type="button"
              tooltip={{
                children: sidebarOpen ? "Collapse sidebar" : "Expand sidebar",
                hidden: false,
                sideOffset: 8,
              }}
              className={cn(
                "absolute -right-3 top-4 z-50 flex size-6 items-center justify-center rounded-full border border-border bg-card p-0 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground",
                "group-data-[collapsible=icon]:-right-3 group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:p-0"
              )}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              onClick={() => setSidebarOpen((open) => !open)}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </SidebarMenuButton>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {dashboardNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

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
                            "h-10 gap-3 px-3",
                            isActive &&
                              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                          )}
                        >
                          <Link href={item.href}>
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <div className="flex items-center justify-between gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Node Cluster
                </span>
                <span className="animate-pulse font-mono text-[11px] font-semibold text-emerald-500 dark:text-emerald-400">
                  Live: Active
                </span>
              </div>
              <div className="scale-105">
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
  );
}