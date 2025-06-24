"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "success" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          setConnectionStatus("error")
          setErrorMessage(error.message)
        } else {
          setConnectionStatus("success")
        }
      } catch (err) {
        setConnectionStatus("error")
        setErrorMessage(err instanceof Error ? err.message : "Unknown error")
      }
    }

    testConnection()
  }, [])

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Environment Variables</h2>
          <div>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</div>
          <div>
            NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Supabase Connection</h2>
          <div>
            Status: {connectionStatus === "checking" && "🔄 Checking..."}
            {connectionStatus === "success" && "✅ Connected"}
            {connectionStatus === "error" && "❌ Error"}
          </div>
          {errorMessage && <div className="mt-2 text-red-600">Error: {errorMessage}</div>}
        </div>
      </div>
    </div>
  )
}
