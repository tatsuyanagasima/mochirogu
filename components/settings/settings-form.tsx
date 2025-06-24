"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Habit } from "@/lib/types"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SettingsFormProps {
  habits: Habit[]
  onUpdateHabit: (habitId: string, isActive: boolean, name: string) => Promise<void>
  onDeleteHabit: (habitId: string) => Promise<void>
  isLoading?: boolean
}

export default function SettingsForm({ habits, onUpdateHabit, onDeleteHabit, isLoading = false }: SettingsFormProps) {
  const [editedHabits, setEditedHabits] = useState<Record<string, { name: string; isActive: boolean }>>(
    habits.reduce(
      (acc, habit) => {
        acc[habit.id] = { name: habit.name, isActive: habit.is_active }
        return acc
      },
      {} as Record<string, { name: string; isActive: boolean }>,
    ),
  )

  const handleNameChange = (habitId: string, name: string) => {
    setEditedHabits((prev) => ({
      ...prev,
      [habitId]: { ...prev[habitId], name },
    }))
  }

  const handleActiveChange = (habitId: string, isActive: boolean) => {
    setEditedHabits((prev) => ({
      ...prev,
      [habitId]: { ...prev[habitId], isActive },
    }))
  }

  const handleSave = async (habitId: string) => {
    const { name, isActive } = editedHabits[habitId]
    await onUpdateHabit(habitId, isActive, name)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-main-green">習慣の管理</CardTitle>
        <CardDescription>習慣の名前変更や表示/非表示を設定できます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {habits.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            習慣が登録されていません。ホーム画面から習慣を追加してください。
          </div>
        ) : (
          habits.map((habit) => (
            <div key={habit.id} className="space-y-2 pb-4 border-b last:border-0">
              <div className="flex items-center justify-between">
                <Label htmlFor={`habit-name-${habit.id}`}>習慣名</Label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>習慣を削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は取り消せません。この習慣に関連するすべての記録も削除されます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteHabit(habit.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        削除する
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  id={`habit-name-${habit.id}`}
                  value={editedHabits[habit.id]?.name || habit.name}
                  onChange={(e) => handleNameChange(habit.id, e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSave(habit.id)}
                  disabled={
                    isLoading ||
                    (editedHabits[habit.id]?.name === habit.name &&
                      editedHabits[habit.id]?.isActive === habit.is_active)
                  }
                  size="sm"
                  className="bg-main-green hover:bg-main-green/90"
                >
                  保存
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`habit-active-${habit.id}`}
                  checked={editedHabits[habit.id]?.isActive ?? habit.is_active}
                  onCheckedChange={(checked) => {
                    handleActiveChange(habit.id, checked)
                    handleSave(habit.id)
                  }}
                  disabled={isLoading}
                />
                <Label htmlFor={`habit-active-${habit.id}`}>
                  {(editedHabits[habit.id]?.isActive ?? habit.is_active) ? "表示" : "非表示"}
                </Label>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
