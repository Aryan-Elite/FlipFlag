"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FolderOpen, Flag, Zap, Plus, Search, Trash2, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getProjects, createProject, deleteProject } from "@/lib/api"

// ─── Types ────────────────────────────────────────────────────────────────────

type Project = {
  id: string
  name: string
  created_at: string
}

// ─── Create Project Modal ─────────────────────────────────────────────────────

function CreateProjectModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (name: string) => Promise<void>
}) {
  const [name, setName]       = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError("")
    try {
      await onCreate(name.trim())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <FolderOpen className="size-4 text-primary" />
            </div>
            <h2 className="font-semibold">Create New Project</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Project Name <span className="text-destructive">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., E-commerce Platform"
              required
              autoFocus
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!name.trim() || loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, onDelete }: {
  project: Project
  onDelete: (id: string) => void
}) {
  const router = useRouter()

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <FolderOpen className="size-4 text-primary" />
            </div>
            <p className="font-semibold">{project.name}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation() // prevent card click from firing
              onDelete(project.id)
            }}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Flag className="size-3.5" />
            <span>Dev + Prod environments</span>
          </div>
        </div>

        <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          Created {new Date(project.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [projects, setProjects]   = useState<Project[]>([])
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch]       = useState("")
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState("")

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => setError("Failed to load projects"))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(name: string) {
    const project = await createProject(name)
    setProjects((prev) => [project, ...prev])
    setShowModal(false)
  }

  async function handleDelete(id: string) {
    await deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      sub: projects.length === 0 ? "No projects yet" : "Your projects",
      icon: FolderOpen,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      label: "Total Flags",
      value: "—",
      sub: "Across all projects",
      icon: Flag,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
    {
      label: "Active Flags",
      value: "—",
      sub: "Across all projects",
      icon: Zap,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
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
        <div className="grid grid-cols-3 gap-4">
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
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {/* States */}
        {loading && (
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Project list */}
        {!loading && !error && filtered.length === 0 && (
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
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
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
