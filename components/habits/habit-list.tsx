"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Habit } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface HabitListProps {
  habits: {
    habit: Habit
    completed: boolean
  }[]
  onToggleHabit: (habitId: string, completed: boolean) => Promise<void>
  onAddHabit: (habitName: string) => Promise<void>
  isLoading?: boolean
}

export default function HabitList({ habits, onToggleHabit, onAddHabit, isLoading = false }: HabitListProps) {
  const [newHabitName, setNewHabitName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddingHabit, setIsAddingHabit] = useState(false)

  const handleAddHabit = async () => {
    if (newHabitName.trim()) {
      setIsAddingHabit(true)
      await onAddHabit(newHabitName.trim())
      setNewHabitName("")
      setIsDialogOpen(false)
      setIsAddingHabit(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-gray-900">習慣チェック</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="border-main-green text-main-green hover:bg-main-green/10">
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しい習慣を追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="habit-name">習慣名</Label>
                <Input
                  id="habit-name"
                  placeholder="例：朝の散歩、読書、瞑想など"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAddHabit}
                disabled={!newHabitName.trim() || isAddingHabit}
                className="w-full bg-main-green hover:bg-main-green/90"
              >
                {isAddingHabit ? "追加中..." : "習慣を追加する"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <div className="text-center py-4 text-gray-600">
            習慣が登録されていません。「追加」ボタンから習慣を登録しましょう。
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map(({ habit, completed }) => (
              <div key={habit.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                <Checkbox
                  id={`habit-${habit.id}`}
                  checked={completed}
                  onCheckedChange={(checked) => {
                    onToggleHabit(habit.id, checked as boolean)
                  }}
                  disabled={isLoading}
                />
                <label htmlFor={`habit-${habit.id}`} className="text-sm font-medium leading-none text-gray-900 ml-2">
                  {habit.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
