import type { LucideIcon } from "lucide-react"

type DashboardPageHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  icon: LucideIcon
}

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: DashboardPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-brand" />
        {eyebrow}
      </div>
      <h1 className="mt-1 font-heading text-3xl font-black uppercase tracking-tight text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
