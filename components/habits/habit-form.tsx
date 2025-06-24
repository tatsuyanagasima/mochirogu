"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HabitFrequency, WeekDay } from "@/lib/types"
import { getWeekDays, getWeekDayLabel } from "@/lib/utils"

interface HabitFormProps {
  onSubmit: (habitData: {
    name: string
    description: string
    frequency: HabitFrequency
    targetDays: WeekDay[]
    targetCount: number
  }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function HabitForm({ onSubmit, onCancel, isLoading = false }: HabitFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState<HabitFrequency>("daily")
  const [targetDays, setTargetDays] = useState<WeekDay[]>([])
  const [targetCount, setTargetCount] = useState(1)

  const weekDays = getWeekDays()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      frequency,
      targetDays: frequency === "weekly" ? targetDays : [],
      targetCount,
    })
  }

  const handleDayToggle = (day: WeekDay) => {
    setTargetDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新しい習慣を追加</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">習慣名 *</Label>
            <Input
              id="habit-name"
              placeholder="例：朝の散歩、読書、瞑想など"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-description">説明（任意）</Label>
            <Textarea
              id="habit-description"
              placeholder="習慣の詳細や目標を記入してください"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">頻度</Label>
            <Select value={frequency} onValueChange={(value: HabitFrequency) => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">毎日</SelectItem>
                <SelectItem value="weekly">週次（曜日指定）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "weekly" && (
            <div className="space-y-2">
              <Label>実行する曜日</Label>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={targetDays.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label htmlFor={`day-${day}`} className="text-sm">
                      {getWeekDayLabel(day)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="target-count">1日の目標回数</Label>
            <Input
              id="target-count"
              type="number"
              min="1"
              max="10"
              value={targetCount}
              onChange={(e) => setTargetCount(Number.parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={!name.trim() || isLoading || (frequency === "weekly" && targetDays.length === 0)}
              className="flex-1 bg-main-green hover:bg-main-green/90"
            >
              {isLoading ? "追加中..." : "習慣を追加"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
