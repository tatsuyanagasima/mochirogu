"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseConfigured, isDemoMode } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Mail, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SupabaseSetup from "@/components/setup/supabase-setup"
import DemoBanner from "@/components/demo/demo-banner"

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Supabaseが設定されておらず、デモモードでもない場合は設定画面を表示
  if (!isSupabaseConfigured() && !isDemoMode()) {
    return <SupabaseSetup />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isDemoMode()) {
        // デモモードでは簡単な検証のみ
        if (email && password) {
          await new Promise((resolve) => setTimeout(resolve, 1000)) // 擬似的な遅延
          router.push("/")
          return
        } else {
          throw new Error("メールアドレスとパスワードを入力してください")
        }
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        alert("確認メールを送信しました。メールを確認してアカウントを有効化してください。")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push("/")
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || "認証エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      if (isDemoMode()) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        router.push("/")
        return
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setError(error.message || "Googleログインエラーが発生しました")
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail("demo@example.com")
    setPassword("demo123")
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <DemoBanner />

      <Card className="shadow-lg border-2 border-gray-200 bg-white">
        <CardHeader className="space-y-3 pb-6">
          <CardTitle className="text-center text-2xl md:text-3xl font-bold text-gray-900">
            {mode === "login" ? "ログイン" : "アカウント作成"}
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-600">
            {mode === "login"
              ? "モチログにログインして記録を始めましょう"
              : "アカウントを作成して習慣と気分を記録しましょう"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="mb-6 shadow-sm border-red-200 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-base ml-2 text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {isDemoMode() && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                デモモードでは任意のメールアドレスとパスワードでログインできます。
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-medium text-gray-900">
                メールアドレス
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="pl-10 py-6 text-base text-gray-900 placeholder:text-gray-400 bg-white border-gray-300 focus:border-main-green focus:ring-main-green"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-medium text-gray-900">
                パスワード
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="パスワードを入力してください"
                  className="pl-10 py-6 text-base text-gray-900 placeholder:text-gray-400 bg-white border-gray-300 focus:border-main-green focus:ring-main-green"
                />
              </div>
            </div>

            {isDemoMode() && (
              <Button
                type="button"
                onClick={handleDemoLogin}
                variant="outline"
                className="w-full py-3 text-sm border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                デモ用の認証情報を入力
              </Button>
            )}

            <Button
              type="submit"
              className="w-full py-6 text-base font-medium bg-main-green hover:bg-main-green/90 text-white transition-colors"
              disabled={loading}
            >
              {loading ? "処理中..." : mode === "login" ? "ログイン" : "アカウント作成"}
            </Button>
          </form>

          {!isDemoMode() && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-white px-4 text-gray-500 font-medium">または</span>
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-6 text-base font-medium border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Googleでログイン
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6">
          {mode === "login" ? (
            <p className="text-base text-center text-gray-600">
              アカウントをお持ちでない場合は{" "}
              <a
                href="/auth/signup"
                className="underline font-medium text-main-green hover:text-main-green/80 transition-colors"
              >
                新規登録
              </a>
            </p>
          ) : (
            <p className="text-base text-center text-gray-600">
              すでにアカウントをお持ちの場合は{" "}
              <a
                href="/auth/login"
                className="underline font-medium text-main-green hover:text-main-green/80 transition-colors"
              >
                ログイン
              </a>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
