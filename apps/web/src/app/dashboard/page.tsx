import { Activity } from "lucide-react"

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { ClusterStatus } from "@/components/dashboard/overview/cluster-status"
import { OverviewStats } from "@/components/dashboard/overview/overview-stats"
import { QuickActions } from "@/components/dashboard/overview/quick-actions"

export default function DashboardOverview() {
  return (
    <div className="max-w-4xl text-foreground">
      <DashboardPageHeader
        eyebrow="System Telemetry Matrix"
        title="Overview"
        description="Welcome back to the LifyGo orchestrator hub. Monitor your pipeline delivery telemetry, track asynchronous background runner environments, and review active infrastructure loops."
        icon={Activity}
      />

      <OverviewStats />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <QuickActions />
        <ClusterStatus />
      </div>
    </div>
  )
}
