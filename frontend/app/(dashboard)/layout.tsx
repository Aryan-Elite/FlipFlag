"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Flag, LayoutDashboard, FolderOpen, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects",  label: "Projects",  icon: FolderOpen      },
  { href: "/settings",  label: "Settings",  icon: Settings        },
]

const environments = [
  { name: "Production",  color: "bg-emerald-500" },
  { name: "Development", color: "bg-blue-500"    },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname        = usePathname()
  const router          = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.session) router.replace("/login")
      else setReady(true)
    })
  }, [])

  if (!ready) return null

  async function handleLogout() {
    await authClient.signOut()
    router.push("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-border">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <Flag className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">FlipFlag</span>
        </div>

        <Separator />

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-2 pt-3">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}

          {/* Environments section */}
          <div className="mt-4 px-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Environments
            </p>
            <div className="space-y-1">
              {environments.map(({ name, color }) => (
                <div key={name} className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                  <span className={`size-2 rounded-full ${color}`} />
                  {name}
                </div>
              ))}
            </div>
          </div>
        </nav>

        <Separator />

        {/* Logout */}
        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
