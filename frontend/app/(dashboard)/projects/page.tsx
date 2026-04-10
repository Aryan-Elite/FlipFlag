"use client"

import { useState } from "react"
import { FolderOpen, Flag, Zap, Users, Plus, Search, Clock, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

type Project = {
  id: number
  name: string
  description: string
  environment: "Development" | "Production"
  totalFlags: number
  activeFlags: number
  updatedAt: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockProjects: Project[] = []

const ENV_COLORS: Record<string, string> = {
  Production:  "bg-emerald-500/15 text-emerald-600",
  Development: "bg-blue-500/15 text-blue-600",
}

// ─── Create Project Modal ─────────────────────────────────────────────────────

function CreateProjectModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (name: string, description: string) => void
}) {
  const [name, setName]               = useState("")
  const [description, setDescription] = useState("")
  const [environment, setEnvironment] = useState("")
  const [repoUrl, setRepoUrl]         = useState("")
  const [tags, setTags]               = useState<string[]>([])

  const TAG_OPTIONS = ["Frontend", "Backend", "Mobile", "API", "Analytics", "E-commerce", "Admin"]

  function toggleTag(tag: string) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name.trim(), description.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-2xl">
        {/* Modal header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <FolderOpen className="size-4 text-primary" />
              </div>
              <h2 className="font-semibold">Create New Project</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Set up a new project to organize your feature flags.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Project Name <span className="text-destructive">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., E-commerce Platform"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your project and its purpose..."
              rows={2}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Default Environment */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Default Environment</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Select environment</option>
              <option value="Development">Development</option>
              <option value="Production">Production</option>
            </select>
          </div>

          {/* Repository URL */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Repository URL (Optional)</label>
            <input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/company/project"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Project Tags (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    tags.includes(tag)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Click tags to select them for better project organization
            </p>
          </div>

          {/* What's Next */}
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <Users className="size-3.5" /> What&apos;s Next?
            </p>
            <p>• Create your first feature flag for this project</p>
            <p>• Configure environment-specific settings</p>
            <p>• Integrate the SDK into your application</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!name.trim()}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <FolderOpen className="size-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{project.name}</p>
              {project.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
              )}
            </div>
          </div>
          <span className="text-muted-foreground">›</span>
        </div>

        <div className="mt-3">
          <Badge className={`text-xs font-normal ${ENV_COLORS[project.environment]}`} variant="secondary">
            {project.environment}
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Flag className="size-3.5" />
            <span>Total Flags</span>
            <span className="font-semibold text-foreground">{project.totalFlags}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Zap className="size-3.5" />
            <span>Active</span>
            <span className="font-semibold text-foreground">{project.activeFlags}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground border-t border-border pt-3">
          <Clock className="size-3" />
          Updated {project.updatedAt}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState("")

  function handleCreate(name: string, description: string) {
    const newProject: Project = {
      id: Date.now(),
      name,
      description,
      environment: "Development",
      totalFlags: 0,
      activeFlags: 0,
      updatedAt: "Just now",
    }
    setProjects((prev) => [newProject, ...prev])
    setShowModal(false)
  }

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      sub: projects.length === 0 ? "No projects yet" : `+${projects.length} from last month`,
      icon: FolderOpen,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      label: "Total Flags",
      value: projects.reduce((a, p) => a + p.totalFlags, 0),
      sub: "Across all projects",
      icon: Flag,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
    {
      label: "Active Flags",
      value: projects.reduce((a, p) => a + p.activeFlags, 0),
      sub: "0% of total flags",
      icon: Zap,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      label: "Team Members",
      value: 1,
      sub: "Across all projects",
      icon: Users,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
  ]

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Organize and manage feature flags across your projects
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowModal(true)}>
            <Plus className="size-4" />
            New Project
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
                <p className="mt-3 text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        {/* Project list */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
                <FolderOpen className="size-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No projects yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first project to start managing feature flags
              </p>
              <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowModal(true)}>
                <Plus className="size-4" />
                New Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  )
}
