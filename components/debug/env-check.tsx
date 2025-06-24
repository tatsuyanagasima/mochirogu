"use client"

import { useEffect, useState } from "react"

export default function EnvCheck() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseAnonKey: boolean
  }>({
    supabaseUrl: false,
    supabaseAnonKey: false,
  })

  useEffect(() => {
    setEnvStatus({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }, [])

  // 本番環境では表示しない
  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded text-sm">
      <div className="font-bold">Environment Variables Status:</div>
      <div>SUPABASE_URL: {envStatus.supabaseUrl ? "✅" : "❌"}</div>
      <div>SUPABASE_ANON_KEY: {envStatus.supabaseAnonKey ? "✅" : "❌"}</div>
    </div>
  )
}
