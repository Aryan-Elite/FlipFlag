"use client"

import { useState } from "react"
import { User, Code2, Shield, Eye, EyeOff, Copy, Check, RefreshCw, FolderOpen, Key } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type Tab = "general" | "developer" | "security"

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS = [
  { id: 1, name: "My SaaS App"  },
  { id: 2, name: "Admin Panel"  },
]

const MOCK_KEYS: Record<number, { dev: string; prod: string }> = {
  1: { dev: "ff_dev_a1b2c3d4e5f6g7h8i9j0k1l2",  prod: "ff_prod_z9y8x7w6v5u4t3s2r1q0p9o8" },
  2: { dev: "ff_dev_m2n3o4p5q6r7s8t9u0v1w2x3",  prod: "ff_prod_l8k7j6i5h4g3f2e1d0c9b8a7" },
}

function maskKey(key: string) {
  return key.slice(0, 10) + "•".repeat(16) + key.slice(-4)
}

// ─── SDK Key row ──────────────────────────────────────────────────────────────

function SdkKeyRow({ label, sublabel, color, sdkKey }: {
  label: string; sublabel: string; color: string; sdkKey: string
}) {
  const [visible, setVisible] = useState(false)
  const [copied,  setCopied]  = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(sdkKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="size-3" /> Regenerate
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
                A
              </div>
              <div>
                <p className="text-sm font-medium">Profile Picture</p>
                <p className="text-xs text-muted-foreground">Profile pictures are not supported at this time.</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              {[
                { label: "Username",      value: "Anonymous"        },
                { label: "Email",         value: "user@example.com", verified: true },
                { label: "Role",          value: "Owner"            },
                { label: "Member Since",  value: "April 2026"       },
              ].map(({ label, value, verified }) => (
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
  const [projectId, setProjectId] = useState(1)
  const keys = MOCK_KEYS[projectId]

  const codeExample = [
    `// Evaluate flags for a user`,
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
          <Badge variant="secondary" className="gap-1 font-normal">2 Environments</Badge>
        </div>

        {/* Project selector */}
        <div className="mb-4 space-y-1.5">
          <label className="text-sm font-medium">Select Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(Number(e.target.value))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            {MOCK_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <SdkKeyRow label="Development" sublabel="Development Environment" color="bg-blue-500"    sdkKey={keys.dev}  />
          <SdkKeyRow label="Production"  sublabel="Production Environment"  color="bg-emerald-500" sdkKey={keys.prod} />
        </div>
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
            `Send it as the X-SDK-Key header in POST /api/sdk/flags`,
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
