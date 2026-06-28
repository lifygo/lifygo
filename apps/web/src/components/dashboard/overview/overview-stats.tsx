import type { LucideIcon } from "lucide-react"
import { Layers, Mail, Zap } from "lucide-react"

type OverviewStat = {
  label: string
  value: string
  change: string
  icon: LucideIcon
}

const overviewStats: OverviewStat[] = [
  { label: "Total Dispatches", value: "1,248", change: "+12.3%", icon: Mail },
  { label: "Active Jobs", value: "2 / 3", change: "Free Tier", icon: Layers },
  { label: "API Handshakes", value: "99.98%", change: "Healthy", icon: Zap },
]

export function OverviewStats() {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {overviewStats.map((stat) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.label}
            style={{ borderRadius: "12px 0px 12px 12px" }}
            className="relative overflow-hidden border border-border bg-card p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
              <Icon className="h-4 w-4 text-muted-foreground/70" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-black tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                {stat.change}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
