"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DailyLog, Habit } from "@/lib/types"
import { formatDate, calculateHabitStats, calculateCorrelationData } from "@/lib/utils"
import {
  Line,
  Bar,
  ResponsiveContainer,
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState } from "react"
import { subDays, subMonths } from "date-fns"

interface EnhancedAnalysisChartsProps {
  logs: DailyLog[]
  habits: Habit[]
}

export default function EnhancedAnalysisCharts({ logs, habits }: EnhancedAnalysisChartsProps) {
  const [timeRange, setTimeRange] = useState("30days")

  // 🔍 デバッグ用ログ出力
  console.log("🧪 logs:", logs)
  console.log("🧪 habits:", habits)
  console.log("🧪 logs の日付一覧:", logs.map((l) => l.date))


  const getFilteredData = () => {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "7days":
        startDate = subDays(now, 7)
        break
      case "30days":
        startDate = subDays(now, 30)
        break
      case "3months":
        startDate = subMonths(now, 3)
        break
      default:
        startDate = subDays(now, 30)
    }

    return logs.filter((log) => new Date(log.date) >= startDate)
  }

  const filteredLogs = getFilteredData()

  // 🔍 フィルター後のログも確認
  console.log("🧪 filteredLogs:", filteredLogs)

  // 気分データ
  const moodData = filteredLogs
    .filter((log) => log.mood)
    .map((log) => ({
      date: formatDate(log.date, "MM/dd"),
      mood: log.mood?.mood,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // 習慣達成率
  const habitCompletionData = habits.map((habit) => {
    const habitLogs = filteredLogs.flatMap((log) => log.habits.filter((h) => h.habit.id === habit.id))
    const totalDays = habitLogs.length
    const completedDays = habitLogs.filter((h) => h.completed).length
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0

    return {
      name: habit.name,
      達成率: Math.round(completionRate),
      完了日数: completedDays,
      総日数: totalDays,
    }
  })

  // 習慣統計
  const habitStats = calculateHabitStats(
    filteredLogs.flatMap((log) =>
      log.habits.map((h) => ({
        ...h,
        habit_id: h.habit.id,
        habits: h.habit,
      })),
    ),
    new Date(filteredLogs[0]?.date || new Date()),
    new Date(),
  )

  // 相関データ
  const correlationData = calculateCorrelationData(
    filteredLogs
      .filter((log) => log.mood)
      .map((log) => ({
        date: log.date,
        mood: log.mood!.mood,
      })),
    filteredLogs.flatMap((log) =>
      log.habits.map((h) => ({
        date: log.date,
        completed: h.completed,
      })),
    ),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-main-green to-accent-yellow bg-clip-text text-transparent">
          分析ダッシュボード
        </h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">過去7日間</SelectItem>
            <SelectItem value="30days">過去30日間</SelectItem>
            <SelectItem value="3months">過去3ヶ月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="mood" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mood" className="data-[state=active]:bg-main-green data-[state=active]:text-white">
            気分推移
          </TabsTrigger>
          <TabsTrigger value="habits" className="data-[state=active]:bg-main-green data-[state=active]:text-white">
            習慣達成率
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-main-green data-[state=active]:text-white">
            習慣統計
          </TabsTrigger>
          <TabsTrigger value="correlation" className="data-[state=active]:bg-main-green data-[state=active]:text-white">
            相関分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mood">
          <Card>
            <CardHeader>
              <CardTitle className="text-main-green">気分の推移</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  mood: {
                    label: "気分レベル",
                    color: "hsl(138, 155, 92)",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="var(--color-mood)"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits">
          <Card>
            <CardHeader>
              <CardTitle className="text-main-green">習慣の達成率</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  達成率: {
                    label: "達成率 (%)",
                    color: "hsl(252, 211, 77)",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitCompletionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="達成率" fill="var(--color-達成率)" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-4 md:grid-cols-2">
            {habitStats.map((stat) => (
              <Card key={stat.habit_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{stat.habit_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>達成率:</span>
                    <span className="font-bold text-main-green">{stat.completion_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>完了日数:</span>
                    <span>
                      {stat.completed_days}/{stat.total_days}日
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>現在の連続記録:</span>
                    <span className="font-bold text-accent-yellow">{stat.current_streak}日</span>
                  </div>
                  <div className="flex justify-between">
                    <span>最長連続記録:</span>
                    <span className="font-bold text-blue-600">{stat.longest_streak}日</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="correlation">
          <Card>
            <CardHeader>
              <CardTitle className="text-main-green">気分と習慣達成率の相関</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  mood: {
                    label: "気分レベル",
                    color: "hsl(138, 155, 92)",
                  },
                  completion_rate: {
                    label: "習慣達成率 (%)",
                    color: "hsl(252, 211, 77)",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" domain={[1, 5]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="mood"
                      stroke="var(--color-mood)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Bar yAxisId="right" dataKey="completion_rate" fill="var(--color-completion_rate)" opacity={0.6} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
