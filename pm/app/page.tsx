'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth"

const LOGIN_PATH = "/auth/login";

export default function Home() {
  const router = useRouter()
  const { data: sessionData, isPending } = authClient.useSession();
  const user = sessionData?.user ?? null;
  const loading = isPending;

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push(LOGIN_PATH)
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner className="size-8" />
    </div>
  )
}

