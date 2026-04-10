"use client"

import { useState } from "react"
import { Bell, ShoppingCart, Moon, Zap, Star } from "lucide-react"

const FLAGS = [
  { key: "dark_mode",      label: "Dark Mode",      icon: Moon,         defaultEnabled: true  },
  { key: "new_checkout",   label: "New Checkout",   icon: ShoppingCart, defaultEnabled: false },
  { key: "beta_features",  label: "Beta Features",  icon: Zap,          defaultEnabled: false },
  { key: "notifications",  label: "Notifications",  icon: Bell,         defaultEnabled: true  },
]

type FlagState = Record<string, boolean>

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

const BAR_COLORS = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-purple-500",
  "bg-blue-400",
]
const BAR_HEIGHTS = [40, 65, 45, 80, 55, 70, 90]

function AppPreview({ flags }: { flags: FlagState }) {
  const isDark      = flags["dark_mode"]
  const newCheckout = flags["new_checkout"]
  const beta        = flags["beta_features"]
  const notifs      = flags["notifications"]

  const bg      = isDark ? "bg-[#0f1117]"   : "bg-white"
  const surface = isDark ? "bg-[#1a1d27]"   : "bg-slate-100"
  const border  = isDark ? "border-zinc-700" : "border-slate-200"
  const text    = isDark ? "text-zinc-100"   : "text-zinc-800"
  const sub     = isDark ? "text-zinc-400"   : "text-zinc-500"
  const muted   = isDark ? "text-zinc-500"   : "text-zinc-400"

  return (
    <div className={`h-full w-full rounded-lg p-4 transition-all duration-300 ${bg} ${text}`}>
      {/* Top bar */}
      <div className={`mb-3 flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium ${surface}`}>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-blue-500" />
          <span>Dashboard</span>
          {beta && (
            <span className="rounded bg-yellow-400/20 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400">
              BETA
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifs && (
            <div className="relative">
              <Bell className="size-3" />
              <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-red-500" />
            </div>
          )}
          <div className={`size-5 rounded-full bg-gradient-to-br from-blue-400 to-violet-500`} />
        </div>
      </div>

      {/* Notification banner */}
      {notifs && (
        <div className="mb-3 rounded-md border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-[11px] text-blue-400">
          You have 3 new alerts —{" "}
          <span className="cursor-pointer font-semibold underline">view all</span>
        </div>
      )}

      {/* Main content */}
      {newCheckout ? (
        <div className={`rounded-md border p-3 text-xs ${surface} ${border}`}>
          <div className="mb-2 flex items-center gap-1.5 font-semibold text-blue-400">
            <Star className="size-3" />
            New Checkout Experience
          </div>
          <div className={`mb-3 space-y-2 text-[11px] ${sub}`}>
            <div className="flex justify-between">
              <span>Pro Plan</span>
              <span className="text-zinc-100 font-medium">$29/mo</span>
            </div>
            <div className="flex justify-between">
              <span>Annual discount</span>
              <span className="font-semibold text-emerald-400">-20%</span>
            </div>
            <div className={`my-1 h-px ${isDark ? "bg-zinc-700" : "bg-slate-200"}`} />
            <div className="flex justify-between font-semibold">
              <span className={text}>Total</span>
              <span className="text-blue-400">$23.20/mo</span>
            </div>
          </div>
          <div className="mt-1 rounded-md bg-blue-600 px-2 py-1.5 text-center text-[11px] font-semibold text-white shadow-md shadow-blue-500/30">
            Complete Purchase
          </div>
        </div>
      ) : (
        <div className={`rounded-md border p-3 text-xs ${surface} ${border}`}>
          <div className={`mb-2 font-semibold ${text}`}>Analytics Overview</div>
          <div className="flex h-14 items-end gap-1">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-all duration-500 ${BAR_COLORS[i]}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className={`mt-1.5 text-[10px] ${muted}`}>Weekly flag evaluations</div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
        {[
          { label: "Flags",   value: "12",     color: "text-emerald-400" },
          { label: "Uptime",  value: "99.9%",  color: "text-blue-400"   },
          { label: "Latency", value: "<10ms",  color: "text-amber-400"  },
        ].map((s) => (
          <div key={s.label} className={`rounded-md border py-1.5 ${surface} ${border}`}>
            <div className={`font-bold ${s.color}`}>{s.value}</div>
            <div className={muted}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HeroDemo() {
  const [flags, setFlags] = useState<FlagState>(
    Object.fromEntries(FLAGS.map((f) => [f.key, f.defaultEnabled]))
  )

  const toggle = (key: string) =>
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      <div className="grid md:grid-cols-2">
        {/* Left — controls */}
        <div className="border-b border-border p-6 md:border-b-0 md:border-r">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live Feature Control
          </p>
          <p className="mb-5 text-sm text-muted-foreground">
            Toggle flags below and watch the app update instantly.
          </p>

          <div className="space-y-3">
            {FLAGS.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
              >
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <Icon className="size-4 text-muted-foreground" />
                  {label}
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-medium ${flags[key] ? "text-emerald-500" : "text-muted-foreground"}`}>
                    {flags[key] ? "Enabled" : "Disabled"}
                  </span>
                  <Toggle enabled={flags[key]} onToggle={() => toggle(key)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — live preview */}
        <div className="flex flex-col p-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Application View
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            This is what your users see — in real time.
          </p>
          <div className="flex-1 overflow-hidden rounded-xl border border-border">
            <AppPreview flags={flags} />
          </div>
        </div>
      </div>
    </div>
  )
}
