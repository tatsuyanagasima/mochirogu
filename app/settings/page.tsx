"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Habit } from "@/lib/types"
import SettingsForm from "@/components/settings/settings-form"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [habits, setHabits] = useState<Habit[]>([])
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          router.push("/auth/login")
          return
        }
        setUser(data.session.user)
        await fetchHabits(data.session.user.id)
      } catch (error) {
        console.error("Error checking user:", error)
        setError("ユーザー情報の取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const fetchHabits = async (userId: string) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching habits:", error)
        setError("習慣データの取得に失敗しました")
        return
      }

      setHabits(data || [])
    } catch (error) {
      console.error("Error fetching habits:", error)
      setError("習慣データの取得に失敗しました")
    }
  }

  const handleUpdateHabit = async (habitId: string, isActive: boolean, name: string) => {
    if (!user) return

    setUpdating(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("habits")
        .update({ is_active: isActive, name })
        .eq("id", habitId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating habit:", error)
        setError("習慣の更新に失敗しました")
        return
      }

      setHabits((prevHabits) =>
        prevHabits.map((habit) => (habit.id === habitId ? { ...habit, is_active: isActive, name } : habit)),
      )
    } catch (error) {
      console.error("Error updating habit:", error)
      setError("習慣の更新に失敗しました")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    if (!user) return

    setUpdating(true)
    setError(null)

    try {
      // 習慣の削除
      const { error: habitError } = await supabase.from("habits").delete().eq("id", habitId).eq("user_id", user.id).select()


      if (habitError) {
        console.error("Error deleting habit:", habitError)
        setError("習慣の削除に失敗しました")
        return
      }

      // 関連する習慣ログの削除
      const { error: logError } = await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId)
        .eq("user_id", user.id)
        .select()

      if (logError) {
        console.warn("Error deleting habit logs:", logError)
        // ログの削除エラーは警告のみ（習慣は削除済み）
      }

      setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== habitId))
    } catch (error) {
      console.error("Error deleting habit:", error)
      setError("習慣の削除に失敗しました")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main-green mx-auto"></div>
          <p className="text-text-secondary">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">

      <h1 className="text-2xl font-bold bg-gradient-to-r from-main-green to-accent-yellow bg-clip-text text-transparent">
        設定
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            ページを再読み込み
          </button>
        </div>
      )}

      <SettingsForm
        habits={habits}
        onUpdateHabit={handleUpdateHabit}
        onDeleteHabit={handleDeleteHabit}
        isLoading={updating}
      />
    </div>
  )
}
