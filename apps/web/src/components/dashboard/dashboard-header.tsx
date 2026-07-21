import { ThemeToggle } from "@/components/theme-toggle"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLifygoAuth } from "@/components/auth-provider"

export function DashboardHeader() {
  const { signOut } = useLifygoAuth()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-5 border-b border-border bg-card/80 px-8 backdrop-blur-md">
      <div className="text-xs font-mono tracking-tight text-muted-foreground">
        v1.0.4-prod
      </div>
      <ThemeToggle />
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        className="h-8 w-8 text-destructive hover:text-destructive/80"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  )
}