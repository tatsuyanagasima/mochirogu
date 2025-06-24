"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { DailyLog, Habit, HabitLog, MoodLog } from "@/lib/types"
import EnhancedAnalysisCharts from "@/components/analysis/enhanced-analysis-charts"
import { format, subMonths } from "date-fns"

export default function AnalysisPage() {
  const router = useRouter()

  // ✅ useState定義（fetchData の外＝関数の最上部）
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [habits, setHabits] = useState<Habit[]>([])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          router.push("/auth/login")
          return
        }
        setUser(data.session.user)
        await fetchData(data.session.user.id)
      } catch (err) {
        console.error("Authentication error:", err)
        setError("認証エラーが発生しました")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  // ✅ fetchDataの中身
  const fetchData = async (userId: string) => {
    try {
      const threeMonthsAgo = format(subMonths(new Date(), 3), "yyyy-MM-dd")
      const today = format(new Date(), "yyyy-MM-dd")

      const habitsResponse = await supabase.from("habits").select("*").eq("user_id", userId)
      const habitsData = habitsResponse.data || []
      setHabits(habitsData)

      const habitLogsResponse = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", threeMonthsAgo)
        .lte("date", today)
      const habitLogsData = habitLogsResponse.data || []

      const moodLogsResponse = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", threeMonthsAgo)
        .lte("date", today)
      const moodLogsData = moodLogsResponse.data || []

      const dailyLogs: Record<string, DailyLog> = {}

      moodLogsData.forEach((moodLog: MoodLog) => {
        if (!dailyLogs[moodLog.date]) {
          dailyLogs[moodLog.date] = {
            date: moodLog.date,
            habits: [],
          }
        }
        dailyLogs[moodLog.date].mood = moodLog
      })

      habitLogsData.forEach((habitLog: HabitLog) => {
        const habit = habitsData.find((h: Habit) => h.id === habitLog.habit_id)
        if (!habit) return

        if (!dailyLogs[habitLog.date]) {
          dailyLogs[habitLog.date] = {
            date: habitLog.date,
            habits: [],
          }
        }

        dailyLogs[habitLog.date].habits.push({
          habit,
          completed: habitLog.completed,
          count: habitLog.count || 0,
          notes: habitLog.notes || "",
        })
      })

      setLogs(Object.values(dailyLogs))
    } catch (err) {
      console.error("Data fetch error:", err)
      setError("データの取得に失敗しました")
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-main-green to-accent-yellow bg-clip-text text-transparent">
        分析
      </h1>
      <EnhancedAnalysisCharts logs={logs} habits={habits} />
    </div>
  )
}
