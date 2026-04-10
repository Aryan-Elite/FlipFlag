"use client"

import { useState } from "react"
import { Key, Eye, EyeOff, Copy, Check, RefreshCw, FolderOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const MOCK_PROJECTS = [
  {
    id: 1,
    name: "My SaaS App",
    keys: {
      development: "ff_dev_a1b2c3d4e5f6g7h8i9j0k1l2",
      production:  "ff_prod_z9y8x7w6v5u4t3s2r1q0p9o8",
    },
  },
  {
    id: 2,
    name: "Admin Panel",
    keys: {
      development: "ff_dev_m2n3o4p5q6r7s8t9u0v1w2x3",
      production:  "ff_prod_l8k7j6i5h4g3f2e1d0c9b8a7",
    },
  },
]

function maskKey(key: string) {
  return key.slice(0, 10) + "•".repeat(16) + key.slice(-4)
}

function KeyCard({
  env,
  color,
  sdkKey,
}: {
  env: string
  color: string
  sdkKey: string
}) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied]   = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(sdkKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`size-2.5 rounded-full ${color}`} />
          <div>
            <p className="text-sm font-semibold">{env}</p>
            <p className="text-xs text-muted-foreground">{env} Environment</p>
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
        <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={() => setVisible((v) => !v)}>
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={handleCopy}>
          {copied
            ? <Check className="size-4 text-emerald-500" />
            : <Copy className="size-4" />}
        </Button>
      </div>

      <div className="rounded-lg bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
        <span className="text-blue-400">X-SDK-Key</span>: {visible ? sdkKey : maskKey(sdkKey)}
      </div>
    </div>
  )
}

export default function ApiKeysPage() {
  const [selectedProject, setSelectedProject] = useState(MOCK_PROJECTS[0])

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            SDK keys for initializing FlipFlag in your application
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5 font-normal">
          <Key className="size-3" /> 2 Environments
        </Badge>
      </div>

      {/* Project selector */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Environment SDK Keys</p>
              <p className="text-sm text-muted-foreground">
                Pass the SDK key via the <code className="rounded bg-muted px-1 text-xs">X-SDK-Key</code> header when calling <code className="rounded bg-muted px-1 text-xs">/api/sdk/flags</code>
              </p>
            </div>
          </div>

          {/* Project tabs */}
          <div className="mb-4 flex gap-2">
            {MOCK_PROJECTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  selectedProject.id === p.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                <FolderOpen className="size-3.5" />
                {p.name}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <KeyCard env="Development" color="bg-blue-500"    sdkKey={selectedProject.keys.development} />
            <KeyCard env="Production"  color="bg-emerald-500" sdkKey={selectedProject.keys.production}  />
          </div>
        </CardContent>
      </Card>

      {/* Usage guide */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-3 font-medium">How to use</p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
              <p>Copy the SDK key for the environment you want to target (Development or Production)</p>
            </div>
            <div className="flex gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
              <p>Include it as the <code className="rounded bg-muted px-1 text-xs text-foreground">X-SDK-Key</code> header in your POST request to <code className="rounded bg-muted px-1 text-xs text-foreground">/api/sdk/flags</code></p>
            </div>
            <div className="flex gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
              <p>Send user context (userId + attributes) in the request body to get evaluated flags back</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
