"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns"
import { ja } from "date-fns/locale"
import type { DailyLog, MoodLevel } from "@/lib/types"
import { getMoodEmoji, getMoodColor } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

interface CalendarViewProps {
  logs: DailyLog[]
}

export default function CalendarView({ logs }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const handleDayClick = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd")
    const log = logs.find((log) => log.date === formattedDate)
    if (log) {
      setSelectedLog(log)
      setIsDialogOpen(true)
    }
  }

  const handleDeleteMood = async () => {
    if (!selectedLog?.mood || !selectedLog.mood.id) return

    const { error } = await supabase
      .from("mood_logs")
      .delete()
      .eq("id", selectedLog.mood.id)

    if (error) {
      console.error("気分の削除に失敗:", error)
      return
    }

    setIsDialogOpen(false)
    window.location.reload()
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-main-green">記録カレンダー</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth} className="border-main-green text-main-green hover:bg-main-green/10">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">{format(currentDate, "yyyy年MM月", { locale: ja })}</span>
            <Button variant="outline" size="icon" onClick={nextMonth} className="border-main-green text-main-green hover:bg-main-green/10">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
              .map((_, i) => <div key={`empty-${i}`} className="h-10 rounded-md" />)}

            {daysInMonth.map((day) => {
              const formattedDate = format(day, "yyyy-MM-dd")
              const log = logs.find((log) => log.date === formattedDate)
              const hasLog = !!log
              const moodLevel = log?.mood?.mood
              const moodNote = log?.mood?.note
              const completedHabits = log?.habits.filter((h) => h.completed).length || 0
              const totalHabits = log?.habits.length || 0

              return (
                <button
                  key={day.toString()}
                  className={`h-14 rounded-md flex flex-col items-center justify-center text-xs relative ${
                    hasLog ? getMoodColor((moodLevel || 0) as MoodLevel) : "bg-muted/30"
                  } ${
                    isSameMonth(day, currentDate) ? "text-foreground" : "text-muted-foreground"
                  } hover:bg-muted/50 transition-colors px-1`}
                  onClick={() => handleDayClick(day)}
                  disabled={!hasLog}
                >
                  <span>{format(day, "d")}</span>
                  {hasLog && (
                    <div className="flex flex-col items-center space-y-0.5 mt-0.5">
                      <div className="flex items-center space-x-1">
                        {moodLevel && <span>{getMoodEmoji(moodLevel)}</span>}
                        {totalHabits > 0 && (
                          <span className="text-[10px]">{completedHabits}/{totalHabits}</span>
                        )}
                      </div>
                      {moodNote && (
                        <span className="text-[10px] truncate max-w-[40px] text-center">{moodNote}</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getMoodEmoji(selectedLog.mood.mood)}</span>
                      {selectedLog.mood.note && (
                        <p className="text-sm text-muted-foreground">{selectedLog.mood.note}</p>
                      )}
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleDeleteMood}>削除</Button>
                  </div>
                </div>
              )}

              {selectedLog.habits.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">習慣</h3>
                  <ul className="space-y-1">
                    {selectedLog.habits.map(({ habit, completed }) => (
                      <li key={habit.id} className="flex items-center space-x-2">
                        <span>{completed ? "✅" : "❌"}</span>
                        <span>{habit.name}</span>
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
