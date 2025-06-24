"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Habit, MoodLevel } from "@/lib/types"
import { format } from "date-fns"
import MoodSelector from "@/components/mood/mood-selector"
import HabitList from "@/components/habits/habit-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [habits, setHabits] = useState<{ habit: Habit; completed: boolean }[]>([])
  const [todayMood, setTodayMood] = useState<MoodLevel | undefined>(undefined)
  const [todayNote, setTodayNote] = useState("")
  const [savingMood, setSavingMood] = useState(false)
  const [savingHabit, setSavingHabit] = useState(false)

  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          console.error("Auth error:", error)
          router.push("/auth/login")
          return
        }

        const currentUser = data.session.user
        setUser(currentUser)
        await fetchData(currentUser.id)
      } catch (err) {
        console.error("Session check error:", err)
        setError("セッションの確認中にエラーが発生しました")
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const fetchData = async (userId: string) => {
    try {
      const habitsResult = await supabase.from("habits").select("*").eq("user_id", userId).eq("is_active", true)

      if (habitsResult.error) {
        if (
          habitsResult.error.message.includes("relation") &&
          habitsResult.error.message.includes("does not exist")
        ) {
          setError("データベーステーブルが作成されていません。セットアップページで設定を完了してください。")
          router.push("/setup")
          return
        }
        throw habitsResult.error
      }

      const habitsData = habitsResult.data || []

      const habitLogsResult = await supabase.from("habit_logs").select("*").eq("user_id", userId).eq("date", today)
      const habitLogsData = habitLogsResult.data || []

      const moodResult = await supabase.from("mood_logs").select("*").eq("user_id", userId).eq("date", today).single()
      const moodData = moodResult.data || null

      const habitsWithStatus = habitsData.map((habit: Habit) => {
        const log = habitLogsData.find((log) => log.habit_id === habit.id)
        return {
          habit,
          completed: log ? log.completed : false,
        }
      })

      setHabits(habitsWithStatus)
      if (moodData?.mood) {
        setTodayMood(moodData.mood as MoodLevel)
        setTodayNote(moodData.note || "")
      }
    } catch (err) {
      console.error("Data fetch error:", err)
      setError("データの取得中にエラーが発生しました")
    }
  }

  const handleSaveMood = async (mood: MoodLevel, note: string) => {
    if (!user) return
    setSavingMood(true)
    try {
      const { data: existingMood } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single()

      if (existingMood) {
        const { error } = await supabase.from("mood_logs").update({mood, note }).eq("id", existingMood.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("mood_logs").insert([
          { user_id: user.id, date: today, mood, note },
        ])
        if (error) throw error
      }

      setTodayMood(mood)
      setTodayNote(note)
    } catch (error) {
      console.error("Error saving mood:", error)
      setError("気分の保存に失敗しました")
    } finally {
      setSavingMood(false)
    }
  }

  const handleToggleHabit = async (habitId: string, completed: boolean) => {
    if (!user) return
    console.log("Saving mood for user:", user?.id)
    setSavingHabit(true)
    try {
      const { data: existingLog } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("habit_id", habitId)
        .eq("date", today)
        .single()

      if (existingLog) {
        const { error } = await supabase.from("habit_logs").update({ completed }).eq("id", existingLog.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("habit_logs").insert([
          { user_id: user.id, habit_id: habitId, date: today, completed },
        ])
        if (error) throw error
      }

      setHabits((prev) =>
        prev.map((item) => (item.habit.id === habitId ? { ...item, completed } : item))
      )
    } catch (error) {
      console.error("Error toggling habit:", error)
      setError("習慣の更新に失敗しました")
    } finally {
      setSavingHabit(false)
    }
  }

  const handleAddHabit = async (habitName: string) => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from("habits")
        .insert([{ user_id: user.id, name: habitName, is_active: true }])
        .select()

      if (error) throw error
      if (data && data[0]) {
        setHabits((prev) => [...prev, { habit: data[0] as Habit, completed: false }])
      }
    } catch (error) {
      console.error("Error adding habit:", error)
      setError("習慣の追加に失敗しました")
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main-green mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-main-green text-white rounded hover:bg-main-green/90"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      
      <Card className="bg-gradient-to-r from-main-green/10 to-accent-yellow/10 border-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">モチログ</CardTitle>
          <CardDescription className="text-gray-600">今日の気分と習慣を記録しましょう</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-gray-900">{format(new Date(), "yyyy年MM月dd日")}</p>
        </CardContent>
      </Card>

      <MoodSelector
        initialMood={todayMood}
        initialNote={todayNote}
        onSave={handleSaveMood}
        isLoading={savingMood}
      />

      <HabitList
        habits={habits}
        onToggleHabit={handleToggleHabit}
        onAddHabit={handleAddHabit}
        isLoading={savingHabit}
      />
    </div>
  )
}
