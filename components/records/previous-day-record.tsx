"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { format, subDays, addDays } from "date-fns"
import { ja } from "date-fns/locale"
import type { Habit, MoodLevel } from "@/lib/types"
import MoodSelector from "@/components/mood/mood-selector"
import EnhancedHabitList from "@/components/habits/enhanced-habit-list"

interface PreviousDayRecordProps {
  habits: Habit[]
  onSaveMood: (date: string, mood: MoodLevel, note: string) => Promise<void>
  onUpdateHabitLog: (date: string, habitId: string, completed: boolean, count?: number, notes?: string) => Promise<void>
  onAddHabit: (habitData: any) => Promise<void>
  onFetchDayData: (date: string) => Promise<{
    mood?: { mood: MoodLevel; note?: string }
    habitLogs: any[]
  }>
}

export default function PreviousDayRecord({
  habits,
  onSaveMood,
  onUpdateHabitLog,
  onAddHabit,
  onFetchDayData,
}: PreviousDayRecordProps) {
  const [selectedDate, setSelectedDate] = useState(subDays(new Date(), 1))
  const [dayMood, setDayMood] = useState<MoodLevel | undefined>(undefined)
  const [dayNote, setDayNote] = useState("")
  const [dayHabits, setDayHabits] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDayData()
  }, [selectedDate])

  const loadDayData = async () => {
    setLoading(true)
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const data = await onFetchDayData(dateStr)

      setDayMood(data.mood?.mood)
      setDayNote(data.mood?.note || "")

      const habitsWithLogs = habits.map((habit) => {
        const log = data.habitLogs.find((log) => log.habit_id === habit.id)
        return { habit, log }
      })
      setDayHabits(habitsWithLogs)
    } catch (error) {
      console.error("Error loading day data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1))
  }

  const handleNextDay = () => {
    const tomorrow = addDays(selectedDate, 1)
    const today = new Date()
    if (tomorrow <= today) {
      setSelectedDate(tomorrow)
    }
  }

  const handleSaveMood = async (mood: MoodLevel, note: string) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    await onSaveMood(dateStr, mood, note)
    setDayMood(mood)
    setDayNote(note)
  }

  const handleUpdateHabitLog = async (habitId: string, completed: boolean, count?: number, notes?: string) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    await onUpdateHabitLog(dateStr, habitId, completed, count, notes)
    await loadDayData() // データを再読み込み
  }

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  const canGoNext = format(addDays(selectedDate, 1), "yyyy-MM-dd") <= format(new Date(), "yyyy-MM-dd")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-main-green flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              過去の記録
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevDay}
                className="border-main-green text-main-green hover:bg-main-green/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium text-lg min-w-[140px] text-center">
                {format(selectedDate, "yyyy年MM月dd日", { locale: ja })}
                {isToday && " (今日)"}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextDay}
                disabled={!canGoNext}
                className="border-main-green text-main-green hover:bg-main-green/10 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main-green mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <MoodSelector initialMood={dayMood} initialNote={dayNote} onSave={handleSaveMood} isLoading={false} />

          <EnhancedHabitList
            habits={dayHabits}
            onUpdateHabitLog={handleUpdateHabitLog}
            onAddHabit={onAddHabit}
            isLoading={false}
          />
        </div>
      )}
    </div>
  )
}
