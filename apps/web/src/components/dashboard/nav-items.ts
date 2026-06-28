import type { LucideIcon } from "lucide-react"
import {
  CalendarRange,
  FileText,
  Key,
  LayoutDashboard,
  Send,
  Server,
} from "lucide-react"

export type DashboardNavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/smtp", label: "SMTP Config", icon: Server },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/send", label: "Send Test", icon: Send },
  { href: "/dashboard/logs", label: "Logs", icon: FileText },
  { href: "/dashboard/jobs", label: "Jobs", icon: CalendarRange },
]
