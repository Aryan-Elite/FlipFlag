"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { exchangeOAuthToken } from "@/lib/api"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      router.replace("/login?error=no_token")
      return
    }

    exchangeOAuthToken(token)
      .then(() => router.replace("/dashboard"))
      .catch(() => router.replace("/login?error=exchange_failed"))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Signing you in...</p>
    </div>
  )
}
