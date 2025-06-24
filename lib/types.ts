export type MoodLevel = 1 | 2 | 3 | 4 | 5 // 1: 悲しい, 5: 嬉しい

export type HabitFrequency = "daily" | "weekly" | "custom"

export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export interface Habit {
  id: string
  user_id: string
  name: string
  description?: string
  frequency: HabitFrequency
  target_days?: WeekDay[] // 週次の場合の曜日指定
  custom_schedule?: string // カスタムスケジュール（JSON形式）
  target_count?: number // 1日の目標回数
  created_at: string
  is_active: boolean
}

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  date: string
  completed: boolean
  count?: number // 実行回数
  notes?: string
  completed_at?: string
}

export interface MoodLog {
  id: string // ← ここがポイント
  user_id: string
  date: string
  mood: MoodLevel
  note?: string
  created_at: string
}

export interface DailyLog {
  date: string
  mood?: MoodLog // ← 修正：id付きMoodLogに統一
  habits: {
    habit: Habit
    completed: boolean
    count?: number
    notes?: string
  }[]
  note?: string
}

export interface HabitStats {
  habit_id: string
  habit_name: string
  total_days: number
  completed_days: number
  completion_rate: number
  current_streak: number
  longest_streak: number
}

export interface CorrelationData {
  date: string
  mood: number
  completion_rate: number
}
