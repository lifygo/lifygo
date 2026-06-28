import { Activity, ShieldCheck } from "lucide-react"

export function ClusterStatus() {
  return (
    <div className="flex flex-col gap-4 lg:col-span-5">
      <div className="flex items-center gap-2 border-b border-border pb-2.5">
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
          Cluster Verification Node
        </h2>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-500">
        <Activity className="mt-0.5 h-4 w-4 shrink-0 animate-pulse text-emerald-500" />
        <div>
          <h5 className="text-xs font-semibold tracking-tight text-foreground">
            All Nodes Standby Ready
          </h5>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            SMTP link encryption handshakes, cron routine registries, and
            webhook micro-listeners are functioning nominally within edge
            limits.
          </p>
        </div>
      </div>
    </div>
  )
}
