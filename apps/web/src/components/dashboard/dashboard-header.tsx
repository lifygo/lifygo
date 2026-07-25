"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Plus, 
  BookOpen, 
  Send, 
  Webhook, 
  LogOut,
  ChevronRight,
  LayoutDashboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLifygoAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function DashboardHeader() {
  const { signOut } = useLifygoAuth()
  const pathname = usePathname()

  // Generate dynamic breadcrumb segments from route pathname
  const segments = pathname.split("/").filter(Boolean)

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md md:px-8">
      {/* Left: Dynamic Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-1.5 font-medium transition-colors hover:text-foreground"
        >
          <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Dashboard</span>
        </Link>
        {segments.length > 1 && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="font-semibold capitalize text-foreground">
              {segments[segments.length - 1].replace(/-/g, " ")}
            </span>
          </>
        )}
      </nav>

      {/* Right: Rapid Actions & Utilities */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Action Dropdown Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Quick Action</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 space-y-1 p-1 shadow-md">
            <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              New Dispatch
            </DropdownMenuLabel>
            <DropdownMenuItem asChild className="cursor-pointer text-xs">
              <Link href="/dashboard/jobs?type=webhook" className="flex items-center gap-2">
                <Webhook className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Schedule Webhook</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer text-xs">
              <Link href="/dashboard/jobs?type=email" className="flex items-center gap-2">
                <Send className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Send Email Job</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-0.5 hidden h-4 w-px bg-border sm:block" />

        {/* Documentation Link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <a href="https://docs.lifygo.com" target="_blank" rel="noreferrer">
                <BookOpen className="h-4 w-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Documentation
          </TooltipContent>
        </Tooltip>

        {/* System Version Tag */}
        <div className="hidden items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:flex">
          v1.0.4-prod
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Sign Out Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="h-8 w-8 text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Sign out
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}