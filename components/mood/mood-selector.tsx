"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { MoodLevel } from "@/lib/types"
import { getMoodEmoji } from "@/lib/utils"

interface MoodSelectorProps {
  initialMood?: MoodLevel
  initialNote?: string
  onSave: (mood: MoodLevel, note: string) => Promise<void>
  isLoading?: boolean
}

export default function MoodSelector({ initialMood, initialNote = "", onSave, isLoading = false }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | undefined>(initialMood)
  const [note, setNote] = useState(initialNote)

  const moods: MoodLevel[] = [1, 2, 3, 4, 5]

  const handleSave = async () => {
    if (selectedMood) {
      await onSave(selectedMood, note)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-gray-900">今日の気分</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          {moods.map((mood) => (
            <Button
              key={mood}
              variant={selectedMood === mood ? "default" : "outline"}
              className={`text-2xl h-12 w-12 mood-emoji ${selectedMood === mood ? "bg-main-green hover:bg-main-green/90" : ""}`}
              onClick={() => setSelectedMood(mood)}
            >
              {getMoodEmoji(mood)}
            </Button>
          ))}
        </div>
        <Textarea
          placeholder="今日の気分メモ（任意）"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[100px] text-gray-900 placeholder:text-gray-400"
        />
        <Button
          onClick={handleSave}
          disabled={!selectedMood || isLoading}
          className="w-full bg-main-green hover:bg-main-green/90 text-white"
        >
          {isLoading ? "保存中..." : "気分を記録する"}
        </Button>
      </CardContent>
    </Card>
  )
}
