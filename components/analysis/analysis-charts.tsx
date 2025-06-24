"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DailyLog, Habit } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Line, Bar, ResponsiveContainer, LineChart, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalysisChartsProps {
  logs: DailyLog[]
  habits: Habit[]
}

export default function AnalysisCharts({ logs, habits }: AnalysisChartsProps) {
  // 気分データの準備
  const moodData = logs
    .filter((log) => log.mood)
    .map((log) => ({
      date: formatDate(log.date, "MM/dd"),
      mood: log.mood?.mood,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // 習慣達成率データの準備
  const habitCompletionData = habits.map((habit) => {
    const habitLogs = logs.flatMap((log) => log.habits.filter((h) => h.habit.id === habit.id))

    const totalLogs = habitLogs.length
    const completedLogs = habitLogs.filter((h) => h.completed).length
    const completionRate = totalLogs > 0 ? (completedLogs / totalLogs) * 100 : 0

    return {
      name: habit.name,
      達成率: Math.round(completionRate),
    }
  })

  return (
    <Tabs defaultValue="mood" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="mood" className="data-[state=active]:bg-main-green data-[state=active]:text-white">
          気分の推移
        </TabsTrigger>
        <TabsTrigger value="habits" className="data-[state=active]:bg-main-green data-[state=active]:text-white">
          習慣の達成率
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
              className="h-[300px]"
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
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
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
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitCompletionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="達成率" fill="var(--color-達成率)" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
