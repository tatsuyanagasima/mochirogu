"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Minus, MessageSquare } from "lucide-react"
import type { Habit, HabitLog } from "@/lib/types"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getWeekDayLabel } from "@/lib/utils"
import HabitForm from "./habit-form"

interface EnhancedHabitListProps {
  habits: {
    habit: Habit
    log?: HabitLog
  }[]
  onUpdateHabitLog: (habitId: string, completed: boolean, count?: number, notes?: string) => Promise<void>
  onAddHabit: (habitData: any) => Promise<void>
  isLoading?: boolean
}

export default function EnhancedHabitList({
  habits,
  onUpdateHabitLog,
  onAddHabit,
  isLoading = false,
}: EnhancedHabitListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [habitNotes, setHabitNotes] = useState<Record<string, string>>({})
  const [habitCounts, setHabitCounts] = useState<Record<string, number>>({})

  const handleAddHabit = async (habitData: any) => {
    setIsAddingHabit(true)
    try {
      await onAddHabit(habitData)
      setIsFormOpen(false)
    } finally {
      setIsAddingHabit(false)
    }
  }

  const handleToggleHabit = async (habitId: string, completed: boolean) => {
    const count = habitCounts[habitId] || 1
    const notes = habitNotes[habitId] || ""
    await onUpdateHabitLog(habitId, completed, count, notes)
  }

  const handleCountChange = (habitId: string, delta: number) => {
    const currentCount = habitCounts[habitId] || 1
    const newCount = Math.max(1, Math.min(10, currentCount + delta))
    setHabitCounts((prev) => ({ ...prev, [habitId]: newCount }))
  }

  const handleNotesChange = (habitId: string, notes: string) => {
    setHabitNotes((prev) => ({ ...prev, [habitId]: notes }))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-gray-900">今日の習慣</CardTitle>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="border-main-green text-main-green hover:bg-main-green/10">
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <HabitForm onSubmit={handleAddHabit} onCancel={() => setIsFormOpen(false)} isLoading={isAddingHabit} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <div className="text-center py-4 text-gray-600">
            習慣が登録されていません。「追加」ボタンから習慣を登録しましょう。
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map(({ habit, log }) => (
              <div key={habit.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{habit.name}</h3>
                    {habit.description && <p className="text-sm text-gray-600 mt-1">{habit.description}</p>}
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{habit.frequency === "daily" ? "毎日" : "週次"}</Badge>
                      {habit.frequency === "weekly" && habit.target_days && (
                        <Badge variant="outline">
                          {habit.target_days.map((day) => getWeekDayLabel(day)).join("・")}
                        </Badge>
                      )}
                      {habit.target_count && habit.target_count > 1 && (
                        <Badge variant="outline">目標: {habit.target_count}回</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {habit.target_count && habit.target_count > 1 && (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCountChange(habit.id, -1)}
                        disabled={isLoading}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium min-w-[2rem] text-center">
                        {habitCounts[habit.id] || log?.count || 1}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCountChange(habit.id, 1)}
                        disabled={isLoading}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={() => handleToggleHabit(habit.id, !log?.completed)}
                    disabled={isLoading}
                    className={`${
                      log?.completed
                        ? "bg-main-green hover:bg-main-green/90 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    {log?.completed ? "完了済み" : "実行する"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">メモ（任意）</span>
                  </div>
                  <Textarea
                    placeholder="今日の実行についてメモを残せます"
                    value={habitNotes[habit.id] || log?.notes || ""}
                    onChange={(e) => handleNotesChange(habit.id, e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
