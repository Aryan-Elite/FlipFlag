"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Flag, ArrowLeft, Key, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock — will be replaced with real API calls
const MOCK_PROJECTS: Record<string, { name: string; description: string }> = {
  "1": { name: "My SaaS App",  description: "Main customer-facing application" },
  "2": { name: "Admin Panel",  description: "Internal admin tooling"            },
}

const ENVIRONMENTS = [
  {
    id: "dev",
    name: "Development",
    description: "Development Environment",
    color: "bg-blue-500",
    badge: "bg-blue-500/15 text-blue-600",
    flagCount: 0,
    activeCount: 0,
    sdkKey: "ff_dev_a1b2c3d4••••••••••••k1l2",
  },
  {
    id: "prod",
    name: "Production",
    description: "Production Environment",
    color: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-600",
    flagCount: 0,
    activeCount: 0,
    sdkKey: "ff_prod_z9y8x7w6••••••••••••p9o8",
  },
]

export default function ProjectDetailPage() {
  const params  = useParams()
  const id      = String(params.id)
  const project = MOCK_PROJECTS[id] ?? { name: "Project", description: "" }

  return (
    <div className="p-6 space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/projects"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Projects
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
          </div>
        </div>
      </div>

      {/* Environments */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">Environments</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {ENVIRONMENTS.map((env) => (
            <Link key={env.id} href={`/projects/${id}/environments/${env.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`size-2.5 rounded-full ${env.color}`} />
                      <div>
                        <p className="font-semibold">{env.name}</p>
                        <p className="text-xs text-muted-foreground">{env.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                      <p className="text-lg font-bold">{env.flagCount}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Flag className="size-3" /> Total Flags
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                      <p className="text-lg font-bold text-emerald-500">{env.activeCount}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5">
                    <Key className="size-3 shrink-0 text-muted-foreground" />
                    <code className="text-xs text-muted-foreground truncate">{env.sdkKey}</code>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
