"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { DailyLog, Habit, HabitLog, MoodLog } from "@/lib/types"
import CalendarView from "@/components/calendar/calendar-view"
import { format, subMonths } from "date-fns"

export default function HistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<DailyLog[]>([])

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/auth/login")
        return
      }
      setUser(data.session.user)
      await fetchData(data.session.user.id)
      setLoading(false)
    }

    checkUser()
  }, [router])

  const fetchData = async (userId: string) => {
    // 過去3ヶ月分のデータを取得
    const threeMonthsAgo = format(subMonths(new Date(), 3), "yyyy-MM-dd")
    const today = format(new Date(), "yyyy-MM-dd")

    // 習慣の取得
    const { data: habitsData } = await supabase.from("habits").select("*").eq("user_id", userId)

    // 習慣記録の取得
    const { data: habitLogsData } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", threeMonthsAgo)
      .lte("date", today)

    // 気分記録の取得
    const { data: moodLogsData } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("date", threeMonthsAgo)
      .lte("date", today)

    // データの整形
    const dailyLogs: Record<string, DailyLog> = {}

    // 気分ログの処理
    ;(moodLogsData || []).forEach((moodLog: MoodLog) => {
      if (!dailyLogs[moodLog.date]) {
        dailyLogs[moodLog.date] = {
          date: moodLog.date,
          habits: [],
        }
      }
      dailyLogs[moodLog.date].mood = moodLog
      dailyLogs[moodLog.date].note = moodLog.note
    })

    // 習慣ログの処理
    ;(habitLogsData || []).forEach((habitLog: HabitLog) => {
      const habit = habitsData?.find((h: Habit) => h.id === habitLog.habit_id)
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
      })
    })

    setLogs(Object.values(dailyLogs))
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-main-green to-accent-yellow bg-clip-text text-transparent">
        履歴
      </h1>
      <CalendarView logs={logs} />
    </div>
  )
}
