"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Flag, ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

type FlagItem = {
  id: number
  key: string
  name: string
  isActive: boolean
  defaultRollout: number
  createdAt: string
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-blue-500" : "bg-zinc-600"
      }`}
    >
      <span
        className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  )
}

// ─── Create Flag Modal ────────────────────────────────────────────────────────

function CreateFlagModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (key: string, name: string, defaultRollout: number) => void
}) {
  const [key,            setKey]            = useState("")
  const [name,           setName]           = useState("")
  const [defaultRollout, setDefaultRollout] = useState(0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!key.trim()) return
    onCreate(key.trim().toLowerCase().replace(/\s+/g, "-"), name.trim() || key.trim(), defaultRollout)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-2xl">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                <Flag className="size-4 text-primary" />
              </div>
              <h2 className="font-semibold">Create New Flag</h2>
            </div>
            <p className="text-xs text-muted-foreground">Add a feature flag to this environment</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Flag Key <span className="text-destructive">*</span>
            </label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g., new-checkout"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <p className="text-[11px] text-muted-foreground">
              Lowercase letters, numbers, and hyphens only. Used in code to evaluate this flag.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Checkout Experience"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Default Rollout <span className="text-muted-foreground text-xs font-normal">({defaultRollout}%)</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={defaultRollout}
              onChange={(e) => setDefaultRollout(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-[11px] text-muted-foreground">
              % of users who see this flag when no targeting rules match
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!key.trim()}>Create Flag</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ENV_META: Record<string, { name: string; color: string }> = {
  dev:  { name: "Development", color: "bg-blue-500"    },
  prod: { name: "Production",  color: "bg-emerald-500" },
}

export default function FlagsPage() {
  const params = useParams()
  const id     = String(params.id)
  const envId  = String(params.envId)
  const env    = ENV_META[envId] ?? { name: envId, color: "bg-zinc-500" }

  const [flags,      setFlags]      = useState<FlagItem[]>([])
  const [showModal,  setShowModal]  = useState(false)

  function handleCreate(key: string, name: string, defaultRollout: number) {
    setFlags((prev) => [
      ...prev,
      { id: Date.now(), key, name, isActive: false, defaultRollout, createdAt: "Just now" },
    ])
    setShowModal(false)
  }

  function toggleFlag(id: number) {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f))
    )
  }

  function deleteFlag(id: number) {
    setFlags((prev) => prev.filter((f) => f.id !== id))
  }

  const activeCount = flags.filter((f) => f.isActive).length

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <Link
            href={`/projects/${id}`}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to Project
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`size-2.5 rounded-full ${env.color}`} />
              <div>
                <h1 className="text-2xl font-semibold">{env.name} Flags</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {flags.length} flag{flags.length !== 1 ? "s" : ""} · {activeCount} active
                </p>
              </div>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => setShowModal(true)}>
              <Plus className="size-4" /> New Flag
            </Button>
          </div>
        </div>

        {/* Flags table */}
        <Card>
          <CardContent className="p-0">
            {flags.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                  <Flag className="size-5 text-muted-foreground" />
                </div>
                <p className="font-medium">No flags yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first feature flag for this environment
                </p>
                <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowModal(true)}>
                  <Plus className="size-4" /> New Flag
                </Button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Flag Key</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Default Rollout</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-left font-medium text-muted-foreground">Toggle</th>
                    <th className="px-6 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flags.map((flag, i) => (
                    <tr key={flag.id} className={i !== flags.length - 1 ? "border-b border-border" : ""}>
                      <td className="px-6 py-3 font-mono font-medium">{flag.key}</td>
                      <td className="px-6 py-3 text-muted-foreground">{flag.name}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-20 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all"
                              style={{ width: `${flag.defaultRollout}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{flag.defaultRollout}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant="secondary"
                          className={flag.isActive ? "bg-emerald-500/15 text-emerald-600" : ""}
                        >
                          {flag.isActive ? "Enabled" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <Toggle enabled={flag.isActive} onToggle={() => toggleFlag(flag.id)} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/projects/${id}/environments/${envId}/flags/${flag.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteFlag(flag.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <CreateFlagModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  )
}
