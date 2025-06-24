"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
} from "date-fns"
import { ja } from "date-fns/locale"
import type { DailyLog, Habit } from "@/lib/types"
import { getMoodEmoji, getMoodColor, getWeekRange, getMoodLabel } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EnhancedCalendarViewProps {
  logs: DailyLog[]
  habits: Habit[]
}

export default function EnhancedCalendarView({ logs, habits }: EnhancedCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"week" | "month">("month")

  const prevPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(subWeeks(currentDate, 1))
    }
  }

  const nextPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }

  const handleDayClick = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd")
    const log = logs.find((log) => log.date === formattedDate)
    if (log) {
      setSelectedLog(log)
      setIsDialogOpen(true)
    }
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    return (
      <>
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
            <div
              key={day}
              className={`text-xs font-medium py-1 ${index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : ""}`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(daysInMonth[0].getDay())
            .fill(null)
            .map((_, i) => (
              <div key={`empty-${i}`} className="h-20 rounded-md"></div>
            ))}
          {daysInMonth.map((day) => {
            const formattedDate = format(day, "yyyy-MM-dd")
            const log = logs.find((log) => log.date === formattedDate)
            const hasLog = !!log
            const moodLevel = log?.mood?.mood
            const completedHabits = log?.habits.filter((h) => h.completed).length || 0
            const totalHabits = log?.habits.length || 0

            return (
              <button
                key={day.toString()}
                className={`h-20 rounded-md flex flex-col items-center justify-center text-xs relative p-1 ${
                  hasLog ? getMoodColor(moodLevel || 0) : "bg-muted/30"
                } ${
                  isSameMonth(day, currentDate) ? "text-foreground" : "text-muted-foreground"
                } hover:bg-muted/50 transition-colors`}
                onClick={() => handleDayClick(day)}
                disabled={!hasLog}
              >
                <span className="font-medium">{format(day, "d")}</span>
                {hasLog && (
                  <div className="flex flex-col items-center space-y-1">
                    {moodLevel && <span className="text-lg">{getMoodEmoji(moodLevel)}</span>}
                    {totalHabits > 0 && (
                      <span className="text-[10px] bg-white/80 px-1 rounded">
                        {completedHabits}/{totalHabits}
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </>
    )
  }

  const renderWeekView = () => {
    const { start: weekStart, end: weekEnd } = getWeekRange(currentDate)
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="grid grid-cols-7 gap-2">
        {daysInWeek.map((day) => {
          const formattedDate = format(day, "yyyy-MM-dd")
          const log = logs.find((log) => log.date === formattedDate)
          const hasLog = !!log
          const moodLevel = log?.mood?.mood
          const completedHabits = log?.habits.filter((h) => h.completed).length || 0
          const totalHabits = log?.habits.length || 0

          return (
            <button
              key={day.toString()}
              className={`h-32 rounded-lg flex flex-col items-center justify-start p-3 ${
                hasLog ? getMoodColor(moodLevel || 0) : "bg-muted/30"
              } hover:bg-muted/50 transition-colors`}
              onClick={() => handleDayClick(day)}
              disabled={!hasLog}
            >
              <div className="text-center mb-2">
                <div className="text-xs text-muted-foreground">{format(day, "E", { locale: ja })}</div>
                <div className="text-lg font-medium">{format(day, "d")}</div>
              </div>
              {hasLog && (
                <div className="flex flex-col items-center space-y-1">
                  {moodLevel && <span className="text-2xl">{getMoodEmoji(moodLevel)}</span>}
                  {totalHabits > 0 && (
                    <span className="text-xs bg-white/80 px-2 py-1 rounded">
                      {completedHabits}/{totalHabits}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  const getPeriodLabel = () => {
    if (viewMode === "month") {
      return format(currentDate, "yyyy年MM月", { locale: ja })
    } else {
      const { start, end } = getWeekRange(currentDate)
      return `${format(start, "MM/dd", { locale: ja })} - ${format(end, "MM/dd", { locale: ja })}`
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-main-green flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              記録カレンダー
            </CardTitle>
            <Tabs value={viewMode} onValueChange={(value: "week" | "month") => setViewMode(value)}>
              <TabsList>
                <TabsTrigger value="week">週表示</TabsTrigger>
                <TabsTrigger value="month">月表示</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPeriod}
              className="border-main-green text-main-green hover:bg-main-green/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-lg">{getPeriodLabel()}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextPeriod}
              className="border-main-green text-main-green hover:bg-main-green/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>{viewMode === "month" ? renderMonthView() : renderWeekView()}</CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedLog && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{format(new Date(selectedLog.date), "yyyy年MM月dd日", { locale: ja })}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {selectedLog.mood && (
                <div className="space-y-2">
                  <h3 className="font-medium">気分</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getMoodEmoji(selectedLog.mood.mood)}</span>
                    <span className="text-sm text-muted-foreground">{getMoodLabel(selectedLog.mood.mood)}</span>
                  </div>
                  {selectedLog.mood.note && (
                    <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                      {selectedLog.mood.note}
                    </p>
                  )}
                </div>
              )}

              {selectedLog.habits.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">習慣</h3>
                  <ul className="space-y-2">
                    {selectedLog.habits.map(({ habit, completed, count, notes }) => (
                      <li key={habit.id} className="flex flex-col space-y-1 p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span>{completed ? "✅" : "❌"}</span>
                          <span className="font-medium">{habit.name}</span>
                          {count && count > 1 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{count}回</span>
                          )}
                        </div>
                        {notes && <p className="text-xs text-muted-foreground ml-6">{notes}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}