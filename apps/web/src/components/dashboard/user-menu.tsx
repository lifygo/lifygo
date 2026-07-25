"use client"

import { useLifygoAuth } from "@/components/auth-provider"
import { UserButton } from "@clerk/nextjs"
import { LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "clerk"

export function UserMenu() {
  const { user, signOut } = useLifygoAuth()

  if (AUTH_PROVIDER === "clerk") {
    return (
      <UserButton 
        appearance={{
          elements: {
            avatarBox: "h-8 w-8 rounded-full border border-border shadow-xs hover:opacity-90 transition-opacity",
          },
        }}
      />
    )
  }

  if (!user) return null

  // Generate up to 2 uppercase initials from user name
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-8 w-8 rounded-full border border-border bg-muted/50 transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring"
        >
          {initials ? (
            <span className="text-xs font-semibold text-foreground">{initials}</span>
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 space-y-1 p-1.5 shadow-md">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
              {initials || <User className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex flex-col min-w-0 space-y-0.5">
              <span className="truncate text-xs font-semibold text-foreground">
                {user.name || "User Account"}
              </span>
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={signOut}
          className="cursor-pointer text-xs font-medium text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600 dark:focus:bg-red-500/20 dark:focus:text-red-400"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}