import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-5 border-b border-border bg-card/80 px-8 backdrop-blur-md">
      <div className="text-xs font-mono tracking-tight text-muted-foreground">
        v1.0.4-prod
      </div>
      <ThemeToggle />
    </header>
  )
}
