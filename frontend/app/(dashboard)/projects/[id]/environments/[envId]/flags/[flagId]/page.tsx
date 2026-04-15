"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getFlag,
  updateFlag as apiUpdateFlag,
  updateFlagConfig,
  createRule as apiCreateRule,
  updateRule as apiUpdateRule,
  deleteRule as apiDeleteRule,
} from "@/lib/api"

// ─── Types ────────────────────────────────────────────────────────────────────

type Rule = {
  id: string
  field_name: string
  operator: string
  values: string[]
  serve: boolean
  rollout_percent: number | null
  is_active: boolean
  priority: number
}

type FlagDetail = {
  id: string
  key: string
  name: string
  description: string | null
  tags: string[]
  is_active: boolean
  default_rollout: number
  config_id: string
  rules: Rule[]
}

const OPERATORS = [
  { value: "in",         label: "is one of" },
  { value: "contains",   label: "contains" },
  { value: "startsWith", label: "starts with" },
  { value: "endsWith",   label: "ends with" },
  { value: "matches",    label: "matches regex" },
]

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? "bg-blue-500" : "bg-zinc-600"
      }`}
    >
      <span className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        enabled ? "translate-x-[22px]" : "translate-x-[2px]"
      }`} />
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlagDetailPage() {
  const params = useParams()
  const id     = String(params.id)
  const envId  = String(params.envId)
  const flagId = String(params.flagId)

  const [flag,    setFlag]    = useState<FlagDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  // Settings form state
  const [name,        setName]        = useState("")
  const [description, setDescription] = useState("")
  const [tagsInput,   setTagsInput]   = useState("")
  const [savingMeta,  setSavingMeta]  = useState(false)

  // Rollout state
  const [rollout,       setRollout]       = useState(0)
  const [savingRollout, setSavingRollout] = useState(false)

  // New rule form state
  const [showRuleForm,    setShowRuleForm]    = useState(false)
  const [ruleField,       setRuleField]       = useState("")
  const [ruleOperator,    setRuleOperator]    = useState("in")
  const [ruleValues,      setRuleValues]      = useState("")
  const [ruleServe,       setRuleServe]       = useState(true)
  const [addingRule,      setAddingRule]      = useState(false)

  useEffect(() => {
    getFlag(flagId, envId)
      .then((data: FlagDetail) => {
        setFlag(data)
        setName(data.name)
        setDescription(data.description ?? "")
        setTagsInput(data.tags.join(", "))
        setRollout(data.default_rollout)
      })
      .catch((err: any) => setError(err.message || "Failed to load flag."))
      .finally(() => setLoading(false))
  }, [flagId, envId])

  async function handleToggle() {
    if (!flag) return
    const result = await updateFlagConfig(flagId, envId, {
      isActive: !flag.is_active,
      defaultRollout: flag.default_rollout,
    })
    setFlag((f) => f ? { ...f, is_active: result.is_active } : f)
  }

  async function handleSaveRollout() {
    if (!flag) return
    setSavingRollout(true)
    try {
      const result = await updateFlagConfig(flagId, envId, {
        isActive: flag.is_active,
        defaultRollout: rollout,
      })
      setFlag((f) => f ? { ...f, default_rollout: result.default_rollout } : f)
    } finally {
      setSavingRollout(false)
    }
  }

  async function handleSaveMeta() {
    if (!flag) return
    setSavingMeta(true)
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
      const updated = await apiUpdateFlag(flagId, { name, description, tags })
      setFlag((f) => f ? { ...f, name: updated.name, description: updated.description, tags: updated.tags } : f)
    } finally {
      setSavingMeta(false)
    }
  }

  async function handleAddRule() {
    if (!ruleField.trim() || !ruleValues.trim()) return
    setAddingRule(true)
    try {
      const values = ruleValues.split(",").map((v) => v.trim()).filter(Boolean)
      const rule = await apiCreateRule(flagId, envId, {
        fieldName: ruleField.trim(),
        operator: ruleOperator,
        values,
        serve: ruleServe,
        priority: flag!.rules.length,
      })
      setFlag((f) => f ? { ...f, rules: [...f.rules, rule] } : f)
      setShowRuleForm(false)
      setRuleField("")
      setRuleValues("")
      setRuleServe(true)
      setRuleOperator("in")
    } finally {
      setAddingRule(false)
    }
  }

  async function handleToggleRule(rule: Rule) {
    const updated = await apiUpdateRule(rule.id, {
      isActive: !rule.is_active,
      serve: rule.serve,
      rolloutPercent: rule.rollout_percent,
    })
    setFlag((f) => f ? {
      ...f,
      rules: f.rules.map((r) => r.id === rule.id ? { ...r, is_active: updated.is_active } : r)
    } : f)
  }

  async function handleDeleteRule(ruleId: string) {
    await apiDeleteRule(ruleId)
    setFlag((f) => f ? { ...f, rules: f.rules.filter((r) => r.id !== ruleId) } : f)
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading...</div>
  if (error || !flag) return <div className="p-6 text-sm text-destructive">{error || "Flag not found."}</div>

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Link
          href={`/projects/${id}/environments/${envId}`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Flags
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{flag.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{flag.key}</code>
              {flag.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
            {flag.description && (
              <p className="mt-1.5 text-sm text-muted-foreground">{flag.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-muted-foreground">{flag.is_active ? "On" : "Off"}</span>
            <Toggle enabled={flag.is_active} onToggle={handleToggle} />
          </div>
        </div>
      </div>

      {/* Targeting */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Default Rollout</CardTitle>
          <p className="text-sm text-muted-foreground">
            % of users who receive this flag as <code className="text-xs bg-muted px-1 rounded">true</code> when no targeting rules match
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              value={rollout}
              onChange={(e) => setRollout(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-right font-mono font-semibold">{rollout}%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {rollout === 0
              ? "Flag is off for all users by default"
              : rollout === 100
              ? "Flag is on for all users by default"
              : `${rollout}% of users will see this flag as true`}
          </p>
          <Button size="sm" onClick={handleSaveRollout} disabled={savingRollout}>
            {savingRollout ? "Saving..." : "Save Rollout"}
          </Button>
        </CardContent>
      </Card>

      {/* Targeting Rules */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Targeting Rules</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Rules are evaluated top-to-bottom. First match wins.
              </p>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowRuleForm(true)}>
              <Plus className="size-3.5" /> Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {flag.rules.length === 0 && !showRuleForm && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No targeting rules yet. All users fall through to the default rollout.
            </p>
          )}

          {flag.rules.map((rule, i) => (
            <div key={rule.id} className={`rounded-lg border p-3 space-y-2 ${!rule.is_active ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">Rule {i + 1}</span>
                <div className="flex items-center gap-2">
                  <Toggle enabled={rule.is_active} onToggle={() => handleToggleRule(rule)} />
                  <button onClick={() => handleDeleteRule(rule.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm">
                When <code className="bg-muted px-1 rounded text-xs">{rule.field_name}</code>{" "}
                <span className="text-muted-foreground">{OPERATORS.find((o) => o.value === rule.operator)?.label ?? rule.operator}</span>{" "}
                <code className="bg-muted px-1 rounded text-xs">{rule.values.join(", ")}</code>
                {" → "}
                <Badge variant="secondary" className={rule.serve ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-600"}>
                  serve {rule.serve ? "true" : "false"}
                </Badge>
              </p>
            </div>
          ))}

          {showRuleForm && (
            <div className="rounded-lg border border-dashed p-4 space-y-3">
              <p className="text-sm font-medium">New Rule</p>
              <div className="grid grid-cols-3 gap-2">
                <input
                  value={ruleField}
                  onChange={(e) => setRuleField(e.target.value)}
                  placeholder="Field (e.g. plan)"
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring"
                />
                <select
                  value={ruleOperator}
                  onChange={(e) => setRuleOperator(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring"
                >
                  {OPERATORS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  value={ruleValues}
                  onChange={(e) => setRuleValues(e.target.value)}
                  placeholder="Values (comma-separated)"
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-ring"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Serve:</span>
                <button
                  onClick={() => setRuleServe(true)}
                  className={`px-3 py-1 rounded text-xs font-medium ${ruleServe ? "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500" : "bg-muted text-muted-foreground"}`}
                >
                  true
                </button>
                <button
                  onClick={() => setRuleServe(false)}
                  className={`px-3 py-1 rounded text-xs font-medium ${!ruleServe ? "bg-red-500/15 text-red-600 ring-1 ring-red-500" : "bg-muted text-muted-foreground"}`}
                >
                  false
                </button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddRule} disabled={addingRule || !ruleField.trim() || !ruleValues.trim()}>
                  {addingRule ? "Adding..." : "Add Rule"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowRuleForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flag Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Flag Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tags</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. frontend, payments"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <p className="text-[11px] text-muted-foreground">Comma-separated</p>
          </div>
          <Button size="sm" onClick={handleSaveMeta} disabled={savingMeta}>
            {savingMeta ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
