"use client"

import { useEffect, useState } from "react"
import { Flag, Activity, Database, FolderOpen, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDashboardStats } from "@/lib/api"

type Counts = { total_flags: string; active_flags: string; total_projects: string }
type RecentFlag = { key: string; name: string; project_name: string; created_at: string; is_active: boolean }

export default function DashboardPage() {
  const [counts,  setCounts]  = useState<Counts | null>(null)
  const [recent,  setRecent]  = useState<RecentFlag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(({ counts, recent }) => {
        setCounts(counts)
        setRecent(recent)
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    {
      label: "Total Flags",
      value: loading ? "—" : counts?.total_flags ?? "0",
      icon: Flag,
      sub: "Across all environments",
      iconColor: "text-violet-500",
      iconBg: "bg-violet-500/10",
    },
    {
      label: "Active Flags",
      value: loading ? "—" : counts?.active_flags ?? "0",
      icon: Activity,
      sub: "Currently enabled",
      subColor: "text-emerald-500",
      iconColor: "text-rose-500",
      iconBg: "bg-rose-500/10",
    },
    {
      label: "Environments",
      value: "Development, Production",
      isText: true,
      icon: Database,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
    },
    {
      label: "Projects",
      value: loading ? "—" : counts?.total_projects ?? "0",
      icon: FolderOpen,
      sub: "Total projects",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and monitor your feature flags across all environments
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Create Flag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className={`flex size-8 items-center justify-center rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`size-4 ${stat.iconColor}`} />
                </div>
              </div>
              {stat.isText ? (
                <p className="mt-3 text-sm font-medium leading-snug">{stat.value}</p>
              ) : (
                <p className="mt-3 text-3xl font-bold">{stat.value}</p>
              )}
              {stat.sub && (
                <p className={`mt-1 text-xs ${stat.subColor ?? "text-muted-foreground"}`}>
                  {stat.sub}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Flags */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <p className="font-medium">Recent Flags</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Recently created feature flags across all environments
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
              View all
            </Button>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                <Flag className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No flags found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first flag to get started
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Flag</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Project</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Environment</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((flag, i) => (
                  <tr key={flag.key + flag.project_name} className={i !== recent.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-6 py-3 font-mono font-medium">{flag.key}</td>
                    <td className="px-6 py-3 text-muted-foreground">{flag.project_name}</td>
                    <td className="px-6 py-3">
                      <Badge variant="secondary" className="font-normal">Development</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={flag.is_active ? "default" : "secondary"}
                        className={flag.is_active ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20" : ""}
                      >
                        {flag.is_active ? "On" : "Off"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
