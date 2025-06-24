import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { MoodLevel, WeekDay, HabitStats, CorrelationData } from "./types"
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from "date-fns"
import { ja } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMoodEmoji(mood: MoodLevel): string {
  const emojis = {
    1: "😢",
    2: "😔",
    3: "😐",
    4: "😊",
    5: "😄",
  }
  return emojis[mood]
}

export function getMoodColor(mood: MoodLevel): string {
  const colors = {
    0: "bg-gray-100",
    1: "bg-red-100",
    2: "bg-orange-100",
    3: "bg-yellow-100",
    4: "bg-green-100",
    5: "bg-emerald-100",
  }
  return colors[mood] || colors[0]
}

export function getMoodLabel(mood: MoodLevel): string {
  const labels = {
    1: "とても悪い",
    2: "悪い",
    3: "普通",
    4: "良い",
    5: "とても良い",
  }
  return labels[mood]
}

export function formatDate(date: string, formatStr = "yyyy-MM-dd"): string {
  return format(parseISO(date), formatStr, { locale: ja })
}

export function getWeekDayLabel(day: WeekDay): string {
  const labels = {
    monday: "月",
    tuesday: "火",
    wednesday: "水",
    thursday: "木",
    friday: "金",
    saturday: "土",
    sunday: "日",
  }
  return labels[day]
}

export function getWeekDays(): WeekDay[] {
  return ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
}

export function calculateHabitStats(habitLogs: any[], startDate: Date, endDate: Date): HabitStats[] {
  const habitGroups = habitLogs.reduce((acc, log) => {
    if (!acc[log.habit_id]) {
      acc[log.habit_id] = {
        habit_name: log.habits?.name || "Unknown",
        logs: [],
      }
    }
    acc[log.habit_id].logs.push(log)
    return acc
  }, {})

  return Object.entries(habitGroups).map(([habitId, data]: [string, any]) => {
    const logs = data.logs
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const completedDays = logs.filter((log: any) => log.completed).length
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0

    // 連続記録の計算
    const sortedLogs = logs.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    for (let i = sortedLogs.length - 1; i >= 0; i--) {
      if (sortedLogs[i].completed) {
        tempStreak++
        if (i === sortedLogs.length - 1) currentStreak = tempStreak
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 0
        if (currentStreak === 0) currentStreak = 0
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      habit_id: habitId,
      habit_name: data.habit_name,
      total_days: totalDays,
      completed_days: completedDays,
      completion_rate: Math.round(completionRate),
      current_streak: currentStreak,
      longest_streak: longestStreak,
    }
  })
}

export function calculateCorrelationData(moodLogs: any[], habitLogs: any[]): CorrelationData[] {
  const dateGroups = moodLogs.reduce((acc, moodLog) => {
    const date = moodLog.date
    if (!acc[date]) {
      acc[date] = {
        mood: moodLog.mood,
        habits: [],
      }
    }
    return acc
  }, {})

  habitLogs.forEach((habitLog) => {
    const date = habitLog.date
    if (dateGroups[date]) {
      dateGroups[date].habits.push(habitLog)
    }
  })

  return Object.entries(dateGroups)
    .map(([date, data]: [string, any]) => {
      const completedHabits = data.habits.filter((h: any) => h.completed).length
      const totalHabits = data.habits.length
      const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0

      return {
        date,
        mood: data.mood,
        completion_rate: Math.round(completionRate),
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // 月曜日始まり
    end: endOfWeek(date, { weekStartsOn: 1 }),
  }
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return isWithinInterval(date, { start, end })
}
