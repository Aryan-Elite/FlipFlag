"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Flag, ArrowLeft, Key, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getProject, getEnvironments } from "@/lib/api"

const ENV_STYLES: Record<string, { color: string }> = {
  Development: { color: "bg-blue-500" },
  Production:  { color: "bg-emerald-500" },
}

export default function ProjectDetailPage() {
  const params = useParams()
  const id     = String(params.id)

  const [project,      setProject]      = useState<{ id: string; name: string } | null>(null)
  const [environments, setEnvironments] = useState<{ id: string; name: string; sdk_key: string }[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState("")

  useEffect(() => {
    Promise.all([getProject(id), getEnvironments(id)])
      .then(([proj, envs]) => {
        setProject(proj)
        setEnvironments(envs)
      })
      .catch((err) => setError(err.message || "Failed to load project."))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
  }

  if (error || !project) {
    return <div className="p-6 text-sm text-destructive">{error || "Project not found."}</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Projects
        </Link>
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor feature flags for this project</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatTile label="Total Flags"  value={0} sub="across all environments"  icon={<Flag className="size-3.5" />} />
        <StatTile label="Development"  value={0} sub="flags in dev"             icon={<ToggleRight className="size-3.5 text-blue-500" />} />
        <StatTile label="Production"   value={0} sub="flags in prod"            icon={<ToggleRight className="size-3.5 text-emerald-500" />} />
        <StatTile label="Enabled"      value={0} sub="currently on"             icon={<ToggleRight className="size-3.5 text-green-500" />} />
        <StatTile label="Disabled"     value={0} sub="currently off"            icon={<ToggleLeft className="size-3.5 text-muted-foreground" />} />
      </div>

      {/* Environments */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">Environments</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {environments.map((env) => {
            const style = ENV_STYLES[env.name] ?? { color: "bg-zinc-500" }
            return (
              <Link key={env.id} href={`/projects/${id}/environments/${env.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`size-2 rounded-full ${style.color}`} />
                        <span className="font-medium">{env.name}</span>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2.5 py-1.5">
                      <Key className="size-3 shrink-0 text-muted-foreground" />
                      <code className="text-xs text-muted-foreground truncate">{env.sdk_key}</code>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatTile({
  label, value, sub, icon,
}: {
  label: string
  value: number
  sub: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}
