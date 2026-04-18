"use client"

import { useState, useEffect } from "react"
import { User, Code2, Shield, Eye, EyeOff, Copy, Check, FolderOpen, Key, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getProjects, getEnvironments, generateApiKeys, regenerateApiKey, getMe } from "@/lib/api"

type Tab = "general" | "developer" | "security"
type Project = { id: string; name: string }
type Environment = { id: string; name: string; sdk_key: string }

// ─── SDK Key row ──────────────────────────────────────────────────────────────

function maskKey(key: string) {
  return key.slice(0, 10) + "•".repeat(16) + key.slice(-4)
}

function SdkKeyRow({ label, sublabel, color, envId, sdkKey, onRegenerated }: {
  label: string; sublabel: string; color: string; envId: string; sdkKey: string
  onRegenerated: (envId: string, newKey: string) => void
}) {
  const [visible,      setVisible]      = useState(false)
  const [copied,       setCopied]       = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(sdkKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      const updated = await regenerateApiKey(envId)
      onRegenerated(envId, updated.sdk_key)
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`size-2 rounded-full ${color}`} />
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          </div>
        </div>
        <Button
          variant="ghost" size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          {regenerating ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
          Regenerate
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-input bg-muted/40 px-3 py-2 font-mono text-sm">
          {visible ? sdkKey : maskKey(sdkKey)}
        </div>
        <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={() => setVisible(v => !v)}>
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={handleCopy}>
          {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
        </Button>
      </div>

      <div className="rounded-lg bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
        <span className="text-blue-400">X-SDK-Key</span>: {visible ? sdkKey : maskKey(sdkKey)}
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function GeneralTab() {
  const [user, setUser] = useState<{ name: string; email: string; emailVerified: boolean; createdAt: string } | null>(null)

  useEffect(() => {
    getMe().then(setUser)
  }, [])

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—"

  const fields = [
    { label: "Username",     value: user?.name  ?? "—"              },
    { label: "Email",        value: user?.email ?? "—", verified: user?.emailVerified },
    { label: "Role",         value: "Owner"                          },
    { label: "Member Since", value: memberSince                      },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">General Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </div>

      <section>
        <h3 className="mb-1 font-medium">Profile Information</h3>
        <p className="mb-4 text-sm text-muted-foreground">Update your personal information</p>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted text-xl font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? "—"}
              </div>
              <div>
                <p className="text-sm font-medium">Profile Picture</p>
                <p className="text-xs text-muted-foreground">Profile pictures are not supported at this time.</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              {fields.map(({ label, value, verified }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-sm font-medium">{label}</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                      {value}
                    </div>
                    {verified && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 gap-1 font-normal">
                        <Check className="size-3" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="mb-3 font-medium">Account Actions</h3>
        <Card className="border-destructive/30">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">Delete</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function DeveloperTab() {
  const [projects,   setProjects]   = useState<Project[]>([])
  const [projectId,  setProjectId]  = useState<string>("")
  const [envs,       setEnvs]       = useState<Environment[]>([])
  const [loadingEnv, setLoadingEnv] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    getProjects().then((data: Project[]) => {
      setProjects(data)
      if (data.length > 0) setProjectId(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!projectId) return
    setLoadingEnv(true)
    setEnvs([])
    setError(null)
    getEnvironments(projectId)
      .then((data: Environment[]) => setEnvs(data))
      .catch(() => setEnvs([]))
      .finally(() => setLoadingEnv(false))
  }, [projectId])

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    try {
      const data = await generateApiKeys(projectId)
      setEnvs(data.environments)
    } catch (e: any) {
      setError(e.message ?? "Failed to generate keys")
    } finally {
      setGenerating(false)
    }
  }

  function handleRegenerated(envId: string, newKey: string) {
    setEnvs(prev => prev.map(e => e.id === envId ? { ...e, sdk_key: newKey } : e))
  }

  const devEnv  = envs.find(e => e.name === "Development")
  const prodEnv = envs.find(e => e.name === "Production")
  const hasKeys = envs.length > 0

  const codeExample = [
    `const result = await fetch("/api/sdk/flags", {`,
    `  method: "POST",`,
    `  headers: { "X-SDK-Key": "ff_dev_..." },`,
    `  body: JSON.stringify({ userId: "user-123" })`,
    `})`,
    ``,
    `if (result.flags["new-checkout"]) {`,
    `  // show new checkout UI`,
    `}`,
  ].join("\n")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Developer Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage API keys and SDK configuration</p>
      </div>

      {/* Environment SDK Keys */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              <Key className="size-4 text-muted-foreground" /> Environment SDK Keys
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Initialize the SDK in your application with these environment-specific keys
            </p>
          </div>
          {hasKeys && <Badge variant="secondary" className="gap-1 font-normal">2 Environments</Badge>}
        </div>

        {/* Project selector */}
        <div className="mb-4 space-y-1.5">
          <label className="text-sm font-medium">Select Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            {projects.length === 0 && <option value="">No projects yet</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {loadingEnv ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="size-4 animate-spin" /> Loading keys…
          </div>
        ) : hasKeys ? (
          <div className="space-y-3">
            {devEnv  && <SdkKeyRow label="Development" sublabel="Development Environment" color="bg-blue-500"    envId={devEnv.id}  sdkKey={devEnv.sdk_key}  onRegenerated={handleRegenerated} />}
            {prodEnv && <SdkKeyRow label="Production"  sublabel="Production Environment"  color="bg-emerald-500" envId={prodEnv.id} sdkKey={prodEnv.sdk_key} onRegenerated={handleRegenerated} />}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-3">
            <FolderOpen className="size-8 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">No API keys yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">Generate keys to start using the SDK for this project</p>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button size="sm" onClick={handleGenerate} disabled={generating || !projectId}>
              {generating ? <><Loader2 className="size-3 mr-1.5 animate-spin" /> Generating…</> : "Generate API Keys"}
            </Button>
          </div>
        )}
      </section>

      <Separator />

      {/* Integration example */}
      <section>
        <h3 className="mb-1 font-medium">Integration Example</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Use the SDK key in the <code className="rounded bg-muted px-1 text-xs">X-SDK-Key</code> header to evaluate flags
        </p>
        <div className="rounded-xl border border-border bg-[#0f1117] p-4">
          <div className="mb-3 flex gap-1.5">
            <span className="size-3 rounded-full bg-red-400" />
            <span className="size-3 rounded-full bg-yellow-400" />
            <span className="size-3 rounded-full bg-green-400" />
          </div>
          <pre className="overflow-x-auto text-xs leading-relaxed text-zinc-300 whitespace-pre">
            {codeExample}
          </pre>
        </div>

        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          {[
            "Copy the SDK key for your target environment (Development or Production)",
            "Send it as the X-SDK-Key header in POST /api/sdk/flags",
            "Include userId + attributes in the body to get evaluated flags back",
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {i + 1}
              </span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SecurityTab() {
  const [current, setCurrent] = useState("")
  const [next,    setNext]    = useState("")
  const [confirm, setConfirm] = useState("")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Security</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your password and account security</p>
      </div>

      <section>
        <h3 className="mb-1 font-medium">Change Password</h3>
        <p className="mb-4 text-sm text-muted-foreground">Update your password to keep your account secure</p>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[
              { label: "Current Password", value: current, set: setCurrent, placeholder: "••••••••"          },
              { label: "New Password",     value: next,    set: setNext,    placeholder: "Min. 8 characters" },
              { label: "Confirm Password", value: confirm, set: setConfirm, placeholder: "Repeat new password" },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-sm font-medium">{label}</label>
                <input
                  type="password"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
            ))}
            <div className="flex justify-end pt-1">
              <Button size="sm" disabled={!current || !next || next !== confirm}>
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; sub: string; icon: typeof User }[] = [
  { id: "general",   label: "General",   sub: "Profile & preferences", icon: User   },
  { id: "developer", label: "Developer", sub: "API keys & SDKs",       icon: Code2  },
  { id: "security",  label: "Security",  sub: "Password & 2FA",        icon: Shield },
]

export default function SettingsPage() {
  const [active, setActive] = useState<Tab>("general")

  return (
    <div className="flex min-h-full">
      {/* Left sub-nav */}
      <aside className="w-56 shrink-0 border-r border-border p-4 space-y-1">
        <div className="mb-4 px-2">
          <p className="font-semibold">Settings</p>
          <p className="text-xs text-muted-foreground">Manage your account and preferences</p>
        </div>
        {TABS.map(({ id, label, sub }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
              active === id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <p className="text-sm font-medium">{label}</p>
            <p className="text-[11px] text-muted-foreground">{sub}</p>
          </button>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 p-8 max-w-2xl">
        {active === "general"   && <GeneralTab   />}
        {active === "developer" && <DeveloperTab />}
        {active === "security"  && <SecurityTab  />}
      </div>
    </div>
  )
}
