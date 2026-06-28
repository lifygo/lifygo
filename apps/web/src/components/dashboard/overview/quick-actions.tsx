import Link from "next/link"
import { ArrowUpRight, Key, Mail, Terminal } from "lucide-react"

import { Button } from "@/components/ui/button"

const quickActions = [
  {
    href: "/dashboard/send",
    label: "Fire Mail Test",
    icon: Mail,
    iconClassName: "text-brand",
  },
  {
    href: "/dashboard/api-keys",
    label: "Manage API Keys",
    icon: Key,
    iconClassName: "text-amber-500",
  },
]

export function QuickActions() {
  return (
    <div
      style={{ borderRadius: "12px 0px 12px 12px" }}
      className="relative flex flex-col gap-4 overflow-hidden border border-border bg-card p-6 shadow-xs lg:col-span-7"
    >
      <div className="mb-1 flex items-center gap-2 border-b border-border pb-3">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-heading text-sm font-bold uppercase tracking-tight text-foreground">
          Rapid Pipeline Triggers
        </h2>
      </div>

      <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
        Initiate automated runtime modules or inspect token keys instantly via
        secure sandbox gateways.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {quickActions.map((action) => {
          const Icon = action.icon

          return (
            <Button
              key={action.href}
              asChild
              variant="outline"
              className="group h-10 w-full justify-between border-border bg-muted/20 text-xs text-foreground hover:bg-muted"
            >
              <Link href={action.href}>
                <span className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${action.iconClassName}`} />
                  {action.label}
                </span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Link>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
